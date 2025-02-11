import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import config from '../../config';
import { InputText } from "primereact/inputtext";
import CustomToast from '../../components/CustomToast';
import '../../assets/css/login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const toastRef = useRef(null);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prevCooldown) => prevCooldown - 1);
            }, 1000);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const showMessage = (severity, detail) => {
        const summary = severity.charAt(0).toUpperCase() + severity.slice(1);
        toastRef.current.show(severity, summary, detail);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCooldown(60); // Set cooldown to 1 minute (60 seconds)
        showMessage('info', `You can request another reset link in ${cooldown} seconds.`);
        try {
            const response = await axios.post(`${config.apiBASEURL}/Forgot/forgot-password`, { email });
            showMessage('success', response.data);

        } catch (error) {
            showMessage('error', 'Error sending reset link');
        }
    };

    return (
        <Container className='login-card'>
            <Row className="m-0">
                <Col md='6' lg='3' className='w-440'>
                    <Card title="Forgot Password">
                        <p className='login_logo'>
                            <img src={require("../../assets/images/logogf.png")} alt="Logo" style={{ width: '30px', height: '30px' }} />
                            Blackbox
                        </p>
                        <form onSubmit={handleSubmit} className='mt-4'>
                            <Col className='mb-3'>
                                <label htmlFor="email"><i className='pi pi-envelope pe-2'></i>Email</label>
                                <InputText 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    disabled={cooldown > 0}
                                />
                            </Col>
                            <Col className='d-flex justify-content-center mt-4'>
                                <Button type="submit" className='loginbtn' disabled={cooldown > 0}>
                                    {cooldown > 0 ? `Wait ${cooldown} seconds` : 'Send Reset Link'}
                                </Button>
                            </Col>
                           
                            {/* <button type="submit" disabled={cooldown > 0}>
                                {cooldown > 0 ? `Wait ${cooldown} seconds` : 'Send Reset Link'}
                            </button> */}
                        </form>
                    </Card>
                </Col>
            </Row>
            <CustomToast ref={toastRef} />
        </Container>
    );
};

export default ForgotPassword;
