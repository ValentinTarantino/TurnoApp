import React from 'react';
import { supabase } from '../../firebase/config';
import './LoginPage.css';
import { toast } from 'react-toastify';

const LoginPage = () => {
    const handleGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            console.error('Error al iniciar sesión con Google:', error);
            toast.error("Hubo un error al intentar iniciar sesión con Google.");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card text-center">
                <h2>Bienvenido a TurnosApp</h2>
                <p className="lead text-muted">La forma más fácil de gestionar tus turnos.</p>
                <hr />
                <button
                    className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleGoogleSignIn}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
                        <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
                    </svg>
                    Iniciar sesión con Google
                </button>
            </div>
        </div>
    );
};

export default LoginPage;