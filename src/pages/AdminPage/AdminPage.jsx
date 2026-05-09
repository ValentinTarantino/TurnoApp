import React, { useState, useEffect } from 'react';
import { supabase } from '../../firebase/config';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader/Loader.jsx';

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data: usersData, error } = await supabase.from('users').select('*');
            if (error) throw error;
            setUsers(usersData);
        } catch (error) {
            toast.error("Error al cargar los usuarios.");
            console.error("Error al cargar usuarios desde Supabase:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChangeRole = async (userId, newRole) => {
        try {
            const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
            if (error) throw error;
            toast.success("Rol de usuario actualizado con éxito.");
            setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
        } catch (error) {
            toast.error("Error al actualizar el rol.");
            console.error("Error al actualizar el rol en Supabase:", error);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="container mt-4">
            <h2>Panel de Administración de Usuarios</h2>
            <div className="table-responsive">
                <table className="table table-striped table-hover mt-4">
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
                                <td>{user.nombre || 'N/A'}</td>
                                <td>
                                    <span className={`badge ${user.role === 'administrador' ? 'bg-danger' : user.role === 'profesional' ? 'bg-primary' : 'bg-secondary'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    {user.role !== 'profesional' && (
                                        <button className="btn btn-sm btn-primary me-2" onClick={() => handleChangeRole(user.id, 'profesional')}>Hacer Profesional</button>
                                    )}
                                    {user.role !== 'cliente' && (
                                        <button className="btn btn-sm btn-secondary" onClick={() => handleChangeRole(user.id, 'cliente')}>Hacer Cliente</button>
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