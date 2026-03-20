export interface AgentCapability {
  protocol: string
  role: string
  interop: string[]
}

export interface InventoryComponent {
  id: string
  name: string
  version: string | null
  source: string
  capability: AgentCapability
}

export interface InteropEdge {
  from: string
  to: string
  via: string
}

export interface AgentManifest {
  schema: 'ai-inventory/v1'
  timestamp: string
  path: string
  components: InventoryComponent[]
  graph: InteropEdge[]
}

export const CAPABILITY_MAP: Record<string, AgentCapability> = {
  'openai': { protocol: 'rest', role: 'llm-provider', interop: ['openai-api'] },
  '@anthropic-ai/sdk': { protocol: 'rest', role: 'llm-provider', interop: ['anthropic-api', 'bedrock'] },
  '@anthropic-ai/bedrock-sdk': { protocol: 'rest', role: 'llm-provider', interop: ['bedrock'] },
  '@google/generative-ai': { protocol: 'rest', role: 'llm-provider', interop: ['google-ai'] },
  'langchain': { protocol: 'sdk', role: 'orchestrator', interop: ['openai-api', 'anthropic-api', 'google-ai', 'ollama'] },
  '@langchain/core': { protocol: 'sdk', role: 'orchestrator', interop: ['openai-api', 'anthropic-api', 'google-ai', 'ollama'] },
  '@langchain/openai': { protocol: 'sdk', role: 'orchestrator', interop: ['openai-api'] },
  '@langchain/anthropic': { protocol: 'sdk', role: 'orchestrator', interop: ['anthropic-api'] },
  'llamaindex': { protocol: 'sdk', role: 'orchestrator', interop: ['openai-api', 'anthropic-api'] },
  '@modelcontextprotocol/sdk': { protocol: 'mcp', role: 'tool-server', interop: ['mcp'] },
  'crewai': { protocol: 'sdk', role: 'agent-runtime', interop: ['openai-api', 'anthropic-api'] },
  'autogen': { protocol: 'sdk', role: 'agent-runtime', interop: ['openai-api', 'anthropic-api'] },
  '@pinecone-database/pinecone': { protocol: 'rest', role: 'vector-store', interop: ['pinecone'] },
  'chromadb': { protocol: 'rest', role: 'vector-store', interop: ['chroma'] },
  'weaviate-ts-client': { protocol: 'rest', role: 'vector-store', interop: ['weaviate'] },
  '@qdrant/js-client-rest': { protocol: 'rest', role: 'vector-store', interop: ['qdrant'] },
  'cohere-ai': { protocol: 'rest', role: 'llm-provider', interop: ['cohere-api'] },
  'replicate': { protocol: 'rest', role: 'llm-provider', interop: ['replicate-api'] },
  'ollama': { protocol: 'rest', role: 'llm-provider', interop: ['ollama', 'openai-api'] },
  'ai': { protocol: 'sdk', role: 'orchestrator', interop: ['openai-api', 'anthropic-api', 'google-ai'] },
  '@ai-sdk/openai': { protocol: 'sdk', role: 'llm-provider', interop: ['openai-api'] },
  '@ai-sdk/anthropic': { protocol: 'sdk', role: 'llm-provider', interop: ['anthropic-api'] },
  'transformers': { protocol: 'sdk', role: 'embedding', interop: ['huggingface'] },
  'onnxruntime-node': { protocol: 'sdk', role: 'embedding', interop: ['onnx'] },
  // pip equivalents
  'anthropic': { protocol: 'rest', role: 'llm-provider', interop: ['anthropic-api', 'bedrock'] },
  'google-generativeai': { protocol: 'rest', role: 'llm-provider', interop: ['google-ai'] },
  'langchain-core': { protocol: 'sdk', role: 'orchestrator', interop: ['openai-api', 'anthropic-api', 'google-ai', 'ollama'] },
  'langchain-openai': { protocol: 'sdk', role: 'orchestrator', interop: ['openai-api'] },
  'langchain-anthropic': { protocol: 'sdk', role: 'orchestrator', interop: ['anthropic-api'] },
  'llama-index': { protocol: 'sdk', role: 'orchestrator', interop: ['openai-api', 'anthropic-api'] },
  'torch': { protocol: 'sdk', role: 'ml-runtime', interop: ['pytorch'] },
  'tensorflow': { protocol: 'sdk', role: 'ml-runtime', interop: ['tensorflow'] },
  'sentence-transformers': { protocol: 'sdk', role: 'embedding', interop: ['huggingface'] },
  'pinecone-client': { protocol: 'rest', role: 'vector-store', interop: ['pinecone'] },
  'weaviate-client': { protocol: 'rest', role: 'vector-store', interop: ['weaviate'] },
  'qdrant-client': { protocol: 'rest', role: 'vector-store', interop: ['qdrant'] },
  'cohere': { protocol: 'rest', role: 'llm-provider', interop: ['cohere-api'] },
  'huggingface-hub': { protocol: 'rest', role: 'embedding', interop: ['huggingface'] },
}

export const FRAMEWORK_CAPABILITY: Record<string, AgentCapability> = {
  'crewai': { protocol: 'sdk', role: 'agent-runtime', interop: ['openai-api', 'anthropic-api'] },
  'langchain': { protocol: 'sdk', role: 'orchestrator', interop: ['openai-api', 'anthropic-api', 'google-ai'] },
  'autogen': { protocol: 'sdk', role: 'agent-runtime', interop: ['openai-api', 'anthropic-api'] },
  'metagpt': { protocol: 'sdk', role: 'agent-runtime', interop: ['openai-api'] },
  'autogpt': { protocol: 'sdk', role: 'agent-runtime', interop: ['openai-api'] },
  'langflow': { protocol: 'rest', role: 'orchestrator', interop: ['openai-api', 'anthropic-api'] },
  'mcp': { protocol: 'mcp', role: 'tool-server', interop: ['mcp'] },
  'n8n': { protocol: 'rest', role: 'orchestrator', interop: ['webhooks', 'openai-api'] },
}

const MODEL_INTEROP_MAP: Record<string, string[]> = {
  'GGUF': ['llama-cpp', 'ollama'],
  'SafeTensors': ['huggingface', 'pytorch'],
  'ONNX': ['onnx'],
  'PyTorch': ['pytorch'],
  'HDF5/Keras': ['tensorflow'],
  'TFLite': ['tensorflow'],
  'Ollama': ['ollama'],
  'TensorFlow.js': ['tfjs'],
  'HuggingFace': ['huggingface'],
}

export function modelCapability(format: string): AgentCapability {
  return {
    protocol: 'file',
    role: 'model-file',
    interop: MODEL_INTEROP_MAP[format] ?? [],
  }
}

export function buildInteropGraph(
  components: InventoryComponent[]
): InteropEdge[] {
  const edges: InteropEdge[] = []

  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const a = components[i]
      const b = components[j]
      if (!a || !b) continue

      for (const via of a.capability.interop) {
        if (b.capability.interop.includes(via)) {
          edges.push({ from: a.id, to: b.id, via })
          break
        }
      }
    }
  }

  return edges
}
