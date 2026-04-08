import { ArrowUpRight, BriefcaseBusiness, FlaskConical, Trophy } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'
import { experiences } from '../data/portfolio'
import type { Link } from '../types/portfolio'

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
        className="inline-flex items-center gap-1 text-sm font-semibold text-sky-300 transition hover:text-sky-200"
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
      className="inline-flex items-center gap-1 text-sm font-semibold text-sky-300 transition hover:text-sky-200"
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
        description="프로젝트형 인턴, 동아리 백엔드 리드, 모빌리티 보안 연구를 시간 흐름에 따라 정리했습니다."
      />
      <div className="relative grid gap-5 lg:grid-cols-2">
        <div className="absolute left-4 top-0 hidden h-full w-px bg-slate-800 lg:block" />
        {experiences.map((experience, index) => {
          const Icon = getIcon(experience.category)
          const accentClass = index % 3 === 0 ? 'bg-sky-400 text-slate-950' : index % 3 === 1 ? 'bg-slate-800 text-sky-300' : 'bg-slate-800 text-teal-300'
          const links = experience.links ?? (experience.link ? [experience.link] : [])

          return (
            <article
              className="relative rounded-lg border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-slate-700"
              key={experience.title}
            >
              <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${accentClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-sky-300">
                      {experience.category}
                    </p>
                    <p className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-400">
                      {experience.period}
                    </p>
                  </div>
                  <h3 className="mt-3 whitespace-pre-line text-xl font-semibold text-white">{experience.title}</h3>
                </div>
              </div>
              <p className="mt-4 text-base leading-7 text-slate-300">{experience.description}</p>
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-slate-400">
                {experience.bullets.map((bullet) => (
                  <li className="flex gap-2" key={bullet}>
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                    <span>{bullet}</span>
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
            </article>
          )
        })}
      </div>
    </section>
  )
}
