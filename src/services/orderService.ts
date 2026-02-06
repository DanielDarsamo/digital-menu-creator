import { supabase } from '@/lib/supabase';
import { SupabaseClient } from "@supabase/supabase-js";

// Actor context for order operations
export interface ActorContext {
    role: 'admin' | 'waiter' | 'chef';
    name: string;
    userId: string;
}

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
    status: 'draft' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    paymentType?: 'cash' | 'card' | 'mobile';
    createdAt: string;
    updatedAt: string;
    sentToAdmin: boolean;
    acceptedBy?: string;
    acceptedByRole?: 'admin' | 'waiter' | 'chef';
    acceptedByName?: string;
    acceptedAt?: string;
    deliveredAt?: string;
    lastUpdatedByRole?: 'admin' | 'waiter' | 'chef';
    lastUpdatedByName?: string;
    statusHistory?: {
        oldStatus: string | null;
        newStatus: string;
        changedAt: string;
        changedBy: string;
    }[];
    rejectionReason?: string;
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
            rejectionReason: row.rejection_reason || undefined,
            status: row.status,
            paymentType: row.payment_type || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            sentToAdmin: row.sent_to_admin,
            acceptedBy: row.accepted_by || row.waiter_id, // Support both column names during migration
            acceptedByRole: row.accepted_by_role || undefined,
            acceptedByName: row.accepted_by_name || undefined,
            acceptedAt: row.accepted_at,
            deliveredAt: row.delivered_at,
            lastUpdatedByRole: row.last_updated_by_role || undefined,
            lastUpdatedByName: row.last_updated_by_name || undefined,
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
    }, client: SupabaseClient = supabase): Promise<Order[]> {
        try {
            let query = client
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

    static async getOrderStats(client: SupabaseClient = supabase) {
        try {
            const { data, error } = await client
                .from('orders')
                .select('status, created_at, delivered_at');

            if (error) throw error;

            const total = data.length;
            const pending = data.filter(o => o.status === 'pending').length;
            const preparing = data.filter(o => o.status === 'preparing').length;

            const today = new Date().toDateString();
            const todayCount = data.filter(o =>
                o.status === 'delivered' &&
                o.delivered_at &&
                new Date(o.delivered_at).toDateString() === today
            ).length;

            return { total, pending, preparing, todayCount };
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            return { total: 0, pending: 0, preparing: 0, todayCount: 0 };
        }
    }

    static async getOrderById(id: string, client: SupabaseClient = supabase): Promise<Order | null> {
        try {
            const { data, error } = await client
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

    static async getNextOrderNumber(client: SupabaseClient = supabase): Promise<number> {
        try {
            const { data, error } = await client.rpc('get_next_order_number');

            if (error) {
                console.error('Error getting next order number:', error);
                // Fallback: get max order number and add 1
                const { data: orders } = await client
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
        sentToAdmin: boolean = false,
        customerSessionId?: string, // New optional param
        client: SupabaseClient = supabase
    ): Promise<Order | null> {
        try {
            const orderNumber = await this.getNextOrderNumber(client);

            const payload: any = {
                order_number: orderNumber,
                items: items,
                total_price: totalPrice,
                customer_name: customerInfo?.name || null,
                customer_table: customerInfo?.table || null,
                customer_notes: customerInfo?.notes || null,
                status: 'pending',
                sent_to_admin: sentToAdmin,
            };

            if (customerSessionId) {
                payload.customer_session_id = customerSessionId;
            }

            const { data, error } = await client
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

    static async updateOrderStatus(
        orderId: string,
        status: Order['status'],
        actor: ActorContext,
        client: SupabaseClient = supabase
    ): Promise<Order | null> {
        try {
            // Audit logic: Fetch current order status
            const { data: currentOrder } = await client
                .from('orders')
                .select('status, status_history')
                .eq('id', orderId)
                .single();

            const oldStatus = currentOrder?.status || null;
            const history = currentOrder?.status_history || [];

            // Skip update if status hasn't changed
            if (oldStatus === status) {
                return this.getOrderById(orderId, client);
            }

            const newHistoryItem = {
                oldStatus,
                newStatus: status,
                changedAt: new Date().toISOString(),
                changedBy: actor.name,
                changedByRole: actor.role,
                changedById: actor.userId
            };

            const updatedHistory = [...history, newHistoryItem];

            const updatePayload: any = {
                status,
                status_history: updatedHistory,
                last_updated_by_role: actor.role,
                last_updated_by_name: actor.name
            };

            // Auto-update timestamps based on status
            if (status === 'delivered') {
                updatePayload.delivered_at = new Date().toISOString();
            }

            const { data, error } = await client
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
            // Re-throw database constraint errors with user-friendly messages
            if (error instanceof Error) {
                if (error.message.includes('Invalid status transition')) {
                    throw new Error('Invalid status transition. Please follow the correct order flow.');
                }
                if (error.message.includes('Payment type is required')) {
                    throw new Error('Payment type must be selected before marking as delivered');
                }
            }
            throw error;
        }
    }

    // Status transition validation (client-side)
    private static ALLOWED_TRANSITIONS: Record<Order['status'], Order['status'][]> = {
        draft: ['pending'],
        pending: ['confirmed', 'cancelled'], // Allow cancel for pending if needed by logic
        confirmed: ['preparing', 'cancelled'],
        preparing: ['ready', 'cancelled'],
        ready: ['delivered'],
        delivered: [],
        cancelled: []
    };

    static validateStatusTransition(oldStatus: Order['status'], newStatus: Order['status']): boolean {
        return this.ALLOWED_TRANSITIONS[oldStatus]?.includes(newStatus) || oldStatus === newStatus;
    }

    static async acceptOrder(orderId: string, actor: ActorContext, client: SupabaseClient = supabase): Promise<Order | null> {
        try {
            const { data, error } = await client
                .from('orders')
                .update({
                    accepted_by: actor.userId,
                    accepted_by_role: actor.role,
                    accepted_by_name: actor.name,
                    accepted_at: new Date().toISOString(),
                    last_updated_by_role: actor.role,
                    last_updated_by_name: actor.name,
                    status: 'confirmed' // Transition from pending to confirmed
                })
                .eq('id', orderId)
                .eq('status', 'pending') // Only accept pending orders
                .is('accepted_by', null) // Only if not already accepted
                .select()
                .single();

            if (error) throw error;
            return data ? this.dbToOrder(data) : null;
        } catch (error) {
            console.error('Failed to accept order:', error);
            throw error;
        }
    }

    // Legacy method for backward compatibility
    static async assignWaiter(orderId: string, waiterId: string, client: SupabaseClient = supabase): Promise<Order | null> {
        // Use a default actor context for legacy calls
        const actor: ActorContext = {
            userId: waiterId,
            role: 'waiter',
            name: 'Waiter' // Default name
        };
        return this.acceptOrder(orderId, actor, client);
    }

    static async updatePaymentType(
        orderId: string,
        paymentType: 'cash' | 'card' | 'mobile',
        actor: ActorContext,
        client: SupabaseClient = supabase
    ): Promise<Order | null> {
        try {
            const { data, error } = await client
                .from('orders')
                .update({
                    payment_type: paymentType,
                    last_updated_by_role: actor.role,
                    last_updated_by_name: actor.name
                })
                .eq('id', orderId)
                .select()
                .single();

            if (error) throw error;
            return data ? this.dbToOrder(data) : null;
        } catch (error) {
            console.error('Failed to update payment type:', error);
            throw error;
        }
    }

    static async cancelOrder(
        orderId: string,
        reason: string,
        actor: ActorContext,
        client: SupabaseClient = supabase
    ): Promise<Order | null> {
        try {
            const { data, error } = await client
                .from('orders')
                .update({
                    status: 'cancelled',
                    rejection_reason: reason,
                    last_updated_by_role: actor.role,
                    last_updated_by_name: actor.name
                })
                .eq('id', orderId)
                .select()
                .single();

            if (error) throw error;
            return data ? this.dbToOrder(data) : null;
        } catch (error) {
            console.error('Failed to cancel order:', error);
            throw error;
        }
    }

    // Alias for backward compatibility
    static async rejectOrder(orderId: string, reason: string, client: SupabaseClient = supabase): Promise<Order | null> {
        const actor: ActorContext = {
            userId: 'system',
            role: 'admin',
            name: 'System'
        };
        return this.cancelOrder(orderId, reason, actor, client);
    }

    static async getWaiterStats(waiterId: string, client: SupabaseClient = supabase) {
        try {
            const { data, error } = await client
                .from('waiter_performance')
                .select('*')
                .eq('waiter_id', waiterId)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // Handle empty result
            return data || { total_orders: 0, total_revenue: 0, today_orders: 0, today_revenue: 0 };
        } catch (error) {
            console.error('Failed to fetch waiter stats:', error);
            return { total_orders: 0, total_revenue: 0, today_orders: 0, today_revenue: 0 };
        }
    }

    static async getAvailableOrders(client: SupabaseClient = supabase): Promise<Order[]> {
        // Orders that are confirmed but not yet assigned (or just confirmed)
        // Adjust logic based on exact requirements. 
        // "View new incoming orders" -> Usually 'confirmed' state.
        try {
            const { data, error } = await client
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

    static async getWaiterOrders(waiterId: string, client: SupabaseClient = supabase): Promise<Order[]> {
        try {
            const { data, error } = await client
                .from('orders')
                .select('*')
                .eq('accepted_by', waiterId)
                .in('status', ['confirmed', 'preparing', 'ready']) // Active orders
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return data ? data.map(this.dbToOrder) : [];
        } catch (error) {
            console.error('Failed to get waiter orders:', error);
            return [];
        }
    }

    static async deleteOrder(orderId: string, client: SupabaseClient = supabase): Promise<boolean> {
        try {
            const { error } = await client
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

    static subscribeToOrders(callback: (payload: any) => void, client: SupabaseClient = supabase) {
        const subscription = client
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

    static async getOrdersBySessionId(sessionId: string, client: SupabaseClient = supabase): Promise<Order[]> {
        try {
            const { data, error } = await client
                .from('orders')
                .select('*')
                .eq('customer_session_id', sessionId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data ? data.map(this.dbToOrder) : [];
        } catch (error) {
            console.error('Failed to fetch session orders:', error);
            return [];
        }
    }

    static unsubscribeFromOrders(subscription: any, client: SupabaseClient = supabase) {
        client.removeChannel(subscription);
    }

    // Session-related methods
    static async getActiveSessionsByTable(client: SupabaseClient = supabase): Promise<Map<string, any[]>> {
        try {
            const { data, error } = await client
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

