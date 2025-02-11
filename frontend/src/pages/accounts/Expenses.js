import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Breadcrumb, Table, CardHeader , Form} from 'react-bootstrap';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Assuming React Router is used
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

const Expenses = () => {

    const [dates, setDates] = useState(null);
    const [visibleRight, setVisibleRight] = useState(false);
    const [value3, setValue3] = useState('');
    const [date, setDate] = useState(null);

     return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col sm={4} className="mb-4 d-flex justify-content-between align-items-center">
                        <Breadcrumb>
                            <Breadcrumb.Item active>Expenses</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col sm={8} className="mb-4 d-flex justify-content-end align-items-center">
                        <Button
                            label='Add Expense'
                            icon='pi pi-plus'
                            className='py-2'
                            severity='primary'
                            onClick={() => setVisibleRight(true)}
                        />
                    </Col>

                    <Card>
                        <Card.Header className='d-flex justify-content-end align-items-center'>
                            <div className='d-flex'>
                                <IconField iconPosition="left" style={{ width: '200px' }} className='me-2'>
                                    <InputIcon className="pi pi-search"> </InputIcon>
                                    <InputText placeholder="Search" className='ps-5' />
                                </IconField>
                                <Calendar 
                                    value={dates} 
                                    onChange={(e) => setDates(e.value)} 
                                    selectionMode="range" 
                                    readOnlyInput 
                                    hideOnRangeSelection 
                                    style={{ width: '200px' }}
                                    placeholder='Select Date Range'
                                />
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className='table-responsive'>
                                <Table  hover size="sm">
                                    <thead>
                                        <tr className='table-light'>
                                            <th style={{ width: '150px' }}>Date</th>
                                            <th style={{ width: '150px' }}>Image</th>
                                            <th>Expense</th>
                                            <th style={{ width: '150px' }}>Amount</th>
                                            <th style={{ width: '150px' }}>Status</th>
                                            <th style={{ width: '100px' }} className='text-center'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>20/01/2025</td>
                                            <td>
                                                {/* <Image src={require("../../assets/images/logo.png")} alt='' style={{ width: '80px', height: 'auto' }} preview /> */}
                                                <Image src={require("../../assets/images/logo.png")} zoomSrc={require("../../assets/images/logo.png")} alt="Image" width="80" height="auto" preview />
                                            </td>
                                            <td>
                                                <p className='m-0 w-75'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                            </td>
                                            <td>₹1000</td>
                                            <td><Badge value="Paid" severity="success" /></td>
                                            <td className='text-center'>
                                                <Button
                                                    title='Delete'
                                                    icon='pi pi-trash'
                                                    severity='danger'
                                                    outlined
                                                    className='border-0 p-0'
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Row>
            </Row>
            <Sidebar visible={visibleRight} position="right" onHide={() => setVisibleRight(false)}>
                <h5 className='mb-4'>Add Expenses</h5>
                <Form>
                    <div className='mb-3'>
                        <Form.Label>Upload Image</Form.Label>
                            <Form.Control
                                type="file"
                            />
                    </div>
                    <div className='mb-3'>
                        <Form.Label>Your Text</Form.Label>
                        <Form.Control as="textarea" aria-label="With textarea" rows={5} className='h-auto' />
                    </div>
                    <div className='mb-3'>
                        <Form.Label>Add Amount</Form.Label>
                        <InputNumber 
                            inputId="currency-india" 
                            value={value3} 
                            onValueChange={(e) => setValue3(e.value)} 
                            mode="currency" 
                            currency="INR" 
                            currencyDisplay="code" 
                            ocale="en-IN"
                            className='w-100'
                        />
                    </div>
                    <div className='mb-3'>
                        <Form.Label>Select Date</Form.Label>
                        <Calendar value={date} onChange={(e) => setDate(e.value)} />
                    </div>
                    <div className='mb-3'>
                        <Form.Label>Select Status</Form.Label>
                        <Form.Select aria-label="Default select example">
                            <option da>Select Status</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </Form.Select>
                    </div>
                    <div className='mt-3 d-flex justify-content-end'>
                        <Button 
                            label='Save'
                            severity='primary'
                            className='py-2'

                        />

                    </div>
                </Form>
            </Sidebar>
        </>
    );
};

export default Expenses;