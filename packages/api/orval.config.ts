// orval.config.ts
import { defineConfig } from 'orval';

// Note: baseUrl is removed so orval generates relative URLs (e.g., '/batch')
// The customFetch mutator will prepend env.BACKEND_URL to relative URLs
export default defineConfig({
    akxr: {
        input: {
            target: './openapi.json', // Generated locally from postman
        },
        output: {
            mode: 'tags-split',
            target: './src/api/generated',
            schemas: './src/api/models',
            client: 'react-query',
            httpClient: 'fetch',
            // baseUrl removed - customFetch handles URL resolution using env.BACKEND_URL
            override: {
                mutator: {
                    path: './src/api/custom-fetch.ts',
                    name: 'customFetch',
                },
                query: {
                    useQuery: true,
                    useMutation: true,
                    signal: true,
                },
            },
        },
    },
});