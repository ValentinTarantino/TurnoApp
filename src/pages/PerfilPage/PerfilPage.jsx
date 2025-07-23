import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { supabase } from '../../firebase/config';
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
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();
                if (error) throw error;
                setUserData(data);
            } catch (error) {
                console.error("Error al cargar datos de usuario:", error);
                toast.error("Error al cargar los datos de tu perfil.");
            }
        };

        const fetchHistorial = async () => {
            try {
                const { data, error } = await supabase
                    .from('turnos')
                    .select('*')
                    .eq('paciente_id', currentUser.id);
                if (error) throw error;
                setHistorialTurnos(data || []);
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
            const { error } = await supabase
                .from('users')
                .update({
                    especialidad: formData.especialidad,
                    horarios: formData.horarios,
                })
                .eq('id', currentUser.id);
            if (error) throw error;
            toast.success("Perfil actualizado con éxito.");
            setUserData({ ...userData, ...formData });
            setIsEditing(false);
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
                                {userData.foto_url ? (
                                    <img
                                        src={userData.foto_url}
                                        alt={`Foto de perfil de ${currentUser.displayName || currentUser.email}`}
                                        className="rounded-circle"
                                        style={{ width: '150px', height: '150px', objectFit: 'cover', border: '4px solid #fff' }}
                                    />
                                ) : (
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || currentUser.email)}&background=random&color=fff&size=150`}
                                        alt="Avatar de usuario"
                                        className="rounded-circle"
                                        style={{ width: '150px', height: '150px', objectFit: 'cover', border: '4px solid #fff' }}
                                    />
                                )}
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