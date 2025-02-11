import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Breadcrumb, Table, CardHeader, Badge } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Assuming React Router is used
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';


const Edit_client = () => {

     return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col sm={12} className="mb-4 d-flex justify-content-between align-items-center">
                        <Breadcrumb>
                            <Breadcrumb.Item active>Edit Client</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                </Row>
            </Row>
        </>
    );
};

export default Edit_client;