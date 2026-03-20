# @firmislabs/ai-inventory

AI tech stack discovery for agents. Detects frameworks, LLM SDKs, vector stores, and model files in any project. Machine-readable inventory for agent orchestration and inter-agent discovery.

## What This Tool Does

Scans a project directory and returns a structured inventory of all AI components: frameworks (CrewAI, LangChain, AutoGen, MCP, n8n, etc.), LLM SDK dependencies (OpenAI, Anthropic, Google AI, Cohere, Ollama, etc.), vector databases (Pinecone, ChromaDB, Weaviate, Qdrant), and model files (GGUF, SafeTensors, ONNX, PyTorch).

## When to Use

- Before security scanning: discover what AI tools exist before scanning for threats
- Agent orchestration: get a machine-readable manifest of available components and their interop capabilities
- Compliance: generate an AI Bill of Materials for auditing
- Team visibility: understand what AI tools are deployed across projects

## Available Commands

```bash
# Default: JSON output (machine-readable)
npx @firmislabs/ai-inventory [path]

# Agent discovery manifest with interop graph
npx @firmislabs/ai-inventory [path] --manifest

# Human-readable report
npx @firmislabs/ai-inventory [path] --human
```

## Output Formats

### Default (JSON)
Full `InventoryResult` with framework, dependencies, models, summary, and components array.

### Manifest (`--manifest`)
Minimal `AgentManifest` schema:
- `schema`: "ai-inventory/v1"
- `components[]`: Each with id, name, version, source, and capability (protocol, role, interop)
- `graph[]`: Interop edges showing which components can communicate via shared protocols

### Human (`--human`)
Pretty-printed report with dependency grouping, model files, capability summary, and interop graph.

## Component Capabilities

Each detected component includes:
- `protocol`: How it communicates (rest, sdk, mcp, grpc, file)
- `role`: What it does (llm-provider, orchestrator, agent-runtime, tool-server, vector-store, embedding, model-file)
- `interop`: What protocols/APIs it can talk to (openai-api, anthropic-api, mcp, ollama, etc.)

## Supported Detections

### Frameworks (8)
CrewAI, LangChain, AutoGen, MetaGPT, AutoGPT, LangFlow, MCP Server, n8n

### Dependencies (35+)
npm: openai, @anthropic-ai/sdk, @google/generative-ai, langchain, @langchain/core, llamaindex, @modelcontextprotocol/sdk, crewai, autogen, @pinecone-database/pinecone, chromadb, weaviate-ts-client, @qdrant/js-client-rest, cohere-ai, replicate, ollama, ai, @ai-sdk/openai, @ai-sdk/anthropic, transformers, onnxruntime-node

pip: anthropic, openai, google-generativeai, langchain, crewai, autogen, torch, tensorflow, sentence-transformers, pinecone-client, chromadb, weaviate-client, qdrant-client, cohere, huggingface-hub

### Model Files
GGUF, SafeTensors, ONNX, PyTorch (.pt/.pth), HDF5/Keras, TFLite, Ollama Modelfile, TensorFlow.js, HuggingFace configs

## Programmatic API

```typescript
import { inventory } from '@firmislabs/ai-inventory'
import { buildInteropGraph } from '@firmislabs/ai-inventory'

const result = await inventory('/path/to/project')
const graph = buildInteropGraph(result.components)
```

## Related

For security scanning of detected AI components: `npx firmis-cli scan` (242 detection rules across 24 threat categories).

## Package Info

- npm: @firmislabs/ai-inventory
- License: Apache-2.0
- Repository: https://github.com/firmislabs/ai-inventory
