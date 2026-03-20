#!/usr/bin/env node

import { resolve } from 'node:path'
import { inventory } from './inventory.js'
import { buildInteropGraph } from './capabilities.js'
import type { AgentManifest, InventoryComponent } from './capabilities.js'

const CATEGORY_LABELS: Record<string, string> = {
  'llm-sdk': 'LLM SDKs',
  'agent-framework': 'Agent Frameworks',
  'ml-library': 'ML Libraries',
  'vector-db': 'Vector Databases',
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const humanFlag = args.includes('--human')
  const manifestFlag = args.includes('--manifest')
  const filteredArgs = args.filter(
    a =>
      a !== '--json' &&
      a !== '--human' &&
      a !== '--manifest' &&
      a !== '--help' &&
      a !== '-h'
  )

  if (args.includes('--help') || args.includes('-h')) {
    printUsage()
    return
  }

  const targetPath = resolve(filteredArgs[0] ?? '.')
  const result = await inventory(targetPath)

  if (manifestFlag) {
    const manifest: AgentManifest = {
      schema: 'ai-inventory/v1',
      timestamp: new Date().toISOString(),
      path: targetPath,
      components: result.components,
      graph: buildInteropGraph(result.components),
    }
    console.log(JSON.stringify(manifest, null, 2))
    return
  }

  if (humanFlag) {
    printReport(result)
    return
  }

  // Default: JSON output (machine-readable)
  console.log(JSON.stringify(result, null, 2))
}

function printUsage(): void {
  console.log(`
ai-inventory — AI tech stack discovery for agents and humans

Usage:
  npx @firmis/ai-inventory [path] [options]

Options:
  --manifest  Output minimal agent discovery manifest with interop graph
  --human     Output human-readable report
  --json      Output full JSON (default)
  --help      Show this help

Examples:
  npx @firmis/ai-inventory .
  npx @firmis/ai-inventory ./my-project --manifest
  npx @firmis/ai-inventory ./my-project --human
`)
}

function printReport(
  result: Awaited<ReturnType<typeof inventory>>
): void {
  const { summary, framework, dependencies, models } = result

  console.log('')
  console.log(`  AI Inventory: ${result.path}`)
  console.log('  ' + '─'.repeat(50))

  if (!summary.hasAI) {
    console.log('')
    console.log('  No AI components detected.')
    console.log('')
    return
  }

  if (framework) {
    console.log('')
    console.log(`  Framework: ${framework.label}`)
    if (framework.isFrameworkSource) {
      console.log('  (This is the framework source code)')
    }
  }

  if (dependencies.length > 0) {
    console.log('')
    console.log(`  Dependencies (${dependencies.length}):`)

    const grouped = groupBy(dependencies, d => d.category)
    for (const [category, deps] of Object.entries(grouped)) {
      const label = CATEGORY_LABELS[category] ?? category
      console.log(`    ${label}:`)
      for (const dep of deps) {
        const ver = dep.version ? `@${dep.version}` : ''
        const src = dep.source === 'pip' ? ' (pip)' : ''
        console.log(`      - ${dep.name}${ver}${src}`)
      }
    }
  }

  if (models.length > 0) {
    console.log('')
    console.log(`  Model Files (${models.length}):`)
    for (const model of models) {
      const size = model.sizeMB
        ? ` (${model.sizeMB.toFixed(1)} MB)`
        : ''
      console.log(`    - ${model.name} [${model.format}]${size}`)
    }
  }

  console.log('')
  console.log('  ' + '─'.repeat(50))
  console.log(
    `  Found: ${summary.dependencyCount} deps, ${summary.modelCount} models`
  )

  if (result.components.length > 0) {
    printCapabilities(result.components)
  }

  if (summary.dependencyCount > 0) {
    console.log(
      `  Scan for security threats: npx @firmis/scanner scan .`
    )
  }

  console.log('')
}

function printCapabilities(
  components: InventoryComponent[]
): void {
  console.log('')
  console.log('  Agent Capabilities:')

  const byRole = groupBy(components, c => c.capability.role)
  for (const [role, comps] of Object.entries(byRole)) {
    const names = comps.map(c => c.name).join(', ')
    console.log(`    ${role}: ${names}`)
  }

  const edges = buildInteropGraph(components)
  if (edges.length > 0) {
    console.log('')
    console.log(`  Interop Graph (${edges.length} connections):`)
    for (const edge of edges) {
      console.log(`    ${edge.from} <-> ${edge.to} via ${edge.via}`)
    }
  }
}

function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  const result: Record<string, T[]> = {}
  for (const item of items) {
    const key = keyFn(item)
    const group = result[key] ?? []
    group.push(item)
    result[key] = group
  }
  return result
}

main().catch((err: unknown) => {
  console.error('Error:', err)
  process.exit(1)
})
