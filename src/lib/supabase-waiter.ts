import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Waiter-specific client with isolated storage
export const supabaseWaiter = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'sb-waiter-auth',
        persistSession: true,
        autoRefreshToken: true,
    }
});
