import { useState } from 'react';
import { toast } from 'react-toastify';
import './FormularioTurno.css';

function validarTurno({ pacienteId, hora, motivo, duracion, clientes }) {
    if (!pacienteId || !hora || !motivo || !duracion) {
        return 'Por favor, completa todos los campos.';
    }
    const clienteSeleccionado = clientes.find(c => c.id === pacienteId);
    if (!clienteSeleccionado) {
        return 'Error: cliente no encontrado.';
    }
    return null;
}

const FormularioTurno = ({ onNuevoTurno, clientes }) => {
    const [pacienteId, setPacienteId] = useState('');
    const [hora, setHora] = useState('');
    const [motivo, setMotivo] = useState('');
    const [duracion, setDuracion] = useState('30');

    const handleSubmit = (e) => {
        e.preventDefault();
        const error = validarTurno({ pacienteId, hora, motivo, duracion, clientes });
        if (error) {
            toast.error(error);
            return;
        }
        const clienteSeleccionado = clientes.find(c => c.id === pacienteId);
        const nuevoTurnoData = {
            pacienteId: pacienteId,
            pacienteNombre: clienteSeleccionado.nombre,
            hora,
            motivo,
            duracion: parseInt(duracion),
            estado: 'Pendiente',
        };
        onNuevoTurno(nuevoTurnoData);
        setPacienteId('');
        setHora('');
        setMotivo('');
        setDuracion('30');
    };

    return (
        <div className="card shadow-sm">
            <div className="card-header">
                <h3>Agregar Nuevo Turno</h3>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="paciente" className="form-label">Paciente</label>
                        <select
                            id="paciente"
                            className="form-select"
                            value={pacienteId}
                            onChange={(e) => setPacienteId(e.target.value)}
                            required
                        >
                            <option value="" disabled>Selecciona un cliente</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.nombre} ({cliente.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="hora" className="form-label">Hora</label>
                        <input
                            type="time"
                            className="form-control"
                            id="hora"
                            value={hora}
                            onChange={(e) => setHora(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="duracion" className="form-label">Duración (minutos)</label>
                        <select
                            id="duracion"
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

                    <div className="mb-3">
                        <label htmlFor="motivo" className="form-label">Motivo de la Consulta</label>
                        <textarea
                            className="form-control"
                            id="motivo"
                            rows="3"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Ej: Consulta de control"
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Guardar Turno
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FormularioTurno;