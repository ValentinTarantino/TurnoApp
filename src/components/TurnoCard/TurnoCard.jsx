import './TurnoCard.css';

const TurnoCard = ({ turno, userRole, onActualizarEstado, onShowConfirmModal, onAsignarHora, onClienteCancela }) => {
    const { id, pacienteNombre, fecha, hora, motivo, estado, duracion } = turno; 

    const getBadgeClass = (estado) => {
        switch (estado.toLowerCase()) {
            case 'confirmado':
                return 'bg-success';
            case 'solicitado':
                return 'bg-info text-dark';
            case 'pendiente':
                return 'bg-warning text-dark';
            case 'cancelado':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    return (
        <div className="card shadow-sm mb-3 turno-card">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">{pacienteNombre}</h5>
                    <span className={`badge ${getBadgeClass(estado)}`}>{estado}</span>
                </div>
                <p className="card-text text-muted mt-2">
                    <strong>Fecha:</strong> {fecha ? new Date(fecha + 'T00:00:00').toLocaleDateString() : 'Por confirmar'}
                    <br />
                    <strong>Hora:</strong> {hora}
                    {duracion && ( 
                        <>
                            <br />
                            <strong>Duración:</strong> {duracion} minutos
                        </>
                    )}
                </p>
                <p className="card-text">
                    <strong>Motivo:</strong> {motivo}
                </p>

                {/* --- LÓGICA DE BOTONES CONDICIONAL POR ROL --- */}

                {/* Botones para PROFESIONAL / ADMINISTRADOR */}
                {(userRole === 'profesional' || userRole === 'administrador') && (
                    <div className="d-flex justify-content-end gap-2 mt-3">
                        {estado.toLowerCase() === 'solicitado' && (
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => onAsignarHora(turno)}
                            >
                                Asignar Fecha y Hora
                            </button>
                        )}

                        {estado.toLowerCase() === 'pendiente' && (
                            <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() => onActualizarEstado(id, 'Confirmado')}
                            >
                                Confirmar
                            </button>
                        )}

                        {estado.toLowerCase() !== 'cancelado' && estado.toLowerCase() !== 'solicitado' && (
                            <button
                                className="btn btn-outline-warning btn-sm"
                                onClick={() => onActualizarEstado(id, 'Cancelado')}
                            >
                                Cancelar
                            </button>
                        )}

                        {estado.toLowerCase() !== 'solicitado' && (
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => onShowConfirmModal(id)}
                            >
                                Eliminar
                            </button>
                        )}
                    </div>
                )}

                {/* Botón "Cancelar" para CLIENTE */}
                {userRole === 'cliente' && estado.toLowerCase() !== 'cancelado' && estado.toLowerCase() !== 'solicitado' && (
                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onClienteCancela(id)}
                        >
                            Cancelar Turno
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TurnoCard;