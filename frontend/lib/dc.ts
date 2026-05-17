import { DataCollection } from "@akxr-in/data-collection-sdk";
import { env } from "@akxr/api";

let instance: DataCollection | null = null;

function create(studentId: string, courseId?: string): DataCollection {
  return new DataCollection({
    endpoint: env.DC_ENDPOINT,
    studentId,
    courseId,
    flushIntervalMs: 5000,
    debug: env.isDevelopment,
  });
}

/**
 * Initialize (or re-identify) the data-collection singleton with the
 * authenticated user. Called by DcBootstrapper as soon as the user loads,
 * and again by CoursePlayer whenever the active course changes.
 */
export function initDc(studentId: string, courseId?: string): DataCollection {
  if (instance) {
    instance.identify(studentId, courseId);
    return instance;
  }
  instance = create(studentId, courseId);
  return instance;
}

/**
 * Lazy proxy. Any event helper called before `initDc` will trigger
 * construction with an `anonymous` student — this only happens for the
 * brief window before `useGetUser` resolves; identify() upgrades the
 * student id in place once known.
 */
export const dc = new Proxy({} as DataCollection, {
  get(_, prop: string | symbol) {
    if (!instance) instance = create("anonymous");
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(instance) : value;
  },
});
