# Vectorcache JavaScript/TypeScript SDK

[![npm version](https://badge.fury.io/js/vectorcache.svg)](https://badge.fury.io/js/vectorcache)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Official JavaScript/TypeScript SDK for [Vectorcache](https://vectorcache.com) - the intelligent caching layer for LLMs that uses semantic similarity to dramatically reduce API costs and improve response times.

## Features

- ✅ **Full TypeScript support** with comprehensive type definitions
- ✅ **Easy integration** with any Node.js or browser application
- ✅ **Semantic caching** - Intelligent cache hits based on meaning, not exact matches
- ✅ **Cost optimization** - Save up to 90% on LLM API costs
- ✅ **Performance boost** - Cache hits return in ~50ms vs ~2000ms for API calls
- ✅ **Error handling** - Robust error handling with custom error types
- ✅ **Debug support** - Built-in logging and cache workflow visualization
- ✅ **Promise-based** - Modern async/await API

## Installation

```bash
npm install vectorcache
```

```bash
yarn add vectorcache
```

```bash
pnpm add vectorcache
```

## Quick Start

```typescript
import { VectorcacheClient } from 'vectorcache';

const client = new VectorcacheClient({
  apiKey: 'your-api-key-here'
});

const result = await client.query({
  query: "What is machine learning?",
  context: "AI tutorial",
  model: "gpt-4"
});

console.log(result.response);
console.log('Cache hit:', result.is_cache_hit);
console.log('Response time:', result.response_time_ms + 'ms');
```

## Authentication

1. Sign up at [vectorcache.com](https://vectorcache.com)
2. Create a project in your dashboard
3. Generate an API key
4. Use the API key to initialize the client

```typescript
const client = new VectorcacheClient({
  apiKey: process.env.VECTORCACHE_API_KEY
});
```

## API Reference

### Client Configuration

```typescript
const client = new VectorcacheClient({
  apiKey: 'your-api-key',        // Required: Your Vectorcache API key
  baseUrl: 'https://api.vectorcache.com', // Optional: API base URL
  projectId: 'your-project-id',  // Optional: Default project ID
  timeout: 30000,                // Optional: Request timeout (ms)
  logLevel: 'warn'               // Optional: 'debug' | 'info' | 'warn' | 'error' | 'none'
});
```

### Methods

#### `client.query(request)`

Make a cached query to your LLM.

```typescript
const result = await client.query({
  query: "Explain quantum computing",
  context: "For a beginner audience",      // Optional
  model: "gpt-4",                          // Optional, defaults to 'gpt-4'
  max_tokens: 150,                         // Optional, defaults to 1000
  temperature: 0.7,                        // Optional, defaults to 0.7
  metadata: { userId: "123" }              // Optional
});
```

**Response:**
```typescript
{
  response: string;           // The cached or generated response
  is_cache_hit: boolean;      // Whether this was a cache hit
  similarity_score?: number;  // Similarity score for cache hits
  response_time_ms: number;   // Response time in milliseconds
  tokens_used?: number;       // Tokens used (for cache misses)
  estimated_cost?: number;    // Estimated cost in USD
  cache_entry_id?: string;    // Cache entry ID for hits
  query_id: string;           // Unique query ID for tracking
}
```

#### `client.testCache(request)`

Test cache workflow with debugging information.

```typescript
const result = await client.testCache({
  project_id: 'your-project-id',
  prompt: "What is AI?",
  similarity_threshold: 0.8,     // Optional, defaults to 0.85
  include_debug: true            // Optional, defaults to true
});
```

#### `client.getCacheStats(projectId?)`

Get cache statistics for a project.

```typescript
const stats = await client.getCacheStats('your-project-id');

console.log('Total entries:', stats.total_entries);
console.log('Cache hits:', stats.total_hits);
console.log('Cost saved:', stats.total_cost_saved);
```

#### `client.findSimilarQueries(query, projectId?)`

Find similar queries in your cache.

```typescript
const similar = await client.findSimilarQueries(
  "What is artificial intelligence?",
  'your-project-id'
);

console.log('Found', similar.total_found, 'similar queries');
```

#### `client.clearCache(request)`

Clear cache entries.

```typescript
const result = await client.clearCache({
  project_id: 'your-project-id',  // Optional
  expired_only: true,             // Optional, only clear expired entries
  older_than_hours: 24            // Optional, clear entries older than X hours
});
```

#### `client.health()`

Check API health and connectivity.

```typescript
const health = await client.health();
console.log('Status:', health.status);
```

## Error Handling

The SDK provides custom error types for different scenarios:

```typescript
import {
  VectorcacheAPIError,
  VectorcacheAuthenticationError,
  VectorcacheRateLimitError,
  VectorcacheValidationError,
  VectorcacheNetworkError,
  VectorcacheTimeoutError
} from 'vectorcache';

try {
  const result = await client.query({
    query: "What is AI?",
    model: "gpt-4"
  });
} catch (error) {
  if (error instanceof VectorcacheAuthenticationError) {
    console.error('Invalid API key:', error.message);
  } else if (error instanceof VectorcacheRateLimitError) {
    console.error('Rate limited. Retry after:', error.retryAfter);
  } else if (error instanceof VectorcacheValidationError) {
    console.error('Validation error:', error.message);
    console.error('Details:', error.details);
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Examples

### Basic Usage

```typescript
import { VectorcacheClient } from 'vectorcache';

const client = new VectorcacheClient({
  apiKey: process.env.VECTORCACHE_API_KEY
});

// Simple query
const result = await client.query({
  query: "What is the capital of France?",
  model: "gpt-4"
});

console.log(result.response); // "The capital of France is Paris."
```

### Batch Processing

```typescript
const queries = [
  "What is machine learning?",
  "Explain neural networks",
  "What is deep learning?"
];

const results = await Promise.all(
  queries.map(query => client.query({ query, model: "gpt-4" }))
);

results.forEach((result, index) => {
  console.log(`Query ${index + 1}:`);
  console.log(`  Cache hit: ${result.is_cache_hit}`);
  console.log(`  Response: ${result.response}\n`);
});
```

### Cache Management

```typescript
// Get cache statistics
const stats = await client.getCacheStats();
console.log(`Cache hit rate: ${(stats.total_hits / stats.total_entries * 100).toFixed(1)}%`);
console.log(`Total cost saved: $${stats.total_cost_saved.toFixed(4)}`);

// Find similar queries
const similar = await client.findSimilarQueries("What is AI?");
console.log(`Found ${similar.total_found} similar queries`);

// Clear old cache entries
await client.clearCache({
  expired_only: true,
  older_than_hours: 168 // 1 week
});
```

## Environment Variables

You can set these environment variables for convenience:

```bash
VECTORCACHE_API_KEY=your-api-key-here
VECTORCACHE_PROJECT_ID=your-default-project-id
```

## Browser Support

This SDK works in both Node.js and modern browsers. For browser usage:

```html
<script type="module">
import { VectorcacheClient } from 'https://cdn.skypack.dev/vectorcache';

const client = new VectorcacheClient({
  apiKey: 'your-api-key'
});
</script>
```

## TypeScript Support

The SDK is written in TypeScript and includes comprehensive type definitions:

```typescript
import {
  VectorcacheClient,
  SemanticQueryRequest,
  SemanticQueryResponse,
  CacheStatsResponse
} from 'vectorcache';

const client = new VectorcacheClient({ apiKey: 'key' });

// Full type safety
const request: SemanticQueryRequest = {
  query: "What is AI?",
  model: "gpt-4",
  max_tokens: 100
};

const response: SemanticQueryResponse = await client.query(request);
```

## Development

```bash
# Clone the repository
git clone https://github.com/vectorcache/vectorcache-js.git

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run examples
node examples/basic-usage.js
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- 🌐 [Website](https://vectorcache.com)
- 📚 [Documentation](https://docs.vectorcache.com)
- 🐛 [Issues](https://github.com/vectorcache/vectorcache-js/issues)
- 💬 [Discord Community](https://discord.gg/vectorcache)

## Support

- 📧 Email: support@vectorcache.com
- 💬 Discord: [Join our community](https://discord.gg/vectorcache)
- 📖 Docs: [docs.vectorcache.com](https://docs.vectorcache.com)