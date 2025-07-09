import { useContext } from "react";
import { AuthContext } from "./AuthContext"; 

// Este es el hook personalizado que usarán los componentes.
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }

    return context;
};
