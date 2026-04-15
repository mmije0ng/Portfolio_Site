import { ArrowLeft, ArrowUpRight, CalendarDays, Code2, Sparkles, UserRound } from 'lucide-react'
import { MarkdownDocument } from '../components/MarkdownDocument'
import { PillList } from '../components/PillList'
import { ProjectMetadataPanel } from '../components/ProjectMetadataPanel'
import { getWorkDocumentPath, getWorkMarkdown } from '../lib/projectAssets'
import type { Project } from '../types/portfolio'

type WorkDetailPageProps = {
  item: Project
  eyebrow: string
  backLabel: string
  backPath: string
  onNavigate: (path: string) => void
}

export function WorkDetailPage({ item, eyebrow, backLabel, backPath, onNavigate }: WorkDetailPageProps) {
  const links = item.links ?? (item.link ? [item.link] : [])
  const projectDocument = getWorkMarkdown(item.slug)
  const documentPath = getWorkDocumentPath(item.slug)
  const categoryLabel = Array.isArray(item.category) ? item.category.join(' / ') : item.category

  if (projectDocument) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50 to-violet-50 text-slate-800">
        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
          <button
            className="mb-8 inline-flex items-center gap-2 rounded-lg border border-sky-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400"
            onClick={() => onNavigate(backPath)}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </button>

          <ProjectMetadataPanel markdown={projectDocument} fallbackHighlights={[item.impact]} overrideLinks={links} />

          <article className="rounded-lg border border-sky-200 bg-white/90 p-6 shadow-sm shadow-sky-100/60 sm:p-8">
            <MarkdownDocument assetBasePath={documentPath} markdown={projectDocument} skipMetadata />
          </article>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50 to-violet-50 text-slate-800">
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <button
          className="mb-8 inline-flex items-center gap-2 rounded-lg border border-sky-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400"
          onClick={() => onNavigate(backPath)}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </button>

        <div className="rounded-lg border border-sky-200 bg-white/90 p-6 shadow-sm shadow-sky-100/60 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">{eyebrow}</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">{item.title}</h1>
              <p className="mt-5 text-base leading-8 text-slate-700">{item.description}</p>
              <p className="mt-5 rounded-lg bg-sky-50 p-4 text-sm font-semibold leading-7 text-violet-700">
                {item.impact}
              </p>
            </div>

            <aside className="rounded-lg border border-sky-200 bg-sky-50 p-5">
              <dl className="space-y-5 text-sm">
                {item.category ? (
                  <div>
                    <dt className="flex items-center gap-2 font-semibold text-slate-400">
                      <Code2 className="h-4 w-4" />
                      Category
                    </dt>
                    <dd className="mt-1 text-slate-800">{categoryLabel}</dd>
                  </div>
                ) : null}
                {item.type ? (
                  <div>
                    <dt className="flex items-center gap-2 font-semibold text-slate-400">
                      <Sparkles className="h-4 w-4" />
                      Type
                    </dt>
                    <dd className="mt-1 leading-6 text-slate-800">{item.type}</dd>
                  </div>
                ) : null}
                {item.period ? (
                  <div>
                    <dt className="flex items-center gap-2 font-semibold text-slate-400">
                      <CalendarDays className="h-4 w-4" />
                      Period
                    </dt>
                    <dd className="mt-1 text-slate-800">{item.period}</dd>
                  </div>
                ) : null}
                {item.role ? (
                  <div>
                    <dt className="flex items-center gap-2 font-semibold text-slate-400">
                      <UserRound className="h-4 w-4" />
                      Role
                    </dt>
                    <dd className="mt-1 leading-6 text-slate-800">{item.role}</dd>
                  </div>
                ) : null}
              </dl>
            </aside>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-lg border border-sky-200 bg-white/90 p-6 shadow-sm shadow-sky-100/60">
            <h2 className="text-xl font-semibold text-slate-800">Overview</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
              {(item.overview ?? [item.description]).map((entry) => (
                <li className="rounded-lg bg-sky-50 p-4" key={entry}>
                  {entry}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-sky-200 bg-white/90 p-6 shadow-sm shadow-sky-100/60">
            <h2 className="text-xl font-semibold text-slate-800">Tech Stack</h2>
            <div className="mt-5">
              <PillList items={item.stack} />
            </div>
            {links.length ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {links.map((link) => (
                  <a
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
                    href={link.href}
                    key={link.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {link.label}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ))}
              </div>
            ) : null}
          </section>
        </div>

        {item.contributions?.length ? (
          <section className="mt-8 rounded-lg border border-sky-200 bg-white/90 p-6 shadow-sm shadow-sky-100/60">
            <h2 className="text-xl font-semibold text-slate-800">Contributions</h2>
            <ul className="mt-5 grid gap-3 md:grid-cols-2">
              {item.contributions.map((entry) => (
                <li className="rounded-lg bg-sky-50 p-4 text-sm leading-7 text-slate-700" key={entry}>
                  {entry}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {item.problemSolving?.length ? (
          <section className="mt-8 rounded-lg border border-sky-200 bg-white/90 p-6 shadow-sm shadow-sky-100/60">
            <h2 className="text-xl font-semibold text-slate-800">Problem Solving</h2>
            <div className="mt-5 grid gap-4">
              {item.problemSolving.map((block) => (
                <article className="rounded-lg bg-sky-50 p-5" key={block.title}>
                  <h3 className="text-lg font-semibold text-violet-700">{block.title}</h3>
                  <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-700 md:grid-cols-3">
                    {block.problem ? <p><span className="font-semibold text-slate-800">문제</span><br />{block.problem}</p> : null}
                    {block.solution ? <p><span className="font-semibold text-slate-800">해결</span><br />{block.solution}</p> : null}
                    {block.result ? <p><span className="font-semibold text-slate-800">결과</span><br />{block.result}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

      </section>
    </main>
  )
}
