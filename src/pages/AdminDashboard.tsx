import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    ArrowLeft,
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
                {/* Order Items */}
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

                {/* Notes */}
                {order.customerInfo?.notes && (
                    <div className="pt-2 border-t">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <FileText className="w-4 h-4 mt-0.5" />
                            <span className="font-body italic">{order.customerInfo.notes}</span>
                        </div>
                    </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-body font-semibold">Total</span>
                    <span className="text-xl font-bold text-primary">
                        {formatPrice(order.totalPrice)}
                    </span>
                </div>

                {/* Sent via badges */}
                <div className="flex gap-2">
                    {order.sentToAdmin && (
                        <Badge variant="secondary" className="text-xs">
                            Sistema
                        </Badge>
                    )}
                    {order.sentViaWhatsApp && (
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            WhatsApp
                        </Badge>
                    )}
                </div>

                {/* Status Change */}
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

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeTab, setActiveTab] = useState<"all" | Order['status']>("all");
    const [isLoading, setIsLoading] = useState(true);

    const loadOrders = async () => {
        setIsLoading(true);
        const fetchedOrders = await OrderService.getAllOrders();
        setOrders(fetchedOrders);
        setIsLoading(false);
    };

    // Check authentication on mount
    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem("adminAuthenticated");
        if (!isAuthenticated) {
            toast.error("Acesso não autorizado!");
            navigate("/admin-login");
        }
    }, [navigate]);

    useEffect(() => {
        loadOrders();

        // Subscribe to real-time order changes
        const subscription = OrderService.subscribeToOrders((payload) => {
            console.log('Real-time update:', payload);
            loadOrders(); // Reload orders on any change
        });

        // Listen for custom events (for backward compatibility)
        const handleOrderCreated = () => loadOrders();
        const handleOrderUpdated = () => loadOrders();
        const handleOrderDeleted = () => loadOrders();

        window.addEventListener('orderCreated', handleOrderCreated);
        window.addEventListener('orderUpdated', handleOrderUpdated);
        window.addEventListener('orderDeleted', handleOrderDeleted);

        return () => {
            // Cleanup subscriptions
            OrderService.unsubscribeFromOrders(subscription);
            window.removeEventListener('orderCreated', handleOrderCreated);
            window.removeEventListener('orderUpdated', handleOrderUpdated);
            window.removeEventListener('orderDeleted', handleOrderDeleted);
        };
    }, []);

    const handleStatusChange = async (orderId: string, status: Order['status']) => {
        const updated = await OrderService.updateOrderStatus(orderId, status);
        if (updated) {
            toast.success("Status do pedido atualizado!", {
                description: `Pedido marcado como ${statusConfig[status].label.toLowerCase()}`,
            });
        } else {
            toast.error("Erro ao atualizar status do pedido");
        }
    };

    const handleDelete = async (orderId: string) => {
        if (confirm("Tem certeza que deseja excluir este pedido?")) {
            const deleted = await OrderService.deleteOrder(orderId);
            if (deleted) {
                toast.success("Pedido excluído com sucesso!");
            } else {
                toast.error("Erro ao excluir pedido");
            }
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("adminAuthenticated");
        toast.success("Sessão encerrada!");
        navigate("/admin-login");
    };

    const filteredOrders = activeTab === "all"
        ? orders
        : orders.filter(order => order.status === activeTab);

    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const preparingCount = orders.filter(o => o.status === 'preparing').length;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => navigate("/")}
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div>
                            <h1 className="font-display text-4xl font-bold text-primary mb-2">
                                Central de Pedidos
                            </h1>
                            <p className="font-body text-muted-foreground">
                                Gerencie todos os pedidos do restaurante
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={loadOrders} variant="outline" size="icon">
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button onClick={handleLogout} variant="outline" className="gap-2">
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sair</span>
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-body">Total de Pedidos</CardDescription>
                            <CardTitle className="text-3xl font-display">{orders.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-body">Pendentes</CardDescription>
                            <CardTitle className="text-3xl font-display text-yellow-600">{pendingCount}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-body">Em Preparo</CardDescription>
                            <CardTitle className="text-3xl font-display text-orange-600">{preparingCount}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="font-body">Hoje</CardDescription>
                            <CardTitle className="text-3xl font-display">
                                {orders.filter(o => {
                                    const today = new Date().toDateString();
                                    const orderDate = new Date(o.createdAt).toDateString();
                                    return today === orderDate;
                                }).length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Orders Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                    <TabsList className="mb-6">
                        <TabsTrigger value="all">Todos ({orders.length})</TabsTrigger>
                        <TabsTrigger value="pending">Pendentes ({pendingCount})</TabsTrigger>
                        <TabsTrigger value="preparing">Em Preparo ({preparingCount})</TabsTrigger>
                        <TabsTrigger value="ready">Prontos</TabsTrigger>
                        <TabsTrigger value="delivered">Entregues</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab}>
                        {filteredOrders.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <p className="text-muted-foreground font-body">
                                        Nenhum pedido encontrado
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <ScrollArea className="h-[calc(100vh-400px)]">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredOrders.map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            onStatusChange={handleStatusChange}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminDashboard;
