import React, { useState, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Card } from 'primereact/card';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import { Password } from 'primereact/password';
import Form from 'react-bootstrap/Form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../../assets/css/login.css';
import config from '../../config';
import CustomToast from '../../components/CustomToast';

function Signup() {
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    // const [uploadedFiles, setUploadedFiles] = useState([]);
    const navigate = useNavigate();
    const toastRef = useRef(null);

    const showMessage = (severity, detail) => {
        const summary = severity.charAt(0).toUpperCase() + severity.slice(1);
        toastRef.current.show(severity, summary, detail);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        // Validate password confirmation
        if (password !== event.target.cpassword.value) {
            showMessage('error', 'Passwords do not match');
            return;
        }
    
        // Construct the payload
        const payload = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
        };
    
        try {
            // Send JSON request to the backend
            const response = await axios.post(`${config.apiBASEURL}/authentication/register`, payload, {
                headers: { 'Content-Type': 'application/json' }, // Ensure JSON is sent
            });
    
            // Handle the response
            if (response.status === 201) {
                showMessage('success', `User registered successfully, welcome ${response.data.name}`);
                setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
            }
        } catch (error) {
            console.error('Error registering user:', error);
    
            // Handle specific error messages from the backend
            const errorMessage = error.response?.data?.message || 'Error registering user';
            showMessage('error', errorMessage);
        }
    };
    

    return (
        <>
            <Container className='login-card'>
                <Row className="mx-0">
                    <Col md='6' lg='3' className='w-440'>
                        <Card title="Register" className='REGform'>
                            <form className='mt-4' onSubmit={handleSubmit}>
                                <Row className='m-0 h-auto ps-0'>
                                    <Col md={6} lg={6} className='mb-3 ps-0'>
                                        <span className='fnameinp'>
                                            <label htmlFor="firstName"><i className='pi pi-user pe-2'></i>First Name <span>*</span></label>
                                            <InputText
                                                type="text"
                                                name="firstName"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="Enter your first name"
                                                required
                                            />
                                        </span>
                                    </Col>
                                    <Col md={6} lg={6} className='mb-3 pe-0'>
                                        <span className='fnameinp'>
                                            <label htmlFor="lastName"><i className='pi pi-user pe-2'></i>Last Name <span>*</span></label>
                                            <InputText
                                                type="text"
                                                name="lastName"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="Enter your last name"
                                                required
                                            />
                                        </span>
                                    </Col>
                                </Row>
                                <Col md={12} lg={12} className='mb-3 p-0'>
                                    <span className='fnameinp'>
                                        <label htmlFor="email"><i className='pi pi-envelope pe-2'></i>Email <span>*</span></label>
                                        <InputText
                                            type="email"
                                            name="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="jon@test.com"
                                            required
                                        />
                                    </span>
                                </Col>
                                
                                    <Col md={6} lg={12} className='mb-3 p-0 pe-1'>
                                        <label htmlFor="password"><i className='pi pi-lock pe-2'></i>Password <span>*</span></label>
                                        <Password
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Password"
                                            toggleMask
                                            className='w-100 d-block position-relative'
                                            required
                                        />
                                    </Col>
                                    <Col md={6} lg={12} className='mb-3 p-0 ps-1'>
                                        <span className='fnameinp'>
                                            <label htmlFor="cpassword"><i className='pi pi-lock pe-2'></i>Confirm Password <span>*</span></label>
                                            <InputText
                                                type="password"
                                                name="cpassword"
                                                placeholder="***********"
                                                required
                                            />
                                        </span>
                                    </Col>
                               
                                <Col className='text-center mt-4'><Button label="Signup" type="submit" className='loginbtn' /></Col>
                            </form>
                            <p className='mt-4 text-center'>Already have an account? <Link to='/'>Login</Link></p>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <CustomToast ref={toastRef} />
        </>
    );
}

export default Signup;
