/**
 * Tests for VectorcacheClient
 */

import { VectorcacheClient } from '../src/client';
import { VectorcacheAPIError, VectorcacheAuthenticationError } from '../src/errors';

// Mock fetch globally
global.fetch = jest.fn();

describe('VectorcacheClient', () => {
  let client: VectorcacheClient;

  beforeEach(() => {
    client = new VectorcacheClient({
      apiKey: 'test-api-key',
      baseUrl: 'https://api.test.com'
    });

    // Reset fetch mock
    (fetch as jest.MockedFunction<typeof fetch>).mockReset();
  });

  describe('constructor', () => {
    it('should throw error if no API key provided', () => {
      expect(() => {
        new VectorcacheClient({} as any);
      }).toThrow('API key is required');
    });

    it('should set default configuration', () => {
      const config = client.getConfig();
      expect(config.baseUrl).toBe('https://api.test.com');
      expect(config.timeout).toBe(30000);
    });

    it('should use production URL by default', () => {
      const prodClient = new VectorcacheClient({ apiKey: 'test' });
      const config = prodClient.getConfig();
      expect(config.baseUrl).toBe('https://api.vectorcache.com');
    });
  });

  describe('query', () => {
    it('should make successful query request', async () => {
      const mockResponse = {
        response: 'Test response',
        is_cache_hit: true,
        similarity_score: 0.95,
        response_time_ms: 50,
        query_id: 'test-query-id'
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockResponse))
      } as Response);

      const result = await client.query({
        query: 'Test query',
        model: 'gpt-4'
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/cache/query',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({
            query: 'Test query',
            model: 'gpt-4'
          })
        })
      );
    });

    it('should handle API errors', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve(JSON.stringify({ message: 'Invalid API key' }))
      } as Response);

      await expect(client.query({ query: 'Test' }))
        .rejects
        .toThrow(VectorcacheAuthenticationError);
    });

    it('should handle network errors', async () => {
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(client.query({ query: 'Test' }))
        .rejects
        .toThrow('Network error');
    });
  });

  describe('health', () => {
    it('should check API health', async () => {
      const mockHealth = {
        status: 'healthy',
        timestamp: '2023-10-01T00:00:00Z'
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockHealth))
      } as Response);

      const result = await client.health();

      expect(result).toEqual(mockHealth);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/health',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('getCacheStats', () => {
    it('should get cache stats with project ID', async () => {
      const mockStats = {
        project_id: 'test-project',
        total_entries: 100,
        active_entries: 90,
        expired_entries: 10,
        total_hits: 50,
        total_tokens_saved: 1000,
        total_cost_saved: 0.05,
        avg_similarity_score: 0.85,
        cache_size_mb: 2.5
      };

      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockStats))
      } as Response);

      const result = await client.getCacheStats('test-project');

      expect(result).toEqual(mockStats);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/v1/cache/projects/test-project/stats',
        expect.any(Object)
      );
    });

    it('should throw error if no project ID provided', async () => {
      await expect(client.getCacheStats())
        .rejects
        .toThrow('Project ID is required');
    });
  });

  describe('setDefaultProjectId', () => {
    it('should update default project ID', () => {
      client.setDefaultProjectId('new-project-id');
      const config = client.getConfig();
      expect(config.projectId).toBe('new-project-id');
    });
  });
});