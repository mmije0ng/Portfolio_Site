import { ArrowUpRight, CalendarDays, Code2, FolderKanban, Sparkles, Trophy, UserRound } from 'lucide-react'
import { PillList } from './PillList'

type ProjectMetadataPanelProps = {
  markdown: string
  fallbackHighlights?: string[]
  overrideLinks?: { label: string; href: string }[]
}

type Metadata = {
  title?: string
  type?: string
  description?: string
  highlights: string[]
  stack: string[]
  role?: string
  period?: string
  links: { label: string; href: string }[]
}

function normalizeKey(key: string) {
  return key.replace(/\s+/g, '').toLowerCase()
}

function isProjectTypeKey(key: string) {
  const normalized = normalizeKey(key)
  return normalized.includes('프로젝트유형') || normalized.includes('?꾨줈?앺듃?좏삎')
}

function isProjectDescriptionKey(key: string) {
  const normalized = normalizeKey(key)
  return normalized.includes('프로젝트설명') || normalized.includes('?꾨줈?앺듃?ㅻ챸')
}

function isStackKey(key: string) {
  const normalized = normalizeKey(key)
  return normalized.includes('사용기술') || normalized.includes('?ъ슜湲곗닠')
}

function isRoleKey(key: string) {
  const normalized = normalizeKey(key)
  return normalized.includes('담당역할') || normalized.includes('?대떦??븷')
}

function isPeriodKey(key: string) {
  const normalized = normalizeKey(key)
  return normalized.includes('작업기간') || normalized.includes('?묒뾽湲곌컙')
}

function isLinkKey(key: string) {
  const normalized = normalizeKey(key)
  return (
    normalized.includes('github링크') ||
    normalized.includes('논문링크') ||
    key.includes('GitHub') ||
    key.includes('논문') ||
    key.includes('留곹겕') ||
    key.includes('?쇰Ц')
  )
}

function getFallbackLinkLabel(key: string) {
  return key.includes('논문') || key.includes('?쇰Ц') ? '논문 정보' : 'GitHub'
}

function normalizeLinkLabel(sectionKey: string, label: string) {
  const base = getFallbackLinkLabel(sectionKey)
  if (label === base || label.startsWith(`${base} `)) return label
  return `${base} ${label}`.trim()
}

function parseGroupedLinks(key: string, value: string) {
  const links: { label: string; href: string }[] = []
  const parts = value.split(/(?=\S+:\s*https?:\/\/|https?:\/\/)/).map((item) => item.trim()).filter(Boolean)

  parts.forEach((part, index) => {
    const labeledMatch = part.match(/^(.+?):\s*(https?:\/\/\S+)$/)
    const directMatch = part.match(/^(https?:\/\/\S+)$/)

    if (labeledMatch) {
      links.push({ label: normalizeLinkLabel(key, labeledMatch[1].trim()), href: labeledMatch[2] })
      return
    }

    if (directMatch) {
      const fallback = getFallbackLinkLabel(key)
      links.push({ label: index === 0 ? fallback : `${fallback} ${index + 1}`, href: directMatch[1] })
    }
  })

  return links
}

