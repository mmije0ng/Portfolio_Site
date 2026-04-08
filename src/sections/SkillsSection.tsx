import { Boxes, Cloud, Database, Shield } from 'lucide-react'
import { PillList } from '../components/PillList'
import { SectionHeading } from '../components/SectionHeading'
import { skillGroups } from '../data/portfolio'

const skillStyles = ['bg-slate-800 text-sky-300', 'bg-slate-800 text-teal-300', 'bg-slate-800 text-amber-300', 'bg-slate-800 text-slate-300']

function renderGroupIcon(index: number) {
  if (index === 1) return <Database className="h-6 w-6" />
  if (index === 2) return <Cloud className="h-6 w-6" />
  if (index === 3) return <Shield className="h-6 w-6" />
  return <Boxes className="h-6 w-6" />
}

export function SkillsSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8" id="skills">
      <SectionHeading
        eyebrow="Skills"
        title="기술 스택"
        description="PRD의 기술 스택을 숙련도와 함께 카테고리별 배지로 정리했습니다."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {skillGroups.map((group, index) => (
          <article
            className="rounded-lg border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-slate-700"
            key={group.title}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${skillStyles[index] ?? 'bg-slate-800 text-sky-300'}`}>
                {renderGroupIcon(index)}
              </div>
              <h3 className="text-lg font-semibold text-white">{group.title}</h3>
            </div>
            <div className="mt-5">
              <PillList items={group.items} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
