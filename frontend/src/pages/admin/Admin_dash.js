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
import { TabView, TabPanel } from 'primereact/tabview';
import Dash_evntcal from '../../components/Dash_evntcal';
import Brand_postcal from '../../components/Brand_postcal';


const Admin_dash = () => {
    const { accessToken, userId } = useAuth();
    const [visible, setVisible] = useState(false);
    const [visible1, setVisible1] = useState(false);

    const [loading, setLoading] = useState(false);
    const [overtimeData, setOvertimeData] = useState([]);
    const [tasks, setTasks] = useState([]);


    const [presentCount, setPresentCount] = useState(0);
    const [notCheckedInCount, setNotCheckedInCount] = useState(0);
    const [leaveCount, setLeaveCount] = useState(0);
    const [leaveUsers, setleaveUsers] = useState(0);
    const [overallEmployees, setOverallEmployees] = useState(0);
    const [notCheckedInUsers, setNotCheckedInUsers] = useState([]);

    const [taskSummary, setTaskSummary] = useState(null);
    const [employeetaskSummary, setemployeeTaskSummary] = useState(null);


    useEffect(() => {
        // Fetch data from the API
        const fetchData = async () => {
            try {
                const response = await fetch(`${config.apiBASEURL}/attendance/fetch-dashboard-attendance-summary`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }); // Replace with your actual API endpoint
                const data = await response.json();
                // Update state
                setPresentCount(data.presentCount);
                setNotCheckedInCount(data.notCheckedInCount);
                setLeaveCount(data.leaveCount);
                setleaveUsers(data.leaveUsers);
                setOverallEmployees(data.totalUsers);
                setNotCheckedInUsers(data.notCheckedInUsers);
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            }
        };
        fetchData();
    }, []);



    // Fetch the current attendance status on load
    useEffect(() => {
        const fetchOvertime = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${config.apiBASEURL}/overtimeRoutes/dashboardovertime`, {
                    headers: { Authorization: `Bearer ${accessToken}` },

                });
                setOvertimeData(response.data);
            } catch (error) {
                console.error('Error fetching attendance status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOvertime();
    }, [accessToken]);


    useEffect(() => {
        const fetchWeeklyPriorityTasks = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${config.apiBASEURL}/projectRoutes/tasks/weekly-priority`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                console.log("log the data isnow response ", response);
                setTasks(response.data.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching weekly priority tasks:', err);
                setLoading(false);
            }
        };

        fetchWeeklyPriorityTasks();
    }, [accessToken]);


    useEffect(() => {
        setLoading(true);
        const fetchTaskSummary = async () => {
            try {
                // Replace with your backend API URL
                const response = await axios.get(`${config.apiBASEURL}/projectRoutes//brand-task-summary`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setTaskSummary(response.data.summary || {});
            } catch (err) {
                console.error('Error fetching task summary:', err);
                setLoading(false);
            }
        };

        fetchTaskSummary();
    }, [accessToken]);

    useEffect(() => {
        setLoading(true);
        const fetchEmployeeTaskSummary = async () => {
            try {
                // Replace with your backend API URL
                const response = await axios.get(`${config.apiBASEURL}/projectRoutes//user-task-summary`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setemployeeTaskSummary(response.data.summary || {});
            } catch (err) {
                console.error('Error fetching employee task summary:', err);
                setLoading(false);
            }
        };
        fetchEmployeeTaskSummary();
    }, [accessToken]);





    const formatTime = (time) => {
        const [hours, minutes] = time.slice(0, 5).split(':').map(Number); // Get HH:mm and split
        const suffix = hours >= 12 ? 'PM' : 'AM'; // Determine AM/PM
        const adjustedHours = hours % 12 || 12; // Convert 24-hour to 12-hour format
        return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${suffix}`; // Format time with AM/PM
    };

    return (
        <>
            <Row className='body_content'>
                <Row className='mx-0'>
                    <Col md={6} lg={6} className='mb-4'>
                        <Breadcrumb>
                            <Breadcrumb.Item active>Dashboard</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={12} lg={12} className='mb-4'>
                        <Card>
                            <TabView>
                                <TabPanel header="Event Calendar">
                                    <Dash_evntcal />
                                </TabPanel>
                                <TabPanel header="Brand Calander">
                                    <Brand_postcal />
                                </TabPanel>

                            </TabView>
                        </Card>
 
                    </Col>
                    <Col md={'12'} lg={'12'} className='dashboard_card ps-0'>
                        <Row className='justify-content-between'>
                            <Col md={'6'} lg={'3'} className='dashboard_card mb-4'>
                                <Card>
                                    <Card.Header>
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <span className="d-block">Present <sub className='text-primary'>(Today)</sub></span>
                                            </div>
                                            <div className='hrshortdata'>
                                                <span><PiUsersFourLight /></span>
                                            </div>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Card.Title>{presentCount}</Card.Title>
                                        <Card.Text>
                                            <span>Overall Employees {overallEmployees}</span>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={'6'} lg={'3'} className='dashboard_card mb-4'>
                                <Link onClick={() => setVisible(true)}>
                                    <Card>
                                        <Card.Header>
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <span className="d-block">Not Checked-In <sub className='text-primary'>(Today)</sub></span>
                                                </div>
                                                <div className='hrshortdata'>
                                                    <span><TbUsersMinus /></span>
                                                </div>
                                            </div>
                                        </Card.Header>
                                        <Card.Body>
                                            <Card.Title>{notCheckedInCount}</Card.Title>
                                            <Card.Text>
                                                <span>Overall Employees {overallEmployees}</span>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                            <Col md={'6'} lg={'3'} className='dashboard_card mb-4'>
                                <Link onClick={() => setVisible1(true)}>
                                    <Card>
                                        <Card.Header>
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <span className="d-block">Approved Leave <sub className='text-primary'>(Today)</sub></span>
                                                </div>
                                                <div className='hrshortdata'>
                                                    <span><TbUsersMinus /></span>
                                                </div>
                                            </div>
                                        </Card.Header>
                                        <Card.Body>
                                            <Card.Title>{leaveCount}</Card.Title>
                                            <Card.Text>
                                                <span>Overall Employees {overallEmployees}</span>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                            <Col md={'6'} lg={'3'} className='dashboard_card mb-4 pe-lg-0'>
                                <Card>
                                    <Card.Header>
                                        <div className="d-flex justify-content-between">
                                            <div className='headerdashTitle'>
                                                <span className="d-block">Half Day <sub className='text-primary'>(Today)</sub></span>
                                            </div>
                                            <div className='hrshortdata'>
                                                <span><LiaHourglassHalfSolid /></span>
                                            </div>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Card.Title>0</Card.Title>
                                        <Card.Text>
                                            <span>Overall Employees {overallEmployees}</span>
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>

                    <Col md={'12'} lg={'12'} className="dashboard_card">
                        <Card className="emp_list_card p-0">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <b>
                                    Priority Tasks <sub className="text-primary">(This Week)</sub>
                                </b>
                                <span>
                                    Total: <b className="ms-1">{tasks.length}</b>
                                </span>
                            </Card.Header>
                            <Card.Body className="table-scroll">
                                {loading ? (
                                    <div>Loading...</div>
                                ) : tasks.length === 0 ? (
                                    <div className="text-danger">No tasks available for this week.</div>
                                ) : (
                                    <Table responsive bordered size="sm" hover className="taskover">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '200px' }}>Brand</th>
                                                <th>Task Name</th>
                                                <th style={{ width: '250px' }}>Task Description</th>

                                                <th>Project Leader</th>
                                                <th>Allocate To</th>
                                                <th className="table-info" style={{ width: '130px' }}>Create Date</th>
                                                <th className="table-danger" style={{ width: '130px' }}>Deadline</th>
                                                <th className="text-center" style={{ width: '100px' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks.map((task, index) => (
                                                <tr key={index}>
                                                    <td>{task.project?.brand?.brand_name || '-'}</td>
                                                    <td>{task.task_name || '-'}</td>
                                                    <td>{task.task_description || '-'}</td>

                                                    <td>
                                                        {task.project?.lead?.first_name} {task.project?.lead?.last_name || '-'}
                                                    </td>
                                                    <td>
                                                        {task.assignee?.first_name} {task.assignee?.last_name || '-'}
                                                    </td>
                                                    <td className="table-info">
                                                        {new Date(task.task_startdate).toLocaleDateString('en-GB')}
                                                    </td>
                                                    <td className="table-danger">
                                                        {new Date(task.task_deadline).toLocaleDateString('en-GB')}
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge
                                                            bg={
                                                                task.status === 'Todo'
                                                                    ? 'secondary'
                                                                    : task.status === 'InProgress'
                                                                        ? 'primary'
                                                                        : task.status === 'InReview'
                                                                            ? 'warning'
                                                                            : task.status === 'InChanges'
                                                                                ? 'danger'
                                                                                : task.status === 'Completed'
                                                                                    ? 'success'
                                                                                    : 'dark' // Default for unknown statuses
                                                            }
                                                        >
                                                            {task.status || 'Unknown'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>


                    <Col md="12" lg="12" className="dashboard_card">
                        <Card className="emp_list_card p-0">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <b>
                                    Task Overview <sub className="text-primary">(This Month)</sub>
                                </b>
                            </Card.Header>
                            <Card.Body className="table-scroll">
                                <div className="responsive">
                                    <Table hover size="sm" bordered striped>
                                        <thead className="sticky-top" style={{ top: '-20px' }}>
                                            <tr className="table-light">
                                                <th className="table-info">Brand Name</th>
                                                <th>Todo</th>
                                                <th>In Progress</th>
                                                <th>In Review</th>
                                                <th>In Changes</th>
                                                <th>Completed</th>
                                                <th>Missed Deadlines</th>
                                                <th>Total Tasks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {taskSummary && Object.entries(taskSummary).length > 0 ? (
                                                Object.entries(taskSummary).map(([brandName, data]) => (
                                                    <tr key={brandName}>
                                                        <td className="table-info">{brandName}</td>
                                                        <td>{data.Todo}</td>
                                                        <td>{data.InProgress}</td>
                                                        <td>{data.InReview}</td>
                                                        <td>{data.InChanges}</td>
                                                        <td>{data.Completed}</td>
                                                        <td>{data.missedDeadlines}</td>
                                                        <th>{data.totalTasks}</th>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="text-center">
                                                        No data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={'12'} lg={'12'} className="dashboard_card">
                        <Card className="emp_list_card p-0">
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <b>
                                    Employees Project Report <sub className="text-primary">(This Month)</sub>
                                </b>
                            </Card.Header>
                            <Card.Body className="table-scroll">
                                <div className="responsive">
                                    <Table hover size="sm" bordered striped>
                                        <thead className="sticky-top" style={{ top: '-20px' }}>
                                            <tr className="table-light">
                                                <th className="table-info">Name</th>
                                                <th>Todo</th>
                                                <th>In Progress</th>
                                                <th>In Review</th>
                                                <th>In Changes</th>
                                                <th>Completed</th>
                                                <th>Missed Deadlines</th>
                                                <th>On Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employeetaskSummary && Object.entries(employeetaskSummary).length > 0 ? (
                                                Object.entries(employeetaskSummary).map(([name, data]) => (
                                                    <tr key={name}>
                                                        <td className="table-info">{name}</td>
                                                        <td>{data.Todo || 0}</td>
                                                        <td>{data.InProgress || 0}</td>
                                                        <td>{data.InReview || 0}</td>
                                                        <td>{data.InChanges || 0}</td>
                                                        <td>{data.Completed || 0}</td>
                                                        <td>{data.missedDeadlines || 0}</td>
                                                        <th>{data.totalTasks || data.onTimeTasks || 0}</th>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="text-center">
                                                        No data available
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>



                    <Col md={'12'} lg={'12'} className='dashboard_secondcard mb-4'>
                        <Card>
                            <Card.Header className='mb-0'>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <span className="d-block">Over Time <sub className='text-primary'>(This Week)</sub></span>
                                    </div>
                                    <div>
                                        <Link to="/dashboard/overtime">
                                            <Button
                                                label="View All"
                                                severity="info"
                                                outlined
                                                className="border-0 p-0"
                                            />
                                        </Link>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Table responsive bordered size="sm" hover className='taskover'>
                                    <thead>
                                        <tr>
                                            <th scope='col'>Name</th>
                                            <th scope='col'>Date</th>
                                            <th scope='col'>Start Time</th>
                                            <th scope='col'>End Time</th>
                                            <th scope='col'>OT Hours</th>
                                            <th style={{ width: '100px' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {overtimeData.Pending && overtimeData.Pending.length > 0 ? (
                                            overtimeData.Pending.map((overtime) => (
                                                <tr key={overtime.overtime_id}>
                                                    <td> <img
                                                        src={overtime.requester.profileImage?.image_url || 'default-avatar.jpg'}
                                                        alt="Profile"
                                                        className="rounded-circle me-2"
                                                        style={{ width: '35px', height: '35px', objectFit: 'cover' }}
                                                    />
                                                        {`${overtime.requester.first_name} ${overtime.requester.last_name}`}</td>
                                                    <td>{new Date(overtime.ovetime_date).toLocaleDateString('en-GB')}</td>
                                                    <td>{formatTime(overtime.start_time)}</td> {/* Format start_time */}
                                                    <td>{formatTime(overtime.end_time)}</td>   {/* Format end_time */}
                                                    <td>{(overtime.total_time / 60).toFixed(1)} hrs</td>

                                                    <td>
                                                        <Badge className='bg-warning'>
                                                            {overtime.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    No overtime data available for this week.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>


                    <Dialog header="Today Not Checked-IN" visible={visible} style={{ width: '340px' }} onHide={() => setVisible(false)}>
                        <Card className="p-0 shadow-0">
                            <Card.Body className="scrollbody p-0">
                                <Card.Title>
                                    {notCheckedInUsers.map(user => (
                                        <div className="leave-info-box pt-4" key={user.user_id}>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={user.profileImage?.image_url || 'https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png'}
                                                    alt=""
                                                    style={{ width: '34px', height: '34px' }}
                                                    className="rounded-circle"
                                                />
                                                <div className="ms-3">
                                                    <p className="fw-bold mb-1 text-sm">{user.first_name} {user.last_name}</p>
                                                    <p className="text-muted mt-2 mb-0 text-sm">
                                                        <i className="pi pi-phone"></i> {user.userDetails?.phone || 'N/A'}
                                                    </p>
                                                    <div style={{ position: 'absolute', top: '-8px', left: '-3px' }}>
                                                        <Badge color="info" pill className="text-sm">
                                                            Not Checked In
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </Card.Title>
                            </Card.Body>
                        </Card>
                    </Dialog>

                    <Dialog header="Today On Leave" visible={visible1} style={{ width: '340px' }} onHide={() => setVisible1(false)}>
                        <Card className="p-0 shadow-0">
                            <Card.Body className="scrollbody p-0">
                                <Card.Title>
                                    {(Array.isArray(leaveUsers) ? leaveUsers : []).map(user => (
                                        <div className="leave-info-box pt-4" key={user.user_id}>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={user.profileImage?.image_url || 'https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png'}
                                                    alt=""
                                                    style={{ width: '34px', height: '34px' }}
                                                    className="rounded-circle"
                                                />
                                                <div className="ms-3">
                                                    <p className="fw-bold mb-1 text-sm">{user.first_name} {user.last_name}</p>
                                                    <p className="text-muted mt-2 mb-0 text-sm">
                                                        <i className="pi pi-phone"></i> {user.userDetails?.phone || 'N/A'}
                                                    </p>
                                                    <div style={{ position: 'absolute', top: '-8px', left: '-3px' }}>
                                                        <Badge color="success" pill className="text-sm">
                                                            Leave Today
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </Card.Title>
                            </Card.Body>
                        </Card>
                    </Dialog>


                </Row>
            </Row>
        </>

    )
};



export default Admin_dash;