import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { resolveProjectAsset } from '../lib/projectAssets'

type MarkdownDocumentProps = {
  markdown: string
  skipMetadata?: boolean
  assetBasePath?: string
}

type TextBlock = {
  type: 'paragraph' | 'quote'
  text: string
}

type HeadingBlock = {
  type: 'heading'
  level: number
  text: string
}

type ListBlock = {
  type: 'list'
  ordered: boolean
  items: ListItem[]
}

type ListItem = {
  text: string
  children: string[]
}

type ImageBlock = {
  type: 'image'
  alt: string
  src: string
}

type CodeBlock = {
  type: 'code'
  language?: string
  code: string
}

type TableBlock = {
  type: 'table'
  rows: string[][]
}

type RuleBlock = {
  type: 'rule'
}

type Block = TextBlock | HeadingBlock | ListBlock | ImageBlock | CodeBlock | TableBlock | RuleBlock

function cleanInline(text: string) {
  return text
    .replace(/!\[[^\]]*]\((.+)\)/g, '')
    .replace(/\*\*\*\*([^*]+)\*\*\*\*/g, '$1')
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim()
}

function resolveLinkHref(href: string, assetBasePath?: string) {
  return /^https?:\/\//.test(href) ? href : resolveProjectAsset(href, assetBasePath)
}

function getDownloadFileName(href: string) {
  if (/^https?:\/\//.test(href)) return undefined

  const normalizedHref = href.replace(/\\/g, '/')
  const fileName = normalizedHref.split('/').at(-1)
  if (!fileName) return undefined

  try {
    return decodeURIComponent(fileName)
  } catch {
    return fileName
  }
}

function renderInline(text: string, assetBasePath?: string) {
  const nodes: ReactNode[] = []
  const linkPattern = /\[([^\]]+)]\(([^)]+)\)|(https?:\/\/[^\s]+)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = linkPattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const rawHref = match[2] ?? match[3]
    const label = match[1] ?? match[3]
    const href = resolveLinkHref(rawHref, assetBasePath)
    const downloadFileName = getDownloadFileName(rawHref)

    nodes.push(
      <a
        className="inline max-w-full break-words text-sky-300 [overflow-wrap:anywhere] hover:text-sky-200"
        download={downloadFileName}
        href={href}
        key={`${href}-${match.index}`}
        rel="noreferrer"
        target="_blank"
      >
        {label}
        <ArrowUpRight className="ml-1 inline h-4 w-4 align-[-2px]" />
      </a>,
    )

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length ? nodes : text
}

function parseTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cleanInline(cell))
}

function isTableDivider(line: string) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)
}

function getListMatch(line: string) {
  return line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/)
}

function getImageMatch(line: string) {
  return line.trim().match(/^!\[([^\]]*)]\((.+)\)$/)
}

function stripMetadata(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const firstImageIndex = lines.findIndex((line) => line.trim().startsWith('!['))

  if (firstImageIndex === -1) return markdown

  return lines.slice(firstImageIndex).join('\n')
}

