import { useAuth } from '../context/useAuth';
import { Navigate } from 'react-router-dom';

// Este componente es el opuesto a ProtectedRoute.
// Es para rutas que solo deben ser visibles para usuarios NO logueados.
const GuestRoute = ({ children }) => {
    const { currentUser } = useAuth();

    // Si hay un usuario logueado, lo redirigimos a la página de inicio.
    if (currentUser) {
        return <Navigate to="/" replace />;
    }

    // Si NO hay un usuario, renderizamos el componente hijo (LoginPage o RegisterPage).
    return children;
};

export default GuestRoute;