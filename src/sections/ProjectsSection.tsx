import { ArrowRight, Bot, Code2, Cpu, Layers, ShieldCheck } from 'lucide-react'
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
  number?: number
  onOpen?: (project: Project) => void
  compact?: boolean
}

const categoryStyles = {
  Backend: 'bg-sky-100 text-sky-700',
  FullStack: 'bg-violet-100 text-violet-700',
  'DevOps · Cloud': 'bg-indigo-100 text-indigo-700',
  Security: 'bg-cyan-100 text-cyan-700',
  Research: 'bg-purple-100 text-purple-700',
  AI: 'bg-fuchsia-100 text-fuchsia-700',
  Automotive: 'bg-slate-100 text-slate-700',
  Mobile: 'bg-blue-100 text-blue-700',
  Frontend: 'bg-sky-100 text-sky-700',
  Data: 'bg-indigo-100 text-indigo-700',
} as const

function getProjectCategories(project: Project) {
  if (!project.category) return []
  return Array.isArray(project.category) ? project.category : [project.category]
}

function getPrimaryCategory(project: Project) {
  return getProjectCategories(project)[0] ?? 'Backend'
}

function getCategoryLabel(project: Project) {
  const categories = getProjectCategories(project)
  return categories.length ? categories.join(' / ') : 'Project'
}

function renderProjectIcon(category?: string) {
  if (category === 'AI') return <Bot className="h-6 w-6" />
  if (category === 'DevOps · Cloud') return <Cpu className="h-6 w-6" />
  if (category === 'Security' || category === 'Research') return <ShieldCheck className="h-6 w-6" />
  if (category === 'Automotive' || category === 'Data') return <Cpu className="h-6 w-6" />
  if (category === 'FullStack') return <Layers className="h-6 w-6" />
  return <Code2 className="h-6 w-6" />
}

export function ProjectCard({ project, featured = false, number, onOpen, compact = false }: ProjectCardProps) {
  const primaryCategory = getPrimaryCategory(project)
  const categoryClass = categoryStyles[primaryCategory as keyof typeof categoryStyles] ?? categoryStyles.Backend
  const categoryLabel = getCategoryLabel(project)
  const thumbnail = getWorkThumbnail(project.slug)
  const isClickable = Boolean(onOpen && project.slug)
  const useLegacyThumbnailLayout = project.slug === 'iot-ota-platform'
  const compactThumbnailClass = useLegacyThumbnailLayout ? 'object-cover object-[55%_55%] scale-[1.03]' : 'object-cover object-[center_68%]'

  const handleOpen = () => {
    if (onOpen && project.slug) onOpen(project)
  }

  return (
    <article
      className={cn(
        'group min-w-0 overflow-hidden rounded-lg border border-sky-200/80 bg-gradient-to-br from-sky-50/74 via-white/40 to-violet-50/68 transition hover:border-sky-300 hover:shadow-[0_18px_40px_rgba(56,189,248,0.2)] backdrop-blur-sm',
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
        <div
          className={cn(
            useLegacyThumbnailLayout
              ? compact
                ? 'relative min-h-[195px] overflow-hidden bg-sky-50'
                : 'relative min-h-[240px] overflow-hidden bg-sky-50'
              : compact
                ? 'relative h-[210px] overflow-hidden bg-sky-50'
                : 'relative h-[270px] overflow-hidden bg-sky-50',
            featured && useLegacyThumbnailLayout && (compact ? 'md:min-h-[270px]' : 'md:min-h-[350px]'),
          )}
        >
          {thumbnail ? (
            <img
              alt={`${project.title} thumbnail`}
              className={cn(
                'absolute inset-0 block h-full w-full transition duration-500 ease-out group-hover:brightness-105',
                compact ? compactThumbnailClass : 'object-cover object-center',
                compact ? 'group-hover:scale-[1.02]' : 'group-hover:scale-[1.01]',
              )}
              loading="lazy"
              src={thumbnail}
            />
          ) : (
            <div className={cn('flex h-full items-center justify-center', useLegacyThumbnailLayout ? 'min-h-[240px]' : 'w-full')}>
              <div className={cn('flex h-16 w-16 items-center justify-center rounded-lg', categoryClass)}>
                {renderProjectIcon(primaryCategory)}
              </div>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-sky-100/90 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-white/65 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-md">
            {categoryLabel}
          </span>
        </div>
        <div className={cn('flex min-w-0 flex-col', compact ? 'p-4' : 'p-6')}>
          <div className="flex items-center gap-3 text-sm font-semibold text-sky-700">
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', categoryClass)}>
              {renderProjectIcon(primaryCategory)}
            </div>
            <span>{project.type ?? categoryLabel}</span>
          </div>
          <h3 className={cn('mt-4 min-w-0 font-semibold tracking-tight text-slate-800 [overflow-wrap:break-word]', compact ? 'text-lg' : 'text-2xl')}>
            {number ? `${number}. ` : ''}
            {project.title}
          </h3>
          <p className={cn('mt-3 min-w-0 text-slate-600 [overflow-wrap:break-word]', compact ? 'text-xs leading-6' : 'text-sm leading-7')}>
            {project.description}
          </p>
          <p className={cn('mt-4 rounded-lg bg-sky-50 text-sm font-medium text-slate-700', compact ? 'p-3 text-xs leading-5' : 'p-4 leading-6')}>
            {project.impact}
          </p>
          <div className="mt-4">
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
          description="문제 해결의 경험과 성과가 집약된 주요 프로젝트 및 투고 논문을 한눈에 볼 수 있도록 정리했습니다."
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {featuredProjects.map((project, index) => (
          <ProjectCard
            featured={index === 0}
            key={project.title}
            number={index + 1}
            onOpen={(item) => onNavigate(papers.some((paper) => paper.slug === item.slug) ? `/research/${item.slug}` : `/projects/${item.slug}`)}
            project={project}
          />
        ))}
      </div>
      <div className="mt-8 grid gap-4 rounded-lg border border-sky-200/80 bg-gradient-to-r from-sky-50/76 via-white/42 to-violet-50/66 p-5 shadow-sm shadow-sky-100/60 backdrop-blur-sm md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm font-semibold text-violet-700">More Work</p>
          <p className="mt-2 text-base font-semibold text-slate-800">프로젝트와 연구 전체 목록은 각각 별도 페이지에서 확인할 수 있습니다.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
            onClick={() => onNavigate('/projects')}
            type="button"
          >
            전체 프로젝트 보기
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
            onClick={() => onNavigate('/research')}
            type="button"
          >
            전체 연구 보기
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
