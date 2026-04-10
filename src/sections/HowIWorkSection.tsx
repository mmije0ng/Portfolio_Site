import { Compass, GitBranch, Handshake, Layers3, ShieldCheck, Users } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'
import { workPrinciples } from '../data/portfolio'

const icons = [Compass, ShieldCheck, GitBranch, Users, Layers3, Handshake]
const accentStyles = [
  'bg-sky-400/10 text-sky-300',
  'bg-teal-400/10 text-teal-300',
  'bg-amber-400/10 text-amber-300',
  'bg-rose-400/10 text-rose-300',
  'bg-violet-400/10 text-violet-300',
  'bg-emerald-400/10 text-emerald-300',
]

export function HowIWorkSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8" id="how-i-work">
      <SectionHeading
        eyebrow="How I Work"
        title="문제를 푸는 방식과 협업의 기준"
        description="기술 선택부터 설계, 커뮤니케이션, 팀워크까지 일할 때 꾸준히 지키려는 기준들입니다."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {workPrinciples.map((principle, index) => {
          const Icon = icons[index] ?? Compass
          const accentStyle = accentStyles[index] ?? accentStyles[0]

          return (
            <article
              className="rounded-lg border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-slate-700"
              key={principle.title}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${accentStyle}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{principle.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{principle.description}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
