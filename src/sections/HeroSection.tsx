import { ArrowRight, DatabaseZap, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import profilePhoto from '../assets/박미정_이력서 사진.jpg'
import { CVIcon, GitHubIcon, LinkedInIcon } from '../components/BrandIcons'
import { heroStats, links, profile, profileKeywords } from '../data/portfolio'

type HeroSectionProps = {
  onNavigate: (path: string, hash?: string) => void
}

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

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const cvLink = links.find((link) => link.label === 'CV')?.href

  return (
    <section className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_260px] lg:items-center lg:py-24">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-sky-300">
            <Sparkles className="h-4 w-4" />
            {profile.role}
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            {profile.tagline}
          </h1>
          <div className="mt-6 flex max-w-3xl flex-wrap gap-2">
            {profileKeywords.map((keyword) => (
              <span className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-slate-300 ring-1 ring-slate-800" key={keyword}>
                {keyword}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
              onClick={() => onNavigate('/projects')}
              type="button"
            >
              프로젝트 보기
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
              href={`mailto:${profile.email}`}
            >
              <Mail className="h-4 w-4" />
              Mail
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
              href={profile.github}
              rel="noreferrer"
              target="_blank"
            >
              <GitHubIcon className="h-4 w-4" />
              GitHub
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
              href={profile.linkedin}
              rel="noreferrer"
              target="_blank"
            >
              <LinkedInIcon className="h-4 w-4" />
              LinkedIn
            </a>
            {cvLink ? (
              <a
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
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
              <article className="rounded-lg border border-slate-800 bg-slate-900 p-4" key={item.label}>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-sky-300">
                  {renderFocusIcon(item.label)}
                </div>
                <p className="mt-4 text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="grid w-full max-w-[220px] gap-4 justify-self-start lg:justify-self-end">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 shadow-2xl shadow-slate-950/40">
            <img
              alt={`${profile.name} 프로필 사진`}
              className="aspect-[3/4] w-full rounded-md object-cover object-top"
              src={profilePhoto}
            />
            <div className="p-3">
              <p className="text-base font-semibold text-white">{profile.name}</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">{profile.education}</p>
            </div>
          </div>
          <dl className="grid gap-3">
            {heroStats.map((stat) => (
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-4" key={stat.label}>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{stat.label}</dt>
                <dd className="mt-2 text-lg font-semibold text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  )
}
