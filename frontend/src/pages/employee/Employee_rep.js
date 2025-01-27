import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Breadcrumb, Card, Form, Table } from 'react-bootstrap';
import { Button } from 'primereact/button';
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

const Employee_rep = () => {
    const { accessToken, userId } = useAuth(); // Get the access token from the context
    const currentYear = new Date().getFullYear(); // Get the current year
    const value2 = 50; // Example knob value for conversion rate
    // State variables
    const [value, setValue] = useState(null); // For AutoComplete
    const [items, setItems] = useState([]); // Suggestions for AutoComplete
    const [selectedEmployee, setSelectedEmployee] = useState(null); // Selected employee
    const [selectedDate, setSelectedDate] = useState(new Date()); // Initialize with the current date
    const [attendanceData, setAttendanceData] = useState(null); // Attendance report
    const [leaveBalances, setLeaveBalances] = useState(null); // Leave balance data
    const [taskStats, setTaskStats] = useState(null); // Task stats data
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});


    // Fetch attendance data
    const fetchAttendanceData = async () => {
        if (!userId || !selectedDate) {
            console.warn('Employee and date must be selected before fetching data.');
            return;
        }

        const month = selectedDate.getMonth() + 1; // JavaScript months are 0-based
        const year = selectedDate.getFullYear();

        try {
            const response = await axios.get(`${config.apiBASEURL}/employee-report/Employee-report-attendance`, {
                params: { userId: userId, month, year },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setAttendanceData(response.data);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
        }
    };

    // Fetch leave balances
    const fetchLeaveBalances = async () => {
        if (!userId) {
            console.warn('Employee must be selected before fetching leave balances.');
            return;
        }

        try {
            const response = await axios.get(`${config.apiBASEURL}/employee-report/fetch-user-leave-balances/${userId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setLeaveBalances(response.data);
        } catch (error) {
            console.error('Error fetching leave balances:', error);
        }
    };

    // Fetch task stats
    const fetchTaskStats = async () => {
        if (!userId || !selectedDate) {
            console.warn('Employee and date must be selected before fetching task stats.');
            return;
        }

        const month = selectedDate.getMonth() + 1;
        const year = selectedDate.getFullYear();

        try {
            const response = await axios.get(`${config.apiBASEURL}/employee-report/fetch-task-stats/${userId}`, {
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
        if (!userId) {
            console.warn('Employee must be selected before fetching leave balances.');
            return;
        }

        try {
            const response = await axios.get(`${config.apiBASEURL}/employee-report/task-stats/monthly/${userId}`, {
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


    useEffect(() => {
        // Function calls on component mount
        fetchAttendanceData();
        fetchLeaveBalances();
        fetchTaskStats();
        fetchyeartaskgraphdata();
    }, []);


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

                            <Calendar
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.value)}
                                view="month"
                                dateFormat="mm/yy"
                                placeholder="Select month"
                                style={{ width: '180px' }}
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
                                            {new Date(attendanceData.userDetails.joiningDates.joining_date).toLocaleDateString('en-GB', {
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
                                    Leave Report - {currentYear}
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
                            </Card>
                        </Col>
                    )}
                    {/*---------------Project Report----------------*/}
                    {taskStats && (
                        <Col lg={6} className='mb-4 pe-lg-0 ps-lg-0'>
                            <Card className='p-0 ereportcard'>
                                <Card.Header className="h6">
                                    Project Report <sub className='text-muted'>(Task) / Month</sub>
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
                                            // { title: 'Missed Deadlines', icon: <BsFire />, count: taskStats.data.missedAndOnTimeCounts.missedCount },
                                            { title: 'Completed', icon: <LiaTasksSolid />, count: getTaskCountByStatus('Completed') },
                                            // { title: 'On Time', icon: <TbTimeDuration10 />, count: taskStats.data.missedAndOnTimeCounts.onTimeCount },
                                        ].map(({ title, icon, count }, idx) => (
                                            <li key={idx} className='dashboard_card'>
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
                                <Card.Header className="h6">
                                    Check in & out Report <sub className="text-danger">/ Month</sub>
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
                                                   
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attendanceData.userDetails.attendances.map((attendance, index) => {
                                                    const isFullDay = attendance.Attendance_status === "Full-Day";
                                                    const isHalfDay = attendance.Attendance_status === "Half-Day";
                                                    const isStarted = attendance.Attendance_status === "Started";

                                                    return (
                                                        <tr key={index}>
                                                            <td>{new Date(attendance.date).toLocaleDateString('en-GB')}</td>
                                                            <td>{attendance.start_time || "00:00 AM"}</td>
                                                            <td>{attendance.end_time || "00:00 PM"}</td>

                                                            {/* Absence Column */}
                                                            <td>
                                                                {isStarted && (
                                                                    <span className="text-danger h6"><i className="pi pi-times-circle"></i></span>
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
        </>
    );
};



export default Employee_rep;