import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './NavBar.css';
import { useAuth } from '../../context/useAuth';
import { supabase } from '../../firebase/config';
import { toast } from 'react-toastify';
import Notifications from '../Notifications/Notifications';

const Navbar = () => {
    const { currentUser, userRole, theme, toggleTheme } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            toast.info("Has cerrado sesión.");
            navigate('/login');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            toast.error("Error al cerrar sesión.");
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    TurnosApp
                </Link>

                <div className="d-flex align-items-center d-lg-none ms-auto">
                    {currentUser && <Notifications />}
                    <button
                        className="btn btn-link nav-link mx-2 p-0"
                        onClick={toggleTheme}
                        title="Cambiar tema"
                    >
                        <i className={`bi ${theme === 'light' ? 'bi-moon-fill' : 'bi-sun-fill'} fs-5 text-white`}></i>
                    </button>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNav"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>

                <div className="collapse navbar-collapse" id="navbarNav">
                    {currentUser ? (
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center text-center text-lg-start">
                            <li className="nav-item me-3 d-none d-lg-block">
                                <button
                                    className="btn btn-link nav-link"
                                    onClick={toggleTheme}
                                    title="Cambiar tema"
                                >
                                    <i className={`bi ${theme === 'light' ? 'bi-moon-fill' : 'bi-sun-fill'} fs-5`}></i>
                                </button>
                            </li>
                            <li className="nav-item d-none d-lg-block">
                                <Notifications />
                            </li>
                            <li className="nav-item">
                                <span className="navbar-text me-3 d-block py-2">
                                    Hola, {currentUser.user_metadata.full_name || currentUser.email}
                                </span>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/">Inicio</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/agenda">Mi Agenda</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/perfil">Perfil</NavLink>
                            </li>
                            {userRole === 'administrador' && (
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/admin">Admin</NavLink>
                                </li>
                            )}
                            <li className="nav-item mt-2 mt-lg-0">
                                <button className="btn btn-outline-light btn-sm w-100 w-lg-auto" onClick={handleLogout}>
                                    Cerrar Sesión
                                </button>
                            </li>
                        </ul>
                    ) : (
                        <ul className="navbar-nav ms-auto text-center text-lg-start">
                            <li className="nav-item me-3 d-none d-lg-block">
                                <button
                                    className="btn btn-link nav-link"
                                    onClick={toggleTheme}
                                    title="Cambiar tema"
                                >
                                    <i className={`bi ${theme === 'light' ? 'bi-moon-fill' : 'bi-sun-fill'} fs-5`}></i>
                                </button>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/login">Login</NavLink>
                            </li>
                        </ul>
                    )}
                </div>

            </div>
        </nav>
    );
};

export default Navbar;