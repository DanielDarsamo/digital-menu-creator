import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const AdminButton = () => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate("/admin")}
            className={cn(
                "fixed top-6 right-6 z-50",
                "flex items-center justify-center",
                "w-12 h-12",
                "bg-secondary/80 backdrop-blur-sm hover:bg-secondary",
                "text-foreground",
                "rounded-full shadow-lg",
                "transition-all duration-300 hover:scale-110",
                "border border-border"
            )}
            aria-label="Painel Admin"
            title="Painel Admin"
        >
            <Settings className="w-5 h-5" />
        </button>
    );
};

export default AdminButton;
