import * as Tabs from '@radix-ui/react-tabs'
import { ArrowLeft, BookOpenCheck, FileText, ShieldCheck } from 'lucide-react'
import { papers } from '../data/portfolio'
import { ProjectCard } from '../sections/ProjectsSection'

type ResearchPageProps = {
  onNavigate: (path: string) => void
}

export function ResearchPage({ onNavigate }: ResearchPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50 to-violet-50 text-slate-800">
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <button
          className="mb-8 inline-flex items-center gap-2 rounded-lg border border-sky-300/80 bg-gradient-to-r from-sky-50/78 via-white/38 to-violet-50/68 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 backdrop-blur-sm"
          onClick={() => onNavigate('/')}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </button>
        <div className="rounded-lg border border-sky-200/80 bg-gradient-to-br from-sky-50/74 via-white/40 to-violet-50/66 p-6 shadow-sm shadow-sky-100/60 backdrop-blur-sm">
          <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-violet-700">
            <BookOpenCheck className="h-4 w-4" />
            Research Paper
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">논문 목록</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            모빌리티·보안 연구실에서 학부연구생으로 활동하며 투고한 논문을 구성했습니다.
            <br />
            각 논문 카드를 클릭하면 연구 배경, 목표, 실험 결과를 확인할 수 있습니다.
          </p>
        </div>

        <Tabs.Root className="mt-10" defaultValue="papers">
          <Tabs.List className="flex flex-wrap gap-2 rounded-lg border border-sky-200/80 bg-gradient-to-r from-sky-50/74 via-white/36 to-violet-50/64 p-2 backdrop-blur-sm">
            <Tabs.Trigger className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-sky-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white" value="papers">
              <FileText className="h-4 w-4" />
              Papers
            </Tabs.Trigger>
            <Tabs.Trigger className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-sky-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white" value="security">
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
