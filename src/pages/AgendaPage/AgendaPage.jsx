import { useState, useEffect } from 'react';
import moment from 'moment'; 
import 'moment/dist/locale/es'; 
import './AgendaPage.css'; 
import { useAuth } from '../../context/useAuth';
import { supabase } from '../../firebase/config';
import Loader from '../../components/Loader/Loader';
import { toast } from 'react-toastify';

const AgendaPage = () => {
    const { currentUser, userRole } = useAuth();
    const [turnos, setTurnos] = useState([]); 
    const [loading, setLoading] = useState(true);

    const isProfesionalOrAdmin = userRole === 'profesional' || userRole === 'administrador';

    useEffect(() => {
        if (!currentUser || !isProfesionalOrAdmin) {
            setLoading(false);
            return;
        }

        const fetchTurnosForAgenda = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('turnos')
                    .select('*');
                if (error) throw error;
                const agendaTurnos = data
                    .filter(turno => turno.fecha && turno.hora && turno.estado !== 'solicitado' && turno.estado !== 'Cancelado')
                    .sort((a, b) => {
                        const dateA = moment(`${a.fecha} ${a.hora}`, 'YYYY-MM-DD HH:mm');
                        const dateB = moment(`${b.fecha} ${b.hora}`, 'YYYY-MM-DD HH:mm');
                        return dateA.diff(dateB);
                    });
                setTurnos(agendaTurnos);
            } catch (error) {
                console.error("AgendaPage: Error general al cargar la agenda:", error);
                toast.error("Error al cargar la agenda.");
            } finally {
                setLoading(false);
            }
        };

        fetchTurnosForAgenda();
    }, [currentUser, isProfesionalOrAdmin]); 

    if (loading) {
        return <Loader />;
    }

    if (!isProfesionalOrAdmin) {
        return (
            <div className="alert alert-danger text-center mt-5" role="alert">
                Acceso denegado. Esta página es solo para profesionales o administradores.
            </div>
        );
    }
    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <div className="container mt-4">
            <h2>Mi Agenda Profesional</h2>
            <p>Aquí puedes ver tus turnos agendados en formato de lista.</p>

            <div className="table-responsive">
                <table className="table table-striped table-hover mt-4">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Hora</th>
                            <th>Duración</th>
                            <th>Paciente</th>
                            <th>Motivo</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {turnos.length > 0 ? (
                            turnos.map(turno => (
                                <tr key={turno.id}>
                                    <td>{moment(turno.fecha).format('DD/MM/YYYY')}</td>
                                    <td>{turno.hora}</td>
                                    <td>{turno.duracion || 'N/A'} min</td>
                                    <td>{turno.paciente_nombre}</td>
                                    <td>{turno.motivo}</td>
                                    <td><span className={`badge ${turno.estado === 'Confirmado' ? 'bg-success' :
                                            turno.estado === 'Pendiente' ? 'bg-warning text-dark' :
                                                turno.estado === 'Cancelado' ? 'bg-danger' : 'bg-secondary'
                                        }`}>{capitalize(turno.estado)}</span></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center text-muted">No hay turnos agendados para mostrar.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AgendaPage;