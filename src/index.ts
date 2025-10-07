/**
 * Vectorcache JavaScript/TypeScript SDK
 *
 * @example
 * ```typescript
 * import { VectorcacheClient } from 'vectorcache';
 *
 * const client = new VectorcacheClient({
 *   apiKey: 'your-api-key'
 * });
 *
 * const result = await client.query({
 *   query: "What is machine learning?",
 *   context: "AI tutorial"
 * });
 *
 * console.log(result.response);
 * ```
 */

export { VectorcacheClient } from './client';

export * from './types';
export * from './errors';

// Default export for convenience
export { VectorcacheClient as default } from './client';