import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader/Loader';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const usersList = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersList);
        } catch (error) {
            toast.error("Error al cargar los usuarios.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChangeRole = async (userId, newRole) => {
        const userDocRef = doc(db, 'users', userId);
        try {
            await updateDoc(userDocRef, { role: newRole });
            toast.success("Rol de usuario actualizado con éxito.");
            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: newRole } : user
            ));
        } catch (error) {
            toast.error("Error al actualizar el rol.");
            console.error(error);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <h2>Panel de Administración de Usuarios</h2>
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Nombre</th>
                            <th>Rol Actual</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.email}</td>
                                <td>{user.displayName || 'N/A'}</td>
                                <td>
                                    <span className={`badge bg-${user.role === 'administrador' ? 'danger' : user.role === 'profesional' ? 'primary' : 'secondary'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    {user.role !== 'profesional' && (
                                        <button className="btn btn-sm btn-primary me-2" onClick={() => handleChangeRole(user.id, 'profesional')}>
                                            Hacer Profesional
                                        </button>
                                    )}
                                    {user.role !== 'cliente' && (
                                        <button className="btn btn-sm btn-secondary" onClick={() => handleChangeRole(user.id, 'cliente')}>
                                            Hacer Cliente
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPage;