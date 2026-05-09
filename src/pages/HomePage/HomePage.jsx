import { useState, useEffect } from 'react';
import './HomePage.css';
import { useAuth } from '../../context/useAuth';
import { supabase } from '../../firebase/config';

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
            const { error } = await supabase.from('notifications').insert([{ user_id: userId, mensaje }]);
            if (error) throw error;
            console.log(`Notificación enviada a Supabase para ${userId}: ${mensaje}`);
        } catch (error) {
            console.error("Error al crear la notificación:", error);
        }
    };

    const fetchTurnos = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            let query = supabase.from('turnos').select('*');
            if (userRole === 'profesional' || userRole === 'administrador') {
                if (currentFilter !== 'todos') {
                    query = query.eq('estado', currentFilter);
                }
            } else {
                query = query.eq('paciente_id', currentUser.id);
            }
            const { data: turnosData, error } = await query;
            if (error) throw error;

            // Traer usuarios únicos
            const pacienteIds = [...new Set((turnosData || []).map(t => t.paciente_id))];
            let fotos = {};
            if (pacienteIds.length > 0) {
                const { data: usersData } = await supabase
                    .from('users')
                    .select('id, foto_url')
                    .in('id', pacienteIds);
                usersData?.forEach(u => {
                    fotos[u.id] = u.foto_url;
                });
            }

            // Agregar la foto a cada turno
            const turnosConFoto = (turnosData || []).map(t => ({
                ...t,
                fotoPerfil: fotos[t.paciente_id] || null
            }));

            setTurnos(turnosConFoto);
        } catch (error) {
            console.error("Error al cargar los turnos:", error);
            toast.error("Error al cargar los turnos desde Supabase.");
        } finally {
            setLoading(false);
        }
    };

    const fetchClientes = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, nombre, email, role')
                .eq('role', 'cliente');
            if (error) throw error;
            setClientes(data || []);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
            toast.error("Error al cargar la lista de clientes.");
        }
    };

    // Timeout de seguridad para evitar loading infinito
    useEffect(() => {
        const timeout = setTimeout(() => setLoading(false), 5000);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        if (userRole === 'profesional' || userRole === 'administrador') {
            fetchClientes();
        }
        fetchTurnos();
    }, [currentUser, userRole, currentFilter]);

    const agregarTurno = async (nuevoTurnoData) => {
        try {
            const { error } = await supabase.from('turnos').insert([{
                paciente_id: nuevoTurnoData.pacienteId,
                paciente_nombre: nuevoTurnoData.pacienteNombre,
                profesional_id: currentUser.id,
                fecha: null,
                hora: nuevoTurnoData.hora,
                duracion: nuevoTurnoData.duracion,
                motivo: nuevoTurnoData.motivo,
                estado: 'Pendiente'
            }]);
            if (error) throw error;
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
            paciente_id: currentUser.id,
            paciente_nombre: currentUser.displayName || currentUser.nombre || currentUser.email,
            profesional_id: "fde6552f-7f52-447a-88a1-1a6d118238cc", // UUID del profesional real
            hora: null,
            fecha: null,
            motivo: motivo,
            estado: 'solicitado',
        };
        try {
            const { error } = await supabase
                .from('turnos')
                .insert([nuevaSolicitud]);
            if (error) throw error;
            // Notificar al profesional
            await crearNotificacion(
                nuevaSolicitud.profesional_id,
                `Tienes una nueva solicitud de turno de ${nuevaSolicitud.paciente_nombre} para: "${motivo}"`
            );
            toast.success("Tu solicitud de turno ha sido enviada.");
            fetchTurnos();
        } catch (error) {
            console.error("Error al enviar solicitud:", error);
            toast.error("Hubo un error al enviar tu solicitud.");
        }
    };

    // ====================================================================
    // FUNCIÓN PARA EL BOTÓN "ELIMINAR" DEL PROFESIONAL
    // ====================================================================
    // Esta función se pasa al `onConfirm` del modal de eliminación.
    // NO se llama directamente desde el botón "Eliminar" de la tarjeta.
    const eliminarTurno = async (idToDelete) => {
        if (!idToDelete) {
            toast.error("Error: No se ha seleccionado ningún turno para eliminar.");
            handleCloseConfirmModal();
            return;
        }
        try {
            const { error } = await supabase.from('turnos').delete().eq('id', idToDelete);
            if (error) throw error;
            toast.warn("El turno ha sido eliminado.");
            setTurnos(prevTurnos => prevTurnos.filter(turno => turno.id !== idToDelete));
        } catch (error) {
            console.error("Error al eliminar el turno:", error);
            toast.error("Ocurrió un error al eliminar el turno.");
        } finally {
            handleCloseConfirmModal();
        }
    };

    const actualizarEstadoTurno = async (idTurno, nuevoEstado) => {
        try {
            const { data, error } = await supabase
                .from('turnos')
                .update({ estado: nuevoEstado })
                .eq('id', idTurno)
                .select()
                .single();
            if (error) throw error;

            setTurnos(prev => prev.map(t => t.id === idTurno ? { ...t, estado: data.estado } : t));

            if (nuevoEstado.toLowerCase() === 'cancelado') {
                const turnoAfectado = turnos.find(t => t.id === idTurno);
                if (turnoAfectado) {
                    await crearNotificacion(
                        turnoAfectado.paciente_id,
                        `Tu turno para "${turnoAfectado.motivo}" fue cancelado para el ${turnoAfectado.fecha ? turnoAfectado.fecha : 'por confirmar'} a las ${turnoAfectado.hora ? turnoAfectado.hora : 'por confirmar'}.`
                    );
                }
            }
            toast.info(`Turno actualizado a "${nuevoEstado}"`);
        } catch (error) {
            console.error("Error al actualizar el estado:", error);
            toast.error("Error al actualizar el estado.");
        }
    };

    // ====================================================================
    // FUNCIÓN PARA EL BOTÓN "CANCELAR TURNO" DEL CLIENTE
    // ====================================================================
    // Esta función se pasa al `onConfirm` del modal de cancelación del cliente.
    const handleConfirmCancelCliente = () => {
        // Verifica que tengamos un ID guardado
        if (turnoACancelarCliente) {
            // Reutiliza la función `actualizarEstadoTurno` para cambiar el estado a "Cancelado"
            actualizarEstadoTurno(turnoACancelarCliente, 'Cancelado');
        }
        // Cierra el modal después de la acción
        handleCloseCancelModalCliente();
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
            const { error } = await supabase.from('turnos').update({ fecha, hora, duracion, estado: 'Confirmado' }).eq('id', turnoParaAsignar.id);
            if (error) throw error;
            await crearNotificacion(
                turnoParaAsignar.paciente_id,
                `Tu turno para "${turnoParaAsignar.motivo}" fue confirmado para el ${fecha ? fecha : 'por confirmar'} a las ${hora ? hora : 'por confirmar'}.`
            );
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

    const handleSelectPendingRequest = (request) => {
        handleShowAsignarHoraModal(request);
    };

    let turnosFiltrados = turnos;
    if (currentFilter === 'cancelados') {
        turnosFiltrados = turnos.filter(t => t.estado && t.estado.toLowerCase() === 'cancelado');
    }

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
                                {turnosFiltrados.length > 0 ? (
                                    turnosFiltrados.map((turno) => (
                                        <TurnoCard
                                            key={turno.id}
                                            turno={turno}
                                            userRole={userRole}
                                            onShowConfirmModal={handleShowConfirmModal}
                                            onActualizarEstado={actualizarEstadoTurno}
                                            onAsignarHora={userRole === 'profesional' ? handleShowAsignarHoraModal : undefined}
                                            showEliminar={currentFilter === 'cancelados'}
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