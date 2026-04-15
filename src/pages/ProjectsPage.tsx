import * as Tabs from '@radix-ui/react-tabs'
import { ArrowLeft, FolderKanban } from 'lucide-react'
import { projects } from '../data/projects'
import { cn } from '../lib/cn'
import { ProjectCard } from '../sections/ProjectsSection'
import type { Project } from '../types/portfolio'

type ProjectsPageProps = {
  onNavigate: (path: string) => void
}

const projectTabs = [
  { label: 'All', value: 'all' },
  { label: 'Backend', value: 'Backend' },
  { label: 'Frontend', value: 'Frontend' },
  { label: 'FullStack', value: 'FullStack' },
  { label: 'Cloud', value: 'Cloud' },
  { label: 'Mobile', value: 'Mobile' },
  { label: 'Security', value: 'Security' },
  { label: 'AI', value: 'AI' },
  { label: 'Data', value: 'Data' },
]

function getProjectCategories(project: Project) {
  if (!project.category) return []
  return Array.isArray(project.category) ? project.category : [project.category]
}

export function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50 to-violet-50 text-slate-800">
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <button
          className="mb-8 inline-flex items-center gap-2 rounded-lg border border-sky-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400"
          onClick={() => onNavigate('/')}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </button>
        <div className="grid gap-6 rounded-lg border border-sky-200 bg-white/90 p-6 shadow-sm shadow-sky-100/60 md:grid-cols-[1fr_220px] md:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">
              <FolderKanban className="h-4 w-4" />
              Projects
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">프로젝트 목록</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
              주요 프로젝트를 중심으로 구성했습니다.
              <br />
              각 프로젝트 카드를 클릭하면 개요, 구현 기여, 문제 해결 과정을 확인할 수 있습니다.
            </p>
          </div>
          <div className="rounded-lg bg-gradient-to-br from-sky-500 to-violet-500 p-5 text-white">
            <p className="text-sm font-semibold text-white/85">Total Projects</p>
            <p className="mt-2 text-5xl font-extrabold">{projects.length}</p>
          </div>
        </div>

        <Tabs.Root className="mt-10" defaultValue="all">
          <Tabs.List className="flex flex-wrap gap-2 rounded-lg border border-sky-200 bg-white/90 p-2">
            {projectTabs.map((tab) => (
              <Tabs.Trigger
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-sky-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-violet-500 data-[state=active]:text-white"
                key={tab.value}
                value={tab.value}
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {projectTabs.map((tab) => {
            const filteredProjects =
              tab.value === 'all' ? projects : projects.filter((project) => getProjectCategories(project).includes(tab.value))

            return (
              <Tabs.Content className={cn('mt-6 grid gap-4 md:grid-cols-2')} key={tab.value} value={tab.value}>
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    featured={index === 0 && tab.value === 'all'}
                    key={project.title}
                    number={index + 1}
                    onOpen={(item) => onNavigate(`/projects/${item.slug}`)}
                    project={project}
                  />
                ))}
              </Tabs.Content>
            )
          })}
        </Tabs.Root>
      </section>
    </main>
  )
}
