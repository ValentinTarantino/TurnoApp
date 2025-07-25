import './TurnoCard.css';
import moment from 'moment';

const TurnoCard = ({ turno, userRole, onActualizarEstado, onShowConfirmModal, onAsignarHora = () => { }, onClienteCancela, showEliminar = false }) => {
    const { id, paciente_nombre, fecha, hora, motivo, estado, duracion } = turno;

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

    const getNombreCuenta = (email) => {
        if (!email) return '';
        return email.split('@')[0];
    };
    return (
        <div className="card shadow-sm mb-3 turno-card">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                        {turno.fotoPerfil && (
                            <img
                                src={turno.fotoPerfil}
                                alt="Foto de perfil"
                                className="rounded-circle me-2"
                                style={{ width: 40, height: 40, objectFit: 'cover', border: '2px solid #fff' }}
                            />
                        )}
                        <h5 className="card-title mb-0">{getNombreCuenta(paciente_nombre)}</h5>
                    </div>
                    <span className={`badge ${getBadgeClass(estado)}`}>{estado}</span>
                </div>
                <p className="card-text text-muted mt-2">
                    <strong>Fecha:</strong>
                    {fecha ? moment(fecha).format('DD/MM/YYYY') : 'Por confirmar'}
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

                {userRole === 'cliente' && estado.toLowerCase() !== 'cancelado' && estado.toLowerCase() !== 'solicitado' && (
                    <div className="d-flex justify-content-end gap-2 mt-3">
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onActualizarEstado(id, 'Cancelado')}
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