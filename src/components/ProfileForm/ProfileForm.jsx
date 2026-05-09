import  { useState } from 'react';
import PropTypes from 'prop-types';

const ProfileForm = ({ user, onSave }) => {
    const [formData, setFormData] = useState({
        especialidad: user.especialidad || '',
        horarios: user.horarios || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="especialidad" className="form-label">Especialidad</label>
                <input
                    type="text"
                    className="form-control"
                    id="especialidad"
                    name="especialidad"
                    value={formData.especialidad}
                    onChange={handleChange}
                    placeholder="Ej: Psicología, Odontología, etc."
                />
            </div>
            <div className="mb-3">
                <label htmlFor="horarios" className="form-label">Horarios de Atención</label>
                <textarea
                    className="form-control"
                    id="horarios"
                    name="horarios"
                    rows="3"
                    value={formData.horarios}
                    onChange={handleChange}
                    placeholder="Ej: Lunes a Viernes de 09:00 a 18:00"
                ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Guardar Cambios</button>
        </form>
    );
};

ProfileForm.propTypes = {
    user: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
};

export default ProfileForm;
