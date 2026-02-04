const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import env config to get backend URL (source of truth)
const { env } = require('./src/lib/env');

async function generateClient() {
  const openApiPath = path.join(__dirname, 'openapi.json');

  console.log('🔄 Fetching OpenAPI spec from backend...');
  console.log(`📍 Using backend URL: ${env.BACKEND_URL}`);

  const response = await fetch(`${env.BACKEND_URL}/openapi.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
  }

  const openApiSpec = await response.json();
  fs.writeFileSync(openApiPath, JSON.stringify(openApiSpec, null, 2));
  console.log('✅ OpenAPI spec saved');

  console.log('🔄 Generating API client...');
  execSync('pnpm orval', { stdio: 'inherit' });
  console.log('✅ API client generated!');
}

generateClient().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
