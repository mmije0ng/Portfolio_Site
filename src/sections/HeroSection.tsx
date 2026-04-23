import { ArrowRight, DatabaseZap, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import profilePhoto from '../assets/박미정_이력서 사진.jpg'
import { CVIcon, GitHubIcon, LinkedInIcon } from '../components/BrandIcons'
import { heroStats, links, profile, profileKeywords } from '../data/portfolio'

const focusItems = [
  { label: 'Backend', text: 'Spring Boot 기반 서비스 설계' },
  { label: 'Security', text: 'SDV·IoT 보안 연구 경험' },
  { label: 'Performance', text: '부하 테스트와 병목 개선' },
]

function renderFocusIcon(label: string) {
  if (label === 'Security') return <ShieldCheck className="h-5 w-5" />
  if (label === 'Performance') return <Sparkles className="h-5 w-5" />
  return <DatabaseZap className="h-5 w-5" />
}

export function HeroSection() {
  const cvLink = links.find((link) => link.label === 'CV')?.href
  const educationHeadline = profile.education.split('\n')[0]
  const roleLabel = 'Backend Engineer Across Product, Infra, and Security'

  return (
    <section className="border-b border-sky-200/70 bg-gradient-to-br from-sky-100 via-indigo-100 to-violet-100">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_260px] lg:items-start lg:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-lg border border-sky-200/80 bg-gradient-to-r from-sky-50/80 via-white/45 to-violet-50/72 px-3 py-2 text-xs font-semibold text-sky-700 shadow-sm shadow-sky-100/60 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            {roleLabel}
          </div>
          <h1 className="mt-6 whitespace-pre-line text-xl font-bold leading-tight tracking-tight text-slate-800 sm:text-3xl">{profile.tagline}</h1>
          <div className="mt-6 flex max-w-3xl flex-wrap gap-2">
            {profileKeywords.map((keyword) => (
              <span className="rounded-md bg-gradient-to-r from-sky-50/82 via-white/42 to-indigo-50/72 px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-sky-200/80 backdrop-blur-sm" key={keyword}>
                {keyword}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:brightness-105"
              href="/projects"
              rel="noreferrer"
              target="_blank"
            >
              프로젝트 보기
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-sky-200/80 bg-gradient-to-r from-sky-50/74 via-white/34 to-violet-50/68 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 backdrop-blur-sm"
              href={`mailto:${profile.email}`}
            >
              <Mail className="h-4 w-4" />
              Mail
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-sky-200/80 bg-gradient-to-r from-sky-50/74 via-white/34 to-violet-50/68 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 backdrop-blur-sm"
              href={profile.github}
              rel="noreferrer"
              target="_blank"
            >
              <GitHubIcon className="h-4 w-4" />
              GitHub
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-sky-200/80 bg-gradient-to-r from-sky-50/74 via-white/34 to-violet-50/68 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 backdrop-blur-sm"
              href={profile.linkedin}
              rel="noreferrer"
              target="_blank"
            >
              <LinkedInIcon className="h-4 w-4" />
              LinkedIn
            </a>
            {cvLink ? (
              <a
                className="inline-flex items-center gap-2 rounded-lg border border-sky-200/80 bg-gradient-to-r from-sky-50/74 via-white/34 to-violet-50/68 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 backdrop-blur-sm"
                href={cvLink}
                rel="noreferrer"
                target="_blank"
              >
                <CVIcon className="h-4 w-4" />
                CV
              </a>
            ) : null}
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {focusItems.map((item) => (
              <article className="rounded-lg border border-sky-200/80 bg-gradient-to-br from-sky-50/74 via-white/40 to-indigo-50/68 p-4 shadow-sm shadow-sky-100/70 backdrop-blur-sm" key={item.label}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                  {renderFocusIcon(item.label)}
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {heroStats.map((stat) => (
              <div className="rounded-lg border border-sky-200/80 bg-gradient-to-br from-sky-50/72 via-white/38 to-violet-50/64 p-4 shadow-sm shadow-sky-100/60 backdrop-blur-sm" key={stat.label}>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{stat.label}</dt>
                <dd className="mt-2 text-lg font-semibold text-slate-800">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="grid w-full max-w-[220px] gap-4 justify-self-start lg:self-end lg:justify-self-end">
          <div className="rounded-lg border border-sky-200/80 bg-gradient-to-br from-sky-50/82 via-white/50 to-violet-50/70 p-3 shadow-xl shadow-sky-200/60 backdrop-blur-sm">
            <img alt={`${profile.name} 프로필 사진`} className="aspect-[3/4] w-full rounded-md object-cover object-top" src={profilePhoto} />
            <div className="p-3">
              <p className="text-base font-semibold text-slate-800">{profile.name}</p>
              <dl className="mt-3 grid gap-2 text-xs leading-5 text-slate-600">
                <div>
                  <dt className="font-semibold uppercase tracking-[0.14em] text-slate-500">Birth</dt>
                  <dd className="mt-1">{profile.birthDate}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-[0.14em] text-slate-500">Education</dt>
                  <dd className="mt-1">{educationHeadline}</dd>
                </div>
              </dl>
            </div>
          </div>

        </aside>
      </div>
    </section>
  )
}
