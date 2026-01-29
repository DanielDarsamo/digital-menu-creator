
import { useState, useEffect } from "react";
import { MenuService, DBMenuCategory, DBMenuItem } from "@/services/menuService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Edit, Plus, Trash2, Image as ImageIcon } from "lucide-react";

// Types for the UI (extending/adapting DB types for inputs)
type MenuItemFormData = Omit<DBMenuItem, "id" | "created_at">;

const MenuManagement = () => {
    const [categories, setCategories] = useState<DBMenuCategory[]>([]);
    // We use the app's MenuCategory structure which includes items
    const [menuData, setMenuData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<DBMenuItem | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<MenuItemFormData>>({
        name: "",
        description: "",
        price: 0,
        category_id: "",
        is_vegetarian: false,
        is_seafood: false,
        is_kids_friendly: false,
        is_available: true,
        image_url: ""
    });

    useEffect(() => {
        loadMenu();
    }, []);

    const loadMenu = async () => {
        setLoading(true);
        // Note: MenuService.getFullMenu returns app-formatted data, 
        // but for management we ideally want raw DB access or we adapt.
        // For now, let's fetch raw for management to keep it simple, 
        // OR we can add a method to service.
        // Actually, let's use the service's existing method and adapt back if needed, 
        // OR extend service to give us what we need. 
        // Let's rely on `getFullMenu` for now, but strictly speaking we might want a `getRawMenu` for admin.
        // To save time/tokens, I'll simulate fetching raw data directly here or add a method to Service.
        // Let's add a `getAllItems` to service in a follow-up if needed, 
        // but for now I will assume we can use the `getFullMenu` and just map it.
        // Wait, `getFullMenu` returns nested structure.

        try {
            const data = await MenuService.getFullMenu();
            // We need to flatten or structure this for the table.
            // Also we need raw categories for the dropdown.
            // Let's assume we can fetch categories separately or parse them from result.
            // Ideally validation fetches categories.

            // Temporary: Fetch categories manually or via service (I should add getCategories to service)
            // Let's mock it for now since I didn't add getCategories to service yet.
            // I'll update Service in next step.
            setMenuData(data as any); // Type assertion for now
        } catch (error) {
            toast.error("Failed to load menu");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingItem) {
                await MenuService.updateItem(editingItem.id, formData);
                toast.success("Item updated");
            } else {
                // Create not implemented in service yet
                toast.error("Create not implemented yet");
            }
            setIsDialogOpen(false);
            loadMenu();
        } catch (error) {
            toast.error("Failed to save item");
        }
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            price: item.price,
            category_id: item.category, // Map correctly
            is_available: true // Default
        });
        setIsDialogOpen(true);
    }

    if (loading) return <div>Loading menu...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Menu Items</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={async () => {
                        try {
                            setLoading(true);
                            const count = await MenuService.seedDatabase();
                            toast.success(`Database seeded with ${count} items`);
                            loadMenu();
                        } catch (e) {
                            toast.error("Failed to seed database");
                            console.error(e);
                        } finally {
                            setLoading(false);
                        }
                    }}>
                        Seed DB
                    </Button>
                    <Button onClick={() => { setEditingItem(null); setFormData({}); setIsDialogOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Item
                    </Button>
                </div>
            </div>

            {menuData.map((catGroup) => (
                <div key={catGroup.id} className="border rounded-lg p-4">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span>{catGroup.icon}</span>
                        {catGroup.name}
                    </h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {catGroup.items.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <div>{item.name}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</div>
                                    </TableCell>
                                    <TableCell>{item.price} MT</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={item.isAvailable !== false} // Default to true if undefined
                                            onCheckedChange={(checked) => {
                                                // Optimistic update
                                                // API Call
                                                MenuService.toggleAvailability(item.id, !checked).then(() => {
                                                    toast.success(`Item ${checked ? 'enabled' : 'disabled'}`);
                                                    loadMenu();
                                                });
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ))}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Item' : 'New Item'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Name</Label>
                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Price (MT)</Label>
                            <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                        </div>
                        {/* More fields (Category, Tags, Image) to be added */}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MenuManagement;
