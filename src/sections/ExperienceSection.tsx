import { ArrowUpRight, BriefcaseBusiness, FlaskConical, Trophy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { SectionHeading } from '../components/SectionHeading'
import { experiences } from '../data/portfolio'
import { cn } from '../lib/cn'
import type { Link } from '../types/portfolio'

const completionLinksByProject: Record<string, Link> = {
  '/projects/money-touch': {
    label: '수료증 보기',
    href: 'https://www.kolleges.net/ko/neordinary/achievement/8909?utm_source=linkedin',
  },
  '/projects/farmon': {
    label: '수료증 보기',
    href: 'https://www.kolleges.net/ko/neordinary/achievement/2340?utm_source=linkedin',
  },
}

function formatPeriodLabel(period: string) {
  return period
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*(?:->|→|=>|~)\s*/g, ' - ')
}

function getIcon(category: string) {
  if (category.includes('Research')) return FlaskConical
  if (category.includes('Competition')) return Trophy
  return BriefcaseBusiness
}

type ExperienceSectionProps = {
  onNavigate: (path: string) => void
}

function ExperienceLink({ link, onNavigate }: { link: Link; onNavigate: (path: string) => void }) {
  const isInternal = link.href.startsWith('/')

  if (isInternal) {
    return (
      <button
        className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 transition hover:text-violet-700"
        onClick={() => onNavigate(link.href)}
        type="button"
      >
        {link.label}
        <ArrowUpRight className="h-4 w-4" />
      </button>
    )
  }

  return (
    <a
      className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 transition hover:text-violet-700"
      href={link.href}
      rel="noreferrer"
      target="_blank"
    >
      {link.label}
      <ArrowUpRight className="h-4 w-4" />
    </a>
  )
}

export function ExperienceSection({ onNavigate }: ExperienceSectionProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8" id="experience">
      <SectionHeading
        eyebrow="Experience"
        title="실사용, 성능 개선, 연구 과제까지 이어진 경험"
        description="프로젝트형 인턴, 모빌리티 보안 학부연구생, 백엔드 리드 등 주요 경험을 시간 흐름에 따라 정리했습니다."
      />
      <ol className="grid gap-4">
        {experiences.map((experience, index) => {
          const accentClass =
            index % 3 === 0 ? 'bg-sky-500 text-white' : index % 3 === 1 ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'
          const baseLinks = experience.links ?? (experience.link ? [experience.link] : [])
          const completionLink = experience.link ? completionLinksByProject[experience.link.href] : undefined
          const links = completionLink ? [...baseLinks, completionLink] : baseLinks

          return (
            <ExperienceItem
              accentClass={accentClass}
              experience={experience}
              key={experience.title}
              index={index}
              links={links}
              onNavigate={onNavigate}
            />
          )
        })}
      </ol>
    </section>
  )
}

type ExperienceItemProps = {
  accentClass: string
  experience: (typeof experiences)[number]
  index: number
  links: Link[]
  onNavigate: (path: string) => void
}

function ExperienceItem({ accentClass, experience, index, links, onNavigate }: ExperienceItemProps) {
  const itemRef = useRef<HTMLLIElement | null>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const Icon = getIcon(experience.category)

  useEffect(() => {
    const item = itemRef.current

    if (!item || hasAnimated) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return

        setHasAnimated(true)
        observer.disconnect()
      },
      {
        threshold: 0.45,
        rootMargin: '0px 0px -12% 0px',
      },
    )

    observer.observe(item)

    return () => observer.disconnect()
  }, [hasAnimated])

  return (
    <li
      className={cn(
        'group rounded-xl border border-sky-100/80 bg-gradient-to-br from-sky-50/74 via-white/38 to-indigo-50/62 px-5 shadow-sm shadow-sky-100/40 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_18px_40px_rgba(14,165,233,0.12)]',
        hasAnimated ? 'animate-[fadeUp_0.38s_ease-out_both]' : 'translate-y-8 opacity-0',
      )}
      ref={itemRef}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <article className="grid gap-4 py-6 transition sm:py-7 md:grid-cols-[180px_1fr] md:gap-8">
        <div className="flex items-start justify-between gap-4 md:block">
          <div className="min-w-0">
            <p className="min-w-0 text-sm font-semibold text-slate-800 [overflow-wrap:anywhere]">
              {formatPeriodLabel(experience.period)}
            </p>
            <p className="mt-2 inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              {experience.category}
            </p>
          </div>
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accentClass} transition duration-300 group-hover:scale-105 md:mt-1`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-black tracking-[0.18em] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="min-w-0 whitespace-pre-line text-lg font-semibold text-slate-800 [overflow-wrap:anywhere] transition duration-300 group-hover:text-sky-800 sm:text-xl">
              {experience.title}
            </h3>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-700">{experience.description}</p>

          <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-700">
            {experience.bullets.map((bullet) => (
              <li className="flex gap-2" key={bullet}>
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                <span className="min-w-0 [overflow-wrap:anywhere]">{bullet}</span>
              </li>
            ))}
          </ul>

          {links.length ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {links.map((link) => (
                <ExperienceLink key={`${link.label}-${link.href}`} link={link} onNavigate={onNavigate} />
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </li>
  )
}
