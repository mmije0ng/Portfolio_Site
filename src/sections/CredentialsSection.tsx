import { Award, BadgeCheck, BookOpen } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'
import { awards, certifications, programs } from '../data/portfolio'
import type { SimpleItem } from '../types/portfolio'

type ItemListProps = {
  items: SimpleItem[]
  tone: 'sky' | 'teal' | 'amber'
}

const toneClasses = {
  sky: 'bg-slate-800 text-sky-300 border-slate-700',
  teal: 'bg-slate-800 text-teal-300 border-slate-700',
  amber: 'bg-slate-800 text-amber-300 border-slate-700',
}

function ItemList({ items, tone }: ItemListProps) {
  return (
    <ul className="grid gap-4">
      {items.map((item) => (
        <li className="rounded-lg border border-slate-800 bg-slate-900 p-5" key={`${item.title}-${item.meta}`}>
          <p className="font-semibold text-white">{item.title}</p>
          <p className={`mt-3 inline-flex rounded-lg border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>{item.meta}</p>
        </li>
      ))}
    </ul>
  )
}

export function CredentialsSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
      <SectionHeading eyebrow="Credentials" title="수상, 자격, 교육 이력" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Award className="h-5 w-5 text-amber-500" />
            Awards
          </h3>
          <ItemList items={awards} tone="amber" />
        </div>
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <BadgeCheck className="h-5 w-5 text-sky-500" />
            Certifications & Language
          </h3>
          <ItemList items={certifications} tone="sky" />
        </div>
        <div>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <BookOpen className="h-5 w-5 text-teal-500" />
            Certificated Program
          </h3>
          <ItemList items={programs} tone="teal" />
        </div>
      </div>
    </section>
  )
}
