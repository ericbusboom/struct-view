import { validateProject } from '../model'
import type { Project } from '../model'

const FILE_VERSION = '1.0.0'
const FILE_EXTENSION = '.structview.json'

export interface ProjectFile {
  version: string
  created_at: string
  modified_at: string
  project: Project
}

export function serializeProject(project: Project): string {
  const file: ProjectFile = {
    version: FILE_VERSION,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
    project,
  }
  return JSON.stringify(file, null, 2)
}

export function downloadProject(project: Project): void {
  const json = serializeProject(project)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name || 'untitled'}${FILE_EXTENSION}`
  a.click()
  URL.revokeObjectURL(url)
}

export type ImportResult = {
  ok: true
  project: Project
} | {
  ok: false
  errors: string[]
}

export function parseProjectFile(jsonString: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return { ok: false, errors: ['Invalid JSON: could not parse file'] }
  }

  // Accept either a ProjectFile wrapper or a bare Project
  let projectData: unknown
  if (
    typeof parsed === 'object' && parsed !== null &&
    'project' in parsed
  ) {
    projectData = (parsed as Record<string, unknown>).project
  } else {
    projectData = parsed
  }

  const result = validateProject(projectData)
  if (!result.valid) {
    return {
      ok: false,
      errors: result.errors.map((e) => `${e.path}: ${e.message}`),
    }
  }

  return { ok: true, project: projectData as Project }
}

export function importProjectFromFile(): Promise<ImportResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.structview.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) {
        resolve({ ok: false, errors: ['No file selected'] })
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const result = parseProjectFile(reader.result as string)
        resolve(result)
      }
      reader.onerror = () => {
        resolve({ ok: false, errors: ['Could not read file'] })
      }
      reader.readAsText(file)
    }
    // Handle cancel
    input.oncancel = () => {
      resolve({ ok: false, errors: ['File selection cancelled'] })
    }
    input.click()
  })
}
