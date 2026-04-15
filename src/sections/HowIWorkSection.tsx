import { Compass, GitBranch, Handshake, Layers3, ShieldCheck, Users } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'
import { workPrinciples } from '../data/portfolio'

const icons = [Compass, ShieldCheck, GitBranch, Users, Layers3, Handshake]
const accentStyles = [
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700',
]

export function HowIWorkSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8" id="how-i-work">
      <SectionHeading
        eyebrow="How I Work"
        title="협업의 기준과 문제를 해결하는 방식"
        description="기술 선택부터 설계, 커뮤니케이션, 팀워크까지 일할 때 꾸준히 지키려는 기준들입니다."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workPrinciples.map((principle, index) => {
          const Icon = icons[index] ?? Compass
          const accentStyle = accentStyles[index] ?? accentStyles[0]

          return (
            <article
              className="rounded-lg border border-sky-200/80 bg-gradient-to-br from-sky-50/74 via-white/38 to-indigo-50/64 p-6 shadow-sm shadow-sky-100/60 transition hover:-translate-y-1 hover:border-sky-300 backdrop-blur-sm"
              key={principle.title}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${accentStyle}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-800">{principle.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{principle.description}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
