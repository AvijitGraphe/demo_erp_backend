import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, CardTitle } from 'react-bootstrap';
import { Button } from 'primereact/button';

const Nouser = () => { // Corrected component name to Nouser
  const { logout } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    console.log('Nouser component mounted');
  }, []);


  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to the home page after logout
  };


  const handleClick = () => {
    navigate('/newuser/profiledetails');
  };


  return (
    <Container fluid className='noneverify'>
      <Row>
        <Col md='6' lg='3' className='w-450 m-auto' style={{ height: '100vh', alignItems: 'center', display: 'flex' }}>
          <Card className='verify-card position-relative shadow-0 bg-transparent'>
              <img src={require("../../assets/images/no_verify.gif")} className='w-100' alt="No User Found"/>
              <div className='noneverify_text text-center'>
                <h3>Not a verified user</h3>
                <p>Please contact your admin to verify your account</p>
                <div className='d-flex justify-content-center'>
                  
                  <Button 
                    label="Edit Profile"
                    onClick={handleClick}
                    icon='pi pi-user-edit'
                    className='mt-3'
                    outlined
                    style={{ width: '150px', height: '46px' }}
                  />
                  <Button 
                    title="Logout" 
                    onClick={handleLogout} 
                    icon='pi pi-sign-out'
                    className='mt-3 ms-3'
                    outlined
                    severity='danger'
                    style={{ width: '50px', height: '46px' }}
                  />
                </div>
              </div>
            </Card>
        </Col>
      </Row>  
    </Container>
  );
};

export default Nouser;




