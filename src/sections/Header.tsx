type HeaderProps = {
  currentPath: string
  onNavigate: (path: string, hash?: string) => void
}

const navItems = [
  { label: 'About', path: '/', hash: 'about' },
  { label: 'Experience', path: '/', hash: 'experience' },
  { label: 'Projects', path: '/projects' },
  { label: 'Research Paper', path: '/research' },
  { label: 'Credentials', path: '/', hash: 'credentials' },
  { label: 'Skills', path: '/', hash: 'skills' },
  { label: 'How I Work', path: '/', hash: 'how-i-work' },
  { label: 'Contact', path: '/', hash: 'contact' },
]

export function Header({ currentPath, onNavigate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <button
          className="text-sm font-semibold tracking-[0.24em] text-sky-300"
          onClick={() => onNavigate('/')}
          type="button"
        >
          MIJEONG
        </button>
        <nav aria-label="Primary navigation">
          <ul className="hidden gap-2 text-sm font-medium text-slate-300 md:flex">
            {navItems.map((item) => {
              const isActive = currentPath === item.path && !item.hash

              return (
                <li key={`${item.path}-${item.hash ?? item.label}`}>
                  <button
                    className={`rounded-lg px-3 py-2 transition ${
                      isActive ? 'bg-slate-800 text-sky-300' : 'hover:bg-slate-900 hover:text-white'
                    }`}
                    onClick={() => onNavigate(item.path, item.hash)}
                    type="button"
                  >
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}
