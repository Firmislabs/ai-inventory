import { detectFramework } from './framework-detect.js'
import type { DetectedFramework } from './framework-detect.js'
import { detectAIDependencies } from './dep-detector.js'
import type { DependencyInfo } from './dep-detector.js'
import { detectModelFiles } from './model-detector.js'
import type { ModelFileInfo } from './model-detector.js'

export interface InventoryResult {
  path: string
  framework: DetectedFramework | null
  dependencies: DependencyInfo[]
  models: ModelFileInfo[]
  summary: InventorySummary
}

interface InventorySummary {
  hasAI: boolean
  frameworkName: string | null
  dependencyCount: number
  modelCount: number
  categories: string[]
}

export async function inventory(
  targetPath: string
): Promise<InventoryResult> {
  const framework = detectFramework(targetPath)
  const dependencies = await detectAIDependencies(targetPath)
  const models = await detectModelFiles(targetPath)

  const categories = [
    ...new Set(dependencies.map((d) => d.category)),
  ]
  const hasAI =
    framework !== null ||
    dependencies.length > 0 ||
    models.length > 0

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
  }
}
