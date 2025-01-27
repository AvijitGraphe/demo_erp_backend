import React, { useEffect, useState } from "react";
import { Col, Row, Card, Table, Badge } from 'react-bootstrap';
import { Calendar } from "primereact/calendar";
import moment from 'moment';
import axios from 'axios';
import config from "../../config";
import { useAuth } from "../../context/AuthContext";
import '../../assets/css/tasksheet.css'
import { Link } from "react-router-dom";
import { VscFlame } from "react-icons/vsc";
import { PiFlagBannerFill } from "react-icons/pi";
import { Button } from 'primereact/button';



const Dailytask_employee = () => {
    const { accessToken, userId } = useAuth();
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [tasksheets, setTasksheets] = useState([]);


    useEffect(() => {
        generateDaysForMonth(selectedMonth);
        fetchTasksheets();
    }, [selectedMonth]);

    const generateDaysForMonth = (date) => {
        const startOfMonth = moment(date).startOf('month');
        const endOfMonth = moment(date).endOf('month');
        const days = [];

        for (let day = startOfMonth; day <= endOfMonth; day.add(1, 'day')) {
            days.push(day.clone());
        }
        setDaysInMonth(days);
    };

    const fetchTasksheets = async () => {
        const start_date = moment(selectedMonth).startOf('month').format('YYYY-MM-DD');
        const end_date = moment(selectedMonth).endOf('month').format('YYYY-MM-DD');

        try {
            const response = await axios.get(`${config.apiBASEURL}/tasksheetRoutes/tasksheets/user/${userId}`, {
                params: { start_date, end_date },
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            console.log("log the data is now response", response.data)
            if (response.data.success) {
                setTasksheets(response.data.data || []);
            } else {
                setTasksheets([]);
            }
        } catch (error) {
            console.error('Error fetching tasksheets:', error);
        }
    };

    const isWeekend = (day) => day.day() === 0 || day.day() === 6;


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
        <Row className='body_content'>
            <Col lg={12}>
                <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center mb-4">
                        <h6 className="mb-0 me-2">Daily Task Sheet</h6>
                        <div>
                            <label className="me-2">Filter by Month</label>
                            <Calendar
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.value)}
                                view="month"
                                dateFormat="MM yy"
                                placeholder="Choose a month"
                                showButtonBar
                                style={{ width: '170px'}}
                            />
                            <Link to={'/dashboard/single_employee_report'}>
                                <Button
                                    label="Monthly Report"
                                    icon="pi pi-file"
                                    severity="danger"
                                    outlined
                                    className="ms-2"
                                
                                />
                            </Link>
                        </div>
                        
                    </Card.Header>
                    <Card.Body>
                        <div className="table-responsive dailytaskemp">
                            <Table className="employee-table">
                                <thead>
                                    <tr className="table-primary">
                                        {daysInMonth.map((day, index) => (
                                            <th key={index} className={isWeekend(day) ? 'table-danger' : ''}>
                                                {day.format('ddd, MMM D')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {daysInMonth.map((day, index) => (
                                            <td key={index} className={isWeekend(day) ? 'table-danger' : ''}>
                                                <ul >
                                                    {tasksheets
                                                        .filter(sheet =>
                                                            moment(sheet.tasksheet_date).isSame(day, 'day'))
                                                        .map(sheet => (
                                                            <li key={sheet.id} className="mb-3">
                                                                <Link to={`/dashboard/view_task/${sheet.Task?._id}`}>
                                                                    <p className="mb-0">
                                                                        <span>Brand:</span> {sheet.Task?.project?.brand?.brand_name || 'No brand'}
                                                                        <small className="misses_image2">
                                                                              {sheet.task_priority_flag === "Priority" &&  <PiFlagBannerFill className="ms-3"/>}
                                                                        </small>
                                                                    </p>
                                                                    <p className="mb-0"><span>Project:</span> {sheet.Task?.project?.project_name || 'No project'}</p>
                                                                    <p className="mb-0"><span>Task:</span> {sheet.Task?.task_name || 'No task'}</p>
                                                                    <p className="mb-0 text-bold text-danger"><span>Deadline:</span> {sheet.task_deadline ?
                                                                        new Date(sheet.task_deadline).toLocaleString('en-GB', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                        }) : 'No deadline'}
                                                                    </p>
                                                                    <p className="mb-0"><span>Status:</span>
                                                                        <Badge pill bg={getBadgeColor(sheet.task_status)} className="ms-2">
                                                                            {sheet.task_status || 'No status'}
                                                                        </Badge>
                                                                    </p>

                                                                    <div className="misses_image">
                                                                        {sheet.missed_deadline && <VscFlame />}
                                                                    </div>

                                                                </Link>
                                                            </li>
                                                        ))}
                                                </ul>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
};

export default Dailytask_employee;