function parseMarkdown(markdown: string, assetBasePath?: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let index = 0
  let previousImageAlt = ''

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed === '---') {
      blocks.push({ type: 'rule' })
      index += 1
      continue
    }

    const codeFenceMatch = trimmed.match(/^```([\w-]+)?\s*$/)
    if (codeFenceMatch) {
      const language = codeFenceMatch[1]
      const codeLines: string[] = []
      index += 1

      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index])
        index += 1
      }

      if (index < lines.length) index += 1

      blocks.push({
        type: 'code',
        language,
        code: codeLines.join('\n').replace(/\s+$/, ''),
      })
      previousImageAlt = ''
      continue
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/)
    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: cleanInline(headingMatch[2]) })
      index += 1
      continue
    }

    if (previousImageAlt && cleanInline(trimmed) === previousImageAlt) {
      previousImageAlt = ''
      index += 1
      continue
    }

    const imageMatch = getImageMatch(line)
    if (imageMatch) {
      const alt = cleanInline(imageMatch[1])
      blocks.push({ type: 'image', alt, src: resolveProjectAsset(imageMatch[2], assetBasePath) })
      previousImageAlt = alt
      index += 1
      continue
    }

    if (trimmed.startsWith('|') && lines[index + 1] && isTableDivider(lines[index + 1])) {
      const rows = [parseTableRow(trimmed)]
      index += 2

      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(parseTableRow(lines[index]))
        index += 1
      }

      blocks.push({ type: 'table', rows })
      continue
    }

    const firstListMatch = getListMatch(line)
    if (firstListMatch) {
      const baseIndent = firstListMatch[1].length
      const ordered = /^\d+\.$/.test(firstListMatch[2])
      const items: ListItem[] = []
      let lastAppendTarget: 'item' | 'child' = 'item'

      while (index < lines.length) {
        const currentLine = lines[index]
        const currentTrimmed = currentLine.trim()
        const currentMatch = getListMatch(currentLine)

        if (!currentTrimmed) {
          index += 1
          const nextLine = lines[index] ?? ''
          const nextTrimmed = nextLine.trim()
          const nextIsBoundary =
            getImageMatch(nextLine) ||
            nextTrimmed.startsWith('#') ||
            nextTrimmed.startsWith('|') ||
            nextTrimmed.startsWith('>') ||
            nextTrimmed === '---'

          if (nextTrimmed && !nextIsBoundary) continue
          break
        }

        if (getImageMatch(currentLine) || currentTrimmed.startsWith('#') || currentTrimmed.startsWith('|') || currentTrimmed.startsWith('>') || currentTrimmed === '---') {
          break
        }

        if (currentMatch) {
          const indent = currentMatch[1].length
          const marker = currentMatch[2]
          const text = cleanInline(currentMatch[3])

          if (indent > baseIndent) {
            items.at(-1)?.children.push(text)
            lastAppendTarget = 'child'
            index += 1
            continue
          }

          const currentOrdered = /^\d+\.$/.test(marker)
          if (indent === baseIndent && currentOrdered === ordered) {
            items.push({ text, children: [] })
            lastAppendTarget = 'item'
            index += 1
            continue
          }

          break
        }

        if (items.length) {
          const lastItem = items[items.length - 1]
          const continuation = cleanInline(currentTrimmed)

          if (lastAppendTarget === 'child' && lastItem.children.length) {
            const lastChildIndex = lastItem.children.length - 1
            lastItem.children[lastChildIndex] = `${lastItem.children[lastChildIndex]}\n${continuation}`
          } else {
            lastItem.text = `${lastItem.text}\n${continuation}`
          }

          index += 1
          continue
        }

        break
      }

      blocks.push({ type: 'list', ordered, items })
      previousImageAlt = ''
      continue
    }

    if (previousImageAlt && trimmed) {
      previousImageAlt = ''
    }

    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = []

      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quoteLines.push(cleanInline(lines[index].trim().replace(/^>\s?/, '')))
        index += 1
      }

      blocks.push({ type: 'quote', text: quoteLines.filter(Boolean).join(' ') })
      continue
    }

    const paragraphLines = [trimmed]
    index += 1

    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith('#') &&
      !lines[index].trim().startsWith('![') &&
      !lines[index].trim().startsWith('|') &&
      !lines[index].trim().startsWith('>') &&
      !getListMatch(lines[index]) &&
      lines[index].trim() !== '---'
    ) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }

    blocks.push({ type: 'paragraph', text: cleanInline(paragraphLines.join('\n')) })
  }

  return blocks.filter((block) => block.type !== 'paragraph' || block.text)
}

export function MarkdownDocument({ markdown, skipMetadata = false, assetBasePath }: MarkdownDocumentProps) {
  const blocks = parseMarkdown(skipMetadata ? stripMetadata(markdown) : markdown, assetBasePath)

  return (
    <div className="min-w-0 space-y-6">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const HeadingTag = block.level === 1 ? 'h2' : block.level === 2 ? 'h3' : 'h4'
          const className =
            block.level === 1
              ? 'min-w-0 pt-4 text-3xl font-bold tracking-tight text-white [overflow-wrap:break-word]'
              : block.level === 2
                ? 'min-w-0 pt-3 text-2xl font-semibold text-white [overflow-wrap:break-word]'
                : 'min-w-0 pt-2 text-xl font-semibold text-teal-200 [overflow-wrap:break-word]'

          return (
            <HeadingTag className={className} key={`${block.text}-${index}`}>
              {block.text}
            </HeadingTag>
          )
        }

        if (block.type === 'image') {
          return (
            <figure className="min-w-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-950" key={`${block.src}-${index}`}>
              <img alt={block.alt || '프로젝트 이미지'} className="h-auto max-h-[780px] w-full object-contain" loading="lazy" src={block.src} />
            </figure>
          )
        }

        if (block.type === 'code') {
          return (
            <div className="min-w-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-950" key={`code-${index}`}>
              {block.language ? (
                <div className="border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {block.language}
                </div>
              ) : null}
              <pre className="min-w-0 overflow-x-auto p-4 text-sm leading-7 text-slate-200">
                <code className="font-mono whitespace-pre">{block.code}</code>
              </pre>
            </div>
          )
        }

        if (block.type === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul'

          return (
            <ListTag
              className={block.ordered ? 'min-w-0 list-decimal space-y-2 pl-6 text-sm leading-7 text-slate-300' : 'min-w-0 list-disc space-y-2 pl-6 text-sm leading-7 text-slate-300'}
              key={`list-${index}`}
            >
              {block.items.map((item) => (
                <li className="min-w-0 rounded-lg bg-slate-950 px-4 py-3 [overflow-wrap:break-word]" key={item.text}>
                  <span className="whitespace-pre-line">{renderInline(item.text, assetBasePath)}</span>
                  {item.children.length ? (
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-400">
                      {item.children.map((child) => (
                        <li className="min-w-0 [overflow-wrap:break-word]" key={child}>
                          {renderInline(child, assetBasePath)}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ListTag>
          )
        }

        if (block.type === 'table') {
          const [head, ...rows] = block.rows

          return (
            <div className="min-w-0 overflow-x-auto rounded-lg border border-slate-800" key={`table-${index}`}>
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead className="bg-slate-950 text-slate-200">
                  <tr>
                    {head.map((cell) => (
                      <th className="border-b border-slate-800 px-4 py-3 font-semibold leading-6 [overflow-wrap:break-word]" key={cell}>
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {rows.map((row) => (
                    <tr key={row.join('-')}>
                      {row.map((cell) => (
                        <td className="min-w-[140px] px-4 py-3 leading-6 [overflow-wrap:break-word]" key={cell}>
                          {renderInline(cell, assetBasePath)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        if (block.type === 'quote') {
          return (
            <blockquote className="min-w-0 rounded-lg border border-slate-800 bg-slate-950 p-5 text-sm font-medium leading-7 text-sky-200 [overflow-wrap:break-word]" key={`quote-${index}`}>
              {renderInline(block.text, assetBasePath)}
            </blockquote>
          )
        }

        if (block.type === 'rule') {
          return <hr className="border-slate-800" key={`rule-${index}`} />
        }

        return (
          <p className="min-w-0 whitespace-pre-line text-sm leading-8 text-slate-300 [overflow-wrap:break-word]" key={`${block.text}-${index}`}>
            {renderInline(block.text, assetBasePath)}
          </p>
        )
      })}
    </div>
  )
}
