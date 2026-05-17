"use client";

import { useEffect, useRef } from "react";
import { useAuthenticatedUser } from "@/lib/auth-hooks";
import { useGetContinueLearning } from "@akxr/api";
import { dc, initDc } from "@/lib/dc";

export function DcBootstrapper() {
  const { data: userRes } = useAuthenticatedUser();
  const { data: continueRes } = useGetContinueLearning();
  const user = userRes?.status === 200 ? userRes.data.data : null;
  const courseId = continueRes?.data?.data?.next?.course_id ?? undefined;

  const startedForUserId = useRef<string | null>(null);
  const lastCourseId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!user) return;

    if (startedForUserId.current !== user.id) {
      initDc(user.id, courseId);
      dc.startSession();
      startedForUserId.current = user.id;
      lastCourseId.current = courseId;
    } else if (courseId !== lastCourseId.current) {
      initDc(user.id, courseId);
      lastCourseId.current = courseId;
    }
  }, [user, courseId]);

  useEffect(() => {
    return () => {
      if (startedForUserId.current) {
        void dc.endSession();
        startedForUserId.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const onBlur = () => dc.focus.loss();
    const onFocus = () => dc.focus.gain();
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return null;
}
