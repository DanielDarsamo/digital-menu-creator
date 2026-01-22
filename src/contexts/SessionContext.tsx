
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface CustomerSession {
    id: string;
    customerName: string;
    phoneNumber: string;
    tableId: string;
    status: 'active' | 'closed';
}

interface SessionContextType {
    session: CustomerSession | null;
    isLoading: boolean;
    createSession: (name: string, phone: string, table: string) => Promise<boolean>;
    exitSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
};

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<CustomerSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load session from localStorage on mount
    useEffect(() => {
        const loadSession = async () => {
            const savedSessionId = localStorage.getItem("fortaleza-session-id");
            if (savedSessionId) {
                try {
                    const { data, error } = await supabase
                        .from("customer_sessions")
                        .select("*")
                        .eq("id", savedSessionId)
                        .eq("status", "active")
                        .single();

                    if (data && !error) {
                        setSession({
                            id: data.id,
                            customerName: data.customer_name,
                            phoneNumber: data.phone_number,
                            tableId: data.table_id,
                            status: data.status,
                        });
                    } else {
                        // Invalid or closed session
                        localStorage.removeItem("fortaleza-session-id");
                    }
                } catch (error) {
                    console.error("Error restoring session:", error);
                }
            }
            setIsLoading(false);
        };

        loadSession();
    }, []);

    const createSession = async (name: string, phone: string, table: string) => {
        try {
            setIsLoading(true);

            const { data, error } = await supabase
                .from("customer_sessions")
                .insert({
                    customer_name: name,
                    phone_number: phone,
                    table_id: table,
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                const newSession: CustomerSession = {
                    id: data.id,
                    customerName: data.customer_name,
                    phoneNumber: data.phone_number,
                    tableId: data.table_id,
                    status: data.status,
                };
                setSession(newSession);
                localStorage.setItem("fortaleza-session-id", data.id);

                toast.success(`Bem-vindo, ${name}!`);
                setIsLoading(false);
                return true;
            }

            return false;
        } catch (error) {
            console.error("Error creating session:", error);
            toast.error("Erro ao iniciar sessão.");
            setIsLoading(false);
            return false;
        }
    };

    const exitSession = () => {
        setSession(null);
        localStorage.removeItem("fortaleza-session-id");
        window.location.reload();
    };

    return (
        <SessionContext.Provider value={{ session, isLoading, createSession, exitSession }}>
            {children}
        </SessionContext.Provider>
    );
};
