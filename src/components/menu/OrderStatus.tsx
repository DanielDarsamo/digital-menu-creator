import { useEffect, useState } from "react";
import { Order, OrderService } from "@/services/orderService";
import { useSession } from "@/contexts/SessionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    CheckCircle2,
    ChefHat,
    Package,
    XCircle,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
    pending: {
        label: "Pendente",
        icon: Clock,
        color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
    },
    confirmed: {
        label: "Confirmado",
        icon: CheckCircle2,
        color: "bg-blue-500/10 text-blue-600 border-blue-500/20"
    },
    preparing: {
        label: "Em Preparo",
        icon: ChefHat,
        color: "bg-orange-500/10 text-orange-600 border-orange-500/20"
    },
    ready: {
        label: "Pronto",
        icon: Package,
        color: "bg-green-500/10 text-green-600 border-green-500/20"
    },
    delivered: {
        label: "Entregue",
        icon: CheckCircle2,
        color: "bg-gray-500/10 text-gray-600 border-gray-500/20"
    },
    cancelled: {
        label: "Cancelado",
        icon: XCircle,
        color: "bg-red-500/10 text-red-600 border-red-500/20"
    },
};

const OrderStatus = () => {
    const { session } = useSession();
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        if (!session?.id) {
            setLoading(false);
            return;
        }

        try {
            const allOrders = await OrderService.getOrdersBySessionId(session.id);
            // Filter active orders (not delivered or cancelled)
            const active = allOrders.filter(o =>
                ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
            );
            setActiveOrders(active);
        } catch (e) {
            console.error("Failed to load active orders", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();

        // Subscribe to real-time updates
        const subscription = OrderService.subscribeToOrders(() => {
            loadOrders();
        });

        // Listen for local creation events
        const handleOrderCreated = () => loadOrders();
        window.addEventListener('orderCreated', handleOrderCreated);

        return () => {
            OrderService.unsubscribeFromOrders(subscription);
            window.removeEventListener('orderCreated', handleOrderCreated);
        };
    }, [session?.id]);

    if (loading) return (
        <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
    );

    if (activeOrders.length === 0) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("pt-MZ").format(price) + " MT";
    };

    return (
        <div className="space-y-3 mb-6 animate-fade-in">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                Estado do Pedido
                <span className="text-xs font-body bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {activeOrders.length}
                </span>
            </h3>

            <div className="space-y-3">
                {activeOrders.map(order => {
                    const StatusIcon = statusConfig[order.status].icon;
                    return (
                        <Card key={order.id} className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-display font-bold text-lg">
                                        #{order.orderNumber}
                                    </span>
                                    <Badge variant="outline" className={cn("flex items-center gap-1.5 py-1 px-2.5", statusConfig[order.status].color)}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {statusConfig[order.status].label}
                                    </Badge>
                                </div>

                                <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}
                                </div>

                                <div className="flex justify-between items-center text-xs font-medium pt-2 border-t border-dashed">
                                    <span>Total: {formatPrice(order.totalPrice)}</span>
                                    <span className="text-muted-foreground">
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderStatus;
