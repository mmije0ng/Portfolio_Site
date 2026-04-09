import { projectDocuments } from '../data/projectDocuments'
import { researchDocuments } from '../data/researchDocuments'

const documentModules = import.meta.glob('../assets/{projects,research}/**/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const assetModules = import.meta.glob('../assets/{projects,research}/**/*.{md,png,jpg,jpeg,gif,webp,pdf,pptx,docx}', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const assetByName = new Map<string, string>()
const assetByPath = new Map<string, string>()

Object.entries(assetModules).forEach(([path, url]) => {
  const fileName = path.split('/').at(-1)
  if (!fileName) return

  const normalizedPath = path.replace('../assets/', '')
  assetByPath.set(normalizedPath, url)
  assetByPath.set(normalizedPath.normalize('NFC'), url)
  assetByPath.set(normalizedPath.normalize('NFD'), url)

  assetByName.set(fileName, url)
  assetByName.set(fileName.normalize('NFC'), url)
  assetByName.set(fileName.normalize('NFD'), url)
})

const projectThumbnailOverrides: Record<string, string> = {
  'full-count': 'projects/full-count/image 1.png',
}

function normalizeAssetPath(path: string) {
  return path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '')
}

function getDocumentPath(fileName: string) {
  return Object.keys(documentModules).find((path) => path.endsWith(`/${fileName}`))?.replace('../assets/', '')
}

export function resolveProjectAsset(src: string, basePath?: string) {
  if (/^https?:\/\//.test(src)) return src

  const normalizedSrc = normalizeAssetPath(src)
  let decodedSrc = normalizedSrc
  try {
    decodedSrc = normalizeAssetPath(decodeURIComponent(normalizedSrc))
  } catch {
    decodedSrc = normalizedSrc
  }
  const fileName = decodedSrc.split('/').at(-1) ?? normalizedSrc.split('/').at(-1)
  if (!fileName) return src
  const isFullCountScoped = basePath?.startsWith('projects/full-count/')

  const pathCandidates: string[] = []
  if (basePath) {
    const baseDir = normalizeAssetPath(basePath).split('/').slice(0, -1).join('/')
    pathCandidates.push(baseDir ? `${baseDir}/${normalizedSrc}` : normalizedSrc)
    pathCandidates.push(baseDir ? `${baseDir}/${decodedSrc}` : decodedSrc)
  }
  pathCandidates.push(normalizedSrc)
  pathCandidates.push(decodedSrc)

  for (const candidate of pathCandidates) {
    const directPathMatch =
      assetByPath.get(candidate) ?? assetByPath.get(candidate.normalize('NFC')) ?? assetByPath.get(candidate.normalize('NFD'))
    if (directPathMatch) return directPathMatch
  }

  if (isFullCountScoped) return src

  const fileCandidates = [fileName]
  try {
    fileCandidates.push(decodeURIComponent(fileName))
  } catch {
    fileCandidates.push(fileName)
  }

  for (const candidate of fileCandidates) {
    const directNameMatch =
      assetByName.get(candidate) ?? assetByName.get(candidate.normalize('NFC')) ?? assetByName.get(candidate.normalize('NFD'))
    if (directNameMatch) return directNameMatch
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

export function getWorkDocumentPath(slug?: string) {
  if (!slug) return undefined
  if (slug in projectDocuments) return getDocumentPath(projectDocuments[slug as keyof typeof projectDocuments])
  if (slug in researchDocuments) return getDocumentPath(researchDocuments[slug as keyof typeof researchDocuments])
  return undefined
}

export function getWorkThumbnail(slug?: string) {
  const documentPath = getWorkDocumentPath(slug)
  const override = slug ? projectThumbnailOverrides[slug] : undefined
  if (override) return resolveProjectAsset(override, documentPath)

  const markdown = getWorkMarkdown(slug)
  const imageMatch = markdown?.match(/!\[[^\]]*]\((.+)\)/)

  return imageMatch ? resolveProjectAsset(imageMatch[1], documentPath) : undefined
}
