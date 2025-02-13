import '../../App.css';
import '../../assets/css/admin.css';
import { Col, Row, Card, Breadcrumb, Badge, Table } from 'react-bootstrap';
import React, { useEffect, useState } from "react";
import moment from 'moment';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button } from 'primereact/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { TbUsersMinus } from "react-icons/tb";
import { TbBeach } from "react-icons/tb"
import { PiUsersFourLight } from "react-icons/pi";
import { LiaHourglassHalfSolid } from "react-icons/lia";
import { Dialog } from 'primereact/dialog';
import { Tooltip } from 'primereact/tooltip';
import Marquee from "react-fast-marquee";
import { VscFlame } from "react-icons/vsc";
import { PiFlagBannerFill } from "react-icons/pi";
import Dash_evntcal from '../../components/Dash_evntcal';
import { TabView, TabPanel } from 'primereact/tabview';
const Employee_dash = () => {
    const { accessToken, userId } = useAuth();
    const [taskSummary, setTaskSummary] = useState(null);
    const [attendanceData, setAttendanceData] = useState(null);
    const [tasksheets, setTasksheets] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [tasks, setTasks] = useState({
        today_tasks: [],
        pending_tasks: [],
        urgent_tasks: [],
        missed_deadlines: [],
    });

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/projectRoutes/tasks/categorized/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                if (response.data.success) {
                    setTasks(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [accessToken, userId]);


    useEffect(() => {
        const fetchTaskSummary = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/projectRoutes/specific-user-task-summary`, {
                    params: { user_id: userId },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setTaskSummary(response.data.summary);
            } catch (error) {
                console.error('Error fetching task summary:', error);
            }
        };

        fetchTaskSummary();
    }, [accessToken, userId]);


    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/employee-report/dashboard-Employee-report-attendance`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: {
                        userId: userId,
                    },
                });
                setAttendanceData(response.data);
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            }
        };

        fetchAttendanceData();
    }, [accessToken, userId]);


    useEffect(() => {
        // Calculate start_date (yesterday) and end_date (today)
        const end_date = moment().format('YYYY-MM-DD');
        const start_date = moment().subtract(1, 'days').format('YYYY-MM-DD');
        const fetchTasksheets = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/tasksheetRoutes/tasksheets/user/${userId}`, {
                    params: { start_date, end_date },
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                setTasksheets(response.data.data || []);
            } catch (error) {
                console.error('Error fetching tasksheets:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasksheets();
    }, [accessToken, userId]);

    const renderTasks = (taskList, columns) =>
        taskList.length > 0 ? (
            taskList.map((task, index) => (
                <tr key={index}>
                    {columns.map((col, colIndex) => (
                        <td key={colIndex}>{col.format(task)}</td>
                    ))}
                </tr>
            ))
        ) : (
            <tr>
                <td colSpan={columns.length} className="text-center">
                    No tasks found
                </td>
            </tr>
        );

    const columns = {
        today: [
            { format: (task) => task.project?.brand?.brand_name || '-' },
            { format: (task) => task.project?.project_name || '-' },
            { format: (task) => task.task_name || '-' },
            { format: (task) => <Badge className="bg-info">{task.status}</Badge> },
        ],
        pending: [
            { format: (task) => task.project?.brand?.brand_name || '-' },
            { format: (task) => task.task_name || '-' },
            { format: (task) => new Date(task.task_deadline).toLocaleDateString() },
            { format: (task) => <Badge className="bg-warning">{task.status}</Badge> },
        ],
        urgent: [
            { format: (task) => task.project?.brand?.brand_name || '-' },
            { format: (task) => task.task_name || '-' },
            { format: (task) => new Date(task.task_deadline).toLocaleDateString() },
            { format: (task) => <i className="pi pi-flag text-danger"></i> },
        ],
        missed: [
            { format: (task) => task.project?.brand?.brand_name || '-' },
            { format: (task) => task.task_name || '-' },
            { format: (task) => new Date(task.task_deadline).toLocaleDateString() },
            { format: (task) => <Badge className="bg-danger">Missed</Badge> },
        ],
    };



    const getBadgeColor = (status) => {
        switch (status) {
            case 'Todo':
                return 'secondary'; // Grey
            case 'InProgress':
                return 'primary'; // Blue
            case 'InReview':
                return 'warning'; // Yellow
            case 'InChanges':
                return 'info'; // Red
            case 'Completed':
                return 'success'; // Green
            default:
                return 'dark'; // Default
        }
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
                    <Col md={6} lg={6} className='mb-4 d-flex justify-content-end'>

                        <Button
                            label="Leaves"
                            icon="pi pi-eye"
                            severity="help"
                            className="py-2 border-0 ms-2"
                            onClick={() => navigate('/dashboard/leave_apply')} // Navigate on click
                        />
                        <Button
                            label="Overtime"
                            icon="pi pi-stopwatch"
                            severity="warning"
                            className="py-2 border-0 ms-2"
                            onClick={() => navigate('/dashboard/employee-overtime')} // Navigate on click
                        />
                    </Col>
                    <Col md={12} lg={12} className='mb-4'>
                        <Card className='dashboard_week'>

                            <TabView>
                                <TabPanel header="Event Calendar">
                                    <Dash_evntcal />
                                </TabPanel>
                            </TabView>
                        </Card>
                    </Col>
                    {/* Project Report witj moth wise */}
                    <Row className="mb-3">
                        <Col lg={6}>
                            <Card>
                                <Card.Header>
                                    <h6>
                                        Project Report <sub>/ Month</sub>
                                    </h6>
                                </Card.Header>
                                <Card.Body>
                                    {taskSummary ? (
                                        <Table className="repTable">
                                            <thead>
                                                <tr>
                                                    <td>Todo</td>
                                                    <td>In Progress</td>
                                                    <td>In Review</td>
                                                    <td>In Changes</td>
                                                    <td>Completed</td>
                                                    <td className="text-danger">Missed Deadlines</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <th>{taskSummary.Todo}</th>
                                                    <th>{taskSummary.InProgress}</th>
                                                    <th>{taskSummary.InReview}</th>
                                                    <th>{taskSummary.InChanges}</th>
                                                    <th>{taskSummary.Completed}</th>
                                                    <th className="text-danger">{taskSummary.missedDeadlines}</th>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <p>No tasks Available</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card className="">
                                <Card.Header>
                                    <h6>Attendance Report <sub>/ Month</sub></h6>
                                </Card.Header>
                                <Card.Body>
                                    {attendanceData ? (
                                        <Table className="repTable">
                                            <thead>
                                                <tr>
                                                    <td>Absent</td>
                                                    <td>Present</td>
                                                    <td>Approved Overtime</td>
                                                    <td>No.of Late </td>
                                                    <td>Working Days <sup className="text-danger">Total</sup></td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <th>{attendanceData.totalAbsentDays}</th>
                                                    <th>{attendanceData.totalPresentDays}</th>
                                                    <th className="custom-tooltip-btn4 cursor-pointer">
                                                        {attendanceData.totalOvertimeHours}<small className="text-danger"><sub>/ hrs</sub></small>

                                                    </th>
                                                    <th className="custom-tooltip-btn5 cursor-pointer">
                                                        {attendanceData.totalLateCount}<i className="pi pi-angle-right"></i>
                                                        <Tooltip target=".custom-tooltip-btn5">
                                                            <p><b>No.of Late</b></p>
                                                            <ol className="toltioList w-auto">
                                                                {attendanceData.lateDays.map((date, index) => (
                                                                    <li className="d-block" key={index}>
                                                                        <span>{moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY')}</span>
                                                                    </li>
                                                                ))}
                                                            </ol>
                                                        </Tooltip>


                                                    </th>
                                                    <th>{attendanceData.totalDaysInMonth}</th>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <p>No tasks Available</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={12} className="mt-3">
                            <Card>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h6>Daily Task</h6>
                                    <Button
                                        label="View All"
                                        className="p-0 border-0"
                                        severity="info"
                                        outlined
                                        onClick={() => navigate('/dashboard/employee_dailytask')} // Navigate on click
                                    />
                                </Card.Header>
                                <Card.Body>
                                    {loading ? (
                                        <p>Loading...</p>
                                    ) : tasksheets.length > 0 ? (
                                        <Marquee pauseOnHover gradient={false} direction="left" speed={40} autoFill>
                                            <div className="d-flex gap-2">
                                                {tasksheets.map((tasksheet, index) => (
                                                    <Card key={index} style={{ width: '330px' }} className="border mx-2 shadow-0">
                                                        <Card.Body className="dadh_marq">
                                                            <ul>
                                                                <li>
                                                                    <small>Brand : </small> {tasksheet.Task?.project?.brand?.brand_name || 'N/A'}
                                                                    <small className="misses_image2">
                                                                        {tasksheet.task_priority_flag === "Priority" && <PiFlagBannerFill className="ms-3 text-danger" />}
                                                                    </small>
                                                                </li>
                                                                <li>
                                                                    <small>Project : </small> {tasksheet.Task?.project?.project_name || 'N/A'}
                                                                </li>
                                                                <li>
                                                                    <small>Task : </small> {tasksheet.Task?.task_name || 'N/A'}
                                                                </li>
                                                                <li>
                                                                    <small>Deadline : </small>
                                                                    <span className="text-danger">
                                                                        {moment(tasksheet.Task?.task_deadline).format('DD MMM YYYY, HH:mm') || 'N/A'}
                                                                    </span>
                                                                </li>
                                                                <li>
                                                                    <small>Status : </small>
                                                                    <Badge pill bg={getBadgeColor(tasksheet.task_status)} className="ms-2">
                                                                        {tasksheet.task_status || 'No status'}
                                                                    </Badge>
                                                                </li>
                                                            </ul>
                                                            <div className="misses_image" style={{ top: '10px', right: '10px' }}>
                                                                {tasksheet.missed_deadline && <VscFlame />}
                                                            </div>
                                                        </Card.Body>
                                                        <Card.Footer className="text-end py-1 ">
                                                            <small className='text-secondary' style={{ fontSize: '12px' }}><em>Date :  {moment(tasksheet.tasksheet_date).format('DD MMM YYYY') || 'N/A'}</em></small>
                                                        </Card.Footer>
                                                    </Card>
                                                ))}
                                            </div>
                                        </Marquee>
                                    ) : (
                                        <p>New week has started. Please check back in TaskSheet.</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>


                    <Row>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            <>
                                <Col lg={6}>
                                    <Card className="emp_list_card p-0">
                                        <Card.Header className="d-flex justify-content-between align-items-center">
                                            <b>
                                                Today Task <sup><Badge className="bg-danger">{tasks.today_tasks.length}</Badge></sup>
                                            </b>
                                            <small><Link to={'/dashboard/task_board_admin'}>View All</Link></small>
                                        </Card.Header>
                                        <Card.Body className="table-scroll">
                                            <Table size="sm" bordered className="text-left">
                                                <thead>
                                                    <tr>
                                                        <th>Brand Name</th>
                                                        <th>Project Name</th>
                                                        <th>Task Name</th>
                                                        <th style={{ width: '80px' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>{renderTasks(tasks.today_tasks, columns.today)}</tbody>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Similar for Pending Tasks */}
                                <Col lg={6}>
                                    <Card className="emp_list_card p-0">
                                        <Card.Header className="d-flex justify-content-between align-items-center">
                                            <b>
                                                Pending Tasks <sup><Badge className="bg-danger">{tasks.pending_tasks.length}</Badge></sup>
                                            </b>
                                            <small><Link to={'/dashboard/task_board_admin'}>View All</Link></small>
                                        </Card.Header>
                                        <Card.Body className="table-scroll">
                                            <Table size="sm" bordered className="text-left">
                                                <thead>
                                                    <tr>
                                                        <th>Brand Name</th>
                                                        <th>Task Name</th>
                                                        <th>Deadlines</th>
                                                        <th style={{ width: '80px' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>{renderTasks(tasks.pending_tasks, columns.pending)}</tbody>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Similar for Urgent Tasks */}
                                <Col lg={6}>
                                    <Card className="emp_list_card p-0">
                                        <Card.Header className="d-flex justify-content-between align-items-center">
                                            <b>
                                                Urgent Tasks <sup><Badge className="bg-danger">{tasks.urgent_tasks.length}</Badge></sup>
                                            </b>
                                            <small><Link to={'/dashboard/task_board_admin'}>View All</Link></small>
                                        </Card.Header>
                                        <Card.Body className="table-scroll">
                                            <Table size="sm" bordered className="text-left">
                                                <thead>
                                                    <tr>
                                                        <th>Brand Name</th>
                                                        <th>Task Name</th>
                                                        <th>Deadlines</th>
                                                        <th style={{ width: '80px' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>{renderTasks(tasks.urgent_tasks, columns.urgent)}</tbody>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Similar for Missed Deadlines */}
                                <Col lg={6}>
                                    <Card className="emp_list_card p-0">
                                        <Card.Header className="d-flex justify-content-between align-items-center">
                                            <b>
                                                Missed Deadlines <sup><Badge className="bg-danger">{tasks.missed_deadlines.length}</Badge></sup>
                                            </b>
                                            <small><Link to={'/dashboard/task_board_admin'}>View All</Link></small>
                                        </Card.Header>
                                        <Card.Body className="table-scroll">
                                            <Table size="sm" bordered className="text-left">
                                                <thead>
                                                    <tr>
                                                        <th>Brand Name</th>
                                                        <th>Task Name</th>
                                                        <th>Deadlines</th>
                                                        <th style={{ width: '80px' }}>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>{renderTasks(tasks.missed_deadlines, columns.missed)}</tbody>
                                            </Table>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </>
                        )}
                    </Row>
                </Row>
            </Row>
        </>

    )
};



export default Employee_dash;