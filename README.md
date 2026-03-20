# ai-inventory

Detect AI frameworks, LLM dependencies, and model files in any project. One command to know what AI is in your codebase.

## Quick start

```bash
npx @firmis/ai-inventory .
```

**Output:**

```
  AI Inventory: /path/to/your/project
  ──────────────────────────────────────────────────

  Framework: LangChain

  Dependencies (5):
    LLM SDKs:
      - openai@^1.12.0
      - @anthropic-ai/sdk@^0.20.0
    Agent Frameworks:
      - @langchain/core@^0.1.0
    Vector Databases:
      - @pinecone-database/pinecone@^2.0.0
      - chromadb@^1.8.0

  Model Files (1):
    - model.safetensors [SafeTensors] (245.3 MB)

  ──────────────────────────────────────────────────
  Found: 5 deps, 1 models
  Scan for security threats: npx @firmis/scanner scan .
```

## What it detects

**Frameworks:** CrewAI, LangChain, AutoGen, MetaGPT, AutoGPT, LangFlow, MCP Server, n8n

**Dependencies (50+):** OpenAI, Anthropic, Google AI, Cohere, Replicate, Ollama, LangChain, LlamaIndex, Pinecone, ChromaDB, Weaviate, Qdrant, HuggingFace, PyTorch, TensorFlow, and more — across npm and pip.

**Model files:** GGUF, SafeTensors, ONNX, PyTorch (.pt/.pth), HDF5/Keras (.h5), TFLite, Ollama Modelfiles, TensorFlow.js, HuggingFace configs.

## Programmatic API

```typescript
import { inventory } from '@firmis/ai-inventory'

const result = await inventory('./my-project')

console.log(result.summary.hasAI)           // true
console.log(result.framework?.label)         // "LangChain"
console.log(result.dependencies.length)      // 5
console.log(result.models.length)            // 1
```

Individual detectors are also exported:

```typescript
import {
  detectFramework,
  detectAIDependencies,
  detectModelFiles,
} from '@firmis/ai-inventory'
```

## CLI options

```bash
npx @firmis/ai-inventory [path] [options]

Options:
  --json    Output as JSON
  --help    Show help
```

## Found AI? Scan it for threats.

```bash
npx firmis-scanner scan .
```

[Firmis Scanner](https://github.com/firmislabs/firmis-scanner) detects security threats across 9 AI agent platforms with 242 rules.

## FAQ

**What does ai-inventory detect?**
8 agent frameworks (CrewAI, LangChain, AutoGen, MCP, etc.), 35+ LLM/ML dependencies across npm and pip, and model files in 9 formats. Returns structured JSON with capability metadata.

**How is this different from firmis scan?**
ai-inventory discovers what AI tools exist. firmis scan checks them for security threats. Use ai-inventory first to see what you have, then firmis scan to find vulnerabilities. ai-inventory is the asset map, firmis is the security audit.

**Can agents consume the output?**
Yes. The `--manifest` flag outputs a minimal discovery manifest with component capabilities and an interop graph showing which components can communicate. Designed for agent orchestration systems.

**Is it free?**
Yes, Apache-2.0 licensed. Zero install: `npx @firmislabs/ai-inventory`.

## License

Apache-2.0
