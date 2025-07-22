import React, { useState } from 'react';
import { toast } from 'react-toastify';


function validarMotivo(motivo) {
    if (!motivo.trim()) {
        return 'Por favor, describe el motivo de tu consulta.';
    }
    return null;
}

const SolicitarTurnoModal = ({ show, onHide, onSolicitar }) => {
    const [motivo, setMotivo] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const error = validarMotivo(motivo);
        if (error) {
            toast.error(error);
            return;
        }
        onSolicitar(motivo); // Llama a la función del padre con el motivo
        setMotivo(''); // Limpia el campo
        onHide(); // Cierra el modal
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
                                <h5 className="modal-title">Solicitar un Nuevo Turno</h5>
                                <button type="button" className="btn-close" onClick={onHide}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="motivoSolicitud" className="form-label">Motivo de la consulta</label>
                                    <textarea
                                        className="form-control"
                                        id="motivoSolicitud"
                                        rows="4"
                                        value={motivo}
                                        onChange={(e) => setMotivo(e.target.value)}
                                        placeholder="Ej: Revisión anual, consulta por dolor, etc."
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onHide}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Enviar Solicitud
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SolicitarTurnoModal;