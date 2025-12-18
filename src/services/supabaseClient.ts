import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lnthatrbvoumsjpkdbjm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxudGhhdHJidm91bXNqcGtkYmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODMxNTUsImV4cCI6MjA4MTM1OTE1NX0.AaB0pDje6cXuSQiCDxG1-BamF7yaDQtojw6kcgx6Dz4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
