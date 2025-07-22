import { useState, useEffect } from 'react';
import './HomePage.css';
import { useAuth } from '../../context/useAuth';

import TurnoCard from '../../components/TurnoCard/TurnoCard.jsx';
import FormularioTurno from '../../components/FormularioTurno/FormularioTurno.jsx';
import Loader from '../../components/Loader/Loader.jsx';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal.jsx';
import SolicitarTurnoModal from '../../components/SolicitarTurnoModal/SolicitarTurnoModal.jsx';
import AsignarHoraModal from '../../components/AsignarHoraModal/AsignarHoraModal.jsx';
import TurnoFilters from '../../components/TurnoFilters/TurnoFilters.jsx';
import { toast } from 'react-toastify';

const HomePage = () => {
    const { currentUser, userRole } = useAuth();

    const [turnos, setTurnos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSolicitarModal, setShowSolicitarModal] = useState(false);
    const [showAsignarHoraModal, setShowAsignarHoraModal] = useState(false);
    const [showCancelModalCliente, setShowCancelModalCliente] = useState(false);

    const [turnoAEliminar, setTurnoAEliminar] = useState(null);
    const [turnoParaAsignar, setTurnoParaAsignar] = useState(null);
    const [turnoACancelarCliente, setTurnoACancelarCliente] = useState(null);

    const [currentFilter, setCurrentFilter] = useState('todos');

    const crearNotificacion = async (userId, mensaje) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, mensaje })
            });
            if (!response.ok) throw new Error('Error al crear notificación en el backend');
            console.log(`Notificación enviada a backend para ${userId}: ${mensaje}`);
        } catch (error) {
            console.error("Error al crear la notificación:", error);
        }
    };

    const fetchTurnos = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            let url = `${import.meta.env.VITE_API_BASE_URL}/api/turnos`;
            const params = new URLSearchParams();

            if (userRole === 'profesional' || userRole === 'administrador') {
                if (currentFilter !== 'todos') {
                    params.append('estado', currentFilter);
                }
            } else {
                params.append('paciente_id', currentUser.uid);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al cargar turnos desde el backend');
            const data = await response.json();
            setTurnos(data);
        } catch (error) {
            console.error("Error al cargar los turnos:", error);
            toast.error("Error al cargar los turnos desde el backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentUser) return;

        const fetchClientes = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/clients`);
                if (!response.ok) throw new Error('Error al cargar clientes desde el backend');
                const data = await response.json();
                setClientes(data);
            } catch (error) {
                console.error("Error al cargar clientes:", error);
                toast.error("Error al cargar la lista de clientes.");
            }
        };

        if (userRole === 'profesional' || userRole === 'administrador') {
            fetchClientes();
        }
        fetchTurnos();
    }, [currentUser, userRole, currentFilter]);

    const agregarTurno = async (nuevoTurnoData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/turnos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paciente_id: nuevoTurnoData.pacienteId,
                    paciente_nombre: nuevoTurnoData.pacienteNombre,
                    profesional_id: currentUser.uid,
                    fecha: null,
                    hora: nuevoTurnoData.hora,
                    duracion: nuevoTurnoData.duracion,
                    motivo: nuevoTurnoData.motivo,
                    estado: 'Pendiente'
                })
            });
            if (!response.ok) throw new Error('Error al agregar turno en el backend');
            const newTurno = await response.json();
            toast.success("¡Turno agregado con éxito!");
            fetchTurnos();
        } catch (error) {
            console.error("Error al agregar el turno:", error);
            toast.error("Error al agregar el turno.");
        }
    };

    const handleSolicitarTurno = async (motivo) => {
        if (!currentUser) return;
        const nuevaSolicitud = {
            paciente_id: currentUser.uid,
            paciente_nombre: currentUser.displayName,
            profesional_id: "jr8iWiA5EoPVu5QHwZXdjV2HOeD2",
            hora: null,
            fecha: null,
            motivo: motivo,
            estado: 'solicitado',
        };
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/turnos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevaSolicitud)
            });
            if (!response.ok) throw new Error('Error al enviar solicitud en el backend');
            const newRequest = await response.json();
            await crearNotificacion(newRequest.profesional_id, `Nueva solicitud de ${newRequest.paciente_nombre}.`);
            toast.success("Tu solicitud de turno ha sido enviada.");
            fetchTurnos();
        } catch (error) {
            console.error("Error al enviar solicitud:", error);
            toast.error("Hubo un error al enviar tu solicitud.");
        }
    };

    const actualizarEstadoTurno = async (idTurno, nuevoEstado) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/turnos/${idTurno}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (!response.ok) throw new Error('Error al actualizar estado en el backend');
            const updatedTurno = await response.json();
            setTurnos(prev => prev.map(t => t.id === idTurno ? { ...t, estado: updatedTurno.estado } : t));

            if (nuevoEstado.toLowerCase() === 'cancelado') {
                const turnoAfectado = turnos.find(t => t.id === idTurno);
                if (turnoAfectado) {
                    await crearNotificacion(turnoAfectado.paciente_id, `Tu turno del día ${updatedTurno.fecha || 'por confirmar'} fue cancelado.`);
                }
            }
            toast.info(`Turno actualizado a "${nuevoEstado}"`);
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            toast.error("Error al actualizar el estado.");
        }
    };

    const eliminarTurno = async (idToDelete) => {
        if (!idToDelete) {
            toast.error("Error: No se ha seleccionado ningún turno para eliminar.");
            handleCloseConfirmModal();
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/turnos/${idToDelete}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Error al eliminar turno en el backend');
            toast.warn("El turno ha sido eliminado.");
            setTurnos(prevTurnos => prevTurnos.filter(turno => turno.id !== idToDelete));
        } catch (error) {
            console.error("Error al eliminar el turno:", error);
            toast.error("Ocurrió un error al eliminar el turno.");
        } finally {
            handleCloseConfirmModal();
        }
    };

    const handleShowConfirmModal = (id) => {
        setTurnoAEliminar(id);
        setShowConfirmModal(true);
    };
    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
        setTurnoAEliminar(null);
    };

    const handleCloseSolicitarModal = () => {
        setShowSolicitarModal(false);
    };

    const handleShowAsignarHoraModal = (turno) => {
        setTurnoParaAsignar(turno);
        setShowAsignarHoraModal(true);
    };
    const handleCloseAsignarHoraModal = () => {
        setShowAsignarHoraModal(false);
        setTurnoParaAsignar(null);
    };

    const handleConfirmarTurno = async ({ fecha, hora, duracion }) => {
        if (!turnoParaAsignar) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/turnos/${turnoParaAsignar.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fecha, hora, duracion, estado: 'Confirmado' })
            });
            if (!response.ok) throw new Error('Error al confirmar turno en el backend');
            const updatedTurno = await response.json();
            await crearNotificacion(updatedTurno.paciente_id, `Tu turno para "${updatedTurno.motivo}" fue confirmado para el ${updatedTurno.fecha} a las ${updatedTurno.hora}.`);
            toast.success("Turno confirmado y agendado con éxito.");
            fetchTurnos();
        } catch (error) {
            console.error("Error al confirmar el turno:", error);
            toast.error("Error al confirmar el turno.");
        } finally {
            handleCloseAsignarHoraModal();
        }
    };

    const handleShowCancelModalCliente = (idTurno) => {
        setTurnoACancelarCliente(idTurno);
        setShowCancelModalCliente(true);
    };
    const handleCloseCancelModalCliente = () => {
        setShowCancelModalCliente(false);
        setTurnoACancelarCliente(null);
    };
    const handleConfirmCancelCliente = () => {
        if (turnoACancelarCliente) {
            actualizarEstadoTurno(turnoACancelarCliente, 'Cancelado');
        }
        handleCloseCancelModalCliente();
    };

    const handleSelectPendingRequest = (request) => {
        handleShowAsignarHoraModal(request);
    };

    return (
        <>
            <div className="home-page-container mt-4">
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
                    {(userRole === 'profesional' || userRole === 'administrador') && (
                        <div className="col-lg-4 mb-4">
                            <TurnoFilters currentFilter={currentFilter} onFilterChange={setCurrentFilter} />
                        </div>
                    )}

                    <div className={(userRole === 'profesional' || userRole === 'administrador') ? "col-lg-8" : "col-12"}>
                        <h2>{userRole === 'cliente' ? 'Mis Turnos' : 'Agenda de Turnos'}</h2>
                        {loading ? <Loader /> : (
                            <div className="turnos-list">
                                {turnos.length > 0 ? (
                                    turnos.map((turno) => (
                                        <TurnoCard
                                            key={turno.id}
                                            turno={turno}
                                            userRole={userRole}
                                            onShowConfirmModal={handleShowConfirmModal}
                                            onActualizarEstado={actualizarEstadoTurno}
                                            onAsignarHora={handleShowAsignarHoraModal}
                                            onClienteCancela={handleShowCancelModalCliente}
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

            <ConfirmModal
                show={showConfirmModal}
                onHide={handleCloseConfirmModal}
                onConfirm={() => eliminarTurno(turnoAEliminar)}
                title="Confirmar Eliminación"
                body="¿Estás completamente seguro de que quieres eliminar este turno? Esta acción no se puede deshacer."
            />

            <SolicitarTurnoModal
                show={showSolicitarModal}
                onHide={() => setShowSolicitarModal(false)}
                onSolicitar={handleSolicitarTurno}
            />

            <AsignarHoraModal
                show={showAsignarHoraModal}
                onHide={handleCloseAsignarHoraModal}
                onConfirm={handleConfirmarTurno}
            />

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