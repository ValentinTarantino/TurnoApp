import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import './Notifications.css';
import moment from 'moment'; 

const Notifications = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        if (!currentUser) {
            setNotifications([]);
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/notifications/${currentUser.uid}`);
            if (!response.ok) throw new Error('Error al cargar notificaciones desde el backend');
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error("Error al cargar notificaciones:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 10000); 
        return () => clearInterval(intervalId);
    }, [currentUser]);

    const handleToggle = async () => {
        const nextIsOpen = !isOpen;
        setIsOpen(nextIsOpen);

        if (nextIsOpen && notifications.filter(n => !n.leida).length > 0) {
            const unreadNotis = notifications.filter(n => !n.leida);
            for (const noti of unreadNotis) {
                try {
                    const response = await fetch(`http://localhost:5000/api/notifications/${noti.id}/read`, {
                        method: 'PUT',
                    });
                    if (!response.ok) throw new Error('Error al marcar como leída en backend');
                } catch (error) {
                    console.error(`Error marcando notificación ${noti.id} como leída:`, error);
                }
            }
            setNotifications(prevNotis => prevNotis.map(noti => ({ ...noti, leida: true })));
        }
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