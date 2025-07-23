# TurnosApp: Gestión de Turnos para Profesionales

---

## Descripción del Proyecto

TurnosApp es una aplicación web moderna diseñada para facilitar la gestión de turnos para profesionales y sus clientes. Construida con React, ofrece una interfaz intuitiva y responsiva que permite a los profesionales organizar su agenda, y a los clientes solicitar y gestionar sus propios turnos.

## Modo Profesional

[**CLICKEA ACA**](https://drive.google.com/file/d/1QLaHC4JMPIFAcedvwYeP3HmuVizia46w/view?usp=sharing)

### Características Clave:

*   **Autenticación de Usuarios:**  Inicio de sesión seguro a través de Google Authentication.
*   **Gestión de Roles:** Diferenciación entre usuarios clientes, profesionales y administradores, adaptando la interfaz y funcionalidades según el rol.
*   **Solicitud de Turnos:** Los clientes pueden solicitar nuevos turnos a los profesionales.
*   **Agenda Profesional:** Los profesionales y administradores tienen una vista de calendario interactiva para visualizar y gestionar todos los turnos.
*   **Gestión de Turnos:**
    *   Confirmación y asignación de fecha/hora a solicitudes de turno.
    *   Actualización del estado de los turnos (Pendiente, Confirmado, Cancelado).
    *   Eliminación de turnos.
    *   Visualización de duración personalizada para cada turno.
*   **Notificaciones Internas:** Sistema de notificaciones en tiempo real (icono de campana) para informar a los usuarios sobre cambios relevantes en sus turnos o nuevas solicitudes.
*   **Perfiles de Usuario:** Página de perfil donde los usuarios pueden ver sus datos y, en el caso de profesionales, editar información específica de su práctica. Los clientes pueden ver su historial de turnos.
*   **Modo Oscuro:** Opción de cambiar el tema de la aplicación a modo oscuro para una mejor experiencia visual.
*   **Diseño Responsivo:** Interfaz adaptativa que funciona bien en diferentes dispositivos y tamaños de pantalla.

### Dependencias Principales:

*   `React`: La librería principal para construir la interfaz de usuario.
*   `Vite`: Herramienta de compilación rápida para proyectos React.
*   `PostgreSQL`: Gestión de usuarios y sesiones (Google Sign-In).
*   `React Router DOM`: Para la navegación y el enrutamiento dentro de la aplicación.
*   `Bootstrap`: Framework CSS para un diseño responsivo y componentes de UI pre-estilizados.
*   `React Toastify`: Para notificaciones "toast" personalizables.

---

## Project Description

TurnosApp is a modern web application designed to facilitate appointment management for professionals and their clients. Built with React, it offers an intuitive and responsive interface that allows professionals to organize their schedule, and clients to request and manage their own appointments.

## Professional Mode

[**CLICK HERE**](https://drive.google.com/file/d/1QLaHC4JMPIFAcedvwYeP3HmuVizia46w/view?usp=sharing)

### Key Features:

*   **User Authentication:** Secure login via Google Authentication.
*   **Role Management:** Differentiation between client, professional, and administrator users, adapting the interface and functionalities based on their role.
*   **Appointment Request:** Clients can request new appointments from professionals.
*   **Professional Schedule:** Professionals and administrators have an interactive calendar view to visualize and manage all appointments.
*   **Appointment Management:**
    *   Confirmation and assignment of date/time to appointment requests.
    *   Updating appointment statuses (Pending, Confirmed, Cancelled).
    *   Deleting appointments.
    *   Display of custom duration for each appointment.
*   **In-App Notifications:** Real-time notification system (bell icon) to inform users about relevant changes in their appointments or new requests.
*   **User Profiles:** Profile page where users can view their data and, for professionals, edit specific practice information. Clients can view their appointment history.
*   **Dark Mode:** Option to switch the application theme to dark mode for an improved visual experience.
*   **Responsive Design:** Adaptive interface that works well across different devices and screen sizes.

### Main Dependencies:

*   `React`: The primary library for building the user interface.
*   `Vite`: Fast build tool for React projects.
*   `PostgreSQL`: User and session management (Google Sign-In).
*   `React Router DOM`: For navigation and routing within the application.
*   `Bootstrap`: CSS framework for responsive design and pre-styled UI components.
*   `React Toastify`: For customizable "toast" notifications.


---

# Mejoras y Buenas Prácticas / Improvements and Best Practices

## Español

- Se reemplazaron los mensajes de alerta (`alert`) por notificaciones visuales usando `react-toastify` para una mejor experiencia de usuario.
- Se extrajo la lógica de validación de formularios y modales a funciones utilitarias, separando la lógica de la presentación.
- Se eliminaron logs de configuración sensibles en producción para mayor seguridad.
- Se agregaron validaciones de propiedades (`PropTypes`) en componentes clave para evitar errores de uso.
- Se unificaron y aclararon nombres de variables para mayor coherencia y mantenimiento.
- Se mejoró la organización del código, agrupando funciones y estilos según su propósito.
- Se centralizó el feedback de errores y validaciones para que el usuario siempre reciba información clara y consistente.

## English

- Alert messages (`alert`) were replaced with visual notifications using `react-toastify` for a better user experience.
- Form and modal validation logic was extracted into utility functions, separating logic from presentation.
- Sensitive configuration logs were removed from production for increased security.
- Property validation (`PropTypes`) was added to key components to prevent usage errors.
- Variable names were unified and clarified for greater consistency and maintainability.
- Code organization was improved, grouping functions and styles by their purpose.
- Error and validation feedback was centralized so users always receive clear and consistent information.