/**
 * Custom hooks for endpoints added after initial orval codegen.
 * Follows the same customFetch + React Query pattern as generated hooks.
 */
import { useQuery, useMutation } from '@tanstack/react-query'
import type { UseQueryOptions, UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import { customFetch } from './custom-fetch'

// ── shared types ──────────────────────────────────────────────────────────────

export interface Meeting {
  id: string
  batch_id: string
  title: string
  description: string | null
  scheduled_start_time: string
  scheduled_end_time: string
  created_by: string
  created_at: string
  updated_at: string
  realtime_kit_room_id?: string
}

export interface BatchWithStats {
  id: string
  batch_name: string
  batch_code: string
  total_classes: number
  mentor_ids: string[]
  mentor_names: string[]
  batch_start_date: string
  batch_end_date: string | null
  estimated_end_date: string | null
  course_ids: string[]
  current_course_id: string | null
  description: string
  meetings: Meeting[]
  meetings_count: number
  completed_meetings_count: number
  student_count: number
  created_at: string
  updated_at: string
}

export interface AttendanceRecord {
  id: string
  user_id: string
  meeting_summary_id: string
  batch_id: string
  status: 'PRESENT' | 'PARTIALLY_PRESENT' | 'ABSENT'
  first_joined_at: string | null
  last_left_at: string | null
  total_time_in_meeting_seconds: number
  created_at: string
}

export interface AttendanceWithMeeting {
  attendance: AttendanceRecord
  meeting: Meeting | null
}

export interface MentorBatch {
  id: string
  batch_name: string
  batch_code: string
  total_classes: number
  mentor_ids: string[]
  batch_start_date: string
  batch_end_date: string | null
  estimated_end_date: string | null
  course_ids: string[]
  current_course_id: string | null
  description: string
  student_count: number
  meetings_count: number
  completed_meetings_count: number
  avg_attendance_pct: number
  created_at: string
  updated_at: string
}

export interface AdminDashboard {
  total_students: number
  total_mentors: number
  total_courses: number
  total_batches: number
  total_active_batches: number
}

// ── GET /user/batches ─────────────────────────────────────────────────────────

export interface GetUserBatches200 {
  data: BatchWithStats[]
  message: string
}

export type GetUserBatchesResponse = { data: GetUserBatches200; status: 200; headers: Headers }

export const getUserBatches = (): Promise<GetUserBatchesResponse> =>
  customFetch<GetUserBatchesResponse>(`/user/batches`, { method: 'GET' })

export const getUserBatchesQueryKey = () => ['getUserBatches'] as const

export function useGetUserBatches<TData = GetUserBatchesResponse, TError = unknown>(
  options?: UseQueryOptions<GetUserBatchesResponse, TError, TData>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: getUserBatchesQueryKey(),
    queryFn: getUserBatches,
    ...options,
  })
}

// ── GET /user/attendance ──────────────────────────────────────────────────────

export interface GetUserAttendance200 {
  data: AttendanceWithMeeting[]
  message: string
}

export type GetUserAttendanceResponse = { data: GetUserAttendance200; status: 200; headers: Headers }

export const getUserAttendance = (): Promise<GetUserAttendanceResponse> =>
  customFetch<GetUserAttendanceResponse>(`/user/attendance`, { method: 'GET' })

export const getUserAttendanceQueryKey = () => ['getUserAttendance'] as const

export function useGetUserAttendance<TData = GetUserAttendanceResponse, TError = unknown>(
  options?: UseQueryOptions<GetUserAttendanceResponse, TError, TData>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: getUserAttendanceQueryKey(),
    queryFn: getUserAttendance,
    ...options,
  })
}

// ── GET /batch/mentor ─────────────────────────────────────────────────────────

export interface GetMentorBatches200 {
  data: MentorBatch[]
  message: string
}

export type GetMentorBatchesResponse = { data: GetMentorBatches200; status: 200; headers: Headers }

