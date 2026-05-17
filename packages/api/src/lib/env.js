
const APP_ENV = (process.env.APP_ENV) || 'development'

const backendUrls = {
    development: 'http://localhost:3000',
    staging: 'https://api-staging.akxr.in',
    production: 'https://api.akxr.in'
}

const dcEndpoints = {
    development: 'https://data-collection-staging.akxr.in',
    staging: 'https://data-collection-staging.akxr.in',
    production: 'https://data-collection.akxr.in'
}

const env = {
    // Environment
    APP_ENV,
    isDevelopment: APP_ENV === 'development',
    isStaging: APP_ENV === 'staging',
    isProduction: APP_ENV === 'production',

    // URLs
    BACKEND_URL: backendUrls[APP_ENV],
    DC_ENDPOINT: dcEndpoints[APP_ENV]
}

module.exports = {
    env
};
