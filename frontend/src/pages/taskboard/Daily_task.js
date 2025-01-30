import React, { useEffect, useState } from "react";
import { Col, Row, Card, Table, Breadcrumb, Badge } from "react-bootstrap";
import { Calendar } from "primereact/calendar";
import axios from "axios";
import config from "../../config";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { VscFlame } from "react-icons/vsc";
import { PiFlagBannerFill } from "react-icons/pi";
import noUserImg from '../../assets/images/no_user.png'; // Placeholder for missing profile images
const Daily_task = () => {
    const { accessToken } = useAuth();
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1); // Sets to the first day of the current month
    });

    const [tasksheetsData, setTasksheetsData] = useState({});
    const [employeeData, setEmployeeData] = useState([]);
    const [loading, setLoading] = useState(false);

    const getFormattedDates = (year, month) => {
        const dates = [];
        const date = new Date(year, month - 1, 1);
        const formatter = new Intl.DateTimeFormat("en-GB", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });

        while (date.getMonth() === month - 1) {
            dates.push({
                formatted: formatter.format(date),
                plainDate: `${year}-${String(month).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`, // Plain date format
                day: date.getDay(),
            });
            date.setDate(date.getDate() + 1);
        }
        return dates;
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.value);
    };

    const [year, month] = selectedMonth
        ? [selectedMonth.getFullYear(), selectedMonth.getMonth() + 1]
        : [new Date().getFullYear(), new Date().getMonth() + 1];

    const daysInMonth = getFormattedDates(year, month);

    const getDateRange = () => {
        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const endDate = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;
        return { start_date: startDate, end_date: endDate };
    };

    const fetchTasksheetsData = async () => {
        setLoading(true);
        const { start_date, end_date } = getDateRange();
        try {
            const response = await axios.get(`${config.apiBASEURL}/tasksheetRoutes/tasksheets`, {
                params: { start_date, end_date },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const data = response.data.data || {}; 
            console.log("log the data", data);
                       
            setTasksheetsData(data);
            // Extract employee data with missed deadline counts
            const employees = Object.values(data).map(({ userDetails, missedDeadlineCounts }) => ({
                id: userDetails.user_id,
                name: userDetails.name,
                avatar: userDetails.profileImage || noUserImg,
                missedTrueCount: missedDeadlineCounts.missedTrueCount,
                missedFalseCount: missedDeadlineCounts.missedFalseCount,
            }));
            setEmployeeData(employees);
        } catch (error) {
            console.error("Error fetching tasksheet data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedMonth) {
            fetchTasksheetsData();
        }
    }, [selectedMonth]);

    const statusColors = {
        Todo: "badge bg-secondary",    // Yellow
        Completed: "badge bg-success", // Green
        InProgress: "badge bg-info",   // Blue
        InReview: "badge bg-warning",  // Orange
        InChanges: "badge bg-primary",    // Blue
    };

    return (
        <Row className="body_content">
            <Row className="mx-0">
                <Col md={6} lg={6} className="mb-4">
                    <Breadcrumb>
                        <Breadcrumb.Item active>Task Sheet</Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
                <Col md={6} lg={6} className="mb-4 d-flex justify-content-end align-items-center">
                    <label>Filter by Month</label>
                    <Calendar
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        view="month"
                        dateFormat="MM yy"
                        placeholder="Choose a month"
                        showButtonBar
                        className="ms-3 py-0"
                        style={{ width: "170px", height: "38px" }}
                    />
                </Col>
                <Col lg={12}>
                    <Card>
                        <div className="table-responsive tasksheetTable">
                            {loading ? (
                                <p>Loading tasksheets...</p>
                            ) : (
                                <Table className="employee-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "100px" }} className="sticky-header">Day</th>
                                            {employeeData.map(({ name, avatar, missedTrueCount, missedFalseCount }, index) => (
                                                <th key={index} style={{ width: "320px" }} className="sticky-header">
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <img
                                                            src={avatar}
                                                            alt={name}
                                                            style={{
                                                                width: "30px",
                                                                height: "30px",
                                                                borderRadius: "50%",
                                                                marginRight: "10px",
                                                            }}
                                                        />
                                                        {name}
                                                    </div>


                                                    <ol className="countPro">
                                                        <li>
                                                            <span><small>On Time : </small>{missedFalseCount} </span>
                                                        </li>
                                                        <li>
                                                            <span><small>Missd : </small>{missedTrueCount} </span>
                                                        </li>

                                                    </ol>

                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {daysInMonth.map(({ formatted, plainDate, day }, rowIndex) => (
                                            <tr key={rowIndex} className={day === 0 || day === 6 ? "weekend-row" : ""}>
                                                <td
                                                    style={{ width: "100px" }}
                                                    className={`sticky-column ${day === 0 || day === 6 ? "weekend-cell" : ""}`}
                                                >
                                                    {formatted}
                                                </td>
                                                {employeeData.map(({ id }, colIndex) => {
                                                    const userTasks = tasksheetsData[id]?.tasksheets[plainDate] || []; // Use plainDate
                                                    return (
                                                        <td key={colIndex} style={{ width: "320px" }}>
                                                            <ul>
                                                                {userTasks.map((task, taskIndex) => (
                                                                    <li key={taskIndex}>
                                                                        <Link to={`/dashboard/view_task/${task.Task._id}`}>
                                                                            <p>
                                                                                <span>Brand : </span> {task.Task.project.brand.brand_name}
                                                                                <small className="misses_image2">{task.task_priority_flag === "Priority" && <PiFlagBannerFill className="ms-3" />}</small>
                                                                            </p>
                                                                            <p><span>Project : </span> {task.Task.project.project_name}</p>
                                                                            <p><span>Task : </span> {task.Task.task_name}</p>
                                                                            <p className="text-danger text-bold"><span>Deadline : </span> {new Date(task.Task.task_deadline).toLocaleString('en-GB', {
                                                                                year: 'numeric',
                                                                                month: 'short',
                                                                                day: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                            })}</p>

                                                                            <p>
                                                                                <span>Status : </span>
                                                                                <span className={statusColors[task.task_status] || "badge bg-info"}>
                                                                                    {task.task_status}
                                                                                </span>
                                                                            </p>
                                                                            <div className="misses_image">
                                                                                {task.missed_deadline && <VscFlame />}
                                                                            </div>

                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
        </Row>
    );
};

export default Daily_task;
