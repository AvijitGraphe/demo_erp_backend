import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Breadcrumb, Table, CardHeader , Form} from 'react-bootstrap';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom'; // Assuming React Router is used
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Badge } from 'primereact/badge';
import { Image } from 'primereact/image';
import { Sidebar } from 'primereact/sidebar';
import { InputNumber } from 'primereact/inputnumber';


const Invoice_list = () => {

     return (
            <>
                <Row className="body_content">
                    <Row className="mx-0">
                        <Col sm={4} className="mb-4 d-flex justify-content-between align-items-center">
                            <Breadcrumb>
                                <Breadcrumb.Item active>Invoice List</Breadcrumb.Item>
                            </Breadcrumb>
                        </Col>
                        <Col sm={8} className="mb-4 d-flex justify-content-end align-items-center">
                            <Link to='/dashboard/add_invoice'>
                                <Button
                                    label='Add Invoice'
                                    icon='pi pi-plus'
                                    className='py-2'
                                    severity='primary'
                                />
                            </Link>
                        </Col>
                    </Row>
                </Row>
            </>
        );
    };
    
    export default Invoice_list;