// Re-export all generated API hooks
export * from './api/generated/admin/admin';
export * from './api/generated/auth/auth';
export * from './api/generated/batch/batch';
export * from './api/generated/batch-request/batch-request';
export * from './api/generated/meeting/meeting';
export * from './api/generated/user/user';

// Re-export all models/types
export * from './api/models';

// Re-export custom fetch for customization
export { customFetch } from './api/custom-fetch';

// Re-export env configuration
export { env } from './lib/env';

// Re-export manually written hooks for endpoints added post-codegen
// Note: getAdminUsers / useGetAdminUsers are intentionally excluded — the
// generated admin module already exports those names. Import directly from
// '@akxr/api/src/api/custom-hooks' if you need the typed variants.
export type {
  BatchStudent,
  GetBatchStudentsResponse,
  MeetingByRoomResponse,
  MeetingTokenResponse,
  Meeting,
  BatchWithStats,
  AttendanceRecord,
  AttendanceWithMeeting,
  MentorBatch,
  AdminDashboard,
  AdminBatch,
  AdminCourse,
  AdminUser,
  GetUserBatches200,
  GetUserBatchesResponse,
  GetUserAttendance200,
  GetUserAttendanceResponse,
  GetMentorBatches200,
  GetMentorBatchesResponse,
  GetAdminDashboard200,
  GetAdminDashboardResponse,
  GetAdminBatches200,
  GetAdminBatchesResponse,
  GetAdminCoursesResponse,
} from './api/custom-hooks';
export {
  getUserBatches, getUserBatchesQueryKey, useGetUserBatches,
  getUserAttendance, getUserAttendanceQueryKey, useGetUserAttendance,
  getMentorBatches, getMentorBatchesQueryKey, useGetMentorBatches,
  getAdminDashboard, getAdminDashboardQueryKey, useGetAdminDashboard,
  getAdminBatches, getAdminBatchesQueryKey, useGetAdminBatches,
  // Explicit re-exports below take precedence over the generated admin module's
  // star export for the same names (TypeScript spec: named > star).
  // The custom versions have simpler response types (no error union) which
  // match the access pattern used throughout the frontend.
  getAdminCourses, getAdminCoursesQueryKey, useGetAdminCourses,
  updateMeetingAttendance, useUpdateMeetingAttendance,
  assignStudentToBatch, useAssignStudentToBatch,
  enrollInBatch, useEnrollInBatch,
  deleteBatch, useDeleteBatch,
  deleteAdminUser, useDeleteAdminUser,
  getBatchStudents, getBatchStudentsQueryKey, useGetBatchStudents,
  getMeetingByRoomId, getMeetingByRoomIdQueryKey, useGetMeetingByRoomId,
  getMeetingToken, getMeetingTokenQueryKey, useGetMeetingToken,
  type AttendanceStatus,
} from './api/custom-hooks';
