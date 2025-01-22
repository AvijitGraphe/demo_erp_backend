import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Breadcrumb, Card, Form } from 'react-bootstrap';
import { Calendar } from 'primereact/calendar';
import { MDBTable, MDBTableHead, MDBTableBody } from 'mdb-react-ui-kit';
import { Button } from 'primereact/button';
import '../../assets/css/calender.css';
import axios from 'axios';
import config from '../../config';
import CustomToast from '../../components/CustomToast';
import { useAuth } from "../../context/AuthContext";

import moment from 'moment';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';

const Addholiday = () => {
    const [date, setDate] = useState(null);
    const [holidayName, setHolidayName] = useState('');
    const [holidays, setHolidays] = useState([]);
    const [editingHoliday, setEditingHoliday] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const toastRef = useRef(null);
    const [status, setStatus] = useState('');
    const { accessToken } = useAuth(); // Get userId from the context 
    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${config.apiBASEURL}/Holiday/holidays`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setHolidays(Array.isArray(response.data) ? response.data : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching holidays', error);
            setError('Error fetching holidays. Please try again later.');
            setLoading(false);
        }
    };

    const formatDateToUTC = (date) => {
        const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        return utcDate.toISOString().split('T')[0];
    };

    const showMessage = (severity, detail) => {
        const summary = severity.charAt(0).toUpperCase() + severity.slice(1);
        toastRef.current.show(severity, summary, detail);
    };

    const addHoliday = async () => {
        if (!holidayName || !date || !status) {
            setError('Please fill in all required fields.');
            showMessage('error', 'Please fill in all required fields.');
            return;
        }
    
        setLoading(true);
        try {
            await axios.post(`${config.apiBASEURL}/Holiday/holiday`, {
                holiday_name: holidayName,
                holiday_date: formatDateToUTC(date),
                status: status
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            fetchHolidays();
            setHolidayName('');
            setDate(null);
            setStatus('');
            setError('');
            showMessage('success', 'Holiday added successfully');
        } catch (error) {
            console.error('Error adding holiday', error);
            setError('Error adding holiday. Please try again.');
            showMessage('error', 'Error adding holiday. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    

    const updateHoliday = async () => {
        if (!holidayName || !date || !status || !editingHoliday) {
            setError('Please fill in all required fields.');
            showMessage('error', 'Please fill in all required fields.');
            return;
        }
    
        setLoading(true);
        try {
            await axios.put(`${config.apiBASEURL}/Holiday/holiday/${editingHoliday.holiday_id}`, {
                holiday_name: holidayName,
                holiday_date: formatDateToUTC(date),
                status: status
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            fetchHolidays();
            setEditingHoliday(null);
            setHolidayName('');
            setDate(null);
            setStatus('');
            setError('');
            showMessage('success', 'Holiday updated successfully');
        } catch (error) {
            console.error('Error updating holiday', error);
            setError('Error updating holiday. Please try again.');
            showMessage('error', 'Error updating holiday. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    

    const deleteHoliday = async (holidayId) => {
        setLoading(true);
        try {
            await axios.delete(`${config.apiBASEURL}/Holiday/holiday/${holidayId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            fetchHolidays();
            setError('');
            showMessage('success', 'Holiday deleted successfully');
        } catch (error) {
            console.error('Error deleting holiday', error);
            setError('Error deleting holiday. Please try again.');
            showMessage('error', 'Error deleting holiday. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (holiday) => {
        setEditingHoliday(holiday);
        setHolidayName(holiday.holiday_name);
        setDate(new Date(holiday.holiday_date));
        setStatus(holiday.status); // Add this line to set the status
    };
    

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingHoliday) {
            updateHoliday();
        } else {
            addHoliday();
        }
    };

    const [dateRange, setDateRange] = useState({ startDate: moment().subtract(0, 'days'), endDate: moment() });
    const handleDateRangeChange = (start, end) => {
        setDateRange({ startDate: start, endDate: end });
    };

    return (
        <>
            <Row className='body_content'>
                <Row className='mx-0'>
                    <Col md={6} lg={9} className='mb-4'>
                        <Breadcrumb>
                            <Breadcrumb.Item active>Holiday List</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Row className="holidayPage">
                        <Col lg='4' md='12' className="pe-lg-3 ps-0">
                            <Card className="h-auto sticky-top">
                                <Card.Header><b>{editingHoliday ? 'Edit Holiday' : 'Add Holidays'}</b></Card.Header>
                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        <Col lg='12' className='mb-4'>
                                            <Card className='addEm shadow-0 p-0'>
                                                <Card.Body className='p-0'>
                                                    <Row className="mb-3">
                                                        <Col lg={12} md={12}>
                                                            <Form.Label>Holiday Name <span className='text-danger'>*</span></Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                placeholder="Holiday Name"
                                                                value={holidayName}
                                                                onChange={(e) => setHolidayName(e.target.value)}
                                                                required
                                                            />
                                                        </Col>
                                                        <Col lg={12} md={12} className='mt-3'>
                                                            <Form.Label>Holiday Date<span className='text-danger'>*</span></Form.Label>
                                                            <br />
                                                            {/* <Calendar
                                                                value={date}
                                                                onChange={(e) => setDate(e.value)}
                                                                dateFormat="dd-mm-yy"
                                                                placeholder="Select Date"
                                                                required
                                                            /> */}
                                                            <DateRangePicker
                                                                initialSettings={{
                                                                    startDate: dateRange.startDate,
                                                                    endDate: dateRange.endDate,
                                                                    locale: { format: 'DD/MM/YYYY' }
                                                                }}
                                                                onCallback={(start, end) => handleDateRangeChange(start, end)}
                                                            >
                                                                <input type="text" className="form-control" placeholder="Select Date" />
                                                            </DateRangePicker>
                                                        </Col>
                                                        <Col lg={12} md={12} className='mt-3'>
                                                            <Form.Label>Status<span className='text-danger'>*</span></Form.Label>
                                                            <Form.Control
                                                                as="select"
                                                                value={status}
                                                                onChange={(e) => setStatus(e.target.value)}
                                                                required
                                                            >
                                                                <option value="">Select Status</option>
                                                                <option value="active">Active</option>
                                                                <option value="inactive">Inactive</option>
                                                            </Form.Control>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col lg='12' className='d-flex justify-content-end'>
                                            <Button
                                                label={editingHoliday ? 'Update' : 'Save'}
                                                icon={loading ? 'pi pi-spin pi-spinner' : null}
                                                disabled={loading}
                                                severity="info"
                                                style={{ width: '100px', height: '46px' }}

                                            />
                                        </Col>
                                    </Form>
                                    {error && <p className="text-danger mt-2">{error}</p>}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg='8' md='12'>
                            <Card className='text-center h-auto'>
                                <MDBTable responsive striped hover small>
                                    <MDBTableHead light>
                                        <tr>
                                            <th scope='col'>#</th>
                                            <th scope='col'>Title</th>
                                            <th scope='col'>Holiday Date</th>
                                            <th scope='col'>Action</th>
                                        </tr>
                                    </MDBTableHead>
                                    <MDBTableBody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4">Loading...</td>
                                            </tr>
                                        ) : holidays.length === 0 ? (
                                            <tr>
                                                <td colSpan="4">No holidays found.</td>
                                            </tr>
                                        ) : (
                                            holidays.map((holiday, index) => (
                                                <tr key={holiday.holiday_id}>
                                                    <td>{index + 1}</td>
                                                    <td>{holiday.holiday_name}</td>
                                                    <td>{holiday.holiday_date}</td>
                                                    <td>
                                                        <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-primary" onClick={() => handleEdit(holiday)} />
                                                        <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => deleteHoliday(holiday.holiday_id)} />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </MDBTableBody>
                                </MDBTable>
                            </Card>
                        </Col>
                        <CustomToast ref={toastRef} />
                    </Row>
                </Row>
            </Row>

        </>
    );
};

export default Addholiday;