import './ConfirmModal.css';
import PropTypes from 'prop-types';

const ConfirmModal = ({ show, onHide, onConfirm, title, body }) => {
    if (!show) {
        return null;
    }

    return (
        <>
            <div className="modal-backdrop fade show"></div>

            <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button type="button" className="btn-close" onClick={onHide}></button>
                        </div>
                        <div className="modal-body">
                            <p>{body}</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onHide}>
                                Cancelar
                            </button>
                            {/* Este botón simplemente llama a la función onConfirm que recibe por props */}
                            <button type="button" className="btn btn-danger" onClick={onConfirm}>
                                Confirmar Eliminación
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

ConfirmModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
};

export default ConfirmModal;