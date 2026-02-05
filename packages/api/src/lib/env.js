
const NODE_ENV = (process.env.APP_ENV) || 'development'

const backendUrls = {
    development: 'http://localhost:3000',
    staging: 'https://api-staging.akxr.in',
    production: 'https://api.akxr.in'
}

const env = {
    // Environment
    NODE_ENV,
    isDevelopment: NODE_ENV === 'development',
    isStaging: NODE_ENV === 'staging',
    isProduction: NODE_ENV === 'production',

    // URLs
    BACKEND_URL: backendUrls[NODE_ENV],
}

module.exports = {
    env
};
