import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Form, Col } from 'react-bootstrap';
import { Card } from 'primereact/card';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import config from '../../config';
import CustomToast from '../../components/CustomToast';
import '../../assets/css/login.css';

const ResetPassword = () => {
    const { token } = useParams();  // Get the token from the URL params
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const toastRef = useRef(null);

    const showMessage = (severity, detail) => {
        const summary = severity.charAt(0).toUpperCase() + severity.slice(1);
        toastRef.current.show(severity, summary, detail);
    };

    const handlePasswordViewToggle = () => {
        setShowPassword(!showPassword);
    };

    const handleConfirmPasswordViewToggle = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showMessage('error', 'Passwords do not match');
            return;
        }
        try {
            const response = await axios.post(`${config.apiBASEURL}/Forgot/reset-password/${token}`, { password });
            showMessage('success', 'Password has been reset successfully');
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (error) {
            showMessage('error', error.response?.data || 'Error resetting password');
        }
    };

    return (
        <Container className='login-card'>
            <Row className="mx-0">
                <Col md='6' lg='3' className='w-440'>
                    <Card title="Reset Password">
                        <p className='login_logo'>
                            <img src={require("../../assets/images/logogf.png")} alt="Logo" style={{ width: '30px', height: '30px' }} />
                            Blackbox
                        </p>
                        <form onSubmit={handleSubmit} className='mt-4'>
                            <Form.Group controlId="formPassword">
                                    <label htmlFor="email"><i className='pi pi-lock pe-2'></i>New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <InputText
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter new password"
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
                            </Form.Group>
                            <Form.Group controlId="formConfirmPassword" className='mt-3'>
                                <label htmlFor="email"><i className='pi pi-lock pe-2'></i>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <InputText
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                    
                                </div>
                            </Form.Group>
                            <div className='d-flex justify-content-center mt-4'>
                                <Button className='loginbtn' type="submit">Reset Password</Button>
                            </div>
                            {/* <Button variant="primary" type="submit">Reset Password</Button> */}
                        </form>
                    </Card>
                </Col>
            </Row>
            <CustomToast ref={toastRef} />
        </Container>
    );
};

export default ResetPassword;
