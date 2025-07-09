import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Loader from '../components/Loader/Loader';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(() => {
        // Leer el tema guardado de localStorage o usar 'light' por defecto
        const savedTheme = localStorage.getItem('app-theme');
        return savedTheme || 'light';
    });

    useEffect(() => {
        document.body.className = theme === 'dark' ? 'dark-mode' : '';
        localStorage.setItem('app-theme', theme);
    }, [theme]); // Se ejecuta cada vez que 'theme' cambia

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    setCurrentUser(user);
                    setUserRole(userDoc.data().role);
                } else {
                    const newUser = {
                        email: user.email,
                        nombre: user.displayName,
                        role: 'cliente'
                    };
                    await setDoc(userDocRef, newUser);
                    setCurrentUser(user);
                    setUserRole('cliente');
                    toast.info("¡Bienvenido! Tu cuenta ha sido creada.");
                }
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Función para cambiar el tema
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const value = {
        currentUser,
        userRole,
        loading,
        theme, // Exportar el tema
        toggleTheme, // Exportar la función para cambiar el tema
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <Loader /> : children}
        </AuthContext.Provider>
    );
};