// orval.config.ts
import { defineConfig } from 'orval';
import { BACKEND_API_BASE_URL } from './constants';

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
            baseUrl: BACKEND_API_BASE_URL,
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