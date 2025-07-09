import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import './Notifications.css';

const Notifications = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, "notifications"),
            where("userId", "==", currentUser.uid),
            orderBy("fecha", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const notis = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotifications(notis);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const handleToggle = async () => {
        const nextIsOpen = !isOpen;
        setIsOpen(nextIsOpen);

        const unreadNotis = notifications.filter(n => !n.leida);
        if (nextIsOpen && unreadNotis.length > 0) {
            const updatePromises = unreadNotis.map(noti => {
                const notiRef = doc(db, "notifications", noti.id);
                return updateDoc(notiRef, { leida: true });
            });
            await Promise.all(updatePromises); 
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
                                    <small className="text-muted">{new Date(noti.fecha.toDate()).toLocaleString()}</small>
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