export const getMentorBatches = (): Promise<GetMentorBatchesResponse> =>
  customFetch<GetMentorBatchesResponse>(`/batch/mentor`, { method: 'GET' })

export const getMentorBatchesQueryKey = () => ['getMentorBatches'] as const

export function useGetMentorBatches<TData = GetMentorBatchesResponse, TError = unknown>(
  options?: UseQueryOptions<GetMentorBatchesResponse, TError, TData>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: getMentorBatchesQueryKey(),
    queryFn: getMentorBatches,
    ...options,
  })
}

// ── GET /admin/dashboard ──────────────────────────────────────────────────────

export interface GetAdminDashboard200 {
  data: AdminDashboard
  message: string
}

export type GetAdminDashboardResponse = { data: GetAdminDashboard200; status: 200; headers: Headers }

export const getAdminDashboard = (): Promise<GetAdminDashboardResponse> =>
  customFetch<GetAdminDashboardResponse>(`/admin/dashboard`, { method: 'GET' })

export const getAdminDashboardQueryKey = () => ['getAdminDashboard'] as const

export function useGetAdminDashboard<TData = GetAdminDashboardResponse, TError = unknown>(
  options?: UseQueryOptions<GetAdminDashboardResponse, TError, TData>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: getAdminDashboardQueryKey(),
    queryFn: getAdminDashboard,
    ...options,
  })
}

// ── GET /batch (all) — typed alias ───────────────────────────────────────────

export interface AdminBatch {
  id: string
  batch_name: string
  batch_code: string
  total_classes: number
  mentor_ids: string[]
  batch_start_date: string
  batch_end_date: string
  estimated_end_date: string
  course_ids: string[]
  current_course_id: string | null
  description: string
  created_at: string
  updated_at: string
}

export interface AdminCourse {
  id: string
  name: string
  description: string
  time_allotted_in_weeks: number
  lesson_ids: string[]
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  username: string
  full_name: string
  email: string
  role: 'STUDENT' | 'MENTOR' | 'ADMIN'
  profile_status: string
  batch_ids: string[]
  created_at: string
}

export interface GetAdminBatches200 { data: AdminBatch[]; message: string }
export type GetAdminBatchesResponse = { data: GetAdminBatches200; status: 200; headers: Headers }

export const getAdminBatches = (): Promise<GetAdminBatchesResponse> =>
  customFetch<GetAdminBatchesResponse>(`/batch`, { method: 'GET' })

export const getAdminBatchesQueryKey = () => ['getAdminBatches'] as const

export function useGetAdminBatches<TData = GetAdminBatchesResponse, TError = unknown>(
  options?: UseQueryOptions<GetAdminBatchesResponse, TError, TData>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: getAdminBatchesQueryKey(),
    queryFn: getAdminBatches,
    ...options,
  })
}

export interface GetAdminCoursesResponse { data: { data: AdminCourse[]; message: string }; status: 200; headers: Headers }
export const getAdminCourses = (): Promise<GetAdminCoursesResponse> =>
  customFetch<GetAdminCoursesResponse>(`/admin/courses`, { method: 'GET' })

// Returns the same key as the generated getGetAdminCoursesQueryKey so both
// the custom hook and the generated one share a cache entry.
export const getAdminCoursesQueryKey = () => ['/admin/courses'] as const

export function useGetAdminCourses<TData = GetAdminCoursesResponse, TError = unknown>(
  options?: UseQueryOptions<GetAdminCoursesResponse, TError, TData>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: getAdminCoursesQueryKey(),
    queryFn: getAdminCourses,
    ...options,
  })
}

export interface GetAdminUsersResponse { data: { data: AdminUser[]; message: string }; status: 200; headers: Headers }
export const getAdminUsers = (): Promise<GetAdminUsersResponse> =>
  customFetch<GetAdminUsersResponse>(`/admin/users`, { method: 'GET' })

