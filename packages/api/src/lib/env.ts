// TypeScript wrapper for env.js (source of truth)
// This file re-exports from env.js to make it compatible with TypeScript imports
const envModule = require('./env.js');

export const env = envModule.env;
