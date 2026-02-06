import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
<<<<<<< HEAD
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}
=======
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
>>>>>>> refs/remotes/origin/main

// Waiter-specific client with isolated storage
export const supabaseWaiter = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'sb-waiter-auth',
        persistSession: true,
        autoRefreshToken: true,
    }
});
