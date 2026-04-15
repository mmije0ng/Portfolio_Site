import { Boxes, Cloud, Database, Shield } from 'lucide-react'
import { PillList } from '../components/PillList'
import { SectionHeading } from '../components/SectionHeading'
import { skillGroups } from '../data/portfolio'

const skillStyles = ['bg-sky-100 text-sky-700', 'bg-violet-100 text-violet-700', 'bg-indigo-100 text-indigo-700', 'bg-blue-100 text-blue-700']

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
        description="백엔드 개발, 인프라 구축, 성능 개선, 보안과 연구까지 실제로 사용해온 기술 스택을 정리했습니다."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {skillGroups.map((group, index) => (
          <article
            className="rounded-lg border border-sky-200/80 bg-gradient-to-br from-sky-50/74 via-white/38 to-violet-50/64 p-6 shadow-sm shadow-sky-100/60 transition hover:-translate-y-1 hover:border-sky-300 backdrop-blur-sm"
            key={group.title}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${skillStyles[index] ?? 'bg-sky-100 text-sky-700'}`}>
                {renderGroupIcon(index)}
              </div>
              <h3 className="text-lg font-semibold text-slate-800">{group.title}</h3>
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
