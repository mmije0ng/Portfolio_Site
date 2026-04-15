import { useEffect, useRef, useState } from 'react'
import { ContactRound, GraduationCap, Quote, UserRound } from 'lucide-react'
import { profile } from '../data/portfolio'

const profileFacts = [
  {
    icon: GraduationCap,
    label: 'Education',
    value: profile.education,
  },
  { icon: UserRound, label: 'GPA', value: `${profile.gpa}\n성적 우수 장학금 3회 수상` },
  {
    icon: ContactRound,
    label: 'Contact',
    links: [
      { label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
      { label: 'GitHub', value: profile.github, href: profile.github },
      { label: 'LinkedIn', value: profile.linkedin, href: profile.linkedin },
    ],
  },
]

export function AboutSection() {
  const titleRef = useRef<HTMLSpanElement | null>(null)
  const [titleAnimated, setTitleAnimated] = useState(false)

  useEffect(() => {
    const node = titleRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setTitleAnimated(true)
        observer.disconnect()
      },
      { threshold: 0.4 },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8" id="about">
      <div className="mb-8 max-w-4xl">
        <p className="animate-[fadeUp_0.55s_ease-out_both] text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
          Profile
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          <span
            aria-label="Backend Engineer Across Product, Infra, and Security"
            className={`profile-title-gradient ${titleAnimated ? 'profile-title-typing-once' : 'profile-title-hidden'}`}
            data-text="Backend Engineer Across Product, Infra, and Security"
            ref={titleRef}
          >
            Backend Engineer Across Product, Infra, and Security
          </span>
        </h2>
        <p className="mt-4 animate-[fadeUp_0.85s_ease-out_both] text-sm leading-7 text-slate-600">
          서비스 개발, 인프라 운영, 성능 개선, 보안 연구 경험을 하나의 흐름으로 연결해 문제를 해결해왔습니다.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-sky-200/80 bg-gradient-to-br from-sky-50/72 via-white/42 to-violet-50/68 p-6 shadow-sm shadow-sky-100/60 backdrop-blur-sm">
          <div className="space-y-5 text-base leading-8 text-slate-700">
            {profile.summary.map((paragraph) => (
              <p className="text-pretty break-keep" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
          <blockquote className="mt-5 flex gap-4 rounded-lg bg-gradient-to-r from-sky-500 to-violet-500 p-5 text-white">
            <Quote className="h-6 w-6 shrink-0 text-white" />
            <p className="whitespace-pre-line font-semibold leading-7">{profile.quote}</p>
          </blockquote>
        </div>
        <div className="grid gap-4">
          {profileFacts.map((fact) => {
            const Icon = fact.icon

            return (
              <div className="rounded-lg border border-sky-200/80 bg-gradient-to-br from-sky-50/68 via-white/38 to-indigo-50/62 p-5 shadow-sm shadow-sky-100/60 backdrop-blur-sm" key={fact.label}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-slate-800">{fact.label}</p>
                </div>
                {'links' in fact && fact.links ? (
                  <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-600">
                    {fact.links.map((link) => (
                      <li className="grid gap-1" key={link.label}>
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {link.label}
                        </span>
                        <a className="hover:text-sky-300" href={link.href} rel="noreferrer" target={link.href.startsWith('http') ? '_blank' : undefined}>
                          {link.value}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{fact.value}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
