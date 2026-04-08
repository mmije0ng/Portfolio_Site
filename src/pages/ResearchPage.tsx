import * as Tabs from '@radix-ui/react-tabs'
import { ArrowLeft, BookOpenCheck, FileText, ShieldCheck } from 'lucide-react'
import { papers } from '../data/portfolio'
import { ProjectCard } from '../sections/ProjectsSection'

type ResearchPageProps = {
  onNavigate: (path: string) => void
}

export function ResearchPage({ onNavigate }: ResearchPageProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <button
          className="mb-8 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
          onClick={() => onNavigate('/')}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          홈으로 돌아가기
        </button>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-teal-300">
            <BookOpenCheck className="h-4 w-4" />
            Research Paper
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">논문 목록</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-400">
            한국자동차공학회 사이버보안 세션에 투고한 모빌리티 보안 연구를 주제별로 정리했습니다.
          </p>
        </div>

        <Tabs.Root className="mt-10" defaultValue="papers">
          <Tabs.List className="flex flex-wrap gap-2 rounded-lg border border-slate-800 bg-slate-900 p-2">
            <Tabs.Trigger className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 transition data-[state=active]:bg-teal-300 data-[state=active]:text-slate-950" value="papers">
              <FileText className="h-4 w-4" />
              Papers
            </Tabs.Trigger>
            <Tabs.Trigger className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 transition data-[state=active]:bg-teal-300 data-[state=active]:text-slate-950" value="security">
              <ShieldCheck className="h-4 w-4" />
              Security Focus
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content className="mt-6 grid gap-4 md:grid-cols-2" value="papers">
            {papers.map((paper, index) => (
              <ProjectCard key={paper.title} number={index + 1} onOpen={(item) => onNavigate(`/research/${item.slug}`)} project={paper} />
            ))}
          </Tabs.Content>
          <Tabs.Content className="mt-6 grid gap-4 md:grid-cols-2" value="security">
            {papers
              .filter((paper) => paper.stack.some((item) => item.toLowerCase().includes('security')))
              .map((paper, index) => (
                <ProjectCard key={paper.title} number={index + 1} onOpen={(item) => onNavigate(`/research/${item.slug}`)} project={paper} />
              ))}
          </Tabs.Content>
        </Tabs.Root>
      </section>
    </main>
  )
}
