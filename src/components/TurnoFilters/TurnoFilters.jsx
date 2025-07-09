const TurnoFilters = ({ currentFilter, onFilterChange }) => {
    const filters = [
        { key: 'todos', label: 'Todos los Turnos' },
        { key: 'solicitado', label: 'Solicitados' }, 
        { key: 'Confirmado', label: 'Confirmados' },  
        { key: 'Cancelado', label: 'Cancelados' },   
    ];

    return (
        <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
                <h3 className="mb-0">Filtrar Turnos</h3>
            </div>
            <div className="card-body">
                <div className="d-grid gap-2">
                    {filters.map(filter => (
                        <button
                            key={filter.key} 
                            className={`btn btn-block ${currentFilter === filter.key ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => onFilterChange(filter.key)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TurnoFilters;