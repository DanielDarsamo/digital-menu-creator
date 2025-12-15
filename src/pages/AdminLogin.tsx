import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Simple password check (in production, use proper authentication)
    const ADMIN_PASSWORD = "fortaleza2024"; // Change this to your desired password

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate a small delay for better UX
        setTimeout(() => {
            if (password === ADMIN_PASSWORD) {
                // Store admin session
                sessionStorage.setItem("adminAuthenticated", "true");
                toast.success("Acesso autorizado!");
                navigate("/admin");
            } else {
                toast.error("Senha incorreta!", {
                    description: "Por favor, tente novamente.",
                });
                setPassword("");
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Button
                    onClick={() => navigate("/")}
                    variant="ghost"
                    className="mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao Menu
                </Button>

                <Card>
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Lock className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-display text-center">
                            Acesso Administrativo
                        </CardTitle>
                        <CardDescription className="font-body text-center">
                            Digite a senha para acessar o painel de administração
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-body">
                                    Senha
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Digite a senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="font-body"
                                    required
                                    autoFocus
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full font-body"
                                disabled={isLoading || !password}
                            >
                                {isLoading ? "Verificando..." : "Entrar"}
                            </Button>

                            <div className="text-xs text-muted-foreground text-center font-body mt-4">
                                <p>Apenas para funcionários autorizados</p>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-6 text-center text-sm text-muted-foreground font-body">
                    <p>Senha padrão: <code className="bg-secondary px-2 py-1 rounded">fortaleza2024</code></p>
                    <p className="text-xs mt-2">Altere a senha no código para produção</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
