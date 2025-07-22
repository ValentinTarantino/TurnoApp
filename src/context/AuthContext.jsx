import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import Loader from '../components/Loader/Loader';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('app-theme');
        return savedTheme || 'light';
    });

    useEffect(() => {
        document.body.className = theme === 'dark' ? 'dark-mode' : '';
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${user.uid}`);
                    if (!response.ok) {
                        if (response.status === 404) {
                            const createUserResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    id: user.uid,
                                    email: user.email,
                                    nombre: user.displayName,
                                    role: 'cliente'
                                })
                            });
                            const newUser = await createUserResponse.json();
                            setCurrentUser(user);
                            setUserRole(newUser.role);
                            toast.info("¡Bienvenido! Tu cuenta ha sido creada.");
                        } else {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                    } else {
                        const userData = await response.json();
                        setCurrentUser(user);
                        setUserRole(userData.role);
                    }
                } catch (error) {
                    console.error("Error al obtener o crear usuario en el backend:", error);
                    toast.error("Error al cargar datos de usuario.");
                    setCurrentUser(null);
                    setUserRole(null);
                }
            } else {
                setCurrentUser(null);
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const value = {
        currentUser,
        userRole,
        loading,
        theme,
        toggleTheme,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <Loader /> : children}
        </AuthContext.Provider>
    );
};