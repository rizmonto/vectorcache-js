/**
 * Advanced usage examples for Vectorcache SDK
 */

const { VectorcacheClient } = require('vectorcache');

async function advancedExample() {
  // Initialize with custom configuration
  const client = new VectorcacheClient({
    apiKey: process.env.VECTORCACHE_API_KEY || 'your-api-key-here',
    projectId: 'your-project-id', // Set default project ID
    timeout: 15000, // 15 second timeout
    logLevel: 'info' // Enable info logging
  });

  try {
    console.log('=== Advanced Vectorcache SDK Examples ===\n');

    // 1. Test cache workflow with debugging
    console.log('1. Testing cache workflow...');
    const testResult = await client.testCache({
      project_id: 'your-project-id',
      prompt: "Explain quantum computing",
      context: "For a technical audience",
      similarity_threshold: 0.8,
      include_debug: true
    });

    console.log('Cache hit:', testResult.cache_hit);
    console.log('Response time:', testResult.response_time + 'ms');

    if (testResult.workflow_steps) {
      console.log('Workflow steps:');
      testResult.workflow_steps.forEach(step => {
        console.log(`  ${step.id}. ${step.name}: ${step.status}`);
      });
    }

    // 2. Get cache statistics
    console.log('\n2. Getting cache statistics...');
    const stats = await client.getCacheStats();

    console.log('Total entries:', stats.total_entries);
    console.log('Cache hits:', stats.total_hits);
    console.log('Cost saved:', '$' + stats.total_cost_saved.toFixed(4));
    console.log('Hit rate:', ((stats.total_hits / Math.max(1, stats.total_entries)) * 100).toFixed(1) + '%');

    // 3. Find similar queries
    console.log('\n3. Finding similar queries...');
    const similar = await client.findSimilarQueries(
      "What is artificial intelligence?",
      'your-project-id'
    );

    console.log('Found', similar.total_found, 'similar queries');
    similar.similar_entries.slice(0, 3).forEach((entry, index) => {
      console.log(`  ${index + 1}. "${entry.original_query}" (similarity: ${entry.similarity.toFixed(3)})`);
    });

    // 4. Multiple queries with different configurations
    console.log('\n4. Making multiple queries...');

    const queries = [
      {
        query: "What is machine learning?",
        model: "gpt-4",
        temperature: 0.3
      },
      {
        query: "Explain neural networks",
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 150
      }
    ];

    const results = await Promise.all(
      queries.map(query => client.query(query))
    );

    results.forEach((result, index) => {
      console.log(`Query ${index + 1}:`);
      console.log(`  Cache hit: ${result.is_cache_hit}`);
      console.log(`  Response time: ${result.response_time_ms}ms`);
      console.log(`  Response: ${result.response.substring(0, 100)}...\n`);
    });

    // 5. Health check
    console.log('5. Checking API health...');
    const health = await client.health();
    console.log('API Status:', health.status);
    console.log('Timestamp:', health.timestamp);

    // 6. Error handling example
    console.log('\n6. Testing error handling...');
    try {
      await client.query({
        query: "", // Invalid empty query
        model: "gpt-4"
      });
    } catch (error) {
      console.log('Caught expected validation error:', error.name);
      console.log('Error message:', error.message);
    }

  } catch (error) {
    console.error('Unexpected error:', error.message);

    if (error.status) {
      console.error('HTTP Status:', error.status);
    }

    if (error.code) {
      console.error('Error Code:', error.code);
    }

    if (error.details) {
      console.error('Details:', error.details);
    }
  }
}

// Run the example
if (require.main === module) {
  advancedExample().catch(console.error);
}