import { useState } from "react";
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

interface CustomerInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (info: {
        name?: string;
        table?: string;
        notes?: string;
        sendToWhatsApp: boolean;
        sendToAdmin: boolean;
    }) => void;
}

const CustomerInfoDialog = ({ isOpen, onClose, onSubmit }: CustomerInfoDialogProps) => {
    const [name, setName] = useState("");
    const [table, setTable] = useState("");
    const [notes, setNotes] = useState("");
    const [sendToWhatsApp, setSendToWhatsApp] = useState(true);
    const [sendToAdmin, setSendToAdmin] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: name.trim() || undefined,
            table: table.trim() || undefined,
            notes: notes.trim() || undefined,
            sendToWhatsApp,
            sendToAdmin,
        });
        // Reset form
        setName("");
        setTable("");
        setNotes("");
        setSendToWhatsApp(true);
        setSendToAdmin(true);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl">Finalizar Pedido</DialogTitle>
                    <DialogDescription className="font-body">
                        Preencha as informações abaixo para enviar o seu pedido
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="font-body">
                            Nome (opcional)
                        </Label>
                        <Input
                            id="name"
                            placeholder="Seu nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="font-body"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="table" className="font-body">
                            Mesa / Localização (opcional)
                        </Label>
                        <Input
                            id="table"
                            placeholder="Ex: Mesa 5, Varanda, etc."
                            value={table}
                            onChange={(e) => setTable(e.target.value)}
                            className="font-body"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="font-body">
                            Observações (opcional)
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Alguma observação especial sobre o pedido?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="font-body min-h-20"
                        />
                    </div>

                    <div className="space-y-3 pt-2">
                        <p className="text-sm font-body text-muted-foreground">
                            Enviar pedido para:
                        </p>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="sendToAdmin"
                                checked={sendToAdmin}
                                onChange={(e) => setSendToAdmin(e.target.checked)}
                                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                            />
                            <Label htmlFor="sendToAdmin" className="font-body cursor-pointer flex items-center gap-2">
                                <Send className="w-4 h-4" />
                                Sistema de Pedidos (Garçom/Cozinha)
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
                            <Label htmlFor="sendToWhatsApp" className="font-body cursor-pointer flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-green-600" />
                                WhatsApp
                            </Label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 font-body"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={!sendToWhatsApp && !sendToAdmin}
                            className="flex-1 font-body bg-primary hover:bg-primary/90"
                        >
                            Confirmar Pedido
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerInfoDialog;
