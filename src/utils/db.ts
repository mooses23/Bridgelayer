// Legacy compatibility - use the new client instead
import { createClient } from './supabase/client';

const supabase = createClient();

export default supabase;