function parseMetadata(markdown: string): Metadata {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const firstImageIndex = lines.findIndex((line) => line.trim().startsWith('!['))
  const metadataLines = (firstImageIndex === -1 ? lines : lines.slice(0, firstImageIndex))
    .map((line) => line.trim())
    .filter(Boolean)

  const metadata: Metadata = {
    title: metadataLines.find((line) => line.startsWith('#'))?.replace(/^#+\s*/, ''),
    highlights: [],
    stack: [],
    links: [],
  }

  let activeLinkKey: string | null = null

  metadataLines.forEach((line) => {
    if (line.startsWith('#')) return

    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) {
      activeLinkKey = null
      metadata.highlights.push(line)
      return
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()

    if (!value) return

    if (isProjectTypeKey(key)) {
      activeLinkKey = null
      metadata.type = value
      return
    }

    if (isProjectDescriptionKey(key)) {
      activeLinkKey = null
      metadata.description = value
      return
    }

    if (isStackKey(key)) {
      activeLinkKey = null
      metadata.stack = value.split(',').map((item) => item.trim()).filter(Boolean)
      return
    }

    if (isRoleKey(key)) {
      activeLinkKey = null
      metadata.role = value
      return
    }

    if (isPeriodKey(key)) {
      activeLinkKey = null
      metadata.period = value
      return
    }

    if (isLinkKey(key)) {
      activeLinkKey = key
      metadata.links.push(...parseGroupedLinks(key, value))
      return
    }

    if (activeLinkKey && /^https?:\/\/\S+$/.test(value)) {
      metadata.links.push({ label: normalizeLinkLabel(activeLinkKey, key), href: value })
      return
    }

    activeLinkKey = null
    metadata.highlights.push(line)
  })

  metadata.highlights = metadata.highlights.filter((highlight) => !highlight.includes('http://') && !highlight.includes('https://'))

  if (markdown.includes('FarmON')) {
    const farmonLoadTestHighlight =
      'N+1 쿼리 제거와 조회 로직 최적화, 커넥션 풀·WAS 설정 최적화를 거친 뒤 Redis 캐시를 도입해 p(95) 지연 시간 62% 단축, 평균 처리량 182% 향상, Peak RPS 221% 향상, 총 처리 요청 수 2.8배 확장'

    metadata.highlights = metadata.highlights.filter((highlight) => highlight !== farmonLoadTestHighlight)
    metadata.highlights.unshift(farmonLoadTestHighlight)
  }

  return metadata
}

export function ProjectMetadataPanel({ markdown, fallbackHighlights = [], overrideLinks }: ProjectMetadataPanelProps) {
  const metadata = parseMetadata(markdown)
  const highlights = metadata.highlights.length ? metadata.highlights : fallbackHighlights.filter(Boolean)
  const links = overrideLinks?.length ? overrideLinks : metadata.links
  const isResearch = markdown.includes('논문 링크:') || markdown.includes('?쇰Ц 留곹겕:')

  return (
    <section className="mb-8 min-w-0 rounded-lg border border-sky-200 bg-white/90 p-6 shadow-sm shadow-sky-100/60 sm:p-8">
      <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
        <FolderKanban className="h-4 w-4" />
        {isResearch ? 'Research Paper' : 'Project'}
      </p>
      {metadata.title ? <h1 className="mt-4 min-w-0 text-4xl font-bold tracking-tight text-slate-800 [overflow-wrap:break-word] sm:text-5xl">{metadata.title}</h1> : null}
      {metadata.description ? <p className="mt-5 min-w-0 text-base leading-8 text-slate-700 [overflow-wrap:break-word]">{metadata.description}</p> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {metadata.type ? (
          <div className="min-w-0 rounded-lg bg-sky-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <Sparkles className="h-4 w-4" />
              {isResearch ? '논문 유형' : '프로젝트 유형'}
            </p>
            <p className="mt-2 min-w-0 text-sm leading-7 text-slate-800 [overflow-wrap:break-word]">{metadata.type}</p>
          </div>
        ) : null}
        {metadata.period ? (
          <div className="min-w-0 rounded-lg bg-sky-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <CalendarDays className="h-4 w-4" />
              작업기간
            </p>
            <p className="mt-2 min-w-0 text-sm leading-7 text-slate-800 [overflow-wrap:break-word]">{metadata.period}</p>
          </div>
        ) : null}
        {metadata.role ? (
          <div className="min-w-0 rounded-lg bg-sky-50 p-4 md:col-span-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <UserRound className="h-4 w-4" />
              담당 역할
            </p>
            <p className="mt-2 min-w-0 text-sm leading-7 text-slate-800 [overflow-wrap:break-word]">{metadata.role}</p>
          </div>
        ) : null}
      </div>

      {highlights.length ? (
        <div className="mt-6 min-w-0 rounded-lg bg-sky-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-400">
            <Trophy className="h-4 w-4" />
            주요 성과
          </p>
          <ul className="mt-3 grid min-w-0 gap-2 text-sm leading-7 text-violet-700 md:grid-cols-2">
            {highlights.map((highlight) => (
              <li className="min-w-0 [overflow-wrap:break-word]" key={highlight}>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {metadata.stack.length ? (
        <div className="mt-6">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-400">
            <Code2 className="h-4 w-4" />
            사용 기술
          </p>
          <PillList items={metadata.stack} />
        </div>
      ) : null}

      {links.length ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {links.map((link) => (
            <a
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
              href={link.href}
              key={`${link.label}-${link.href}`}
              rel="noreferrer"
              target="_blank"
            >
              {link.label}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ))}
        </div>
      ) : null}
    </section>
  )
}
