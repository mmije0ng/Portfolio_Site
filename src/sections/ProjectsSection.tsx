import { ArrowRight, Bot, Code2, Cpu, ShieldCheck } from 'lucide-react'
import { PillList } from '../components/PillList'
import { SectionHeading } from '../components/SectionHeading'
import { papers } from '../data/portfolio'
import { projects } from '../data/projects'
import { cn } from '../lib/cn'
import { getWorkThumbnail } from '../lib/projectAssets'
import type { Project } from '../types/portfolio'

type ProjectCardProps = {
  project: Project
  featured?: boolean
  onOpen?: (project: Project) => void
}

const categoryStyles = {
  Backend: 'bg-slate-800 text-sky-300',
  Security: 'bg-slate-800 text-teal-300',
  Research: 'bg-slate-800 text-cyan-300',
  AI: 'bg-slate-800 text-amber-300',
  Automotive: 'bg-slate-800 text-slate-300',
  Mobile: 'bg-slate-800 text-emerald-300',
  Frontend: 'bg-slate-800 text-orange-300',
  Data: 'bg-slate-800 text-cyan-300',
}

function renderProjectIcon(category?: string) {
  if (category === 'AI') return <Bot className="h-6 w-6" />
  if (category === 'Security' || category === 'Research') return <ShieldCheck className="h-6 w-6" />
  if (category === 'Automotive' || category === 'Data') return <Cpu className="h-6 w-6" />
  return <Code2 className="h-6 w-6" />
}

export function ProjectCard({ project, featured = false, onOpen }: ProjectCardProps) {
  const categoryClass = categoryStyles[project.category as keyof typeof categoryStyles] ?? categoryStyles.Backend
  const thumbnail = getWorkThumbnail(project.slug)
  const isClickable = Boolean(onOpen && project.slug)
  const handleOpen = () => {
    if (onOpen && project.slug) onOpen(project)
  }

  return (
    <article
      className={cn(
        'group min-w-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-slate-700',
        isClickable && 'cursor-pointer',
        featured && 'md:col-span-2',
      )}
      onClick={isClickable ? handleOpen : undefined}
      onKeyDown={
        isClickable
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleOpen()
              }
            }
          : undefined
      }
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className={cn('grid h-full', featured && 'md:grid-cols-[1.1fr_0.9fr]')}>
        <div className={cn('relative min-h-[220px] overflow-hidden bg-slate-950', featured && 'md:min-h-[360px]')}>
          {thumbnail ? (
            <img
              alt={`${project.title} 썸네일`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              src={thumbnail}
            />
          ) : (
            <div className="flex h-full min-h-[220px] items-center justify-center">
              <div className={cn('flex h-16 w-16 items-center justify-center rounded-lg', categoryClass)}>
                {renderProjectIcon(project.category)}
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-slate-950/85 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur">
            {project.category ?? 'Project'}
          </span>
        </div>
        <div className="flex min-w-0 flex-col p-6">
          <div className="flex items-center gap-3 text-sm font-semibold text-sky-300">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', categoryClass)}>
              {renderProjectIcon(project.category)}
            </div>
            <span>{project.type ?? project.category ?? 'Project'}</span>
          </div>
          <h3 className="mt-5 min-w-0 text-2xl font-semibold tracking-tight text-white [overflow-wrap:break-word]">{project.title}</h3>
          <p className="mt-4 min-w-0 text-sm leading-7 text-slate-400 [overflow-wrap:break-word]">{project.description}</p>
          <p className="mt-5 rounded-lg bg-slate-950 p-4 text-sm font-medium leading-6 text-slate-300">
            {project.impact}
          </p>
          <div className="mt-5">
            <PillList items={project.stack} />
          </div>
        </div>
      </div>
    </article>
  )
}

type ProjectsSectionProps = {
  onNavigate: (path: string) => void
}

export function ProjectsSection({ onNavigate }: ProjectsSectionProps) {
  const featuredProjects = [...projects.slice(0, 4), papers[0]].filter(Boolean)

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8" id="projects-preview">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <SectionHeading
          eyebrow="Featured Work"
          title="대표 프로젝트와 연구"
          description="성과가 큰 프로젝트와 대표 투고 논문을 먼저 볼 수 있게 정리했습니다."
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {featuredProjects.map((project, index) => (
          <ProjectCard
            featured={index === 0}
            key={project.title}
            onOpen={(item) => onNavigate(papers.some((paper) => paper.slug === item.slug) ? `/research/${item.slug}` : `/projects/${item.slug}`)}
            project={project}
          />
        ))}
      </div>
      <div className="mt-8 grid gap-4 rounded-lg border border-slate-800 bg-slate-900 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-semibold text-teal-300">More Work</p>
          <p className="mt-2 text-base font-semibold text-white">
            프로젝트와 투고 논문 전체 목록을 각각 별도 페이지에서 확인할 수 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            onClick={() => onNavigate('/projects')}
            type="button"
          >
            전체 프로젝트 보기
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-teal-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
            onClick={() => onNavigate('/research')}
            type="button"
          >
            전체 투고 논문 보기
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
