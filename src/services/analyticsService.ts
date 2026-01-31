
import { supabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export interface ItemPerformance {
    item_id: string;
    item_name: string;
    total_quantity: number;
    total_revenue: number;
    order_count: number;
}

export class AnalyticsService {
    static async getItemPerformance(limit: number = 5, client: SupabaseClient = supabase): Promise<ItemPerformance[]> {
        try {
            const { data, error } = await client
                .from('item_performance')
                .select('*')
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching item performance:', error);
            return [];
        }
    }

    static async getOrderHistoryStats(days: number = 7, client: SupabaseClient = supabase) {
        try {
            // Simplified daily revenue fetch
            // In a real app we'd use a more complex grouping query
            const { data, error } = await client
                .from('orders')
                .select('total_price, delivered_at, status')
                .eq('status', 'delivered')
                .is('delivered_at', 'not.null');

            if (error) throw error;

            // Group by date in JS for simplicity in this MVP
            const revenueByDate: Record<string, number> = {};
            data?.forEach(order => {
                const date = new Date(order.delivered_at).toLocaleDateString();
                revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(order.total_price);
            });

            return revenueByDate;
        } catch (error) {
            console.error('Error fetching history stats:', error);
            return {};
        }
    }
}
