import { Routes, Route } from 'react-router-dom';
import './App.css';
import AgendaPage from './pages/AgendaPage/AgendaPage.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/NavBar/NavBar.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import GuestRoute from './components/GuestRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx'; 
import HomePage from './pages/HomePage/HomePage.jsx';
import PerfilPage from './pages/PerfilPage/PerfilPage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import AdminPage from './pages/AdminPage/AdminPage.jsx'; 

function App() {
  return (
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Navbar />

      <main className="container mt-4">
        <Routes>
          {/* --- RUTA PARA INVITADOS (NO LOGUEADOS) --- */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />

          {/* --- RUTAS PROTEGIDAS (PARA USUARIOS LOGUEADOS) --- */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
            <Route 
            path="/agenda" 
            element={
              <ProtectedRoute>
                <AgendaPage /> 
              </ProtectedRoute>
            }
            />
          <Route
            path="/agenda"
            element={
              <ProtectedRoute>
                <AgendaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <PerfilPage />
              </ProtectedRoute>
            }
          />

          {/* --- RUTA DE ADMINISTRACIÓN (SOLO PARA ADMINS) --- */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />

          {/* Ruta "catch-all" para manejar páginas no encontradas (404) */}
          <Route path="*" element={
            <div className="text-center mt-5">
              <h1>404</h1>
              <p>Página No Encontrada</p>
            </div>
          } />
        </Routes>
      </main>
    </>
  );
}

export default App;