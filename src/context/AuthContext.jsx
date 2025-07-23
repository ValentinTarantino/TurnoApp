import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../firebase/config';
import Loader from '../components/Loader/Loader';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

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

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        let ignore = false;

        const getSessionAndProfile = async () => {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user || null;
            setCurrentUser(user);

            if (user) {
                let { data: profiles, error } = await supabase
                    .from('users')
                    .select('role, foto_url')
                    .eq('id', user.id);

                const profile = profiles && profiles.length > 0 ? profiles[0] : null;

                if (!profile) {
                    await supabase
                        .from('users')
                        .insert([{
                            id: user.id,
                            email: user.email,
                            nombre: user.user_metadata.full_name || user.user_metadata.name || user.email,
                            role: 'cliente',
                            foto_url: user.user_metadata.avatar_url || user.user_metadata.picture || null
                        }]);
                    setUserRole('cliente');
                } else {
                    setUserRole(profile.role);
                    if (!profile.foto_url && (user.user_metadata.avatar_url || user.user_metadata.picture)) {
                        await supabase
                            .from('users')
                            .update({ foto_url: user.user_metadata.avatar_url || user.user_metadata.picture })
                            .eq('id', user.id);
                    }
                }
            } else {
                setUserRole(null);
                setCurrentUser(null);
            }
            setLoading(false);
        };

        getSessionAndProfile();

        // Listener para cambios de sesión
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (ignore) return;
            setCurrentUser(session?.user || null);
            getSessionAndProfile();
        });

        return () => {
            ignore = true;
            if (subscription) subscription.unsubscribe();
        };
    }, []);

    // Logout robusto
    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setUserRole(null);
        toast.info('Sesión cerrada');
    };

    const value = {
        currentUser,
        userRole,
        loading,
        logout,
        theme,
        toggleTheme,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <Loader /> : children}
        </AuthContext.Provider>
    );
};