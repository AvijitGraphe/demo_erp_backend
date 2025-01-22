import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Breadcrumb, Card, Form, Table, Badge } from 'react-bootstrap';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../assets/css/emp_report.css';
import '../../assets/css/dashboard.css';
import '../../assets/css/admin.css';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { AutoComplete } from "primereact/autocomplete";
import { Calendar } from 'primereact/calendar';
import { TbUsersMinus } from "react-icons/tb";
import { FaTasks } from "react-icons/fa";
import { LiaTasksSolid } from "react-icons/lia";
import { TbTimeDuration10 } from "react-icons/tb";
import { LuListTodo } from "react-icons/lu";
import { RiProgress3Line } from "react-icons/ri";
import { VscOpenPreview } from "react-icons/vsc";
import { GiProgression } from "react-icons/gi";
import { GrInProgress } from "react-icons/gr";
import { Chart } from 'primereact/chart';
import { Tooltip } from 'primereact/tooltip';
import { BsFire } from "react-icons/bs";
import { Knob } from 'primereact/knob';
import { RxCross2 } from "react-icons/rx";
import { IoMdCheckmark } from "react-icons/io";
import { SiClockify } from "react-icons/si";
import nouserImg from '../../assets/images/no_user.png';
import moment from 'moment';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { format, set } from 'date-fns'; // Install date-fns if not already installed
const Employee_report = () => {
    const { accessToken } = useAuth(); // Get the access token from the context
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear(); // Get the current year
    // State variables
    const [value, setValue] = useState(null); // For AutoComplete
    const [items, setItems] = useState([]); // Suggestions for AutoComplete
    const [selectedEmployee, setSelectedEmployee] = useState(null); // Selected employee
    const [selectedDate, setSelectedDate] = useState(null); // Selected month/year
    const [attendanceData, setAttendanceData] = useState(null); // Attendance report
    const [leaveBalances, setLeaveBalances] = useState(null); // Leave balance data
    const [taskStats, setTaskStats] = useState(null); // Task stats data
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [visible, setVisible] = useState(false);
    const [date, setDate] = useState(null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');


    // State Variables for edit
    const [editVisible, setEditVisible] = useState(false);
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndTime, setEditEndTime] = useState('');
    const [editAttendanceId, setEditAttendanceId] = useState(null);
    const [editDate, setEditDate] = useState(null);

    // Fetch employee data for AutoComplete
    const fetchEmployees = async (query) => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/employee-report/fetch-report-users`, {
                params: { search: query }, // Optional search query
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Add the auth header
                },
            });
            if (response.data.success) {
                setItems(
                    response.data.data.map(user => ({
                        label: user.username, // Displayed text
                        value: user.user_id, // Internal value
                    }))
                );
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // Method to fetch suggestions when user types
    const search = async (event) => {
        await fetchEmployees(event.query);
    };

    // Fetch attendance data
    const fetchAttendanceData = async () => {
        if (!selectedEmployee || !selectedDate) {
            console.warn('Employee and date must be selected before fetching data.');
            return;
        }

        const month = selectedDate.getMonth() + 1; // JavaScript months are 0-based
        const year = selectedDate.getFullYear();

        try {
            const response = await axios.get(`${config.apiBASEURL}/employee-report/Employee-report-attendance`, {
                params: { userId: selectedEmployee.value, month, year },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setAttendanceData(response.data);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
        }
    };

    // Fetch leave balances
    const fetchLeaveBalances = async () => {
        if (!selectedEmployee) {
            console.warn('Employee must be selected before fetching leave balances.');
            return;
        }
        const month = selectedDate.getMonth() + 1; // JavaScript months are 0-based
        const year = selectedDate.getFullYear();
        try {
            const response = await axios.get(`${config.apiBASEURL}/employee-report/fetch-user-leave-balances/${selectedEmployee.value}`, {
                params: { month, year },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setLeaveBalances(response.data);
        } catch (error) {
            console.error('Error fetching leave balances:', error);
        }
    };

    // Fetch task stats
    const fetchTaskStats = async () => {
        if (!selectedEmployee || !selectedDate) {
            console.warn('Employee and date must be selected before fetching task stats.');
            return;
        }

        const month = selectedDate.getMonth() + 1;
        const year = selectedDate.getFullYear();

        try {
            const response = await axios.get(`${config.apiBASEURL}/employee-report/fetch-task-stats/${selectedEmployee.value}`, {
                params: { month, year },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setTaskStats(response.data);
        } catch (error) {
            console.error('Error fetching task stats:', error);
        }
    };

    // Fetch leave balances
    const fetchyeartaskgraphdata = async () => {
        if (!selectedEmployee) {
            console.warn('Employee must be selected before fetching leave balances.');
            return;
        }

        try {
            const response = await axios.get(`${config.apiBASEURL}/employee-report/task-stats/monthly/${selectedEmployee.value}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const stats = response.data.data;

            const labels = stats.map((stat) => stat.month); // Months from API
            const totalTasks = stats.map((stat) => stat.total_tasks); // Total Tasks
            const completedTasks = stats.map((stat) => stat.completed_tasks); // Completed Tasks
            const missedDeadlines = stats.map((stat) => stat.missed_deadline_tasks); // Missed Deadlines

            // Chart colors
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
            const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

            const data = {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Tasks',
                        backgroundColor: documentStyle.getPropertyValue('--blue-300'),
                        borderColor: documentStyle.getPropertyValue('--blue-300'),
                        data: totalTasks,
                    },
                    {
                        label: 'Completed Tasks',
                        backgroundColor: documentStyle.getPropertyValue('--green-300'),
                        borderColor: documentStyle.getPropertyValue('--green-300'),
                        data: completedTasks,
                    },
                    {
                        label: 'Missed Deadlines',
                        backgroundColor: documentStyle.getPropertyValue('--pink-300'),
                        borderColor: documentStyle.getPropertyValue('--pink-300'),
                        data: missedDeadlines,
                    },
                ],
            };

            const options = {
                maintainAspectRatio: false,
                aspectRatio: 0.8,
                plugins: {
                    legend: {
                        labels: {
                            color: textColor,
                        },
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: textColorSecondary,
                            font: {
                                weight: 500,
                            },
                        },
                        grid: {
                            display: false,
                            drawBorder: false,
                        },
                    },
                    y: {
                        ticks: {
                            color: textColorSecondary,
                        },
                        grid: {
                            color: surfaceBorder,
                            drawBorder: false,
                        },
                    },
                },
            };

            setChartData(data);
            setChartOptions(options);
        } catch (error) {
            console.error('Error fetching task stats:', error);
        }
    };





    // Event handler for "Apply" button
    const handleApply = () => {
        fetchAttendanceData();
        fetchLeaveBalances();
        fetchTaskStats();
        fetchyeartaskgraphdata();
    };


    const getTaskCountByStatus = (status) => {
        const task = taskStats.data.taskCountsByStatus.find((task) => task.status === status);
        return task ? task.statusCount : 0;
    };


    const openMissedDeadlineDialog = () => {
        setIsDialogVisible(true);
    };


    const handleTaskClick = (taskId) => {
        navigate(`/dashboard/view_task/${taskId}`);
    };



    const getBadgeClass = (status) => {
        switch (status) {
            case 'Completed':
                return 'p-badge-success'; // Green
            case 'Todo':
                return 'p-badge-primary'; // Blue
            case 'InProgress':
                return 'p-badge-info'; // Blue
            case 'InChanges':
                return 'p-badge-danger'; // Red
            case 'InReview':
                return 'p-badge-warning'; // Yellow
            default:
                return 'p-badge-secondary'; // Gray
        }
    };




    const handleSubmit = async () => {
        const formattedStartTime = startTime ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
        const formattedEndTime = endTime ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
        const formattedDate = format(date, 'yyyy-MM-dd');
        try {
            const payload = {
                user_id: selectedEmployee.value,
                date: formattedDate, // Format to YYYY-MM-DD
                start_time: formattedStartTime,
                end_time: formattedEndTime || null,
            };
            const response = await axios.post(
                `${config.apiBASEURL}/attendance/add-attendance`, 
                payload, 
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, // Add auth header
                    },
                }
            );

            if (response.status === 201) {
                // Clear state variables
                setDate(null);
                setStartTime(null);
                setEndTime(null);

                handleApply();
                setVisible(false);
            }

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Error while adding attendance.';

        }
    };




    const handleEditClick = (attendance) => {
        const parseTime = (timeStr) => {
            if (!timeStr) return null;
            const [hours, minutes] = timeStr.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            return date;
        };
        // Parse the date into a JavaScript Date object
        const parseDate = (dateStr) => {
            if (!dateStr) return null;
            return new Date(dateStr); // Assuming dateStr is in ISO format (YYYY-MM-DD or similar)
        };

        setEditDate(parseDate(attendance.date)); // Convert to a Date object

        setEditStartTime(parseTime(attendance.start_time));
        setEditEndTime(parseTime(attendance.end_time));
        setEditAttendanceId(attendance.attendance_id); // Track which record to edit
        setEditVisible(true);
    };


    const handleEditAttendance = async () => {
        const formatTime = (date) => {
            if (!date) return '';
            return date.toTimeString().slice(0, 5); // Extract HH:mm
        };
    
        try {
            const response = await axios.put(
                `${config.apiBASEURL}/attendance/edit-attendance/${editAttendanceId}`,
                {
                    start_time: formatTime(editStartTime),
                    end_time: formatTime(editEndTime),
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, // Add auth header
                    },
                }
            );
    
            setEditVisible(false);
            // Refresh attendance data here
            handleApply();
    
        } catch (error) {
            console.error('Error editing attendance:', error);
        }
    };
    






    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col md={6} lg={6} className="mb-4">
                        <Breadcrumb>
                            <Breadcrumb.Item active>Monthly report generated</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={6} lg={6} className="mb-4 text-end">
                        <div className="d-flex justify-content-end">
                            <AutoComplete
                                value={selectedEmployee}
                                suggestions={items}
                                completeMethod={search}
                                field="label"
                                onChange={(e) => setSelectedEmployee(e.value)}
                                placeholder="Search for employee"
                                style={{ width: '200px' }}
                            />
                            <Calendar
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.value)}
                                view="month"
                                dateFormat="mm/yy"
                                placeholder="Select month"
                                style={{ width: '150px' }}
                                className="mx-2"
                            />
                            <Button
                                title="Apply"
                                icon="pi pi-search"
                                severity="secondary"
                                onClick={handleApply}
                                style={{ height: '46px', width: '46px' }}
                            />
                        </div>
                    </Col>
                </Row>
                <Row className="m-0">
                    {attendanceData && (
                        <Col lg={4} className='mb-4 ps-lg-0'>
                            <Card className='p-0'>
                                <Card.Body className="position-relative">
                                    <div className="jdate">
                                        <span>Date of Joining : </span>
                                        <b>
                                            {new Date(attendanceData.userDetails.joiningDates[0].joining_date).toLocaleDateString('en-GB', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </b>

                                    </div>
                                    <ul className="newulist">
                                        <li>
                                            <div className='d-flex align-items-center mb-2'>
                                                <img
                                                    src={(attendanceData?.userDetails?.profileImage?.image_url) || nouserImg}
                                                    alt={''}
                                                    style={{ width: '34px', height: '34px' }}
                                                    className='rounded-circle'
                                                />
                                                <div className='ms-3 clientDshinfo'>
                                                    <p className='fw-bold mb-1 text-sm'>
                                                        {attendanceData.userDetails.first_name} {attendanceData.userDetails.last_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <span>Designation</span> : {attendanceData.userDetails.user_type}
                                        </li>
                                        <li>
                                            <span>Email</span> : {attendanceData.userDetails.email}
                                        </li>
                                        <li>
                                            <span>Reporting</span> :  {(() => {
                                                const time = attendanceData.userDetails.userTimes[0].start_time.slice(0, 5); // Get HH:mm
                                                const [hours, minutes] = time.split(':').map(Number); // Split into hours and minutes
                                                const suffix = hours >= 12 ? 'PM' : 'AM'; // Determine AM/PM
                                                const adjustedHours = hours % 12 || 12; // Convert 24-hour to 12-hour format
                                                return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${suffix}`; // Format time with AM/PM
                                            })()}
                                        </li>
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                    )}
                    {attendanceData && (
                        <Col lg={8} className='mb-4 ps-lg-0'>
                            <Card className='p-0'>
                                <Card.Header className="h6">
                                    Attendance Report <sub className="text-danger">/ Month</sub>
                                </Card.Header>
                                <Card.Body>
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
                                </Card.Body>
                            </Card>
                        </Col>
                    )}
                    {/*---------------Leave & check-in Report----------------*/}
                    {leaveBalances && (
                        <Col lg={12} className='mb-4 ps-lg-0 pe-lg-0'>
                            <Card className='p-0'>
                                <Card.Header className="h6">
                                    Leave Report - {currentYear} <sub className="text-danger">/ Year</sub>
                                </Card.Header>
                                <Card.Body>
                                    <ul className="liv_nlist">
                                        {leaveBalances && leaveBalances.success && leaveBalances.data.map((leave, index) => (
                                            <li key={index}>
                                                <span>{leave.LeaveType}</span>
                                                <div>
                                                    {leave.Total !== undefined && (
                                                        <small>Total : <b>{leave.Total}</b></small>
                                                    )}
                                                    {leave.Earned !== undefined && (
                                                        <small>Earned : <b>{leave.Earned}</b></small>
                                                    )}
                                                    {leave.LeaveTaken !== undefined && (
                                                        <small>Leave Taken : <b>{leave.LeaveTaken}</b></small>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </Card.Body>
                                <Card.Footer className="bg-light py-0 border-0">
                                    <ul className="mliv_blance">
                                        <li>
                                            Month : <b className="text-danger">
                                                {selectedDate
                                                    ? new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(new Date(selectedDate))
                                                    : 'No Date Selected'}
                                            </b>
                                        </li>
                                        {leaveBalances &&
                                            leaveBalances.success &&
                                            leaveBalances.data.map((leave, index) => (
                                                <li key={index}>
                                                    <small>{leave.LeaveType}</small>
                                                    <span>{leave.MonthlyLeaveTaken}</span>
                                                </li>
                                            ))}
                                    </ul>
                                </Card.Footer>
                            </Card>
                        </Col>
                    )}
                    {/*---------------Project Report----------------*/}
                    {taskStats && (
                        <Col lg={6} className='mb-4 pe-lg-0 ps-lg-0'>
                            <Card className='p-0 ereportcard'>
                                <Card.Header className="h6">
                                    Project Report <sub className='text-muted'>( Task) / Month</sub>
                                    <span className='float-end'>
                                        <span>Total Tasks :</span>
                                        <span className="ms-2 text-danger">{taskStats.data.taskCountsByStatus.reduce((sum, status) => sum + parseInt(status.statusCount, 10), 0)}</span>
                                    </span>
                                </Card.Header>
                                <Card.Body>
                                    <ul className='justify-content-start taskperform'>
                                        {[
                                            { title: 'Todo', icon: <LuListTodo />, count: getTaskCountByStatus('Todo') },
                                            { title: 'In Progress', icon: <RiProgress3Line />, count: getTaskCountByStatus('InProgress') },
                                            { title: 'In Review', icon: <GrInProgress />, count: getTaskCountByStatus('InReview') },
                                            { title: 'In Changes', icon: <GrInProgress />, count: getTaskCountByStatus('InChanges') },
                                            {
                                                title: 'Missed Deadlines',
                                                icon: <BsFire />,
                                                count: taskStats.data.missedAndOnTimeCounts.missedCount,
                                                onClick: openMissedDeadlineDialog,
                                            },
                                            { title: 'Completed', icon: <LiaTasksSolid />, count: getTaskCountByStatus('Completed') },
                                            { title: 'On Time', icon: <TbTimeDuration10 />, count: taskStats.data.missedAndOnTimeCounts.onTimeCount },
                                        ].map(({ title, icon, count, onClick }, idx) => (
                                            <li key={idx} className='dashboard_card' onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
                                                <Card className="shadow-0">
                                                    <Card.Header>
                                                        <div className="d-flex justify-content-between">
                                                            <div className='repTItle'>
                                                                <span className="d-block">{title}</span>
                                                                <span className="d-block h4 mt-3">{count}</span>
                                                            </div>
                                                            <div className='hrshortdata'>
                                                                <span>{icon}</span>
                                                            </div>
                                                        </div>
                                                    </Card.Header>
                                                </Card>
                                            </li>
                                        ))}
                                        <li className='dashboard_card'>
                                            <Card className="h-auto mb-0 shadow-0">
                                                <Card.Header>
                                                    <div className="d-flex justify-content-between">
                                                        <div className='repTItle'>
                                                            <span className="d-block">Conversion Rate <sub className="text-danger">/ Year</sub></span>
                                                            <Knob
                                                                value={taskStats.data.yearlyConversionRate}
                                                                className="custom-tooltip-btn3"
                                                                style={{ width: '80px', height: 'auto' }}
                                                            />
                                                            <Tooltip target=".custom-tooltip-btn3">
                                                                <p>Conversion Rate - <b>2024</b> </p>
                                                                <ol className="toltioList w-auto">
                                                                    {taskStats.data.monthlyConversionRates.map(({ month, conversionRate }, idx) => (
                                                                        <li key={idx} className="d-block">
                                                                            <span><em>{month} 2024 : </em> <small>{conversionRate}%</small></span>
                                                                        </li>
                                                                    ))}
                                                                </ol>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                </Card.Header>
                                            </Card>
                                        </li>
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>

                    )}

                    {chartData && chartOptions && (
                        <Col lg={6} className="mb-4 pe-lg-0">
                            <Card className="p-0">
                                <Card.Header className="h6">
                                    Task Analysis <sub className="text-muted">/ Year</sub>
                                </Card.Header>
                                <Card.Body>
                                    <Chart type="bar" data={chartData} options={chartOptions} />
                                </Card.Body>
                            </Card>
                        </Col>
                    )}

                    {attendanceData && (
                        <Col lg={12} className='mb-4 pe-lg-0 ps-lg-0'>
                            <Card className='p-0'>
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0">Check in & out Report <sub className="text-danger">/ Month</sub></h6>
                                    <Button
                                        label="Attendance"
                                        severity="help"
                                        icon="pi pi-plus"
                                        className="border-0 p-2"
                                        onClick={() => setVisible(true)}
                                    />
                                </Card.Header>
                                <Card.Body>
                                    <div className="repEmp_table">
                                        <Table size="sm" bordered>
                                            <thead className="sticky-top bg-light" style={{ top: '-1px' }}>
                                                <tr>
                                                    <th scope='col'>Date</th>
                                                    <th scope='col'>Check-in</th>
                                                    <th scope='col'>Check-out</th>
                                                    <th scope='col'>Absence</th>
                                                    <th scope='col'>Present</th>
                                                    <th scope='col'>Half Day</th>
                                                    <th scope='col' className="text-center" style={{ width: '80px' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendanceData.userDetails.attendances.map((attendance, index) => {
                                                    const isFullDay = attendance.Attendance_status === "Full-Day";
                                                    const isHalfDay = attendance.Attendance_status === "Half-Day";
                                                    const isStarted = attendance.Attendance_status === "Started";
                                                    const isAbsent = attendance.Attendance_status === "Absent";

                                                    return (
                                                        <tr key={index}>
                                                            <td>{new Date(attendance.date).toLocaleDateString('en-GB')}</td>
                                                            <td>{attendance.start_time || "00:00 AM"}</td>
                                                            <td>{attendance.end_time || "00:00 PM"}</td>

                                                            {/* Absence Column */}
                                                            <td>
                                                                {isAbsent && (
                                                                    <span className="text-danger h6"><i className="pi pi-times"></i></span>
                                                                )}
                                                                {isStarted && (
                                                                    <span className="text-warning h6"><i className="pi pi-exclamation-triangle"></i></span>
                                                                )}
                                                            </td>

                                                            {/* Present Column */}
                                                            <td>
                                                                {isFullDay && (
                                                                    <span className="text-success h6"><i className="pi pi-verified"></i></span>
                                                                )}
                                                            </td>

                                                            {/* Half Day Column */}
                                                            <td>
                                                                {isHalfDay && (
                                                                    <span className="text-warning h6"><SiClockify /></span>
                                                                )}
                                                            </td>
                                                            <td className="text-center">
                                                                <Button
                                                                    title="Edit"
                                                                    outlined
                                                                    severity="info"
                                                                    icon="pi pi-pencil"
                                                                    className="border-0 p-0"
                                                                    onClick={() => handleEditClick(attendance)} // Edit button handler
                                                                />
                                                            </td>

                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    )}

                </Row>
            </Row>

            {/* Dialog for Missed Deadlines */}
            <Dialog
                header="Missed Deadline Tasks"
                visible={isDialogVisible}
                style={{ width: '340px' }}
                onHide={() => setIsDialogVisible(false)}
            >
                {taskStats?.data?.missedDeadlineTasks?.length > 0 ? (
                    <Card className="p-0 shadow-0">
                        <Card.Body className="scrollbody p-0 main_repmissed">
                            {taskStats.data.missedDeadlineTasks.map(task => (
                                <div
                                    className="leave-info-box p-2 pt-3"
                                    key={task.task_id}
                                    onClick={() => handleTaskClick(task.task_id)} // Navigate on click
                                    style={{ cursor: 'pointer' }} // Pointer cursor for better UX
                                >

                                    <div className="repmissed">
                                        <p className="mb-0">
                                            <small>Task :</small> {task.task_name}
                                        </p>
                                        <p className="mb-0">
                                            <small>Brand :</small> {task.project?.brand?.brand_name || 'N/A'}
                                        </p>
                                        <p className="mb-0">
                                            <small>Project :</small> {task.project?.project_name || 'N/A'}
                                        </p>
                                        <p className="mb-0">
                                            <small>Deadline :</small> {new Date(task.task_deadline).toLocaleString('en-GB')}
                                        </p>
                                        <p className="mb-0" style={{ position: 'absolute', right: '-0px', top: '-5px' }}>
                                            <span className={`p-badge ${getBadgeClass(task.status)}`}>
                                                {task.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                ) : (
                    <p>No missed deadlines found.</p>
                )}
            </Dialog>




            <Dialog
                header="Add Attendance"
                visible={visible}
                onHide={() => setVisible(false)}
                style={{ width: '350px' }}
                footer={
                    <div>
                        <Button label="Cancel" severity="secondary" onClick={() => setVisible(false)} className="p-2 border-0 me-2" />
                        <Button label="Save" severity="success" onClick={handleSubmit} className="border-0 p-2 px-3" />
                    </div>
                }
            >
                <div className="field">
                    <label htmlFor="date">Date</label>
                    <Calendar
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.value)}
                        dateFormat="dd-mm-yy"
                        placeholder="DD-MM-YYYY"

                    />
                </div>
                <Row className="field mt-3">
                    <Col>
                        <label htmlFor="startTime">Start Time</label>
                        <Calendar
                            id="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.value)}
                            timeOnly
                            hourFormat="24"

                        />
                    </Col>
                    <Col>
                        <label htmlFor="endTime">End Time</label>
                        <Calendar
                            id="endTime"
                            value={endTime}
                            onChange={(e) => setEndTime(e.value)}
                            timeOnly
                            hourFormat="24"

                        />
                    </Col>
                </Row>
            </Dialog>




            {editVisible && (
                <Dialog
                    header="Edit Attendance"
                    visible={editVisible}
                    style={{ width: '350px' }}
                    onHide={() => setEditVisible(false)}
                >
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault(); // Prevent page reload
                            handleEditAttendance();
                        }}
                    >
                        <Row>
                            <Col lg={12} className="mb-3">
                                <label>Date</label>
                                <Calendar
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.value)}
                                    dateFormat="dd-mm-yy"
                                    placeholder="DD-MM-YYYY"
                                    disabled
                                />
                            </Col>
                            <Col lg={6}>
                                <label>Start Time</label>
                                <Calendar
                                    value={editStartTime}
                                    onChange={(e) => setEditStartTime(e.value)}
                                    timeOnly
                                    hourFormat="24"
                                />
                            </Col>
                            <Col lg={6}>
                                <label>End Time</label>
                                <Calendar
                                    value={editEndTime}
                                    onChange={(e) => setEditEndTime(e.value)}
                                    timeOnly
                                    hourFormat="24"
                                />
                            </Col>
                            <Col className="text-end mt-4" lg={12}>
                                <Button
                                    label="Save"
                                    severity="success"
                                    type="submit" // Set the type to "submit" for the form
                                    className="border-0 p-2 px-3"
                                />
                            </Col>
                        </Row>
                    </Form>
                </Dialog>
            )}









        </>
    );
};



export default Employee_report;