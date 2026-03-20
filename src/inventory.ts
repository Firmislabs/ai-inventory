import { detectFramework } from './framework-detect.js'
import type { DetectedFramework } from './framework-detect.js'
import { detectAIDependencies } from './dep-detector.js'
import type { DependencyInfo } from './dep-detector.js'
import { detectModelFiles } from './model-detector.js'
import type { ModelFileInfo } from './model-detector.js'
import {
  CAPABILITY_MAP,
  FRAMEWORK_CAPABILITY,
  modelCapability,
} from './capabilities.js'
import type { InventoryComponent } from './capabilities.js'

export type { InventoryComponent }

export interface InventoryResult {
  path: string
  framework: DetectedFramework | null
  dependencies: DependencyInfo[]
  models: ModelFileInfo[]
  summary: InventorySummary
  components: InventoryComponent[]
}

interface InventorySummary {
  hasAI: boolean
  frameworkName: string | null
  dependencyCount: number
  modelCount: number
  categories: string[]
}

function frameworkToComponent(
  fw: DetectedFramework
): InventoryComponent {
  const capability =
    FRAMEWORK_CAPABILITY[fw.name] ?? {
      protocol: 'sdk',
      role: 'agent-runtime',
      interop: [],
    }
  return {
    id: `framework:${fw.name}`,
    name: fw.label,
    version: null,
    source: 'framework',
    capability,
  }
}

function depToComponent(dep: DependencyInfo): InventoryComponent {
  const capability =
    CAPABILITY_MAP[dep.name] ?? {
      protocol: dep.source === 'npm' ? 'sdk' : 'sdk',
      role: 'llm-provider',
      interop: [],
    }
  return {
    id: `${dep.source}:${dep.name}`,
    name: dep.name,
    version: dep.version,
    source: dep.source,
    capability,
  }
}

function modelToComponent(model: ModelFileInfo): InventoryComponent {
  return {
    id: `model:${model.name}`,
    name: model.name,
    version: null,
    source: 'file',
    capability: modelCapability(model.format),
  }
}

function buildComponents(
  framework: DetectedFramework | null,
  dependencies: DependencyInfo[],
  models: ModelFileInfo[]
): InventoryComponent[] {
  const components: InventoryComponent[] = []

  if (framework) {
    components.push(frameworkToComponent(framework))
  }

  for (const dep of dependencies) {
    components.push(depToComponent(dep))
  }

  for (const model of models) {
    components.push(modelToComponent(model))
  }

  return components
}

export async function inventory(
  targetPath: string
): Promise<InventoryResult> {
  const framework = detectFramework(targetPath)
  const dependencies = await detectAIDependencies(targetPath)
  const models = await detectModelFiles(targetPath)

  const categories = [
    ...new Set(dependencies.map(d => d.category)),
  ]
  const hasAI =
    framework !== null ||
    dependencies.length > 0 ||
    models.length > 0

  const components = buildComponents(framework, dependencies, models)

  return {
    path: targetPath,
    framework,
    dependencies,
    models,
    summary: {
      hasAI,
      frameworkName: framework?.label ?? null,
      dependencyCount: dependencies.length,
      modelCount: models.length,
      categories,
    },
    components,
  }
}
