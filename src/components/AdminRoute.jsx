import { useAuth } from '../context/useAuth';
import { Navigate } from 'react-router-dom';
import Loader from './Loader/Loader';

const AdminRoute = ({ children }) => {
    const { currentUser, userRole, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }
    if (!currentUser || userRole !== 'administrador') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;