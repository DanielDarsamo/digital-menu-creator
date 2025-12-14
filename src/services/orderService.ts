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
    private static ORDERS_KEY = 'fortaleza-orders';
    private static ORDER_COUNTER_KEY = 'fortaleza-order-counter';

    static getAllOrders(): Order[] {
        const orders = localStorage.getItem(this.ORDERS_KEY);
        return orders ? JSON.parse(orders) : [];
    }

    static getOrderById(id: string): Order | null {
        const orders = this.getAllOrders();
        return orders.find(order => order.id === id) || null;
    }

    static getNextOrderNumber(): number {
        const counter = localStorage.getItem(this.ORDER_COUNTER_KEY);
        const nextNumber = counter ? parseInt(counter) + 1 : 1;
        localStorage.setItem(this.ORDER_COUNTER_KEY, nextNumber.toString());
        return nextNumber;
    }

    static createOrder(
        items: Order['items'],
        totalPrice: number,
        customerInfo?: Order['customerInfo'],
        sentViaWhatsApp: boolean = false,
        sentToAdmin: boolean = false
    ): Order {
        const orders = this.getAllOrders();
        const now = new Date().toISOString();

        const newOrder: Order = {
            id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            orderNumber: this.getNextOrderNumber(),
            items,
            totalPrice,
            customerInfo,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
            sentViaWhatsApp,
            sentToAdmin,
        };

        orders.unshift(newOrder); // Add to beginning
        localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));

        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('orderCreated', { detail: newOrder }));

        return newOrder;
    }

    static updateOrderStatus(orderId: string, status: Order['status']): Order | null {
        const orders = this.getAllOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);

        if (orderIndex === -1) return null;

        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();

        localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));

        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('orderUpdated', { detail: orders[orderIndex] }));

        return orders[orderIndex];
    }

    static deleteOrder(orderId: string): boolean {
        const orders = this.getAllOrders();
        const filteredOrders = orders.filter(order => order.id !== orderId);

        if (filteredOrders.length === orders.length) return false;

        localStorage.setItem(this.ORDERS_KEY, JSON.stringify(filteredOrders));

        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('orderDeleted', { detail: { orderId } }));

        return true;
    }

    static getPendingOrders(): Order[] {
        return this.getAllOrders().filter(order =>
            order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing'
        );
    }

    static getOrdersByStatus(status: Order['status']): Order[] {
        return this.getAllOrders().filter(order => order.status === status);
    }
}
