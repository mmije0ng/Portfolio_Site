import { ArrowUpRight, CalendarDays, Code2, FolderKanban, Sparkles, Trophy, UserRound } from 'lucide-react'
import { PillList } from './PillList'

type ProjectMetadataPanelProps = {
  markdown: string
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

  metadataLines.forEach((line) => {
    if (line.startsWith('#')) return

    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) {
      metadata.highlights.push(line)
      return
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()

    if (!value) return

    if (key === '프로젝트 유형' || key.includes('프로젝트') && key.includes('유형')) metadata.type = value
    else if (key === '프로젝트 설명' || key.includes('프로젝트') && key.includes('설명')) metadata.description = value
    else if (key === '사용 기술' || key.includes('사용') && key.includes('기술')) metadata.stack = value.split(',').map((item) => item.trim()).filter(Boolean)
    else if (key === '담당 역할' || key.includes('담당') && key.includes('역할')) metadata.role = value
    else if (key === '작업기간' || key.includes('작업') && key.includes('기간')) metadata.period = value
    else if (key === 'GitHub 링크' || key === '논문 링크' || key.includes('GitHub') || key.includes('논문')) {
      const links = value.split(/(?=\S+:\s*https?:\/\/|https?:\/\/)/).map((item) => item.trim()).filter(Boolean)

      links.forEach((linkText, index) => {
        const labeledMatch = linkText.match(/^(.+?):\s*(https?:\/\/\S+)$/)
        const directMatch = linkText.match(/^(https?:\/\/\S+)$/)

        if (labeledMatch) {
          metadata.links.push({ label: labeledMatch[1], href: labeledMatch[2] })
        } else if (directMatch) {
          const fallbackLabel = key.includes('논문') ? '논문 정보' : 'GitHub'
          metadata.links.push({ label: index === 0 ? fallbackLabel : `${fallbackLabel} ${index + 1}`, href: directMatch[1] })
        }
      })
    } else {
      metadata.highlights.push(line)
    }
  })

  metadata.highlights = metadata.highlights.filter((highlight) => !/레포지토리:\s*https?:\/\//.test(highlight))

  if (markdown.includes('FarmON')) {
    const farmonLoadTestHighlight =
      'N+1 쿼리 제거와 조회 로직 최적화, 커넥션 풀·WAS 설정 최적화를 거친 뒤 Redis 캐시를 도입해\np(95) 지연 시간 62% 단축, 평균 처리량 182% 향상\n, Peak RPS 221% 향상, 총 처리 요청 수 2.8배 확장'

    metadata.highlights = metadata.highlights.filter((highlight) => highlight !== farmonLoadTestHighlight)
    metadata.highlights.unshift(farmonLoadTestHighlight)
  }

  return metadata
}

export function ProjectMetadataPanel({ markdown }: ProjectMetadataPanelProps) {
  const metadata = parseMetadata(markdown)
  const isResearch = markdown.includes('논문 링크:') || markdown.includes('?쇰Ц')

  return (
    <section className="mb-8 min-w-0 rounded-lg border border-slate-800 bg-slate-900 p-6 sm:p-8">
      <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
        <FolderKanban className="h-4 w-4" />
        {isResearch ? 'Research Paper' : 'Project'}
      </p>
      {metadata.title ? <h1 className="mt-4 min-w-0 text-4xl font-bold tracking-tight text-white [overflow-wrap:break-word] sm:text-5xl">{metadata.title}</h1> : null}
      {metadata.description ? <p className="mt-5 min-w-0 text-base leading-8 text-slate-300 [overflow-wrap:break-word]">{metadata.description}</p> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {metadata.type ? (
          <div className="min-w-0 rounded-lg bg-slate-950 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <Sparkles className="h-4 w-4" />
              {isResearch ? '논문 유형' : '프로젝트 유형'}
            </p>
            <p className="mt-2 min-w-0 text-sm leading-7 text-white [overflow-wrap:break-word]">{metadata.type}</p>
          </div>
        ) : null}
        {metadata.period ? (
          <div className="min-w-0 rounded-lg bg-slate-950 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <CalendarDays className="h-4 w-4" />
              작업기간
            </p>
            <p className="mt-2 min-w-0 text-sm leading-7 text-white [overflow-wrap:break-word]">{metadata.period}</p>
          </div>
        ) : null}
        {metadata.role ? (
          <div className="min-w-0 rounded-lg bg-slate-950 p-4 md:col-span-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <UserRound className="h-4 w-4" />
              담당 역할
            </p>
            <p className="mt-2 min-w-0 text-sm leading-7 text-white [overflow-wrap:break-word]">{metadata.role}</p>
          </div>
        ) : null}
      </div>

      {metadata.highlights.length ? (
        <div className="mt-6 min-w-0 rounded-lg bg-slate-950 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-400">
            <Trophy className="h-4 w-4" />
            주요 성과
          </p>
          <ul className="mt-3 grid min-w-0 gap-2 text-sm leading-7 text-teal-200 md:grid-cols-2">
            {metadata.highlights.map((highlight) => (
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

      {metadata.links.length ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {metadata.links.map((link) => (
            <a
              className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
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
