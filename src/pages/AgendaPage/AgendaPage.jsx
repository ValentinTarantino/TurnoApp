import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/dist/locale/es';

import './AgendaPage.css';

import { useAuth } from '../../context/useAuth';
import Loader from '../../components/Loader/Loader';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';

moment.locale('es');
const localizer = momentLocalizer(moment);

const messages_es = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango.',
    showMore: total => `+ ${total} más`,
};

const CustomAgendaEvent = ({ event: actualEvent }) => (
    <span>{actualEvent.resource.pacienteNombre} ({actualEvent.resource.motivo})</span>
);

const CustomAgendaDate = ({ event: actualEvent }) => (
    <span>{moment(actualEvent.start).format('ddd, DD MMM')}</span>
);

const CustomAgendaTime = ({ event: actualEvent }) => (
    <span>{moment(actualEvent.start).format('HH:mm')} - {moment(actualEvent.end).format('HH:mm')}</span>
);


const AgendaPage = () => {
    const { currentUser, userRole } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('month'); 

    const isProfesionalOrAdmin = userRole === 'profesional' || userRole === 'administrador';

    useEffect(() => {
        if (!currentUser || !isProfesionalOrAdmin) {
            setLoading(false);
            return;
        }

        const fetchTurnosForCalendar = async () => {
            setLoading(true);
            try {
                const turnosCollectionRef = collection(db, 'turnos');
                const q = query(turnosCollectionRef);
                const querySnapshot = await getDocs(q);

                const loadedTurnos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                const calendarEvents = loadedTurnos
                    .filter(turno => turno.fecha && turno.hora && turno.estado !== 'solicitado' && turno.estado !== 'cancelado')
                    .map(turno => {
                        const startDateTime = moment(`${turno.fecha} ${turno.hora}`, 'YYYY-MM-DD HH:mm').toDate();
                        const endDateTime = moment(startDateTime).add(turno.duracion || 30, 'minutes').toDate();

                        let eventClass = '';
                        if (turno.estado === 'Confirmado') eventClass = 'event-confirmed';
                        else if (turno.estado === 'Pendiente') eventClass = 'event-pending';

                        return {
                            id: turno.id,
                            title: `${moment(startDateTime).format('DD/MM HH:mm')} - ${turno.pacienteNombre} (${turno.motivo})`,
                            start: startDateTime,
                            end: endDateTime,
                            allDay: false,
                            resource: turno,
                            className: eventClass,
                        };
                    });
                setEvents(calendarEvents);

            } catch (error) {
                console.error("Error al cargar los turnos para el calendario:", error);
                toast.error("Error al cargar la agenda.");
            } finally {
                setLoading(false);
            }
        };

        fetchTurnosForCalendar();
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

    return (
        <div className="container mt-4">
            <h2>Mi Agenda Profesional</h2>
            <p>Aquí puedes ver tus turnos agendados en formato de calendario.</p>
            <div style={{ height: 700, backgroundColor: 'transparent' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    messages={messages_es}
                    date={currentDate}
                    onNavigate={newDate => setCurrentDate(newDate)}
                    view={currentView}
                    onView={newView => setCurrentView(newView)}
                    views={['month']}
                    culture="es"
                    components={{
                        agenda: {
                            event: CustomAgendaEvent,
                            date: CustomAgendaDate,
                            time: CustomAgendaTime,
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default AgendaPage;