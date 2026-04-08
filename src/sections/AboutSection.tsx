import { ContactRound, GraduationCap, Quote, UserRound } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'
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
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8" id="about">
      <SectionHeading eyebrow="Profile" title={`${profile.name} · ${profile.role}`} />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
          <div className="space-y-5 text-base leading-8 text-slate-300">
            {profile.summary.map((paragraph) => (
              <p className="text-pretty break-keep" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
          <blockquote className="mt-5 flex gap-4 rounded-lg bg-slate-950 p-5 text-white">
            <Quote className="h-6 w-6 shrink-0 text-sky-300" />
            <p className="whitespace-pre-line font-semibold leading-7">{profile.quote}</p>
          </blockquote>
        </div>
        <div className="grid gap-4">
          {profileFacts.map((fact) => {
            const Icon = fact.icon

            return (
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-5" key={fact.label}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-sky-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-semibold text-white">{fact.label}</p>
                </div>
                {'links' in fact && fact.links ? (
                  <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-400">
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
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-400">{fact.value}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
