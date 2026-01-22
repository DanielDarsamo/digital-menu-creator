import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";

import { CustomerSession } from "@/contexts/SessionContext";

interface CustomerInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (info: {
        name?: string;
        email?: string;
        phone?: string;
        table?: string;
        notes?: string;
        sendToWhatsApp: boolean;
        sendToAdmin: boolean;
    }) => void;
    session?: CustomerSession | null;
}

const CustomerInfoDialog = ({ isOpen, onClose, onSubmit, session }: CustomerInfoDialogProps) => {
    const [name, setName] = useState(session?.customerName || "");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState(session?.phoneNumber || "");
    const [table, setTable] = useState(session?.tableId || "");
    const [notes, setNotes] = useState("");
    const [sendToWhatsApp, setSendToWhatsApp] = useState(true);
    const [sendToAdmin, setSendToAdmin] = useState(true);

    useEffect(() => {
        if (session) {
            setName(session.customerName);
            setPhone(session.phoneNumber);
            setTable(session.tableId);
        } else {
            // Load saved customer info if no session
            const saved = localStorage.getItem("customerDetails");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.name) setName(parsed.name);
                    if (parsed.email) setEmail(parsed.email);
                    if (parsed.phone) setPhone(parsed.phone);
                } catch (e) {
                    console.error("Failed to parse saved customer details");
                }
            }
        }
    }, [session, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!session) {
            localStorage.setItem("customerDetails", JSON.stringify({ name, email, phone }));
        }

        onSubmit({
            name: name.trim() || undefined,
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            table: table.trim() || undefined,
            notes: notes.trim() || undefined,
            sendToWhatsApp,
            sendToAdmin,
        });

        if (!session) {
            setTable("");
        }
        setNotes("");
        setSendToWhatsApp(true);
        setSendToAdmin(true);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl">Finalizar Pedido</DialogTitle>
                    <DialogDescription className="font-body">
                        {session ? `Pedindo como ${session.customerName} (Mesa ${session.tableId})` : "Preencha as informações abaixo para enviar o seu pedido"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!session && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-body">Nome</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-body">Email (opcional)</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="font-body">Telefone</Label>
                                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="table" className="font-body">Mesa</Label>
                                <Input id="table" value={table} onChange={(e) => setTable(e.target.value)} />
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="font-body">Observações (opcional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Alguma observação especial sobre o pedido?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="font-body min-h-20"
                        />
                    </div>

                    <div className="space-y-3 pt-2">
                        <p className="text-sm font-body text-muted-foreground">Enviar pedido para:</p>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="sendToAdmin"
                                checked={sendToAdmin}
                                onChange={(e) => setSendToAdmin(e.target.checked)}
                                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                            />
                            <Label htmlFor="sendToAdmin" className="cursor-pointer flex items-center gap-2">
                                <Send className="w-4 h-4" /> Sistema
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="sendToWhatsApp"
                                checked={sendToWhatsApp}
                                onChange={(e) => setSendToWhatsApp(e.target.checked)}
                                className="w-4 h-4 text-green-600 border-border rounded focus:ring-green-500"
                            />
                            <Label htmlFor="sendToWhatsApp" className="cursor-pointer flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
                            </Label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
                        <Button type="submit" disabled={!sendToWhatsApp && !sendToAdmin} className="flex-1 bg-primary">Confirmar</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerInfoDialog;
