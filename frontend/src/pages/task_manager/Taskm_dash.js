import '../../App.css';
import '../../assets/css/admin.css';
import { Col, Row, Card, Breadcrumb, Badge, Table } from 'react-bootstrap';
import React, { useEffect, useState } from "react";
import moment from 'moment';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { TbUsersMinus } from "react-icons/tb";
import { TbBeach } from "react-icons/tb"
import { PiUsersFourLight } from "react-icons/pi";
import { LiaHourglassHalfSolid } from "react-icons/lia";
import { Dialog } from 'primereact/dialog';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';
import { Tooltip } from 'primereact/tooltip';



const Taskm_dash = () => {
    const { accessToken, userId } = useAuth();
    const [visible, setVisible] = useState(false);
    const [checkedIn, setCheckedIn] = useState(false);
    const [loading, setLoading] = useState(false);


    const [dateRange, setDateRange] = useState({
        startDate: moment().startOf('week'),
        endDate: moment().endOf('week'),
    });
    const [events, setEvents] = useState([]);

    const fetchHolidays = async () => {
        try {
            const { startDate, endDate } = dateRange;
            const response = await axios.get(`${config.apiBASEURL}/HolidayRoutes/holidays/week`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    startDate: startDate.format('YYYY-MM-DD'),
                    endDate: endDate.format('YYYY-MM-DD'),
                },
            });

            // Map holidays to FullCalendar event format
            const holidayEvents = response.data.holidays.map((holiday) => ({
                title: holiday.holiday_name,
                start: holiday.holiday_date,
                bbackgroundColor: '#14a8b6',
                borderColor: '#14a8b6',
                textColor: '#fff', // Custom color for holidays
            }));

            setEvents(holidayEvents);
        } catch (error) {
            console.error("Error fetching holidays:", error);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, [dateRange, accessToken]);


// Fetch the current attendance status on load
useEffect(() => {
    const fetchAttendanceStatus = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${config.apiBASEURL}/attendance/fetch-attendance`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { user_id: userId },
            });
            setCheckedIn(response.data.checkin_status);
        } catch (error) {
            console.error('Error fetching attendance status:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchAttendanceStatus();
}, [accessToken, userId]);


 // Check-in function
 const handleCheckIn = async () => {
    try {
        const checkInTime = moment().format('HH:mm');
        const currentDate = moment().format('YYYY-MM-DD'); // Updated format to DD/MM/YYYY

        await axios.post(`${config.apiBASEURL}/attendance/add-checkin`, {
            user_id: userId,
            start_time: checkInTime,
            date: currentDate
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}` // Send token in Authorization header
            }
        });

        setCheckedIn(true);
        // setStartTime(new Date()); // Start time is now
        // showMessage('success', 'Check-in successful!');

    } catch (error) {
        console.error('Error during check-in:', error);
        // const errorMessage = error.response?.data?.message || 'Error during check-in';
        // showMessage('error', errorMessage); // Display error message in toast
    }
};

