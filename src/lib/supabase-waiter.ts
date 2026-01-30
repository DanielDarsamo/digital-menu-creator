
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://roscelplipkkitiafqcq.supabase.co';
const supabaseAnonKey = 'sb_publishable_l0LexwB9FlSiFUfl330SzA_6h7K2AH9';

// Waiter-specific client with isolated storage
export const supabaseWaiter = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'sb-waiter-auth',
        persistSession: true,
        autoRefreshToken: true,
    }
});
