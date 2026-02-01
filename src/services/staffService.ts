
import { supabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export interface StaffProfile {
    id: string;
    full_name: string | null;
    role: 'admin' | 'waiter';
    created_at: string;
    last_login: string | null;
    email?: string; // Opted from auth join if possible, or just profile
}

export class StaffService {
    static async getAllStaff(client: SupabaseClient = supabase): Promise<StaffProfile[]> {
        try {
            // Note: Since we are querying public.profiles, we get what's there.
            // If we want emails, we'd need to join with auth.users (which is restricted) 
            // or have a trigger sync emails to profiles.
            // For now, let's fetch profiles.
            const { data, error } = await client
                .from('profiles')
                .select('*')
                .order('role', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching staff:', error);
            return [];
        }
    }

    static async updateStaffRole(id: string, role: 'admin' | 'waiter', client: SupabaseClient = supabase) {
        try {
            const { data, error } = await client
                .from('profiles')
                .update({ role })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating staff role:', error);
            throw error;
        }
    }

    static async deleteStaff(id: string, client: SupabaseClient = supabase) {
        try {
            // This only deletes the profile. Deleting the actual Auth user requires Service Role.
            // We'll just delete the profile for now to revoke dashboard access.
            const { error } = await client
                .from('profiles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting staff profile:', error);
            return false;
        }
    }
}
