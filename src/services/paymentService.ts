
import { supabase } from "@/lib/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

export interface DBPayment {
    id: string;
    customer_session_id: string;
    order_id: string | null;
    amount: number;
    payment_method: 'cash' | 'card' | 'mpesa';
    status: 'pending' | 'confirmed';
    created_at: string;
    confirmed_at: string | null;
    confirmed_by_waiter: string | null;
}

export class PaymentService {
    static async confirmPayment(
        sessionId: string,
        amount: number,
        method: 'cash' | 'card' | 'mpesa',
        waiterId: string,
        client: SupabaseClient = supabase
    ) {
        try {
            const { data, error } = await client
                .from('payments')
                .insert({
                    customer_session_id: sessionId,
                    amount,
                    payment_method: method,
                    status: 'confirmed',
                    confirmed_at: new Date().toISOString(),
                    confirmed_by_waiter: waiterId
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to confirm payment:', error);
            throw error;
        }
    }

    static async getPaymentsBySession(sessionId: string, client: SupabaseClient = supabase): Promise<DBPayment[]> {
        const { data, error } = await client
            .from('payments')
            .select('*')
            .eq('customer_session_id', sessionId);

        if (error) throw error;
        return data || [];
    }
}