// Check-out function
const handleCheckOut = async () => {
    try {
        const checkOutTime = moment().format('HH:mm'); // Format time to HH:mm
        const currentDate = moment().format('YYYY-MM-DD'); // Format date to YYYY-MM-DD for backend compatibility

        await axios.put(`${config.apiBASEURL}/attendance/update-checkout/${userId}`, {
            date: currentDate,      // Include the date in the body in correct format
            end_time: checkOutTime  // Send the properly formatted time
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        setCheckedIn(false);
        // setElapsedTime('00:00'); // Reset the timer
        // showMessage('success', 'Check-out successful!');
    } catch (error) {
        console.error('Error during check-out:', error);
        // const errorMessage = error.response?.data?.message || 'Error during check-out';
        // showMessage('error', errorMessage); // Display error message
    }
};

const handleCheckInOut = () => {
    if (!checkedIn) {
        handleCheckIn();
    } else {
        handleCheckOut();
    }
};


    return (
        <>
            <Row className='body_content'>
                <Row className='mx-0'>
                    <Col md={6} lg={6} className='mb-4'>
                        <Breadcrumb>
                            <Breadcrumb.Item active>Taskm Management</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={6} lg={6} className='mb-4 d-flex justify-content-end'>
                        <Button
                            label={checkedIn ? 'Check Out' : 'Check In'}
                            icon="pi pi-clock"
                            severity={checkedIn ? 'danger' : 'success'}
                            onClick={handleCheckInOut}
                            disabled={loading}
                            className="py-2 border-0"
                        />
                        <Button
                            label="Add Leaves"
                            icon="pi pi-plus"
                            severity="help"
                            className="py-2 border-0 ms-2"
                        />
                </Col>
                    <Col md={12} lg={12} className='mb-4'>
                        <Card className='dashboard_week'>
                            <Card.Body>
                                <div className='dash_calender'>
                                    <Link to={'/dashboard/calendar'}>
                                        <Button
                                            label='Full View'
                                            icon="pi pi-calendar"
                                            className="p-0 border-0"
                                            severity='danger'
                                            outlined
                                        />
                                    </Link>
                                </div>
                                <FullCalendar
                                     plugins={[dayGridPlugin, interactionPlugin]} 
                                    headerToolbar={{
                                        right: '' 
                                    }}
                                    initialView="dayGridWeek" 
                                    editable={false}
                                    selectable={true}
                                    events={events}
                                   // eventClick={handleEventClick}
                                    //datesSet={handleDatesSet}
                                    dayHeaderFormat={{ weekday: 'short', day: '2-digit'}} // DD/MM/YY for header
                                    eventTimeFormat={{
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    meridiem: false // 24-hour format
                                    }}
                                />

                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={'12'} lg={'12'} className='dashboard_card pb-3'>
                        <Card className='p-0'>
                            <Card.Header className='d-flex justify-content-between align-items-center'>
                                <b>Priority Tasks <sup><Badge className='bg-danger'>15</Badge></sup></b>
                                <small><Link to={''}>View All</Link></small>
                            </Card.Header>
                            <Card.Body className='table-scroll'>
                                <Table responsive size="sm" hover className='taskover'>
                                    <thead>
                                        <tr className='table-secondary'>
                                            <th style={{ width: '200px' }}>Brand</th>
                                            <th>Task Name</th>
                                            <th style={{ width: '250px' }}>Task Description</th>
                                            <th>Department</th>
                                            <th>Project Leader</th>
                                            <th>Allocate To</th>
                                            <th className='table-info' style={{ width: '130px' }}>Create Date</th>
                                            <th className='table-danger' style={{ width: '130px' }}>Deadline</th>
                                            <th className='text-center' style={{ width: '100px' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Brand</td>
                                            <td>Task Name</td>
                                            <td>3rd static</td>
                                            <td>Marketing</td>
                                            <td>smith</td>
                                            <td>
                                            <AvatarGroup>
                                                <Avatar 
                                                    image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" 
                                                    size="small"
                                                    shape="circle"
                                                    style={{width: '32px', height: '32px'}}
                                                    className='custom-target-icon d-block'
                                                    data-pr-tooltip="Jon Dow"
                                                />
                                                <Avatar 
                                                    image="https://primefaces.org/cdn/primereact/images/avatar/asiyajavayant.png" 
                                                    size="small"
                                                    shape="circle"
                                                    className='custom-target-icon d-block'
                                                    data-pr-tooltip="Jon Smith"
                                                />
                                                <Avatar 
                                                    image="https://primefaces.org/cdn/primereact/images/avatar/onyamalimba.png" 
                                                    size="small"
                                                    shape="circle" 
                                                    className='custom-target-icon d-block'
                                                    data-pr-tooltip="Smith Dow"
                                                />
                                                <Tooltip target=".custom-target-icon" />
                                            </AvatarGroup>
                                            </td>
                                            <td className='table-info'>29/11/2024</td>
                                            <td className='table-danger'>30/11/2024</td>
                                            <td className='text-center'><Badge>To Do</Badge></td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6}>
                        <Card className='emp_list_card p-0'>
                            <Card.Header className='d-flex justify-content-between align-items-center'>
                                <b>Pending Tasks <sup><Badge className='bg-danger'>6</Badge></sup></b>
                                <small><Link to={''}>View All</Link></small>
                            </Card.Header>
                            <Card.Body className='table-scroll'>
                                <Table size="sm" hover className='text-left'>
                                    <thead>
                                        <tr className='table-secondary'>
                                            <th>Brand Name</th>
                                            <th>Task Name</th>
                                            <th>Deadlines</th>
                                            <th>Allocate To</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Test Brand</td>
                                            <td>Test Task</td>
                                            <td>30/11/2024</td>
                                            <td>Jon Dow</td> 
                                        </tr>
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={6}>
                        <Card className='emp_list_card p-0'>
                            <Card.Header className='d-flex justify-content-between align-items-center'>
                                <b>Urgent Tasks <sup><Badge className='bg-danger'>10</Badge></sup></b>
                                <small><Link to={''}>View All</Link></small>

                            </Card.Header>
                            <Card.Body className='table-scroll'>
                                <Table size="sm" hover className='text-left'>
                                    <thead>
                                        <tr className='table-secondary'>
                                            <th>Brand Name</th>
                                            <th>Task Name</th>
                                            <th>Deadlines</th>
                                            <th>Allocate To</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Test Brand</td>
                                            <td>Test Task</td>
                                            <td>30/11/2024</td>
                                            <td>Smith Dow</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6}>
                        <Card className='emp_list_card p-0'>
                            <Card.Header className='d-flex justify-content-between align-items-center'>
                                <b>Missed Deadlines <sup><Badge className='bg-danger'>3</Badge></sup></b>
                                {/* <small><Link to={''}>View All</Link></small> */}

                                

                            </Card.Header>
                            <Card.Body className='table-scroll'>
                                <Table size="sm" hover className='text-left'>
                                    <thead>
                                        <tr className='table-secondary'>
                                            <th>Brand Name</th>
                                            <th>Task Name</th>
                                            <th>Deadlines</th>
                                            <th>Allocate To</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Test Brand</td>
                                            <td>Test Task</td>
                                            <td>30/11/2024</td>
                                            <td>Smith Dow</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Row>
        </>

    )
};



export default Taskm_dash;