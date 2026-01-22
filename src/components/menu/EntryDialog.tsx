
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/contexts/SessionContext";

const EntryDialog = () => {
    const { session, isLoading, createSession } = useSession();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [table, setTable] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Don't show if loading or already has session
    if (isLoading || session) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone || !table) return;

        setIsSubmitting(true);
        await createSession(name, phone, table);
        setIsSubmitting(false);
    };

    return (
        <Dialog open={!session} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Bem-vindo ao Fortaleza de Sabores</DialogTitle>
                    <DialogDescription>
                        Por favor, identifique-se para iniciar o seu pedido.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="table">Número da Mesa</Label>
                        <Input
                            id="table"
                            placeholder="Ex: 5"
                            value={table}
                            onChange={(e) => setTable(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Seu Nome</Label>
                        <Input
                            id="name"
                            placeholder="Ex: João"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Número de Telefone</Label>
                        <Input
                            id="phone"
                            placeholder="Ex: 841234567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            type="tel"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Entrando..." : "Começar a Pedir"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EntryDialog;
