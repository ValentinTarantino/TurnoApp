import { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import Loader from '../../components/Loader/Loader';
import ProfileForm from '../../components/ProfileForm/ProfileForm'; 
import { db } from '../../firebase/config';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';

const PerfilPage = () => {
    const { currentUser, userRole, loading: authLoading } = useAuth(); 

    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState(null);
    const [historialTurnos, setHistorialTurnos] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true); // Estado de carga específico del perfil

    // Efecto para buscar todos los datos necesarios cuando el usuario cambia
    useEffect(() => {
        if (currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);

            // Función para buscar los datos del perfil desde el documento 'users'
            const fetchUserData = async () => {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserData(userDoc.data());
                }
            };

            // Función para buscar el historial de turnos si el usuario es un cliente
            const fetchHistorial = async () => {
                const q = query(collection(db, 'turnos'), where("pacienteId", "==", currentUser.uid));
                const querySnapshot = await getDocs(q);
                const turnos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Ordenamos los turnos por fecha, los más recientes primero
                turnos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setHistorialTurnos(turnos);
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
        }
    }, [currentUser, userRole]);

    // Función para guardar los datos del formulario de perfil
    const handleSaveProfile = async (formData) => {
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
            await updateDoc(userDocRef, formData);
            setUserData(prev => ({ ...prev, ...formData }));
            setIsEditing(false);
            toast.success("Perfil actualizado con éxito.");
        } catch (error) {
            toast.error("Error al actualizar el perfil.");
        }
    };

    // Mientras se carga la autenticación o los datos del perfil, mostramos un Loader
    if (authLoading || loadingProfile) return <Loader />;

    // Si no se encuentra el usuario, mostramos un mensaje
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
                                    src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}&background=random`}
                                    alt="Foto de perfil"
                                    className="rounded-circle"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover', border: '4px solid #fff' }}
                                />
                            </div>

                            <ul className="list-group list-group-flush mb-4">
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <strong>Nombre:</strong>
                                    <span>{currentUser.displayName}</span>
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

                            {/* SECCIÓN CONDICIONAL POR ROL */}

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
                                                        <small className="text-muted">{turno.fecha ? new Date(turno.fecha + 'T00:00:00').toLocaleDateString() : 'Sin fecha'}</small>
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