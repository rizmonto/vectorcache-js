/**
 * TypeScript types for Vectorcache API
 * Generated from FastAPI Pydantic schemas
 */

export interface Message {
  /** Message role: 'system', 'user', or 'assistant' */
  role: 'system' | 'user' | 'assistant';
  /** Message content */
  content: string;
}

export interface SemanticQueryRequest {
  /** The query text to cache or retrieve (simple format) */
  query?: string;
  /** Messages array (OpenAI/Anthropic format) - use either query or messages, not both */
  messages?: Message[];
  /** Additional context for the query */
  context?: string;
  /** Optional metadata for the query */
  metadata?: Record<string, any>;
  /** LLM model to use if cache miss */
  model?: string;
  /** Maximum tokens for LLM response (1-4000) */
  max_tokens?: number;
  /** LLM temperature setting (0.0-2.0) */
  temperature?: number;
}

export interface SemanticQueryResponse {
  /** The cached or generated response */
  response: string;
  /** Whether this was a cache hit or miss */
  is_cache_hit: boolean;
  /** Similarity score for cache hits */
  similarity_score?: number;
  /** Response time in milliseconds */
  response_time_ms: number;
  /** Number of tokens used (for cache misses) */
  tokens_used?: number;
  /** Estimated cost in USD */
  estimated_cost?: number;
  /** Cache entry ID for hits */
  cache_entry_id?: string;
  /** Unique query ID for tracking */
  query_id: string;
}

export interface CacheEntry {
  /** Cache entry ID */
  id: string;
  /** Project ID */
  project_id: string;
  /** Original query text */
  query_text: string;
  /** Query context */
  query_context?: string;
  /** Cached response */
  response_text: string;
  /** Query embedding vector */
  embedding: number[];
  /** Similarity threshold used */
  similarity_threshold: number;
  /** Number of times this entry was hit */
  hit_count: number;
  /** Total tokens saved by this cache entry */
  tokens_saved: number;
  /** Total cost saved by this cache entry */
  cost_saved: number;
  /** Entry metadata */
  metadata?: Record<string, any>;
  /** Creation timestamp */
  created_at: string;
  /** Last cache hit timestamp */
  last_hit_at?: string;
  /** Expiration timestamp */
  expires_at: string;
}

export interface CacheStatsResponse {
  /** Project ID */
  project_id: string;
  /** Total number of cache entries */
  total_entries: number;
  /** Number of active (non-expired) entries */
  active_entries: number;
  /** Number of expired entries */
  expired_entries: number;
  /** Total cache hits across all entries */
  total_hits: number;
  /** Total tokens saved */
  total_tokens_saved: number;
  /** Total cost saved in USD */
  total_cost_saved: number;
  /** Average similarity score for hits */
  avg_similarity_score: number;
  /** Estimated cache size in MB */
  cache_size_mb: number;
}

export interface ClearCacheRequest {
  /** Project ID to clear cache for (all if not specified) */
  project_id?: string;
  /** Only clear expired entries */
  expired_only?: boolean;
  /** Clear entries older than X hours */
  older_than_hours?: number;
}

export interface ClearCacheResponse {
  /** Number of entries cleared */
  entries_cleared: number;
  /** Estimated space freed in MB */
  space_freed_mb: number;
  /** Operation time in milliseconds */
  operation_time_ms: number;
}

export interface SimilarEntry {
  /** Cache entry ID */
  id: string;
  /** Original query text */
  original_query: string;
  /** Similarity score */
  similarity: number;
  /** Creation timestamp */
  created_at: string;
}

export interface SimilarQueriesResponse {
  /** Original query */
  query: string;
  /** List of similar cache entries */
  similar_entries: Record<string, any>[];
  /** Total number of similar entries found */
  total_found: number;
}

export interface CacheTestRequest {
  /** Project ID to test cache for */
  project_id: string;
  /** Test prompt */
  prompt: string;
  /** Optional context */
  context?: string;
  /** Similarity threshold for cache hits (0.0-1.0) */
  similarity_threshold?: number;
  /** Model to use for LLM call if cache miss */
  model?: string;
  /** Include debug information in response */
  include_debug?: boolean;
}

export interface WorkflowStep {
  /** Step ID */
  id: number;
  /** Step name */
  name: string;
  /** Step status */
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  /** Step duration in milliseconds */
  duration?: number;
  /** Step details */
  details?: string;
  /** Step icon */
  icon: string;
}

export interface CacheTestResponse {
  /** Whether cache was hit */
  cache_hit: boolean;
  /** Similarity score for cache hits */
  similarity_score?: number;
  /** Total response time in milliseconds */
  response_time: number;
  /** Cost saved from cache hit */
  cost_saved?: number;
  /** Cost spent for cache miss */
  cost_spent?: number;
  /** The actual response */
  response: string;
  /** Cache entry ID */
  cache_entry_id?: string;
  /** Similar entries found */
  similar_entries: SimilarEntry[];
  /** Workflow steps for debugging */
  workflow_steps?: WorkflowStep[];
}

export interface VectorcacheConfig {
  /** Your Vectorcache API key */
  apiKey: string;
  /** Base URL for the API (defaults to production) */
  baseUrl?: string;
  /** Default project ID for queries */
  projectId?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

export interface VectorcacheError {
  /** Error message */
  message: string;
  /** HTTP status code */
  status?: number;
  /** Error code */
  code?: string;
  /** Additional error details */
  details?: any;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

export interface RequestOptions {
  /** Override default project ID for this request */
  projectId?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}