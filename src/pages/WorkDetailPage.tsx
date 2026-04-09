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
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
          <button
            className="mb-8 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
            onClick={() => onNavigate(backPath)}
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </button>

          <ProjectMetadataPanel markdown={projectDocument} />

          <article className="rounded-lg border border-slate-800 bg-slate-900 p-6 sm:p-8">
            <MarkdownDocument assetBasePath={documentPath} markdown={projectDocument} skipMetadata />
          </article>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <button
          className="mb-8 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
          onClick={() => onNavigate(backPath)}
          type="button"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </button>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">{eyebrow}</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">{item.title}</h1>
              <p className="mt-5 text-base leading-8 text-slate-300">{item.description}</p>
              <p className="mt-5 rounded-lg bg-slate-950 p-4 text-sm font-semibold leading-7 text-teal-200">
                {item.impact}
              </p>
            </div>

            <aside className="rounded-lg border border-slate-800 bg-slate-950 p-5">
              <dl className="space-y-5 text-sm">
                {item.category ? (
                  <div>
                    <dt className="flex items-center gap-2 font-semibold text-slate-400">
                      <Code2 className="h-4 w-4" />
                      Category
                    </dt>
                    <dd className="mt-1 text-white">{categoryLabel}</dd>
                  </div>
                ) : null}
                {item.type ? (
                  <div>
                    <dt className="flex items-center gap-2 font-semibold text-slate-400">
                      <Sparkles className="h-4 w-4" />
                      Type
                    </dt>
                    <dd className="mt-1 leading-6 text-white">{item.type}</dd>
                  </div>
                ) : null}
                {item.period ? (
                  <div>
                    <dt className="flex items-center gap-2 font-semibold text-slate-400">
                      <CalendarDays className="h-4 w-4" />
                      Period
                    </dt>
                    <dd className="mt-1 text-white">{item.period}</dd>
                  </div>
                ) : null}
                {item.role ? (
                  <div>
                    <dt className="flex items-center gap-2 font-semibold text-slate-400">
                      <UserRound className="h-4 w-4" />
                      Role
                    </dt>
                    <dd className="mt-1 leading-6 text-white">{item.role}</dd>
                  </div>
                ) : null}
              </dl>
            </aside>
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Overview</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
              {(item.overview ?? [item.description]).map((entry) => (
                <li className="rounded-lg bg-slate-950 p-4" key={entry}>
                  {entry}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Tech Stack</h2>
            <div className="mt-5">
              <PillList items={item.stack} />
            </div>
            {links.length ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {links.map((link) => (
                  <a
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
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
          <section className="mt-8 rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Contributions</h2>
            <ul className="mt-5 grid gap-3 md:grid-cols-2">
              {item.contributions.map((entry) => (
                <li className="rounded-lg bg-slate-950 p-4 text-sm leading-7 text-slate-300" key={entry}>
                  {entry}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {item.problemSolving?.length ? (
          <section className="mt-8 rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Problem Solving</h2>
            <div className="mt-5 grid gap-4">
              {item.problemSolving.map((block) => (
                <article className="rounded-lg bg-slate-950 p-5" key={block.title}>
                  <h3 className="text-lg font-semibold text-teal-200">{block.title}</h3>
                  <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-300 md:grid-cols-3">
                    {block.problem ? <p><span className="font-semibold text-white">문제</span><br />{block.problem}</p> : null}
                    {block.solution ? <p><span className="font-semibold text-white">해결</span><br />{block.solution}</p> : null}
                    {block.result ? <p><span className="font-semibold text-white">결과</span><br />{block.result}</p> : null}
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
