export const STORAGE_KEYS = {
  EMPLOYEES: "els_employees",
  LEAVE_REQUESTS: "els_leave_requests",
  AUTH_SESSION: "els_auth_session",
} as const;

export const DEFAULT_ANNUAL_LEAVE_DAYS = 12;

export const DEPARTMENTS = [
  "Engineering",
  "Human Resources",
  "Finance",
  "Marketing",
  "Operations",
] as const;

export const POSITIONS = [
  "Manager",
  "Senior Staff",
  "Junior Staff",
  "Intern",
  "Director",
  "Team Lead",
] as const;
