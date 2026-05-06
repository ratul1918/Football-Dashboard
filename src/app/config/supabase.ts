// Supabase project credentials (public anon key — safe to expose in frontend)
export const SUPABASE_PROJECT_ID = "obldzzvthstaxsntblpq";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ibGR6enZ0aHN0YXhzbnRibHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MTI3MTMsImV4cCI6MjA5MzQ4ODcxM30.KRFzMKz-BWidtYRQv-Gi9gVX9-0yaumS7m7vCPB9Hn0";

export const API_BASE = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-7950e5fa`;
export const API_HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
};
