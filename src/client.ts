/**
 * Vectorcache TypeScript/JavaScript SDK
 * Official client for the Vectorcache API
 */

import {
  VectorcacheConfig,
  SemanticQueryRequest,
  SemanticQueryResponse,
  CacheStatsResponse,
  CacheTestRequest,
  CacheTestResponse,
  ClearCacheRequest,
  ClearCacheResponse,
  SimilarQueriesResponse,
  RequestOptions,
  LogLevel
} from './types';

import {
  VectorcacheAPIError,
  VectorcacheNetworkError,
  VectorcacheTimeoutError,
  createErrorFromResponse
} from './errors';

export class VectorcacheClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultProjectId?: string;
  private readonly timeout: number;
  private readonly logLevel: LogLevel;

  constructor(config: VectorcacheConfig & { logLevel?: LogLevel }) {
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.vectorcache.com';
    this.defaultProjectId = config.projectId;
    this.timeout = config.timeout || 30000; // 30 seconds default
    this.logLevel = config.logLevel || 'warn';
  }

  /**
   * Make a cached query to your LLM
   */
  async query(request: SemanticQueryRequest, options?: RequestOptions): Promise<SemanticQueryResponse> {
    return this.makeRequest<SemanticQueryResponse>(
      'POST',
      '/v1/cache/query',
      request,
      options
    );
  }

  /**
   * Test cache workflow with debugging information
   */
  async testCache(request: CacheTestRequest, options?: RequestOptions): Promise<CacheTestResponse> {
    return this.makeRequest<CacheTestResponse>(
      'POST',
      '/v1/cache/test',
      request,
      options
    );
  }

  /**
   * Get cache statistics for a project
   */
  async getCacheStats(projectId?: string, options?: RequestOptions): Promise<CacheStatsResponse> {
    const id = projectId || options?.projectId || this.defaultProjectId;
    if (!id) {
      throw new VectorcacheAPIError('Project ID is required');
    }

    return this.makeRequest<CacheStatsResponse>(
      'GET',
      `/v1/cache/projects/${id}/stats`,
      undefined,
      options
    );
  }

  /**
   * Clear cache entries
   */
  async clearCache(request: ClearCacheRequest, options?: RequestOptions): Promise<ClearCacheResponse> {
    return this.makeRequest<ClearCacheResponse>(
      'POST',
      '/v1/cache/clear',
      request,
      options
    );
  }

  /**
   * Find similar queries in cache
   */
  async findSimilarQueries(
    query: string,
    projectId?: string,
    options?: RequestOptions
  ): Promise<SimilarQueriesResponse> {
    const id = projectId || options?.projectId || this.defaultProjectId;
    if (!id) {
      throw new VectorcacheAPIError('Project ID is required');
    }

    return this.makeRequest<SimilarQueriesResponse>(
      'GET',
      `/v1/cache/projects/${id}/similar?query=${encodeURIComponent(query)}`,
      undefined,
      options
    );
  }

  /**
   * Check API health and connectivity
   */
  async health(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest<{ status: string; timestamp: string }>(
      'GET',
      '/health'
    );
  }

  /**
   * Make HTTP request with error handling and retries
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options?.timeout || this.timeout;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'vectorcache-js/0.1.0'
    };

    const requestOptions: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    };

    this.log('debug', `Making ${method} request to ${url}`, { body });

    try {
      // Create timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle response
      const responseText = await response.text();
      let responseBody: any;

      try {
        responseBody = responseText ? JSON.parse(responseText) : {};
      } catch {
        responseBody = { message: responseText };
      }

      if (!response.ok) {
        this.log('error', `API request failed: ${response.status} ${response.statusText}`, {
          url,
          status: response.status,
          body: responseBody
        });
        throw createErrorFromResponse(response, responseBody);
      }

      this.log('debug', `API request successful: ${response.status}`, responseBody);
      return responseBody as T;

    } catch (error) {
      if (error instanceof VectorcacheAPIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new VectorcacheTimeoutError(`Request timeout after ${timeout}ms`);
        }

        this.log('error', `Network error: ${error.message}`, { url, error: error.name });
        throw new VectorcacheNetworkError(`Network error: ${error.message}`);
      }

      throw new VectorcacheAPIError('Unknown error occurred');
    }
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      none: 4
    };

    if (levels[level] >= levels[this.logLevel]) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [Vectorcache] [${level.toUpperCase()}]`;

      if (data) {
        console.log(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): Partial<VectorcacheConfig> {
    return {
      baseUrl: this.baseUrl,
      projectId: this.defaultProjectId,
      timeout: this.timeout
    };
  }

  /**
   * Update default project ID
   */
  setDefaultProjectId(projectId: string): void {
    (this as any).defaultProjectId = projectId;
  }
}