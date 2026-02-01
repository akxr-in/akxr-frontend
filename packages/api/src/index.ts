// Re-export all generated API hooks
export * from './api/generated/admin/admin';
export * from './api/generated/auth/auth';
export * from './api/generated/batch/batch';
export * from './api/generated/meeting/meeting';
export * from './api/generated/user/user';

// Re-export all models/types
export * from './api/models';

// Re-export custom fetch for customization
export { customFetch } from './api/custom-fetch';
