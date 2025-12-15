import { supabase } from '@/lib/supabase';

export interface Order {
    id: string;
    orderNumber: number;
    items: {
        id: string;
        name: string;
        quantity: number;
        price: number | string;
        category: string;
    }[];
    totalPrice: number;
    customerInfo?: {
        name?: string;
        table?: string;
        notes?: string;
    };
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    sentViaWhatsApp: boolean;
    sentToAdmin: boolean;
}

export class OrderService {
    // Convert database row to Order object
    private static dbToOrder(row: any): Order {
        return {
            id: row.id,
            orderNumber: row.order_number,
            items: row.items,
            totalPrice: parseFloat(row.total_price),
            customerInfo: {
                name: row.customer_name || undefined,
                table: row.customer_table || undefined,
                notes: row.customer_notes || undefined,
            },
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            sentViaWhatsApp: row.sent_via_whatsapp,
            sentToAdmin: row.sent_to_admin,
        };
    }

    static async getAllOrders(): Promise<Order[]> {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching orders:', error);
                throw error;
            }

            return data ? data.map(this.dbToOrder) : [];
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            return [];
        }
    }

    static async getOrderById(id: string): Promise<Order | null> {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching order:', error);
                return null;
            }

            return data ? this.dbToOrder(data) : null;
        } catch (error) {
            console.error('Failed to fetch order:', error);
            return null;
        }
    }

    static async getNextOrderNumber(): Promise<number> {
        try {
            const { data, error } = await supabase.rpc('get_next_order_number');

            if (error) {
                console.error('Error getting next order number:', error);
                // Fallback: get max order number and add 1
                const { data: orders } = await supabase
                    .from('orders')
                    .select('order_number')
                    .order('order_number', { ascending: false })
                    .limit(1);

                return orders && orders.length > 0 ? orders[0].order_number + 1 : 1;
            }

            return data || 1;
        } catch (error) {
            console.error('Failed to get next order number:', error);
            return 1;
        }
    }

    static async createOrder(
        items: Order['items'],
        totalPrice: number,
        customerInfo?: Order['customerInfo'],
        sentViaWhatsApp: boolean = false,
        sentToAdmin: boolean = false
    ): Promise<Order | null> {
        try {
            const orderNumber = await this.getNextOrderNumber();

            const { data, error } = await supabase
                .from('orders')
                .insert({
                    order_number: orderNumber,
                    items: items,
                    total_price: totalPrice,
                    customer_name: customerInfo?.name || null,
                    customer_table: customerInfo?.table || null,
                    customer_notes: customerInfo?.notes || null,
                    status: 'pending',
                    sent_via_whatsapp: sentViaWhatsApp,
                    sent_to_admin: sentToAdmin,
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating order:', error);
                throw error;
            }

            const newOrder = data ? this.dbToOrder(data) : null;

            // Dispatch custom event for real-time updates
            if (newOrder) {
                window.dispatchEvent(new CustomEvent('orderCreated', { detail: newOrder }));
            }

            return newOrder;
        } catch (error) {
            console.error('Failed to create order:', error);
            return null;
        }
    }

    static async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
        try {
            const { data, error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId)
                .select()
                .single();

            if (error) {
                console.error('Error updating order status:', error);
                throw error;
            }

            const updatedOrder = data ? this.dbToOrder(data) : null;

            // Dispatch custom event for real-time updates
            if (updatedOrder) {
                window.dispatchEvent(new CustomEvent('orderUpdated', { detail: updatedOrder }));
            }

            return updatedOrder;
        } catch (error) {
            console.error('Failed to update order status:', error);
            return null;
        }
    }

    static async deleteOrder(orderId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) {
                console.error('Error deleting order:', error);
                throw error;
            }

            // Dispatch custom event for real-time updates
            window.dispatchEvent(new CustomEvent('orderDeleted', { detail: { orderId } }));

            return true;
        } catch (error) {
            console.error('Failed to delete order:', error);
            return false;
        }
    }

    static async getPendingOrders(): Promise<Order[]> {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .in('status', ['pending', 'confirmed', 'preparing'])
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching pending orders:', error);
                throw error;
            }

            return data ? data.map(this.dbToOrder) : [];
        } catch (error) {
            console.error('Failed to fetch pending orders:', error);
            return [];
        }
    }

    static async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('status', status)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching orders by status:', error);
                throw error;
            }

            return data ? data.map(this.dbToOrder) : [];
        } catch (error) {
            console.error('Failed to fetch orders by status:', error);
            return [];
        }
    }

    // Subscribe to real-time order changes
    static subscribeToOrders(callback: (payload: any) => void) {
        const subscription = supabase
            .channel('orders-channel')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                },
                callback
            )
            .subscribe();

        return subscription;
    }

    // Unsubscribe from real-time updates
    static unsubscribeFromOrders(subscription: any) {
        supabase.removeChannel(subscription);
    }
}
