import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface DetectedFramework {
  name: string
  label: string
  isFrameworkSource: boolean
  suggestedPath: string | null
}

interface FrameworkSignature {
  name: string
  label: string
  deps: string[]
  packageNames: string[]
  suggestedSourcePath: string | null
}

const FRAMEWORKS: FrameworkSignature[] = [
  {
    name: 'crewai',
    label: 'CrewAI',
    deps: ['crewai'],
    packageNames: ['crewai'],
    suggestedSourcePath: 'lib/crewai/src/crewai/',
  },
  {
    name: 'langchain',
    label: 'LangChain',
    deps: ['langchain', 'langchain-core', '@langchain/core'],
    packageNames: ['langchain', 'langchain-core'],
    suggestedSourcePath: 'libs/langchain/langchain_classic/',
  },
  {
    name: 'autogen',
    label: 'AutoGen',
    deps: ['autogen-agentchat', 'autogen-core', 'autogen-ext', 'pyautogen'],
    packageNames: ['autogen-agentchat', 'autogen-core'],
    suggestedSourcePath: 'python/packages/autogen-agentchat/src/',
  },
  {
    name: 'metagpt',
    label: 'MetaGPT',
    deps: ['metagpt'],
    packageNames: ['metagpt'],
    suggestedSourcePath: 'metagpt/',
  },
  {
    name: 'autogpt',
    label: 'AutoGPT',
    deps: ['autogpt', 'forge'],
    packageNames: ['autogpt'],
    suggestedSourcePath: 'autogpt_platform/backend/backend/',
  },
  {
    name: 'langflow',
    label: 'LangFlow',
    deps: ['langflow', 'langflow-base'],
    packageNames: ['langflow', 'langflow-base'],
    suggestedSourcePath: 'src/backend/base/langflow/',
  },
  {
    name: 'mcp',
    label: 'MCP Server',
    deps: ['@modelcontextprotocol/sdk', 'mcp'],
    packageNames: [],
    suggestedSourcePath: 'src/',
  },
  {
    name: 'n8n',
    label: 'n8n Workflow',
    deps: ['n8n-workflow', 'n8n-core'],
    packageNames: ['n8n', 'n8n-workflow'],
    suggestedSourcePath: 'packages/',
  },
]

export function detectFramework(
  targetPath: string
): DetectedFramework | null {
  const pkgResult = checkPackageJson(targetPath)
  if (pkgResult) return pkgResult

  const pyResult = checkPyprojectToml(targetPath)
  if (pyResult) return pyResult

  const reqResult = checkRequirementsTxt(targetPath)
  if (reqResult) return reqResult

  const configResult = checkConfigFiles(targetPath)
  if (configResult) return configResult

  return null
}

function checkPackageJson(
  targetPath: string
): DetectedFramework | null {
  const pkgPath = join(targetPath, 'package.json')
  if (!existsSync(pkgPath)) return null

  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as Record<
      string,
      unknown
    >
    const deps = pkg.dependencies as Record<string, string> | undefined
    const devDeps = pkg.devDependencies as
      | Record<string, string>
      | undefined
    const allDeps: Record<string, string> = { ...deps, ...devDeps }
    const projectName = (
      typeof pkg.name === 'string' ? pkg.name : ''
    ).toLowerCase()

    for (const fw of FRAMEWORKS) {
      if (fw.packageNames.includes(projectName)) {
        return {
          name: fw.name,
          label: fw.label,
          isFrameworkSource: true,
          suggestedPath: fw.suggestedSourcePath,
        }
      }
      for (const dep of fw.deps) {
        if (dep in allDeps) {
          return {
            name: fw.name,
            label: fw.label,
            isFrameworkSource: false,
            suggestedPath: null,
          }
        }
      }
    }
  } catch {
    // Invalid JSON — skip
  }

  return null
}

function checkPyprojectToml(
  targetPath: string
): DetectedFramework | null {
  const tomlPath = join(targetPath, 'pyproject.toml')
  if (!existsSync(tomlPath)) return null

  try {
    const content = readFileSync(tomlPath, 'utf-8')
    const projectName =
      extractTomlValue(content, 'name')?.toLowerCase() ?? ''

    for (const fw of FRAMEWORKS) {
      if (fw.packageNames.includes(projectName)) {
        return {
          name: fw.name,
          label: fw.label,
          isFrameworkSource: true,
          suggestedPath: fw.suggestedSourcePath,
        }
      }
      for (const dep of fw.deps) {
        if (
          content.includes(`"${dep}`) ||
          content.includes(`'${dep}`)
        ) {
          return {
            name: fw.name,
            label: fw.label,
            isFrameworkSource: false,
            suggestedPath: null,
          }
        }
      }
    }
  } catch {
    // Parse error — skip
  }

  return null
}

function checkRequirementsTxt(
  targetPath: string
): DetectedFramework | null {
  const reqPath = join(targetPath, 'requirements.txt')
  if (!existsSync(reqPath)) return null

  try {
    const content = readFileSync(reqPath, 'utf-8')
    const lines = content.split('\n').map((l) => l.trim().toLowerCase())

    for (const fw of FRAMEWORKS) {
      for (const dep of fw.deps) {
        if (lines.some((line) => line.startsWith(dep))) {
          return {
            name: fw.name,
            label: fw.label,
            isFrameworkSource: false,
            suggestedPath: null,
          }
        }
      }
    }
  } catch {
    // Read error — skip
  }

  return null
}

function checkConfigFiles(
  targetPath: string
): DetectedFramework | null {
  if (
    existsSync(join(targetPath, 'crew.yaml')) ||
    existsSync(join(targetPath, 'agents.yaml'))
  ) {
    return {
      name: 'crewai',
      label: 'CrewAI',
      isFrameworkSource: false,
      suggestedPath: null,
    }
  }
  if (existsSync(join(targetPath, 'config2.yaml'))) {
    return {
      name: 'metagpt',
      label: 'MetaGPT',
      isFrameworkSource: false,
      suggestedPath: null,
    }
  }
  if (existsSync(join(targetPath, 'n8n.config.ts'))) {
    return {
      name: 'n8n',
      label: 'n8n Workflow',
      isFrameworkSource: false,
      suggestedPath: null,
    }
  }
  return null
}

function extractTomlValue(
  content: string,
  key: string
): string | null {
  const regex = new RegExp(
    `^\\s*${key}\\s*=\\s*["']([^"']+)["']`,
    'm'
  )
  const match = content.match(regex)
  return match?.[1] ?? null
}
