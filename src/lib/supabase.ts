import { supabase } from "@/integrations/supabase/client";

export { supabase };

// Database types
export interface Database {
    public: {
        Tables: {
            orders: {
                Row: {
                    id: string;
                    order_number: number;
                    items: any; // JSON
                    total_price: number;
                    customer_name: string | null;
                    customer_table: string | null;
                    customer_notes: string | null;
                    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
                    sent_to_admin: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    order_number: number;
                    items: any;
                    total_price: number;
                    customer_name?: string | null;
                    customer_table?: string | null;
                    customer_notes?: string | null;
                    status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
                    sent_to_admin?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    order_number?: number;
                    items?: any;
                    total_price?: number;
                    customer_name?: string | null;
                    customer_table?: string | null;
                    customer_notes?: string | null;
                    status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
                    sent_to_admin?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
}
