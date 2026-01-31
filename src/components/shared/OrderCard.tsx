
import { Order } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Banknote,
    CreditCard,
    Smartphone,
    MapPin,
    User,
    FileText,
    Clock,
    ChefHat,
    Package,
    CheckCircle2,
    XCircle,
    UserCheck,
    History,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface OrderCardProps {
    order: Order;
    userRole: 'admin' | 'waiter';
    userName?: string;
    onAccept?: () => void;
    onStatusChange?: (status: Order['status']) => void;
    onPaymentTypeChange?: (paymentType: 'cash' | 'card' | 'mobile') => void;
    onCancel?: (reason: string) => void;
    onDelete?: () => void;
}

const statusConfig: Record<Order['status'], { label: string; icon: any; color: string }> = {
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
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const OrderCard = ({
    order,
    userRole,
    onAccept,
    onStatusChange,
    onPaymentTypeChange,
    onCancel,
    onDelete
}: OrderCardProps) => {
    const StatusIcon = statusConfig[order.status].icon;
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    const handleCancel = () => {
        if (onCancel && cancelReason.trim()) {
            onCancel(cancelReason);
            setIsCancelDialogOpen(false);
            setCancelReason("");
        }
    };

    const getPaymentIcon = (type?: string) => {
        switch (type) {
            case 'cash': return <Banknote className="h-3 w-3" />;
            case 'card': return <CreditCard className="h-3 w-3" />;
            case 'mobile': return <Smartphone className="h-3 w-3" />;
            default: return null;
        }
    };

    const canOperate = userRole === 'admin' || (userRole === 'waiter' && order.acceptedByRole === 'waiter');
    const isPending = order.status === 'pending';

    return (
        <Card className={cn("overflow-hidden transition-all duration-200 border-l-4",
            order.status === 'pending' ? "border-l-yellow-500" :
                order.status === 'delivered' ? "border-l-gray-300 opacity-80" :
                    order.status === 'cancelled' ? "border-l-red-500 opacity-70" :
                        "border-l-primary"
        )}>
            <CardHeader className="pb-3 bg-muted/20">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg flex-wrap">
                            Order #{order.orderNumber}
                            <Badge variant="outline" className={cn("flex items-center gap-1", statusConfig[order.status].color)}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig[order.status].label}
                            </Badge>
                            {order.paymentType && (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                    {getPaymentIcon(order.paymentType)}
                                    {order.paymentType.toUpperCase()}
                                </Badge>
                            )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                            {formatDate(order.createdAt)}

                            {/* Attribution - Who accepted */}
                            {order.acceptedByName && (
                                <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                                    <UserCheck className="w-3 h-3" />
                                    {order.acceptedByName} ({order.acceptedByRole})
                                </span>
                            )}
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-lg text-primary">
                            {formatPrice(order.totalPrice)}
                        </div>
                        {/* Attribution - Last updated */}
                        {order.lastUpdatedByName && order.status !== 'pending' && (
                            <div className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-1">
                                <History className="w-3 h-3" />
                                Updated by {order.lastUpdatedByName}
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
                {/* Customer Info */}
                {(order.customerInfo?.table || order.customerInfo?.name) && (
                    <div className="flex gap-4 text-sm font-medium p-2 bg-accent/20 rounded-md">
                        {order.customerInfo.table && (
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>Table {order.customerInfo.table}</span>
                            </div>
                        )}
                        {order.customerInfo.name && (
                            <div className="flex items-center gap-1.5 border-l pl-4 border-muted-foreground/30">
                                <User className="h-4 w-4 text-primary" />
                                <span>{order.customerInfo.name}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Items */}
                <div className="space-y-1">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1 border-b border-dashed last:border-0 border-muted">
                            <span>
                                <span className="font-bold mr-2">{item.quantity}x</span>
                                {item.name}
                            </span>
                            <span className="text-muted-foreground">
                                {formatPrice(Number(item.price) * item.quantity)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Notes */}
                {order.customerInfo?.notes && (
                    <div className="text-sm bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-200 flex gap-2">
                        <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="italic">{order.customerInfo.notes}</span>
                    </div>
                )}

                {/* Rejection Reason */}
                {order.rejectionReason && (
                    <div className="text-sm bg-red-50 text-red-800 p-2 rounded border border-red-200 flex gap-2">
                        <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="italic">Cancelled: {order.rejectionReason}</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 bg-muted/10 pt-3 pb-3">
                {/* Operational Controls - Only for admins or assigned waiters */}
                {canOperate && order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <div className="w-full space-y-3">
                        {/* Payment Selector */}
                        {onPaymentTypeChange && (
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={order.paymentType === 'cash' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPaymentTypeChange('cash')}
                                    className="h-8 text-xs"
                                >
                                    <Banknote className="w-3 h-3 mr-1.5" /> Cash
                                </Button>
                                <Button
                                    variant={order.paymentType === 'card' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPaymentTypeChange('card')}
                                    className="h-8 text-xs"
                                >
                                    <CreditCard className="w-3 h-3 mr-1.5" /> Card
                                </Button>
                                <Button
                                    variant={order.paymentType === 'mobile' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPaymentTypeChange('mobile')}
                                    className="h-8 text-xs"
                                >
                                    <Smartphone className="w-3 h-3 mr-1.5" /> M-Pesa
                                </Button>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {/* Status Selector */}
                            {onStatusChange && (
                                <Select
                                    value={order.status}
                                    onValueChange={(val) => onStatusChange(val as Order['status'])}
                                >
                                    <SelectTrigger className="flex-1 h-9">
                                        <SelectValue placeholder="Update Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="confirmed">Confirmado</SelectItem>
                                        <SelectItem value="preparing">Preparando</SelectItem>
                                        <SelectItem value="ready">Pronto</SelectItem>
                                        <SelectItem value="delivered" disabled={!order.paymentType}>Entregue</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Cancel Button */}
                            {onCancel && (
                                <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" className="h-9 px-3">
                                            Cancel
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Cancel Order #{order.orderNumber}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Please provide a reason for cancelling this order.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="py-2">
                                            <Label htmlFor="reason">Reason</Label>
                                            <Input
                                                id="reason"
                                                value={cancelReason}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                                placeholder="e.g. Out of stock, Customer changed mind"
                                            />
                                        </div>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Back</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleCancel}
                                                disabled={!cancelReason.trim()}
                                                className="bg-destructive hover:bg-destructive/90"
                                            >
                                                Cancel Order
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                )}

                {/* Accept Button for Waiters (Pending Orders) */}
                {userRole === 'waiter' && isPending && onAccept && !order.acceptedBy && (
                    <Button onClick={onAccept} className="w-full gap-2" size="lg">
                        <CheckCircle2 className="w-5 h-5" /> Accept Order
                    </Button>
                )}

                {/* Admin Delete Button */}
                {userRole === 'admin' && onDelete && (
                    <div className="flex justify-end w-full pt-2 border-t mt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDelete}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2 text-xs"
                        >
                            <Trash2 className="w-3 h-3 mr-1" /> Delete Permanently
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};
