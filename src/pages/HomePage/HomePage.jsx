import { useState, useEffect } from 'react';
import './HomePage.css';
import { useAuth } from '../../context/useAuth';
import TurnoCard from '../../components/TurnoCard/TurnoCard.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal.jsx';
import SolicitarTurnoModal from '../../components/SolicitarTurnoModal/SolicitarTurnoModal.jsx';
import AsignarHoraModal from '../../components/AsignarHoraModal/AsignarHoraModal.jsx';
import TurnoFilters from '../../components/TurnoFilters/TurnoFilters.jsx'; 
import { toast } from 'react-toastify';
import { db } from '../../firebase/config';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore'; 

const HomePage = () => {
    const { currentUser, userRole } = useAuth();

    const [turnos, setTurnos] = useState([]);
    const [clientes, setClientes] = useState([]); // Lista de clientes para el select del profesional
    const [loading, setLoading] = useState(true);

    // Estados para controlar la visibilidad de los modales
    const [showConfirmModal, setShowConfirmModal] = useState(false); // Para eliminar (profesional/admin)
    const [showSolicitarModal, setShowSolicitarModal] = useState(false); // Para solicitar turno (cliente)
    const [showAsignarHoraModal, setShowAsignarHoraModal] = useState(false); // Para asignar hora (profesional)
    const [showCancelModalCliente, setShowCancelModalCliente] = useState(false); // Para cancelar turno (cliente)

    // Estados para guardar el ID o el objeto del turno seleccionado para una acción
    const [turnoAEliminar, setTurnoAEliminar] = useState(null);
    const [turnoParaAsignar, setTurnoParaAsignar] = useState(null); // Objeto del turno para asignar hora
    const [turnoACancelarCliente, setTurnoACancelarCliente] = useState(null); // ID del turno que el cliente quiere cancelar
    const [currentFilter, setCurrentFilter] = useState('todos'); 

    const turnosCollectionRef = collection(db, 'turnos');

    // --- LÓGICA DE FUNCIONES ---

    // Función auxiliar para crear notificaciones internas (para la campana)
    const crearNotificacion = async (userId, mensaje) => {
        try {
            const notificacionesCollectionRef = collection(db, 'notifications');
            await addDoc(notificacionesCollectionRef, {
                userId: userId,
                mensaje: mensaje,
                leida: false,
                fecha: new Date(),
            });
        } catch (error) {
            console.error("Error al crear la notificación:", error);
        }
    };
    const fetchTurnos = async () => {
        if (!currentUser) return; 
        setLoading(true);
        try {
            let q;
            if (userRole === 'profesional' || userRole === 'administrador') {
                if (currentFilter === 'todos') {
                    q = query(turnosCollectionRef);
                } else {
                    q = query(turnosCollectionRef, where("estado", "==", currentFilter));
                }
            } else {
                // Si es cliente, trae solo sus propios turnos.
                q = query(turnosCollectionRef, where("pacienteId", "==", currentUser.uid));
            }
            const querySnapshot = await getDocs(q);
            const turnosData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTurnos(turnosData);
        } catch (error) {
            console.error("Error al cargar los turnos: ", error);
            toast.error("Error al cargar los turnos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentUser) return; // No ejecutar el efecto si no hay usuario

        const fetchClientes = async () => {
            const q = query(collection(db, "users"), where("role", "==", "cliente"));
            const querySnapshot = await getDocs(q);
            const clientesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setClientes(clientesList);
        };

        if (userRole === 'profesional' || userRole === 'administrador') {
            fetchClientes();
        }
        fetchTurnos();
    }, [currentUser, userRole, currentFilter]); 

    const agregarTurno = async (nuevoTurnoData) => {
        try {
            await addDoc(turnosCollectionRef, { ...nuevoTurnoData, fechaCreacion: serverTimestamp() }); 
            toast.success("¡Turno agregado con éxito!");
            fetchTurnos(); 
        } catch (error) {
            console.error("Error al agregar el turno: ", error);
            toast.error("Error al agregar el turno.");
        }
    };

    const handleSolicitarTurno = async (motivo) => {
        if (!currentUser) return;
        const nuevaSolicitud = {
            pacienteId: currentUser.uid,
            pacienteNombre: currentUser.displayName,
            hora: 'Por confirmar', 
            fecha: null, 
            motivo: motivo,
            estado: 'solicitado', 
            fechaCreacion: serverTimestamp(), 
        };
        try {
            const idProfesional = "jr8iWiA5EoPVu5QHwZXdjV2HOeD2";
            await addDoc(turnosCollectionRef, nuevaSolicitud);
            await crearNotificacion(idProfesional, `Nueva solicitud de ${currentUser.displayName}.`);
            toast.success("Tu solicitud de turno ha sido enviada.");
            fetchTurnos(); // Recargar la lista para que el cliente vea su solicitud
        } catch (error) {
            toast.error("Hubo un error al enviar tu solicitud.");
        }
    };

    // Función usada por profesionales para Confirmar/Cancelar, y ahora por el cliente para Cancelar
    const actualizarEstadoTurno = async (idTurno, nuevoEstado) => {
        const turnoDocRef = doc(db, 'turnos', idTurno);
        try {
            await updateDoc(turnoDocRef, { estado: nuevoEstado });
            setTurnos(prev => prev.map(t => t.id === idTurno ? { ...t, estado: nuevoEstado } : t));

            if (nuevoEstado.toLowerCase() === 'cancelado') {
                const turnoAfectado = turnos.find(t => t.id === idTurno);
                if (turnoAfectado) {
                    // Notificación para la CAMPANA
                    await crearNotificacion(turnoAfectado.pacienteId, `Tu turno del día ${turnoAfectado.fecha || 'por confirmar'} fue cancelado.`);
                }
            }
            toast.info(`Turno actualizado a "${nuevoEstado}"`);
        } catch (error) {
            console.error("Error al actualizar el estado: ", error);
            toast.error("Error al actualizar el estado.");
        }
    };

    // Función para eliminar un turno (usada por profesional/admin)
    const eliminarTurno = async (idToDelete) => {
        if (!idToDelete) {
            toast.error("Error: No se ha seleccionado ningún turno para eliminar.");
            handleCloseConfirmModal(); 
            return;
        }

        try {
            const turnoDocRef = doc(db, 'turnos', idToDelete); // Referencia al documento en Firestore
            await deleteDoc(turnoDocRef); // Eliminar el documento

            // Actualizar el estado local para que el turno desaparezca de la UI
            setTurnos(prevTurnos => prevTurnos.filter(turno => turno.id !== idToDelete));

            toast.warn("El turno ha sido eliminado.");
        } catch (error) {
            console.error("Error al eliminar el turno: ", error);
            toast.error("Ocurrió un error al eliminar el turno.");
        } finally {
            handleCloseConfirmModal(); 
        }
    };

    // --- FUNCIONES PARA MANEJAR MODALES (ABRIR/CERRAR) ---

    // Modal para Eliminar (profesional/admin)
    const handleShowConfirmModal = (id) => {
        setTurnoAEliminar(id);
        setShowConfirmModal(true);
    };
    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
        setTurnoAEliminar(null);
    };

    // Modal para Solicitar Turno (cliente)
    const handleCloseSolicitarModal = () => {
        setShowSolicitarModal(false);
    };

    // Modal para Asignar Hora (profesional/admin)
    const handleShowAsignarHoraModal = (turno) => {
        setTurnoParaAsignar(turno); // Guardar el objeto completo del turno
        setShowAsignarHoraModal(true);
    };
    const handleCloseAsignarHoraModal = () => {
        setShowAsignarHoraModal(false);
        setTurnoParaAsignar(null);
    };
    const handleConfirmarTurno = async ({ fecha, hora, duracion }) => { // Recibe la fecha, hora y duración del modal
        if (!turnoParaAsignar) return;
        const turnoDocRef = doc(db, 'turnos', turnoParaAsignar.id);
        try {
            await updateDoc(turnoDocRef, {
                fecha: fecha,
                hora: hora,
                duracion: duracion, // Guardar la duración
                estado: 'Confirmado'
            });
            // Notificar al cliente que su turno fue confirmado
            await crearNotificacion(turnoParaAsignar.pacienteId, `Tu turno para "${turnoParaAsignar.motivo}" fue confirmado para el ${fecha} a las ${hora}.`);
            toast.success("Turno confirmado y agendado con éxito.");
            fetchTurnos(); // Recargar la lista para ver el cambio
        } catch (error) {
            toast.error("Error al confirmar el turno.");
        } finally {
            handleCloseAsignarHoraModal();
        }
    };

    // --- FUNCIONES PARA CANCELACIÓN DE TURNO POR EL CLIENTE ---
    // Abre el modal de confirmación de cancelación para el cliente
    const handleShowCancelModalCliente = (idTurno) => {
        setTurnoACancelarCliente(idTurno); // Guarda el ID del turno que el cliente quiere cancelar
        setShowCancelModalCliente(true); // Muestra el modal de confirmación
    };

    // Cierra el modal de cancelación del cliente
    const handleCloseCancelModalCliente = () => {
        setShowCancelModalCliente(false);
        setTurnoACancelarCliente(null);
    };

    // Se ejecuta cuando el cliente CONFIRMA la cancelación en el modal
    const handleConfirmCancelCliente = () => {
        if (turnoACancelarCliente) {
            actualizarEstadoTurno(turnoACancelarCliente, 'Cancelado'); // Llama a la función genérica de actualización
        }
        handleCloseCancelModalCliente(); // Siempre cierra el modal al finalizar
    };

    // --- FUNCIÓN PARA MANEJAR EL CLIC EN SOLICITUD PENDIENTE (PROFESIONAL/ADMIN) ---
    const handleSelectPendingRequest = (request) => {
        // Al hacer clic en una solicitud pendiente en el panel, abrimos directamente el modal para asignarle hora
        handleShowAsignarHoraModal(request);
    };

    return (
        <>
            <div className="home-page-container">
                {/* Renderizado condicional del botón de solicitud para clientes */}
                {userRole === 'cliente' && (
                    <div className="text-center mb-4">
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => setShowSolicitarModal(true)}
                        >
                            + Solicitar Nuevo Turno
                        </button>
                    </div>
                )}

                <div className="row">
                    {/* Renderizado condicional del panel de filtros para profesionales/administradores */}
                    {(userRole === 'profesional' || userRole === 'administrador') && (
                        <div className="col-lg-4 mb-4">
                            <TurnoFilters currentFilter={currentFilter} onFilterChange={setCurrentFilter} />
                        </div>
                    )}

                    {/* Columna principal para la lista de turnos, ajusta el ancho según el rol */}
                    <div className={(userRole === 'profesional' || userRole === 'administrador') ? "col-lg-8" : "col-12"}>
                        <h2>{userRole === 'cliente' ? 'Mis Turnos' : 'Agenda de Turnos'}</h2>
                        {loading ? <Loader /> : ( // Muestra loader mientras carga
                            <div className="turnos-list">
                                {turnos.length > 0 ? (
                                    turnos.map((turno) => (
                                        <TurnoCard
                                            key={turno.id}
                                            turno={turno}
                                            userRole={userRole}
                                            onShowConfirmModal={handleShowConfirmModal} // Profesional/Admin: para eliminar
                                            onActualizarEstado={actualizarEstadoTurno} // Profesional/Admin: para confirmar/cancelar
                                            onAsignarHora={handleShowAsignarHoraModal} // Profesional/Admin: para asignar hora a solicitud
                                            onClienteCancela={handleShowCancelModalCliente} // CLIENTE: para cancelar su turno
                                        />
                                    ))
                                ) : (
                                    <div className="alert alert-light text-center" role="alert">
                                        {userRole === 'cliente' ? 'Aún no tienes turnos. ¡Solicita uno!' : 'No hay turnos agendados.'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 1. MODAL PARA ELIMINAR TURNO (USADO POR PROFESIONAL/ADMIN) */}
            <ConfirmModal
                show={showConfirmModal}
                onHide={handleCloseConfirmModal}
                onConfirm={() => eliminarTurno(turnoAEliminar)}
                title="Confirmar Eliminación"
                body="¿Estás completamente seguro de que quieres eliminar este turno? Esta acción no se puede deshacer."
            />

            {/* 2. MODAL PARA SOLICITAR TURNO (USADO POR CLIENTE) */}
            <SolicitarTurnoModal
                show={showSolicitarModal}
                onHide={handleCloseSolicitarModal}
                onSolicitar={handleSolicitarTurno}
            />

            {/* 3. MODAL PARA ASIGNAR HORA (USADO POR PROFESIONAL/ADMIN) */}
            <AsignarHoraModal
                show={showAsignarHoraModal}
                onHide={handleCloseAsignarHoraModal}
                onConfirm={handleConfirmarTurno} // Esta función recibe {fecha, hora, duracion}
            />

            {/* 4. MODAL PARA CANCELAR TURNO (USADO POR CLIENTE) */}
            <ConfirmModal
                show={showCancelModalCliente}
                onHide={handleCloseCancelModalCliente}
                onConfirm={handleConfirmCancelCliente}
                title="Confirmar Cancelación"
                body="¿Estás seguro de que quieres cancelar este turno? Esta acción no se puede deshacer."
            />
        </>
    );
};

export default HomePage;