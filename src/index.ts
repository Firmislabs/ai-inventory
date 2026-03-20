export { detectFramework } from './framework-detect.js'
export type { DetectedFramework } from './framework-detect.js'

export { detectAIDependencies } from './dep-detector.js'
export type { DependencyInfo } from './dep-detector.js'

export { detectModelFiles } from './model-detector.js'
export type { ModelFileInfo } from './model-detector.js'

export { inventory } from './inventory.js'
export type { InventoryResult, InventoryComponent } from './inventory.js'

export type {
  AgentCapability,
  AgentManifest,
  InteropEdge,
} from './capabilities.js'
export { buildInteropGraph } from './capabilities.js'
