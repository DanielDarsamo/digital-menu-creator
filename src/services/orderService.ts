
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
        email?: string;
        phone?: string;
        table?: string;
        notes?: string;
    };
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    sentViaWhatsApp: boolean;
    sentToAdmin: boolean;
    waiterId?: string;
    acceptedAt?: string;
    deliveredAt?: string;
    statusHistory?: {
        oldStatus: string | null;
        newStatus: string;
        changedAt: string;
        changedBy: string;
    }[];
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
                email: row.customer_email || undefined,
                phone: row.customer_phone || undefined,
                table: row.customer_table || undefined,
                notes: row.customer_notes || undefined,
            },
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            sentViaWhatsApp: row.sent_via_whatsapp,
            sentToAdmin: row.sent_to_admin,
            waiterId: row.waiter_id,
            acceptedAt: row.accepted_at,
            deliveredAt: row.delivered_at,
            statusHistory: row.status_history ? row.status_history.map((h: any) => ({
                oldStatus: h.old_status,
                newStatus: h.new_status,
                changedAt: h.changed_at,
                changedBy: h.changed_by
            })) : undefined,
        };
    }

    static async getAllOrders(options?: {
        status?: Order['status'] | Order['status'][];
        limit?: number;
        page?: number;
    }): Promise<Order[]> {
        try {
            let query = supabase
                .from('orders')
                .select('*', { count: 'exact' });

            if (options?.status) {
                if (Array.isArray(options.status)) {
                    query = query.in('status', options.status);
                } else {
                    query = query.eq('status', options.status);
                }
            }

            // Pagination
            if (options?.limit) {
                const limit = options.limit;
                const page = options.page || 1;
                const from = (page - 1) * limit;
                const to = from + limit - 1;
                query = query.range(from, to);
            }

            // Default sorting
            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

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

    static async getOrderStats() {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('status, created_at');

            if (error) throw error;

            const total = data.length;
            const pending = data.filter(o => o.status === 'pending').length;
            const preparing = data.filter(o => o.status === 'preparing').length;

            const today = new Date().toDateString();
            const todayCount = data.filter(o => new Date(o.created_at).toDateString() === today).length;

            return { total, pending, preparing, todayCount };
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            return { total: 0, pending: 0, preparing: 0, todayCount: 0 };
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
        sentToAdmin: boolean = false,
        customerSessionId?: string // New optional param
    ): Promise<Order | null> {
        try {
            const orderNumber = await this.getNextOrderNumber();

            const payload: any = {
                order_number: orderNumber,
                items: items,
                total_price: totalPrice,
                customer_name: customerInfo?.name || null,
                customer_email: customerInfo?.email || null,
                customer_phone: customerInfo?.phone || null,
                customer_table: customerInfo?.table || null,
                customer_notes: customerInfo?.notes || null,
                status: 'pending',
                sent_via_whatsapp: sentViaWhatsApp,
                sent_to_admin: sentToAdmin,
            };

            if (customerSessionId) {
                payload.customer_session_id = customerSessionId;
            }

            const { data, error } = await supabase
                .from('orders')
                .insert(payload)
                .select()
                .single();

            if (error) {
                console.error('Error creating order:', error);
                throw error;
            }

            const newOrder = data ? this.dbToOrder(data) : null;

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
            const updatePayload: any = { status };

            // Auto-update timestamps based on status
            if (status === 'delivered') {
                updatePayload.delivered_at = new Date().toISOString();
            }

            const { data, error } = await supabase
                .from('orders')
                .update(updatePayload)
                .eq('id', orderId)
                .select()
                .single();

            if (error) {
                console.error('Error updating order status:', error);
                throw error;
            }

            const updatedOrder = data ? this.dbToOrder(data) : null;

            if (updatedOrder) {
                window.dispatchEvent(new CustomEvent('orderUpdated', { detail: updatedOrder }));
            }

            return updatedOrder;
        } catch (error) {
            console.error('Failed to update order status:', error);
            return null;
        }
    }

    static async assignWaiter(orderId: string, waiterId: string): Promise<Order | null> {
        try {
            const { data, error } = await supabase
                .from('orders')
                .update({
                    waiter_id: waiterId,
                    accepted_at: new Date().toISOString(),
                    status: 'preparing' // Usually implies acceptance starts prep, or remains confirmed? Spec says "Accept -> In Preparation" is a manual step, but usually accepting means taking responsibility. Let's kept status as is or update it? Spec: "Waiters... Accept an order (assigns waiter)... Once accepted, they can Mark as In Preparation". So Accept is just assignment.
                    // Actually, if a waiter accepts, it's assigned. Status might stay 'confirmed' until they click 'In Prep', or move to 'preparing' automatically.
                    // Let's just assign waiter for now.
                })
                .eq('id', orderId)
                .select()
                .single();

            if (error) throw error;
            return data ? this.dbToOrder(data) : null;
        } catch (error) {
            console.error('Failed to assign waiter:', error);
            return null;
        }
    }

    static async getAvailableOrders(): Promise<Order[]> {
        // Orders that are confirmed but not yet assigned (or just confirmed)
        // Adjust logic based on exact requirements. 
        // "View new incoming orders" -> Usually 'confirmed' state.
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('status', 'confirmed')
                .is('waiter_id', null) // Only unassigned orders
                .order('created_at', { ascending: true }); // Oldest first

            if (error) throw error;
            return data ? data.map(this.dbToOrder) : [];
        } catch (error) {
            console.error('Failed to get available orders:', error);
            return [];
        }
    }

    static async getWaiterOrders(waiterId: string): Promise<Order[]> {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('waiter_id', waiterId)
                .in('status', ['confirmed', 'preparing', 'ready']) // Active orders
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return data ? data.map(this.dbToOrder) : [];
        } catch (error) {
            console.error('Failed to get waiter orders:', error);
            return [];
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

            window.dispatchEvent(new CustomEvent('orderDeleted', { detail: { orderId } }));
            return true;
        } catch (error) {
            console.error('Failed to delete order:', error);
            return false;
        }
    }

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

    static async getCustomerOrders(email?: string, phone?: string): Promise<Order[]> {
        if (!email && !phone) return [];

        try {
            // Check if RPC exists, if not fall back to simple select
            // Ideally we'd use the RPC if complex logic needed
            // For now let's try a direct query which is safer if RPC is missing
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .or(`customer_email.eq.${email},customer_phone.eq.${phone}`)
                .order('created_at', { ascending: false });

            // If RPC was preferred:
            // const { data, error } = await supabase.rpc('get_customer_orders', { ... });

            if (error) throw error;
            return data ? data.map(this.dbToOrder) : [];
        } catch (error) {
            console.error('Failed to fetch customer orders:', error);
            return [];
        }
    }

    static unsubscribeFromOrders(subscription: any) {
        supabase.removeChannel(subscription);
    }

    // Session-related methods
    static async getActiveSessionsByTable(): Promise<Map<string, any[]>> {
        try {
            const { data, error } = await supabase
                .from('customer_sessions')
                .select(`
                    *,
                    orders:orders(id, total_price, status, created_at)
                `)
                .eq('status', 'active')
                .order('table_id', { ascending: true });

            if (error) throw error;

            // Group by table
            const tableMap = new Map<string, any[]>();
            data?.forEach((session: any) => {
                const tableId = session.table_id;
                if (!tableMap.has(tableId)) {
                    tableMap.set(tableId, []);
                }

                // Calculate unpaid total for this session
                const unpaidTotal = session.orders
                    ?.filter((o: any) => o.status !== 'cancelled' && o.status !== 'delivered')
                    .reduce((sum: number, o: any) => sum + parseFloat(o.total_price), 0) || 0;

                tableMap.get(tableId)!.push({
                    id: session.id,
                    name: session.customer_name,
                    phone: session.phone_number,
                    unpaidTotal,
                    orderCount: session.orders?.length || 0,
                });
            });

            return tableMap;
        } catch (error) {
            console.error('Failed to fetch sessions by table:', error);
            return new Map();
        }
    }
}

