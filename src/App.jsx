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

      <main>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div className="container mt-4">
                  <HomePage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agenda"
            element={
              <ProtectedRoute>
                <div className="container mt-4">
                  <AgendaPage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <div className="container mt-4">
                  <PerfilPage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div className="container mt-4">
                  <AdminPage />
                </div>
              </AdminRoute>
            }
          />
          <Route path="*" element={
            <div className="container text-center mt-5">
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