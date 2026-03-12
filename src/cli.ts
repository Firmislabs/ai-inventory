#!/usr/bin/env node

import { resolve } from 'node:path'
import { inventory } from './inventory.js'

const CATEGORY_LABELS: Record<string, string> = {
  'llm-sdk': 'LLM SDKs',
  'agent-framework': 'Agent Frameworks',
  'ml-library': 'ML Libraries',
  'vector-db': 'Vector Databases',
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const jsonFlag = args.includes('--json')
  const filteredArgs = args.filter(
    (a) => a !== '--json' && a !== '--help' && a !== '-h'
  )

  if (args.includes('--help') || args.includes('-h')) {
    printUsage()
    return
  }

  const targetPath = resolve(filteredArgs[0] ?? '.')
  const result = await inventory(targetPath)

  if (jsonFlag) {
    console.log(JSON.stringify(result, null, 2))
    return
  }

  printReport(result)
}

function printUsage(): void {
  console.log(`
ai-inventory — Detect AI in any project

Usage:
  npx @firmis/ai-inventory [path] [options]

Options:
  --json    Output as JSON
  --help    Show this help

Examples:
  npx @firmis/ai-inventory .
  npx @firmis/ai-inventory ./my-project --json
`)
}

function printReport(
  result: Awaited<ReturnType<typeof inventory>>
): void {
  const { summary, framework, dependencies, models } = result

  console.log('')
  console.log(
    `  AI Inventory: ${result.path}`
  )
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

    const grouped = groupBy(dependencies, (d) => d.category)
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
      console.log(
        `    - ${model.name} [${model.format}]${size}`
      )
    }
  }

  console.log('')
  console.log('  ' + '─'.repeat(50))
  console.log(
    `  Found: ${summary.dependencyCount} deps, ${summary.modelCount} models`
  )

  if (summary.dependencyCount > 0) {
    console.log(
      `  Scan for security threats: npx @firmis/scanner scan .`
    )
  }

  console.log('')
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
