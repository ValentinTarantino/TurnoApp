import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/useAuth';
import { supabase } from '../../firebase/config';
import './Notifications.css';
import moment from 'moment'; 

const Notifications = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const intervalRef = useRef(null);

    const fetchNotifications = async () => {
        if (!currentUser) {
            setNotifications([]);
            return;
        }
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', currentUser.id);
            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error("Error al cargar notificaciones:", error);
        }
    };

    // Solo refresca si la campana está cerrada
    const startInterval = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (!isOpen) fetchNotifications();
        }, 10000);
    };

    useEffect(() => {
        if (currentUser) {
            fetchNotifications();
            startInterval();
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [currentUser]);

    const handleToggle = async () => {
        const nextIsOpen = !isOpen;

        if (nextIsOpen) {
            if (intervalRef.current) clearInterval(intervalRef.current); // Detener refresco automático
            const unreadIds = notifications.filter(n => !n.leida).map(n => n.id);
            if (unreadIds.length > 0) {
                // LOG para ver los ids que se intentan actualizar
                console.log('Intentando marcar como leídas:', unreadIds);
                const { data, error } = await supabase
                    .from('notifications')
                    .update({ leida: true })
                    .in('id', unreadIds);
                if (error) {
                    console.error('Error actualizando notificaciones:', error);
                } else {
                    console.log('Resultado update:', data);
                }
                await fetchNotifications();
            }
        } else {
            startInterval(); // Reanudar refresco automático al cerrar la campana
            fetchNotifications(); // Refresca al cerrar para traer nuevas notis si hay
        }
        setIsOpen(nextIsOpen);
    };

    const unreadCount = notifications.filter(n => !n.leida).length;

    return (
        <div className="nav-item dropdown">
            <button className="btn btn-link nav-link position-relative" onClick={handleToggle} aria-expanded={isOpen}>
                <i className="bi bi-bell-fill fs-5"></i>
                {!isOpen && unreadCount > 0 && (
                    <span className="notification-dot bg-danger border border-light">
                        <span className="visually-hidden">notificaciones sin leer</span>
                    </span>
                )}
            </button>

            <ul className={`dropdown-menu dropdown-menu-lg-end shadow-lg border-0 ${isOpen ? 'show' : ''}`}>
                <li className="dropdown-header">Notificaciones</li>
                <li><hr className="dropdown-divider" /></li>
                <div className="notifications-list">
                    {notifications.length > 0 ? (
                        notifications.map(noti => (
                            <li key={noti.id}>
                                <a className={`dropdown-item ${!noti.leida ? 'unread' : ''}`} href="#">
                                    <p className="mb-0">{noti.mensaje}</p>
                                    <small className="text-muted">{moment(noti.fecha).toLocaleString()}</small>
                                </a>
                            </li>
                        ))
                    ) : (
                        <li><p className="dropdown-item-text text-muted text-center">No tienes notificaciones.</p></li>
                    )}
                </div>
            </ul>
        </div>
    );
};

export default Notifications;