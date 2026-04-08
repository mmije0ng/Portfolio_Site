import { projectDocuments } from '../data/projectDocuments'
import { researchDocuments } from '../data/researchDocuments'

const documentModules = import.meta.glob('../assets/{projects,research}/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const assetModules = import.meta.glob('../assets/{projects,research}/*.{png,jpg,jpeg,gif,webp,pdf,pptx,docx}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const assetByName = new Map<string, string>()

Object.entries(assetModules).forEach(([path, url]) => {
  const fileName = path.split('/').at(-1)
  if (!fileName) return

  assetByName.set(fileName, url)
  assetByName.set(fileName.normalize('NFC'), url)
  assetByName.set(fileName.normalize('NFD'), url)
})

export function resolveProjectAsset(src: string) {
  if (/^https?:\/\//.test(src)) return src

  const fileName = src.split('/').at(-1)
  if (!fileName) return src

  const candidates = [fileName]

  try {
    candidates.push(decodeURIComponent(fileName))
  } catch {
    candidates.push(fileName)
  }

  for (const candidate of candidates) {
    const directMatch = assetByName.get(candidate) ?? assetByName.get(candidate.normalize('NFC')) ?? assetByName.get(candidate.normalize('NFD'))
    if (directMatch) return directMatch
  }

  return src
}

export function getProjectMarkdown(slug?: string) {
  if (!slug || !(slug in projectDocuments)) return undefined

  const fileName = projectDocuments[slug as keyof typeof projectDocuments]
  const documentEntry = Object.entries(documentModules).find(([path]) => path.endsWith(`/${fileName}`))

  return documentEntry?.[1]
}

export function getResearchMarkdown(slug?: string) {
  if (!slug || !(slug in researchDocuments)) return undefined

  const fileName = researchDocuments[slug as keyof typeof researchDocuments]
  const documentEntry = Object.entries(documentModules).find(([path]) => path.endsWith(`/${fileName}`))

  return documentEntry?.[1]
}

export function getWorkMarkdown(slug?: string) {
  return getProjectMarkdown(slug) ?? getResearchMarkdown(slug)
}

export function getWorkThumbnail(slug?: string) {
  const markdown = getWorkMarkdown(slug)
  const imageMatch = markdown?.match(/!\[[^\]]*]\((.+)\)/)

  return imageMatch ? resolveProjectAsset(imageMatch[1]) : undefined
}
