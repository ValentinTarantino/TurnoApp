import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import Loader from '../../components/Loader/Loader';
import ProfileForm from '../../components/ProfileForm/ProfileForm';
import { toast } from 'react-toastify';
import moment from 'moment';

const PerfilPage = () => {
    const { currentUser, userRole, loading: authLoading } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState(null);
    const [historialTurnos, setHistorialTurnos] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/users/${currentUser.uid}`);
                if (!response.ok) throw new Error('Error al cargar datos de usuario desde el backend');
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error("Error al cargar datos de usuario:", error);
                toast.error("Error al cargar los datos de tu perfil.");
            }
        };

        const fetchHistorial = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/turnos?paciente_id=${currentUser.uid}`);
                if (!response.ok) throw new Error('Error al cargar historial de turnos desde el backend');
                const data = await response.json();
                setHistorialTurnos(data);
            } catch (error) {
                console.error("Error al cargar historial de turnos:", error);
                toast.error("Error al cargar tu historial de turnos.");
            }
        };

        const loadData = async () => {
            setLoadingProfile(true);
            await fetchUserData();
            if (userRole === 'cliente') {
                await fetchHistorial();
            }
            setLoadingProfile(false);
        };

        loadData();
    }, [currentUser, userRole]);

    const handleSaveProfile = async (formData) => {
        try {
            const response = await fetch(`http://localhost:5000/api/users/${currentUser.uid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Error al actualizar perfil en el backend');
            const updatedData = await response.json();
            setUserData(updatedData);
            setIsEditing(false);
            toast.success("Perfil actualizado con éxito.");
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            toast.error("Error al actualizar el perfil.");
        }
    };

    if (authLoading || loadingProfile) return <Loader />;

    if (!currentUser || !userData) {
        return <p className="text-center mt-5">No se pudo cargar la información del usuario.</p>;
    }

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h2>Mi Perfil</h2>
                            {(userRole === 'profesional' || userRole === 'administrador') && !isEditing && (
                                <button className="btn btn-light btn-sm" onClick={() => setIsEditing(true)}>
                                    Editar Perfil
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            <div className="text-center mb-4">
                                <img
                                    src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || currentUser.email)}&background=random&color=fff&size=150`}
                                    alt={`Foto de perfil de ${currentUser.displayName || currentUser.email}`}
                                    className="rounded-circle"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover', border: '4px solid #fff' }}
                                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || currentUser.email)}&background=random&color=fff&size=150`; e.target.alt = "Avatar de usuario"; }}
                                />
                            </div>

                            <ul className="list-group list-group-flush mb-4">
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <strong>Nombre:</strong>
                                    <span>{currentUser.displayName || userData.nombre || currentUser.email}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <strong>Correo Electrónico:</strong>
                                    <span>{currentUser.email}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <strong>Rol:</strong>
                                    <span className="badge bg-success fs-6">{capitalize(userRole)}</span>
                                </li>
                            </ul>

                            <hr />

                            {(userRole === 'profesional' || userRole === 'administrador') && (
                                <div className="mt-4">
                                    <h4>Información Profesional</h4>
                                    {isEditing ? (
                                        <ProfileForm user={userData} onSave={handleSaveProfile} />
                                    ) : (
                                        <>
                                            <ul className="list-group list-group-flush">
                                                <li className="list-group-item">
                                                    <strong>Especialidad:</strong> {userData.especialidad || <span className="text-muted">No especificada</span>}
                                                </li>
                                                <li className="list-group-item">
                                                    <strong>Horarios:</strong> {userData.horarios || <span className="text-muted">No especificados</span>}
                                                </li>
                                            </ul>
                                            {isEditing &&
                                                <button className="btn btn-secondary mt-3" onClick={() => setIsEditing(false)}>Cancelar</button>
                                            }
                                        </>
                                    )}
                                </div>
                            )}

                            {userRole === 'cliente' && (
                                <div className="mt-4">
                                    <h4>Historial de Turnos</h4>
                                    <div className="list-group">
                                        {historialTurnos.length > 0 ? (
                                            historialTurnos.map(turno => (
                                                <div key={turno.id} className="list-group-item list-group-item-action flex-column align-items-start">
                                                    <div className="d-flex w-100 justify-content-between">
                                                        <h5 className="mb-1">{turno.motivo}</h5>
                                                        <small className="text-muted">{turno.fecha ? moment(turno.fecha).format('DD/MM/YYYY') : 'Sin fecha'}</small>
                                                    </div>
                                                    <p className="mb-1">Hora: {turno.hora}</p>
                                                    <small>Estado: <strong>{capitalize(turno.estado)}</strong></small>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted">No tienes un historial de turnos.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilPage;