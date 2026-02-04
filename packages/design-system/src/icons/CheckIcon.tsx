import React from "react";
import type { IconProps } from "./GithubIcon";

export const CheckIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ size = 20, className, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
