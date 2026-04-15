import { Mail } from 'lucide-react'
import { BlogIcon, CVIcon, GitHubIcon, LinkedInIcon } from '../components/BrandIcons'
import { links, profile } from '../data/portfolio'

function renderLinkIcon(label: string) {
  if (label === 'GitHub') return <GitHubIcon className="h-4 w-4" />
  if (label === 'LinkedIn') return <LinkedInIcon className="h-4 w-4" />
  if (label === 'CV') return <CVIcon className="h-4 w-4" />
  if (label === 'Blog') return <BlogIcon className="h-4 w-4" />
  return <Mail className="h-4 w-4" />
}

export function ContactSection() {
  return (
    <footer className="border-t border-sky-200" id="contact">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-6 rounded-lg border border-sky-200 bg-gradient-to-r from-sky-500 to-violet-500 p-6 text-white shadow-lg shadow-sky-200/60 sm:p-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em]">Contact</p>
            <h3 className="mt-3 max-w-3xl text-xl font-extrabold leading-tight sm:text-2xl">
              문제를 끝까지 이해하고, 
            </h3>
            <h3 className="mt-3 max-w-3xl text-xl font-extrabold leading-tight sm:text-2xl">
              안정적인 서비스로 구현하는
            </h3>
            <h3 className="mt-3 max-w-3xl text-xl font-extrabold leading-tight sm:text-2xl">
              개발자로 기여하겠습니다.
            </h3>
          </div>
          <div>
            <div className="grid gap-3">
              <a
                className="inline-flex items-center gap-3 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50"
                href={`mailto:${profile.email}`}
              >
                <Mail className="h-4 w-4" />
                {profile.email}
              </a>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {links.map((link) => (
                <a
                    className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
                  href={link.href}
                  key={link.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {renderLinkIcon(link.label)}
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
