
import { supabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export interface StaffProfile {
    id: string;
    full_name: string | null;
    role: 'admin' | 'waiter' | null;
    is_active: boolean;
    phone: string | null;
    created_at: string;
    last_login: string | null;
    email?: string;
}

export class StaffService {
    static async getAllStaff(client: SupabaseClient = supabase): Promise<StaffProfile[]> {
        try {
            const { data, error } = await client
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false }); // Newest first

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

    static async updateStaffStatus(id: string, isActive: boolean, role?: 'admin' | 'waiter', client: SupabaseClient = supabase) {
        try {
            const updates: any = { is_active: isActive };
            if (role) updates.role = role;

            const { data, error } = await client
                .from('profiles')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating staff status:', error);
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
