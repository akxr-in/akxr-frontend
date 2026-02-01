// scripts/generate-api.js
const p2o = require('postman-to-openapi');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function generateClient() {
  console.log('🔄 Fetching Postman collection from backend...');

  // Fetch Postman collection from backend
  const response = await fetch(`${baseUrl}/postman.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Postman collection: ${response.statusText}`);
  }

  const postmanCollection = await response.json();

  // Save temporarily
  const tempPostmanPath = path.join(__dirname, 'temp-postman.json');
  const openApiPath = path.join(__dirname, 'openapi.json');

  fs.writeFileSync(tempPostmanPath, JSON.stringify(postmanCollection, null, 2));
  console.log('✅ Postman collection saved');

  // Convert Postman to OpenAPI
  console.log('🔄 Converting to OpenAPI...');
  const openApiSpec = await p2o(tempPostmanPath);
  fs.writeFileSync(openApiPath, openApiSpec);
  console.log('✅ OpenAPI spec generated');

  // Clean up temp file
  fs.unlinkSync(tempPostmanPath);

  // Run orval to generate client
  console.log('🔄 Generating API client...');
  execSync('pnpm orval', { stdio: 'inherit' });
  console.log('✅ API client generated!');
}

generateClient().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});