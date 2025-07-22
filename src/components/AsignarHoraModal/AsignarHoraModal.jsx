import { useState } from 'react';
import { toast } from 'react-toastify';

const AsignarHoraModal = ({ show, onHide, onConfirm }) => {
    const [fecha, setFecha] = useState('');
    const [hora, setHora] = useState('');
    const [duracion, setDuracion] = useState('30'); 

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); 
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; 
    };

    const getLastDayOfCurrentYear = () => {
        const today = new Date();
        const year = today.getFullYear();
        const lastDay = new Date(year, 11, 31);
        const month = String(lastDay.getMonth() + 1).padStart(2, '0');
        const day = String(lastDay.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; 
    };

    const minDate = getTodayDate();
    const maxDate = getLastDayOfCurrentYear();

    function validarAsignacion({ fecha, hora, duracion, minDate, maxDate }) {
        if (!fecha || !hora || !duracion) {
            return 'Por favor, especifica la fecha, la hora y la duración.';
        }
        if (fecha < minDate || fecha > maxDate) {
            return `Por favor, selecciona una fecha entre hoy (${minDate}) y fin de año (${maxDate}).`;
        }
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const error = validarAsignacion({ fecha, hora, duracion, minDate, maxDate });
        if (error) {
            toast.error(error);
            return;
        }
        onConfirm({ fecha, hora, duracion: parseInt(duracion) });
        setFecha('');
        setHora('');
        setDuracion('30'); 
        onHide();
    };

    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop fade show"></div>

            <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit}>
                            <div className="modal-header">
                                <h5 className="modal-title">Asignar Fecha y Hora</h5>
                                <button type="button" className="btn-close" onClick={onHide}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="fechaTurno" className="form-label">Fecha del Turno</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        id="fechaTurno"
                                        value={fecha}
                                        onChange={(e) => setFecha(e.target.value)}
                                        min={minDate} 
                                        max={maxDate} 
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="horaTurno" className="form-label">Hora del Turno</label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        id="horaTurno"
                                        value={hora}
                                        onChange={(e) => setHora(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="duracionModal" className="form-label">Duración (minutos)</label>
                                    <select
                                        id="duracionModal"
                                        className="form-select"
                                        value={duracion}
                                        onChange={(e) => setDuracion(e.target.value)}
                                        required
                                    >
                                        <option value="15">15 minutos</option>
                                        <option value="30">30 minutos</option>
                                        <option value="45">45 minutos</option>
                                        <option value="60">60 minutos</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onHide}>Cancelar</button>
                                <button type="submit" className="btn btn-success">Confirmar Turno</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AsignarHoraModal;