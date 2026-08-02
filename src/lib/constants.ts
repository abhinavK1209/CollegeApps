/**
 * Authentication is deferred, so the app runs as one fixed user. Every service
 * still takes a `userId` and scopes its queries, so adding real auth later means
 * replacing this constant with a session lookup — no schema or service changes.
 */
export const LOCAL_USER_ID = "local-user";
export const LOCAL_USER_EMAIL = "you@sequence.local";

/** Entering-class year. 2027 = applying during 2026-27, entering fall 2027. */
export const CURRENT_CYCLE_YEAR = 2027;

export const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
] as const;
