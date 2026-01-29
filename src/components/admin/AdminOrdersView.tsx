
import { useState, useEffect } from "react";
import { Order, OrderService } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Clock,
    CheckCircle2,
    ChefHat,
    Package,
    XCircle,
    Trash2,
    MessageCircle,
    User,
    MapPin,
    FileText,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- Types & Constants ---
const statusConfig = {
    pending: {
        label: "Pendente",
        icon: Clock,
        color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    },
    confirmed: {
        label: "Confirmado",
        icon: CheckCircle2,
        color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    preparing: {
        label: "Preparando",
        icon: ChefHat,
        color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    },
    ready: {
        label: "Pronto",
        icon: Package,
        color: "bg-green-500/10 text-green-600 border-green-500/20",
    },
    delivered: {
        label: "Entregue",
        icon: CheckCircle2,
        color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    },
    cancelled: {
        label: "Cancelado",
        icon: XCircle,
        color: "bg-red-500/10 text-red-600 border-red-500/20",
    },
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-MZ").format(price) + " MT";
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

// --- Sub-Component: OrderCard ---
const OrderCard = ({ order, onStatusChange, onDelete }: {
    order: Order;
    onStatusChange: (orderId: string, status: Order['status']) => void;
    onDelete: (orderId: string) => void;
}) => {
    const StatusIcon = statusConfig[order.status].icon;

    return (
        <Card className="animate-fade-up">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="font-display text-xl flex items-center gap-2">
                            Pedido #{order.orderNumber}
                            <Badge variant="outline" className={cn("border", statusConfig[order.status].color)}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig[order.status].label}
                            </Badge>
                        </CardTitle>
                        <CardDescription className="font-body text-xs mt-1">
                            {formatDate(order.createdAt)}
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(order.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                {order.customerInfo && (
                    <div className="mt-3 space-y-1 text-sm">
                        {order.customerInfo.name && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4" />
                                <span className="font-body">{order.customerInfo.name}</span>
                            </div>
                        )}
                        {order.customerInfo.table && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span className="font-body">{order.customerInfo.table}</span>
                            </div>
                        )}
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-sm">
                            <span className="font-body">
                                {item.quantity}x {item.name}
                            </span>
                            <span className="font-semibold text-primary">
                                {typeof item.price === "number"
                                    ? formatPrice(item.price * item.quantity)
                                    : item.price + " MT"}
                            </span>
                        </div>
                    ))}
                </div>

                {order.customerInfo?.notes && (
                    <div className="pt-2 border-t">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <FileText className="w-4 h-4 mt-0.5" />
                            <span className="font-body italic">{order.customerInfo.notes}</span>
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-body font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">
                        {formatPrice(order.totalPrice)}
                    </span>
                </div>

                <div className="flex gap-2">
                    {order.sentToAdmin && (
                        <Badge variant="secondary" className="text-xs">System</Badge>
                    )}
                    {order.sentViaWhatsApp && (
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                        </Badge>
                    )}
                </div>

                <Select
                    value={order.status}
                    onValueChange={(value) => onStatusChange(order.id, value as Order['status'])}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                        <SelectItem value="preparing">Preparando</SelectItem>
                        <SelectItem value="ready">Pronto</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    );
};

// --- Main Component ---
const AdminOrdersView = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<"all" | Order['status']>("all");
    const [isLoading, setIsLoading] = useState(true);

    // Pagination State
    const [page, setPage] = useState(1);
    const LIMIT = 20;

    // Stats State
    const [stats, setStats] = useState({ total: 0, pending: 0, preparing: 0, todayCount: 0 });

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch stats
            const fetchedStats = await OrderService.getOrderStats();
            setStats(fetchedStats);

            // Fetch Paginated Orders
            const options: any = { limit: LIMIT, page };
            if (activeTab !== "all") {
                options.status = activeTab;
            }

            const fetchedOrders = await OrderService.getAllOrders(options);
            setOrders(fetchedOrders);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    // Reload when Tab or Page changes
    useEffect(() => {
        loadData();
    }, [activeTab, page]);

    // Reset page on tab change
    const onTabChange = (val: string) => {
        setActiveTab(val as any);
        setPage(1);
    };

    useEffect(() => {
        const subscription = OrderService.subscribeToOrders((payload) => {
            console.log('Real-time update:', payload);
            loadData();
        });
        return () => OrderService.unsubscribeFromOrders(subscription);
    }, []);

    const handleStatusChange = async (orderId: string, status: Order['status']) => {
        const updated = await OrderService.updateOrderStatus(orderId, status);
        if (updated) {
            toast.success(`Order marked as ${statusConfig[status].label.toLowerCase()}`);
            loadData();
        } else {
            toast.error("Error updating status");
        }
    };

    const handleDelete = async (orderId: string) => {
        if (confirm("Are you sure you want to delete this order?")) {
            const deleted = await OrderService.deleteOrder(orderId);
            if (deleted) {
                toast.success("Order deleted");
                loadData();
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Refresh */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold">Orders Overview</h2>
                    <p className="text-muted-foreground">Manage ongoing and past orders.</p>
                </div>
                <Button onClick={loadData} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-body">Total Orders</CardDescription>
                        <CardTitle className="text-3xl font-display">{stats.total}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-body">Pending</CardDescription>
                        <CardTitle className="text-3xl font-display text-yellow-600">{stats.pending}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-body">In Prep</CardDescription>
                        <CardTitle className="text-3xl font-display text-orange-600">{stats.preparing}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="font-body">Today</CardDescription>
                        <CardTitle className="text-3xl font-display">{stats.todayCount}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={onTabChange}>
                <TabsList className="mb-4 flex flex-wrap h-auto gap-2">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                    <TabsTrigger value="preparing">In Prep</TabsTrigger>
                    <TabsTrigger value="ready">Ready</TabsTrigger>
                    <TabsTrigger value="delivered">Delivered</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 border rounded-lg border-dashed bg-muted/20 text-muted-foreground">
                            <Package className="h-12 w-12 mb-3 opacity-20" />
                            <p className="font-medium">No orders found</p>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                                    {orders.map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>

                            {/* Pagination Controls */}
                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Page {page}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={orders.length < LIMIT} // Simple check: if less than limit, we are at end
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminOrdersView;
