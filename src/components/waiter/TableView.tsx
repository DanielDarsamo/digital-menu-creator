import { useState, useEffect } from "react";
import { OrderService } from "@/services/orderService";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-MZ").format(price) + " MT";
};

const TableView = () => {
    const { supabase } = useAuth();
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
                        <Card key={tableId} className={`${allPaid ? 'border-green-500' : 'border-orange-500'} border-2`}>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center justify-between">
                                    <span className="text-lg">Table {tableId}</span>
                                    <Badge variant={allPaid ? "default" : "destructive"} className={allPaid ? "bg-green-600" : ""}>
                                        {allPaid ? "PAID" : formatPrice(totalUnpaid)}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {customers.map((customer) => (
                                        <div
                                            key={customer.id}
                                            className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm"
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium">{customer.name}</div>
                                                <div className="text-xs text-muted-foreground">{customer.phone}</div>
                                            </div>
                                            <div className="text-right">
                                                {customer.unpaidTotal > 0 ? (
                                                    <div className="font-bold text-orange-600">
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
