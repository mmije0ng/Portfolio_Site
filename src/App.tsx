import { useEffect, useState } from 'react'
import { papers } from './data/portfolio'
import { projects } from './data/projects'
import { ProjectsPage } from './pages/ProjectsPage'
import { ResearchPage } from './pages/ResearchPage'
import { WorkDetailPage } from './pages/WorkDetailPage'
import { AboutSection } from './sections/AboutSection'
import { ContactSection } from './sections/ContactSection'
import { CredentialsSection } from './sections/CredentialsSection'
import { ExperienceSection } from './sections/ExperienceSection'
import { Header } from './sections/Header'
import { HeroSection } from './sections/HeroSection'
import { HowIWorkSection } from './sections/HowIWorkSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { SkillsSection } from './sections/SkillsSection'

function normalizePath(pathname: string) {
  if (pathname === '/projects' || pathname === '/research') return pathname
  if (pathname.startsWith('/projects/') || pathname.startsWith('/research/')) return pathname
  return '/'
}

function App() {
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname))

  const navigate = (path: string, hash?: string) => {
    const nextPath = normalizePath(path)
    const nextUrl = `${nextPath}${hash ? `#${hash}` : ''}`

    window.history.pushState({}, '', nextUrl)
    setCurrentPath(nextPath)

    window.setTimeout(() => {
      if (hash) {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
        return
      }

      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 0)
  }

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const renderRoute = () => {
    if (currentPath.startsWith('/projects/')) {
      const slug = currentPath.replace('/projects/', '')
      const project = projects.find((item) => item.slug === slug)

      return project ? (
        <WorkDetailPage
          backLabel="프로젝트 목록"
          backPath="/projects"
          eyebrow="Project Detail"
          item={project}
          onNavigate={navigate}
        />
      ) : (
        <ProjectsPage onNavigate={navigate} />
      )
    }

    if (currentPath.startsWith('/research/')) {
      const slug = currentPath.replace('/research/', '')
      const paper = papers.find((item) => item.slug === slug)

      return paper ? (
        <WorkDetailPage
          backLabel="논문 목록"
          backPath="/research"
          eyebrow="Research Detail"
          item={paper}
          onNavigate={navigate}
        />
      ) : (
        <ResearchPage onNavigate={navigate} />
      )
    }

    if (currentPath === '/projects') {
      return <ProjectsPage onNavigate={navigate} />
    }

    if (currentPath === '/research') {
      return <ResearchPage onNavigate={navigate} />
    }

    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-50 via-indigo-50 to-violet-50 text-slate-800">
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <CredentialsSection />
        <SkillsSection />
        <HowIWorkSection />
        <ContactSection />
      </main>
    )
  }

  return (
    <>
      <Header currentPath={currentPath} onNavigate={navigate} />
      {renderRoute()}
    </>
  )
}

export default App