export const getAdminUsersQueryKey = () => ['getAdminUsers'] as const

export function useGetAdminUsers<TData = GetAdminUsersResponse, TError = unknown>(
  options?: UseQueryOptions<GetAdminUsersResponse, TError, TData>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: getAdminUsersQueryKey(),
    queryFn: getAdminUsers,
    ...options,
  })
}

// ── GET /meeting/room/:roomId ──────────────────────────────────────────────────

export interface MeetingByRoomResponse {
  data: {
    data: {
      id: string
      title: string
      description: string | null
      batch_id: string
      realtime_kit_room_id: string
      meeting_url: string
      scheduled_start_time: string
      scheduled_end_time: string
      created_by: string
    }
    message: string
  }
  status: 200
  headers: Headers
}

export const getMeetingByRoomId = (roomId: string): Promise<MeetingByRoomResponse> =>
  customFetch<MeetingByRoomResponse>(`/meeting/room/${roomId}`, { method: 'GET' })

export const getMeetingByRoomIdQueryKey = (roomId: string) => ['getMeetingByRoomId', roomId] as const

export function useGetMeetingByRoomId<TData = MeetingByRoomResponse, TError = unknown>(
  roomId: string,
  options?: UseQueryOptions<MeetingByRoomResponse, TError, TData>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: getMeetingByRoomIdQueryKey(roomId),
    queryFn: () => getMeetingByRoomId(roomId),
    enabled: !!roomId,
    ...options,
  })
}

// ── GET /meeting/:id/token ─────────────────────────────────────────────────────

export interface MeetingTokenResponse {
  data: {
    data: {
      authToken: string
      meetingId: string
      realtime_kit_room_id: string
      meeting_url: string
    }
    message: string
  }
  status: 200
  headers: Headers
}

export const getMeetingToken = (meetingId: string): Promise<MeetingTokenResponse> =>
  customFetch<MeetingTokenResponse>(`/meeting/${meetingId}/token`, { method: 'GET' })

export const getMeetingTokenQueryKey = (meetingId: string) => ['getMeetingToken', meetingId] as const

export function useGetMeetingToken<TData = MeetingTokenResponse, TError = unknown>(
  meetingId: string,
  options?: UseQueryOptions<MeetingTokenResponse, TError, TData>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: getMeetingTokenQueryKey(meetingId),
    queryFn: () => getMeetingToken(meetingId),
    enabled: !!meetingId,
    staleTime: 1000 * 60 * 50, // tokens valid ~1hr, refetch before expiry
    ...options,
  })
}

// ── GET /batch/:id/students ───────────────────────────────────────────────────

export interface BatchStudent {
  id: string
  username: string
  full_name: string
  email: string
  role: 'STUDENT' | 'MENTOR' | 'ADMIN'
  profile_status: string
  batch_ids: string[]
  created_at: string
}

export interface GetBatchStudentsResponse { data: { data: BatchStudent[]; message: string }; status: 200; headers: Headers }

export const getBatchStudents = (batchId: string): Promise<GetBatchStudentsResponse> =>
  customFetch<GetBatchStudentsResponse>(`/batch/${batchId}/students`, { method: 'GET' })

export const getBatchStudentsQueryKey = (batchId: string) => ['getBatchStudents', batchId] as const

export function useGetBatchStudents<TData = GetBatchStudentsResponse, TError = unknown>(
  batchId: string,
  options?: Omit<UseQueryOptions<GetBatchStudentsResponse, TError, TData>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey: getBatchStudentsQueryKey(batchId),
    queryFn: () => getBatchStudents(batchId),
    enabled: !!batchId,
    ...options,
  })
}

// ── DELETE /admin/users/:userId ──────────────────────────────────────────────

export const deleteAdminUser = (userId: string): Promise<void> =>
  customFetch<void>(`/admin/users/${userId}`, { method: 'DELETE' })

export const useDeleteAdminUser = (): UseMutationResult<void, Error, string> =>
  useMutation({ mutationFn: (userId: string) => deleteAdminUser(userId) })

