// src/pages/Login.js
import React, { useRef, useState, } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../../assets/css/login.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Card } from 'primereact/card';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import CustomToast from '../../components/CustomToast';

const Login = () => {
  const toastRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePasswordViewToggle = () => {
    setShowPassword(!showPassword);
  };

  const showMessage = (severity, detail) => {
    const summary = severity.charAt(0).toUpperCase() + severity.slice(1);
    toastRef.current.show(severity, summary, detail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send login data to the backend
      const response = await axios.post(`${config.apiBASEURL}/authentication/login`, {
        email, // Make sure this matches the backend API key
        password,
      });

      const authData = response.data;

      // Call login to save user data locally (e.g., session storage)
      login(authData);

      // Redirect based on role immediately
      switch (authData.role) {
        case 'Admin':
          navigate('/dashboard/Admin', { state: { role: authData.role } });
          break;
        case 'SuperAdmin':
          navigate('/dashboard/Admin', { state: { role: authData.role } });
          break;
        case 'Employee':
          navigate('/dashboard/employee', { state: { role: authData.role } });
          break;
        case 'HumanResource':
          navigate('/dashboard/hr', { state: { role: authData.role } });
          break;
        case 'Founder':
          navigate('/dashboard/Admin', { state: { role: authData.role } });
          break;
        case 'Accounts':
          navigate('/dashboard/accountsmanager', { state: { role: authData.role } });
          break;
        case 'Department_Head':
          navigate('/dashboard/employee', { state: { role: authData.role } });
          break;
        case 'Social_Media_Manager':
          navigate('/dashboard/employee', { state: { role: authData.role } });
          break;
        case 'Task_manager':
          navigate('/dashboard/employee', { state: { role: authData.role } });
          break;
        case 'Ex_employee':
          navigate('/dashboard/exemployee', { state: { role: authData.role } });
          break;
        case 'Unverified':
          navigate('/newuser/home', { state: { role: authData.role } });
          break;
        default:
          navigate('/', { state: { role: authData.role } });
          break;
      }
    } catch (error) {
      console.error('Error logging in:', error?.response?.data || error);
      showMessage('error', error?.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <Container className='login-card'> {/*className='login-card newyearcard'/*/}
      <Row className="mx-0">
        <Col md='6' lg='3' className='w-440'>
          <Card title="Login">
            <p className='login_logo'><img src={require("../../assets/images/logogf.png")} alt="Logo" style={{ width: '30px', height: '30px' }} />Blackbox</p>
            <form onSubmit={handleSubmit} className='mt-4'>
              <Col className='mb-3'>
                <label htmlFor="email"><i className='pi pi-envelope pe-2'></i>Email</label>
                <InputText
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  required
                />
              </Col>
              <Col className='mb-3'>
                <label htmlFor="password">
                  <i className='pi pi-lock pe-2'></i>Password
                </label>
                <div style={{ position: 'relative' }}>
                  <InputText
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
                  <span
                    onClick={handlePasswordViewToggle}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </Col>
              <Col>
                <p className='mt-4 text-end w-100'><Link to='/passreset'>Forgot password?</Link></p>
              </Col>
              <Col className='d-flex justify-content-center mt-4'>
                <Button label="Login" type="submit" className='loginbtn' />
              </Col>
            </form>
            <p className='mt-4 text-center'>Don't have an account? <Link to='/signup'>Signup</Link></p>
          </Card>
        </Col>
      </Row>
      <CustomToast ref={toastRef} />
    </Container>
  );
};

export default Login;
