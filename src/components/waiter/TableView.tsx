import { useState, useEffect } from "react";
import { OrderService } from "@/services/orderService";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, CheckCircle, CreditCard, Banknote } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PaymentService } from "@/services/paymentService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-MZ").format(price) + " MT";
};

const TableView = () => {
    const { user, supabase } = useAuth();
    const [tableData, setTableData] = useState<Map<string, any[]>>(new Map());
    const [loading, setLoading] = useState(true);

    const loadTables = async () => {
        setLoading(true);
        const data = await OrderService.getActiveSessionsByTable(supabase);
        setTableData(data);
        setLoading(false);
    };

    useEffect(() => {
        loadTables();

        // Refresh every 10 seconds
        const interval = setInterval(loadTables, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleConfirmPayment = async (sessionId: string, amount: number, method: 'cash' | 'card' | 'mpesa') => {
        if (!user) return;
        try {
            await PaymentService.confirmPayment(sessionId, amount, method, user.id, supabase);
            toast.success("Payment Confirmed");
            loadTables();
        } catch (error) {
            toast.error("Failed to confirm payment");
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Loading tables...</div>;
    }

    if (tableData.size === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No active tables</p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from(tableData.entries()).map(([tableId, customers]) => {
                    const totalUnpaid = customers.reduce((sum, c) => sum + c.unpaidTotal, 0);
                    const allPaid = totalUnpaid === 0 && customers.length > 0;

                    return (
                        <Card key={tableId} className={`${allPaid ? 'border-green-500' : 'border-orange-500'} border-2 shadow-sm`}>
                            <CardHeader className="pb-3 pb-2">
                                <CardTitle className="flex items-center justify-between">
                                    <span className="text-lg">Table {tableId}</span>
                                    <Badge variant={allPaid ? "default" : "destructive"} className={allPaid ? "bg-green-600" : ""}>
                                        {allPaid ? "PAID" : formatPrice(totalUnpaid)}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {customers.map((customer) => (
                                        <div
                                            key={customer.id}
                                            className="space-y-2 p-3 rounded-lg bg-muted/40 text-sm border border-muted"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="font-bold text-base">{customer.name}</div>
                                                    <div className="text-xs text-muted-foreground">{customer.phone}</div>
                                                </div>
                                                <div className="text-right">
                                                    {customer.unpaidTotal > 0 ? (
                                                        <div className="font-bold text-orange-600 text-base">
                                                            {formatPrice(customer.unpaidTotal)}
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            PAID
                                                        </Badge>
                                                    )}
                                                    <div className="text-xs text-muted-foreground">
                                                        {customer.orderCount} order{customer.orderCount !== 1 ? 's' : ''}
                                                    </div>
                                                </div>
                                            </div>

                                            {customer.unpaidTotal > 0 && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="sm" className="w-full mt-2 h-9">
                                                            <DollarSign className="w-4 h-4 mr-2" />
                                                            Receive Payment
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel>Select Method</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleConfirmPayment(customer.id, customer.unpaidTotal, 'cash')}>
                                                            <Banknote className="w-4 h-4 mr-2" /> Cash
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleConfirmPayment(customer.id, customer.unpaidTotal, 'card')}>
                                                            <CreditCard className="w-4 h-4 mr-2" /> Card
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleConfirmPayment(customer.id, customer.unpaidTotal, 'mpesa')}>
                                                            <CheckCircle className="w-4 h-4 mr-2" /> M-Pesa
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </ScrollArea>
    );
};

export default TableView;
