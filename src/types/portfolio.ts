export type Link = {
  label: string
  href: string
}

export type Profile = {
  name: string
  role: string
  birthDate: string
  phone: string
  email: string
  education: string
  gpa: string
  github: string
  linkedin: string
  tagline: string
  summary: string[]
  quote: string
}

export type TimelineItem = {
  title: string
  period: string
  category: string
  description: string
  bullets: string[]
  link?: Link
  links?: Link[]
}

export type Project = {
  slug?: string
  title: string
  category?: string
  type?: string
  period?: string
  role?: string
  description: string
  impact: string
  stack: string[]
  overview?: string[]
  contributions?: string[]
  problemSolving?: DetailBlock[]
  link?: Link
  links?: Link[]
}

export type DetailBlock = {
  title: string
  problem?: string
  solution?: string
  result?: string
}

export type SkillGroup = {
  title: string
  items: string[]
}

export type SimpleItem = {
  title: string
  meta: string
}
