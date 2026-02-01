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
            baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
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