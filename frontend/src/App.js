import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import '././assets/css/responsive.css';
import Login from './pages/defaultpages/Login';
import Signup from './pages/defaultpages/Signup';
import Reset from './pages/defaultpages/Reset';
import ForgotPassword from './pages/defaultpages/Forgotpassword';
import Dashboard from './pages/common/Dashboard';
import AuthGuard from './components/AuthGuard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/PrivateRoute';
import Newuser from './pages/common/Newuser';
import 'primeicons/primeicons.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          {/* <Route path="/" element={<AuthGuard element={Home} />} /> */}
          <Route path="/" element={<AuthGuard element={Login} />} />
          <Route path="/login" element={<AuthGuard element={Login} />} />
          <Route path="/signup" element={<AuthGuard element={Signup} />} />
          <Route path="/passreset" element={<AuthGuard element={ForgotPassword} />} />
          <Route path="/resetpassword/:token" element={<AuthGuard element={Reset} />} />

          <Route
            path="/dashboard/*"
            element={<ProtectedRoute element={Dashboard} allowedRoles={['Founder','Admin','SuperAdmin','HumanResource','Accounts','Department_Head','Employee','Social_Media_Manager','Task_manager','Ex_employee','Unverified']} />}
          />

          <Route path="/newuser/*" element={<ProtectedRoute element={Newuser} allowedRoles={['Unverified']}/>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
