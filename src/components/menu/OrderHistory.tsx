import { useEffect, useState } from "react";
import { Order, OrderService } from "@/services/orderService";
import { useOrder } from "@/contexts/OrderContext";
import { menuCategories } from "@/data/menuData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    RotateCcw,
    Calendar,
    Receipt,
    Loader2,
    ShoppingBag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const OrderHistory = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const { addItem, clearCart } = useOrder();

    const loadHistory = async () => {
        const saved = localStorage.getItem("customerDetails");
        if (!saved) {
            setLoading(false);
            return;
        }

        try {
            const { email, phone } = JSON.parse(saved);
            if (!email && !phone) {
                setLoading(false);
                return;
            }

            const allOrders = await OrderService.getCustomerOrders(email, phone);
            // Filter detailed history (delivered or cancelled)
            const history = allOrders.filter(o =>
                ['delivered', 'cancelled'].includes(o.status)
            );
            setOrders(history);
        } catch (e) {
            console.error("Failed to load order history", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();

        // Subscribe to real-time updates (e.g. when an active order becomes delivered)
        const subscription = OrderService.subscribeToOrders(() => {
            loadHistory();
        });

        // Listen for local updates
        const handleOrderUpdated = () => loadHistory();
        window.addEventListener('orderUpdated', handleOrderUpdated);

        return () => {
            OrderService.unsubscribeFromOrders(subscription);
            window.removeEventListener('orderUpdated', handleOrderUpdated);
        };
    }, []);

    const handleReorder = (order: Order) => {
        // Clear current cart
        clearCart();

        let itemsAdded = 0;
        let itemsNotFound = 0;

        // Flatten menu items for easy lookup
        const allMenuItems = menuCategories.flatMap(cat => cat.items);

        order.items.forEach(orderItem => {
            // Find original item to get full details (image, description, current price)
            const originalItem = allMenuItems.find(i => i.id === orderItem.id);

            if (originalItem) {
                // Add with original quantity using current item details (price, etc)
                // We call addToCart quantity times or use a specialized method if available
                // Assuming addToCart adds 1, we loop. Optimally addToCart should accept quantity.
                // Checking OrderContext context... usually it's addToCart(item).
                // If I loop, it works.
                addItem(originalItem, orderItem.quantity);
                itemsAdded++;
            } else {
                itemsNotFound++;
            }
        });

        if (itemsAdded > 0) {
            toast.success("Itens adicionados ao carrinho!", {
                description: "Você pode revisar o pedido antes de finalizar."
            });
            if (itemsNotFound > 0) {
                toast.warning(`Alguns itens (${itemsNotFound}) não estão mais disponíveis.`);
            }
        } else {
            toast.error("Não foi possível repetir o pedido.", {
                description: "Os itens podem não estar mais disponíveis no menu."
            });
        }
    };

    if (loading) return (
        <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
    );

    if (orders.length === 0) return (
        <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum histórico de pedidos encontrado.</p>
        </div>
    );

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("pt-MZ").format(price) + " MT";
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-PT", {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                Histórico de Pedidos
                <span className="text-xs font-body bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                    {orders.length}
                </span>
            </h3>

            <div className="space-y-4">
                {orders.map(order => (
                    <Card key={order.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-display font-bold">#{order.orderNumber}</span>
                                        <Badge variant={order.status === 'delivered' ? 'outline' : 'destructive'} className="text-[10px] h-5">
                                            {order.status === 'delivered' ? 'Entregue' : 'Cancelado'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(order.createdAt)}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => handleReorder(order)}
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Repetir
                                </Button>
                            </div>

                            <div className="space-y-1 mb-3">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="text-sm flex justify-between">
                                        <span className="text-muted-foreground">
                                            {item.quantity}x <span className="text-foreground">{item.name}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-dashed">
                                <span className="text-xs font-medium text-muted-foreground">Total Pago</span>
                                <span className="font-bold text-primary flex items-center gap-1">
                                    <Receipt className="w-3.5 h-3.5" />
                                    {formatPrice(order.totalPrice)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;
