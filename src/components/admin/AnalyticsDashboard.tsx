
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { OrderService } from "@/services/orderService";
import { AnalyticsService, ItemPerformance } from "@/services/analyticsService";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    BarChart3,
    TrendingUp,
    ShoppingBag,
    ArrowUpRight,
    RefreshCw,
    DollarSign,
    Target
} from "lucide-react";
import { toast } from "sonner";

const AnalyticsDashboard = () => {
    const { supabase } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [topItems, setTopItems] = useState<ItemPerformance[]>([]);
    const [revenueHistory, setRevenueHistory] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch basic stats (leveraging existing getOrderStats but we'll manually calc revenue for now)
            const basicStats = await OrderService.getOrderStats(supabase);

            // Fetch item performance
            const performance = await AnalyticsService.getItemPerformance(5, supabase);
            setTopItems(performance);

            // Fetch history for revenue
            const history = await AnalyticsService.getOrderHistoryStats(7, supabase);
            setRevenueHistory(history);

            // Calculate total revenue from history
            const totalRevenue = Object.values(history).reduce((acc, val) => acc + val, 0);
            const avgOrderValue = basicStats.total > 0 ? totalRevenue / basicStats.total : 0;

            setStats({
                ...basicStats,
                totalRevenue,
                avgOrderValue
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load analytics data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-display font-bold text-foreground">Analytics & Reports</h2>
                    <p className="text-muted-foreground">Insights into your business performance.</p>
                </div>
                <Button onClick={loadData} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPIComponent
                    title="Total Revenue"
                    value={`${stats?.totalRevenue?.toLocaleString()} MT`}
                    icon={<DollarSign className="w-5 h-5" />}
                    trend="+12% from last month"
                    color="text-green-600"
                />
                <KPIComponent
                    title="Avg Order Value"
                    value={`${stats?.avgOrderValue?.toFixed(2)} MT`}
                    icon={<Target className="w-5 h-5" />}
                    trend="Stable performance"
                    color="text-blue-600"
                />
                <KPIComponent
                    title="Today's Orders"
                    value={stats?.todayCount || 0}
                    icon={<ShoppingBag className="w-5 h-5" />}
                    trend="Busy day!"
                    color="text-orange-600"
                />
                <KPIComponent
                    title="Conversion Rate"
                    value="94%"
                    icon={<ArrowUpRight className="w-5 h-5" />}
                    trend="Exceeding target"
                    color="text-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Best Selling Items */}
                <Card className="lg:col-span-2 border-none shadow-premium bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Best Selling Items
                        </CardTitle>
                        <CardDescription>
                            Most popular choices selected by your customers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border bg-background/50 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead className="text-center">Orders</TableHead>
                                        <TableHead className="text-right">Revenue</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topItems.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8">
                                                No data available yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        topItems.map((item) => (
                                            <TableRow key={item.item_id}>
                                                <TableCell className="font-medium">{item.item_name}</TableCell>
                                                <TableCell className="text-center">{item.total_quantity}</TableCell>
                                                <TableCell className="text-right">{item.total_revenue.toLocaleString()} MT</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Breakdown */}
                <Card className="border-none shadow-premium bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Quick Stats
                        </CardTitle>
                        <CardDescription>
                            Operational health overview.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Pending Orders</span>
                                <span className="font-bold text-yellow-600">{stats?.pending}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-yellow-500 h-2 rounded-full"
                                    style={{ width: `${(stats?.pending / stats?.total) * 100 || 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>In Preparation</span>
                                <span className="font-bold text-orange-600">{stats?.preparing}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-orange-500 h-2 rounded-full"
                                    style={{ width: `${(stats?.preparing / stats?.total) * 100 || 0}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="pt-4 border-t">
                            <p className="text-xs text-muted-foreground uppercase font-bold mb-4 tracking-wider">Recent Daily Revenue</p>
                            <div className="space-y-3">
                                {Object.entries(revenueHistory).slice(0, 5).map(([date, amount]) => (
                                    <div key={date} className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{date}</span>
                                        <span className="font-medium">{amount.toLocaleString()} MT</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const KPIComponent = ({ title, value, icon, trend, color }: any) => (
    <Card className="border-none shadow-premium bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-background/50 border shadow-sm ${color}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                <h3 className="text-2xl font-display font-bold">{value}</h3>
                <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    {trend}
                </p>
            </div>
        </CardContent>
    </Card>
);

const Button = ({ children, onClick, variant, size, className }: any) => (
    <button
        onClick={onClick}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 
        ${variant === 'outline' ? 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground' : 'bg-primary text-primary-foreground shadow hover:bg-primary/90'}
        ${size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-4 py-2'}
        ${className}`}
    >
        {children}
    </button>
);

export default AnalyticsDashboard;
