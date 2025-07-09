import  { useState } from 'react';

const ProfileForm = ({ user, onSave }) => {
    // Inicializamos el estado del formulario con los datos existentes del usuario
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
        onSave(formData); // Llama a la función del padre para guardar los datos
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

export default ProfileForm;
