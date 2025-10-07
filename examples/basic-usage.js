/**
 * Basic usage example for Vectorcache SDK
 */

const { VectorcacheClient } = require('vectorcache');

async function basicExample() {
  // Initialize the client
  const client = new VectorcacheClient({
    apiKey: process.env.VECTORCACHE_API_KEY || 'your-api-key-here'
  });

  try {
    // Make a cached query
    console.log('Making query to Vectorcache...');

    const result = await client.query({
      query: "What is the capital of France?",
      context: "Geography question",
      model: "gpt-4",
      max_tokens: 100
    });

    console.log('Query successful!');
    console.log('Response:', result.response);
    console.log('Cache hit:', result.is_cache_hit);
    console.log('Response time:', result.response_time_ms + 'ms');

    if (result.is_cache_hit) {
      console.log('Similarity score:', result.similarity_score);
      console.log('Cache entry ID:', result.cache_entry_id);
    } else {
      console.log('Tokens used:', result.tokens_used);
      console.log('Estimated cost:', '$' + result.estimated_cost);
    }

  } catch (error) {
    console.error('Error:', error.message);

    if (error.status) {
      console.error('Status:', error.status);
    }

    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

// Check if this file is being run directly
if (require.main === module) {
  basicExample();
}