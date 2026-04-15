import { ArrowUpRight, Award, BadgeCheck, BookOpen } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'
import { awards, certifications, programs } from '../data/portfolio'
import type { SimpleItem } from '../types/portfolio'

const certificationLinksByTitle: Record<string, { label: string; href: string }> = {
  'AWS Certified Solutions Architect - Associate': {
    label: '자격증 보기',
    href: 'https://www.credly.com/badges/73e5fbb5-be88-48bf-9111-5ba82790016a',
  },
}

type ItemListProps = {
  items: SimpleItem[]
  tone: 'sky' | 'teal' | 'amber'
}

const toneClasses = {
  sky: 'bg-sky-100 text-sky-700 border-sky-200',
  teal: 'bg-violet-100 text-violet-700 border-violet-200',
  amber: 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

function getItemToneClass(item: SimpleItem, tone: ItemListProps['tone']) {
  if (item.title.includes('TOEIC Speaking')) {
    return 'bg-sky-100 text-sky-700 border-sky-200'
  }

  return toneClasses[tone]
}

function ItemList({ items, tone }: ItemListProps) {
  return (
    <ul className="grid gap-4">
      {items.map((item, index) => {
        const certificationLink = certificationLinksByTitle[item.title]

        return (
          <li
            className="animate-[fadeUp_0.6s_ease-out_both] rounded-lg border border-sky-200/80 bg-gradient-to-br from-sky-50/74 via-white/38 to-violet-50/66 p-5 shadow-sm shadow-sky-100/60 transition duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_18px_40px_rgba(56,189,248,0.14)] backdrop-blur-sm"
            key={`${item.title}-${item.meta}`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <p className="font-semibold text-slate-800 transition duration-300 hover:text-sky-800">{item.title}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className={`inline-flex rounded-lg border px-3 py-1 text-xs font-semibold ${getItemToneClass(item, tone)}`}>{item.meta}</p>
              {certificationLink ? (
                <a
                  className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 transition hover:text-violet-700"
                  href={certificationLink.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {certificationLink.label}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function CredentialsSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8" id="credentials">
      <SectionHeading
        eyebrow="Credentials"
        title="자격증, 수상, 교육 이력"
        description="자격증과 수상 이력, 실무 역량을 확장한 교육 이력을 정리했습니다."
      />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="animate-[fadeUp_0.6s_ease-out_both]" style={{ animationDelay: '0ms' }}>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <BadgeCheck className="h-5 w-5 text-sky-500 transition duration-300 group-hover:scale-105" />
            Certifications & Language
          </h3>
          <ItemList items={certifications} tone="sky" />
        </div>
        <div className="animate-[fadeUp_0.6s_ease-out_both]" style={{ animationDelay: '120ms' }}>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Award className="h-5 w-5 text-amber-500" />
            Awards
          </h3>
          <ItemList items={awards} tone="amber" />
        </div>
        <div className="animate-[fadeUp_0.6s_ease-out_both]" style={{ animationDelay: '240ms' }}>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <BookOpen className="h-5 w-5 text-teal-500" />
            Certificated Program
          </h3>
          <ItemList items={programs} tone="teal" />
        </div>
      </div>
    </section>
  )
}
