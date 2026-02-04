// orval.config.ts
import { defineConfig } from 'orval';

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
            baseUrl: 'https://api-staging.akxr.in',
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