// ── DELETE /admin/courses/:courseId ──────────────────────────────────────────

export const deleteAdminCourse = (courseId: string): Promise<void> =>
  customFetch<void>(`/admin/courses/${courseId}`, { method: 'DELETE' })

export const useDeleteAdminCourse = (): UseMutationResult<void, Error, string> =>
  useMutation({ mutationFn: (courseId: string) => deleteAdminCourse(courseId) })

// ── DELETE /batch/:id ─────────────────────────────────────────────────────────

export const deleteBatch = (id: string): Promise<void> =>
  customFetch<void>(`/batch/${id}`, { method: 'DELETE' })

export const useDeleteBatch = (): UseMutationResult<void, Error, string> =>
  useMutation({ mutationFn: (id: string) => deleteBatch(id) })

// ── Assign student to batch ──────────────────────────────────────────────────

export const assignStudentToBatch = (userId: string, batchId: string): Promise<void> =>
  customFetch<void>(`/admin/users/${userId}/assign-batch`, {
    method: 'POST',
    body: JSON.stringify({ batch_id: batchId }),
  })

export const useAssignStudentToBatch = (): UseMutationResult<
  void,
  Error,
  { userId: string; batchId: string }
> =>
  useMutation({
    mutationFn: ({ userId, batchId }) => assignStudentToBatch(userId, batchId),
  })

// ── Admin: batch-request approval ─────────────────────────────────────────────

export type BatchRequestStatus = 'pending' | 'approved' | 'rejected'

export interface AdminBatchRequest {
  id: string
  batch_code: string
  mentor_id: string
  change_type: string
  proposed_value?: string | null
  reason: string
  status: BatchRequestStatus
  created_at: string
  updated_at: string
}

export const getAllBatchRequests = (): Promise<{
  data: { data: AdminBatchRequest[]; message: string }
  status: number
  headers: Headers
}> =>
  customFetch(`/batch-requests`, { method: 'GET' })

export const getGetAllBatchRequestsQueryKey = () => ['getAllBatchRequests'] as const

export const useGetAllBatchRequests = (
  options?: { query?: Partial<UseQueryOptions<Awaited<ReturnType<typeof getAllBatchRequests>>, Error>> }
) =>
  useQuery({
    queryKey: getGetAllBatchRequestsQueryKey(),
    queryFn: getAllBatchRequests,
    ...options?.query,
  })

export const updateBatchRequestStatus = (
  id: string,
  status: 'approved' | 'rejected'
): Promise<void> =>
  customFetch<void>(`/batch-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const useUpdateBatchRequestStatus = (): UseMutationResult<
  void,
  Error,
  { id: string; status: 'approved' | 'rejected' }
> =>
  useMutation({
    mutationFn: ({ id, status }) => updateBatchRequestStatus(id, status),
  })

// ── Self-enroll in a batch (student) ──────────────────────────────────────────

export const enrollInBatch = (batchId: string): Promise<void> =>
  customFetch<void>(`/user/batches/${batchId}/enroll`, {
    method: 'POST',
  })

export const useEnrollInBatch = (): UseMutationResult<void, Error, string> =>
  useMutation({
    mutationFn: (batchId: string) => enrollInBatch(batchId),
  })

// ── Attendance override ───────────────────────────────────────────────────────

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'PARTIALLY_PRESENT'

export const updateMeetingAttendance = (
  meetingId: string,
  userId: string,
  status: AttendanceStatus
): Promise<void> =>
  customFetch<void>(`/meeting/${meetingId}/attendance/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const useUpdateMeetingAttendance = (): UseMutationResult<
  void,
  Error,
  { meetingId: string; userId: string; status: AttendanceStatus }
> =>
  useMutation({
    mutationFn: ({ meetingId, userId, status }) =>
      updateMeetingAttendance(meetingId, userId, status),
  })
