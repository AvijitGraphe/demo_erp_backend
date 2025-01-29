import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Breadcrumb, Card, Form, Table, Badge } from 'react-bootstrap';
import { Button } from 'primereact/button';
import axios from 'axios';
import '../../assets/css/emp_report.css';
import '../../assets/css/dashboard.css';
import '../../assets/css/admin.css';
import config from '../../config';
import { AutoComplete } from "primereact/autocomplete";
import { Calendar } from 'primereact/calendar';
import { Chart } from 'primereact/chart';
import { Tooltip } from 'primereact/tooltip';
import { useAuth } from "../../context/AuthContext";
import { TbFlag3Filled } from "react-icons/tb";
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';
import { useNavigate } from "react-router-dom";
import { Dropdown } from "primereact/dropdown";
import noUserImg from '../../assets/images/no_user.png'; // Placeholder for missing profile images
const TaskLog = () => {
    const { accessToken } = useAuth();

    const [brands, setBrands] = useState([]);
    const [brandSuggestions, setBrandSuggestions] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedProject, setSelectedProject] = useState("");
    const [projects, setProjects] = useState([]);
    const [date, setDate] = useState(null);
    const [applyEnabled, setApplyEnabled] = useState(false);
    const [projectData, setProjectData] = useState(null);
    const navigate = useNavigate();
    const fetchBrandsAndProjects = async (search) => {
        try {
            const response = await axios.get(
                `${config.apiBASEURL}/projectRoutes/projects-by-brand?brand_name=${search}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            if (response.data && response.data.projects) {
                const projects = response.data.projects;
                const uniqueBrands = Array.from(
                    new Map(
                        projects.map((project) => [
                            project.brand.brand_name,
                            { id: project.brand_id, name: project.brand.brand_name },
                        ])
                    ).values()
                );
                setBrands(uniqueBrands);
                setProjects(projects);
            }
        } catch (error) {
            console.error("Error fetching brands/projects:", error);
        }
    };

    const fetchProjectData = async () => {
        console.log("selectedBrand", selectedBrand)
        try {
            const selectedMonth = date.getMonth() + 1; // `getMonth` is 0-indexed
            const formattedMonth = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`; // Ensure two-digit format

            const response = await axios.get(
                `${config.apiBASEURL}/monthly-report/fetch-monthly-report`,
                {
                    params: {
                        brandId: selectedBrand.id,
                        projectId: selectedProject,
                        month: formattedMonth, // Send only MM
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            console.log("log the data monthly ", response.data)
            setProjectData(response.data);
        } catch (err) {
            console.error("Failed to fetch data:", err.response?.data?.error || "Error occurred");
        }
    };

    const searchBrands = (event) => {
        const query = event.query.toLowerCase();
        const filteredBrands = brands.filter((brand) =>
            brand.name.toLowerCase().includes(query)
        );
        setBrandSuggestions(filteredBrands);
    };

    // Enable the "Apply" button when all fields are selected
    useEffect(() => {
        setApplyEnabled(selectedBrand && selectedProject && date);
    }, [selectedBrand, selectedProject, date]);




    // Define chartData and chartOptions
    const chartData = {
        labels: ['Todo', 'In Progress', 'In Review', 'In Changes', 'Completed'],
        datasets: [
            {
                data: [
                    projectData?.taskStatistics?.taskCountByStatus?.Todo || 0,
                    projectData?.taskStatistics?.taskCountByStatus?.InProgress || 0,
                    projectData?.taskStatistics?.taskCountByStatus?.InReview || 0,
                    projectData?.taskStatistics?.taskCountByStatus?.InChanges || 0,
                    projectData?.taskStatistics?.taskCountByStatus?.Completed || 0,
                ],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#4BC0C0'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#4BC0C0'],
            },
        ],
    };

    const chartOptions = {
        plugins: {
            legend: {
                display: true,
                position: 'right',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value}`;
                    },
                },
            },
        },
        maintainAspectRatio: false,
    };





    return (
        <Row className="body_content">
            <Row className="mx-0">
                <Col md={6} lg={3} className="mb-4">
                    <Breadcrumb>
                        <Breadcrumb.Item active>Monthly Project Report</Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
                <Col md={6} lg={9} className="mb-4 text-end">
                    <div className="d-flex justify-content-end">
                        {/* Brand AutoComplete */}
                        <AutoComplete
                            value={selectedBrand}
                            suggestions={brandSuggestions}
                            completeMethod={(e) => {
                                fetchBrandsAndProjects(e.query);
                                searchBrands(e);
                            }}
                            onChange={(e) => {
                                setSelectedBrand(e.value);
                                setSelectedProject(""); // Reset project selection when brand changes
                            }}
                            field="name"
                            placeholder="Search Brand"
                        />

                        {/* Project Dropdown (visible only if a brand is selected) */}
                        {selectedBrand && (
                            <Form.Select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="ms-2"
                                style={{ width: "180px" }}
                            >
                                <option value="">Select Project</option>
                                {projects
                                    .filter((project) => project.brand_id === selectedBrand.id)
                                    .map((project) => (
                                        <option key={project.project_id} value={project.project_id}>
                                            {project.project_name}
                                        </option>
                                    ))}
                            </Form.Select>
                        )}

                        {/* Month Picker */}
                        <Calendar
                            value={date}
                            onChange={(e) => setDate(e.value)}
                            view="month"
                            dateFormat="mm/yy"
                            className="ms-2"
                            placeholder="Select Month"
                            style={{ width: "150px" }}
                        />

                        {/* Apply Button (enabled only when all fields are selected) */}
                        {applyEnabled && (
                            <Button
                                severity="secondary"
                                className="ms-2"
                                label="Apply"
                                style={{ height: "46px" }}
                                onClick={fetchProjectData}
                            />
                        )}
                    </div>
                </Col>
                <Col lg={4} className="mb-4 ps-lg-0">
                    <Card className="p-0"
                    >
                        <Card.Body className="position-relative">
                            {projectData ? (
                                <>
                                    <div className="jdate">
                                        <span>Date of Creation : </span>
                                        <b>{new Date(projectData.project.createdAt).toLocaleDateString('en-GB')}</b>
                                    </div>
                                    <ul className="newulist" onClick={() => navigate(`/dashboard/projects_details/${projectData?.project?.project_id}`)}
                                        style={{ cursor: "pointer" }} // Optional: Indicate the card is clickable
                                    >
                                        <li>
                                            <div className="d-flex align-items-center mb-2">

                                                <div className="clientDshinfo">
                                                    <p className="fw-bold mb-1 text-sm">{projectData.brand.brand_name}</p>
                                                </div>
                                            </div>
                                        </li>
                                        <li>
                                            <span style={{ width: '110px' }}>Project Name</span> :{' '}
                                            {projectData.project.project_name || 'N/A'}
                                        </li>
                                        <li>

                                            <span style={{ width: '110px' }}>Project Leader</span> :{' '}
                                            <img
                                                src={projectData.project.lead?.profileImage?.image_url || noUserImg}
                                                alt="Project Leader"
                                                style={{ width: '26px', height: '26px' }}
                                                className="rounded-circle me-2 ms-1"
                                            />
                                            {projectData.project.lead
                                                ? `${projectData.project.lead.first_name} ${projectData.project.lead.last_name}`
                                                : 'N/A'}
                                        </li>
                                        <li>
                                            <span style={{ width: '110px' }}>Allocate</span> :
                                            <AvatarGroup className="ms-2">
                                                {projectData.project.members &&
                                                    projectData.project.members.map((member, index) => (
                                                        <Avatar
                                                            key={index}
                                                            image={
                                                                member.profileImage?.image_url ||
                                                                noUserImg
                                                            }
                                                            size="small"
                                                            shape="circle"
                                                            title={`${member.first_name} ${member.last_name}`}
                                                        />
                                                    ))}
                                            </AvatarGroup>
                                        </li>
                                    </ul>
                                </>
                            ) : (
                                <p>No Project Data Available</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={8} className="mb-4 ps-lg-0">
                    <Card className="p-0">
                        <Card.Header className="h6">Task Overview</Card.Header>
                        <Card.Body>
                            <Table className="repTable">
                                <thead>
                                    <tr>
                                        <td>Todo</td>
                                        <td>In Progress</td>
                                        <td>In Review</td>
                                        <td>In Changes</td>
                                        <td>Completed</td>
                                        <td>Missed Deadlines</td>
                                        <td className="table-secondary">Total Tasks</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th>{projectData?.taskStatistics?.taskCountByStatus?.Todo || 0}</th>
                                        <th>{projectData?.taskStatistics?.taskCountByStatus?.InProgress || 0}</th>
                                        <th>{projectData?.taskStatistics?.taskCountByStatus?.InReview || 0}</th>
                                        <th>{projectData?.taskStatistics?.taskCountByStatus?.InChanges || 0}</th>
                                        <th>{projectData?.taskStatistics?.taskCountByStatus?.Completed || 0}</th>
                                        <th className="custom-tooltip-btn4">
                                            {projectData?.missedDeadlineCount || 0}
                                        </th>
                                        <th className="table-secondary">{projectData?.taskStatistics?.totalTasks || 0}</th>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>

                    </Card>
                </Col>

                <Col lg={8} className="mb-4 pe-lg-0 ps-lg-0">
                    <Card className="p-0 ereportcard">
                        <Card.Header className="h6">
                            Urgent Task
                            <span className="float-end">
                                <span>Total Tasks :</span>
                                <span className="ms-2 text-danger">
                                    {projectData?.taskStatistics?.priorityTasks?.count || 0}
                                </span>
                            </span>
                        </Card.Header>
                        <Card.Body>
                            <div className="table-responsive">
                                <Table size="sm" striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Task Name (<TbFlag3Filled className="text-danger" />)</th>

                                            <th>End Date</th>
                                            <th>Employee</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {projectData?.taskStatistics?.priorityTasks?.details?.length > 0 ? (
                                            projectData.taskStatistics.priorityTasks.details.map((task, index) => (
                                                <tr
                                                    key={task.task_id || index}
                                                    onClick={() => navigate(`/dashboard/view_task/${task.task_id}`)}
                                                    style={{ cursor: "pointer" }} // Optional: Indicate the row is clickable
                                                >
                                                    <td>{task.task_name}</td>

                                                    <td>
                                                        {new Date(task.deadline).toLocaleDateString('en-GB')}
                                                    </td>
                                                    <td>
                                                        {`${task.assignee?.first_name || "N/A"} ${task.assignee?.last_name || ""
                                                            }`}
                                                    </td>
                                                    <td>
                                                        <Badge
                                                            className={
                                                                task.status === "Completed"
                                                                    ? "bg-success"
                                                                    : "bg-warning"
                                                            }
                                                        >
                                                            {task.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center">
                                                    No urgent tasks found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4} className="mb-4 pe-lg-0">
                    <Card className="p-0">
                        <Card.Header className="h6">
                            Task Analysis <sub className="text-muted">/ Month</sub>
                        </Card.Header>
                        <Card.Body className="text-center py-0">
                            <Chart
                                type="doughnut"
                                data={chartData}
                                options={chartOptions}
                                style={{ height: '420px' }}
                            />
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={12} className="mb-4 ps-lg-0 pe-lg-0">
                    <Card className="p-0">
                        <Card.Header className="h6">Task Log</Card.Header>
                        <Card.Body className="card-scroll">
                            <Table size="sm" striped bordered hover>
                                <thead className="sticky-top bg-white" style={{top:'-30px'}}>
                                    <tr className="table-info">
                                        <th colSpan={7} className="text-center">
                                            <small className="text-muted">Project Name:</small>
                                            <span>{projectData?.project?.project_name || "N/A"}</span>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>Task Name</th>
                                        <th style={{ width: '300px' }}>Task Description</th>
                                        <th>Priority</th>
                                        <th>Modified By</th>
                                        <th>Previous Status</th>
                                        <th>Time Log</th>
                                        <th>Modified Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projectData?.taskLogs?.length > 0 ? (
                                        projectData.taskLogs.map((log, index) => {
                                            const priorityClass = {
                                                Low: "success",
                                                Medium: "primary",
                                                High: "danger",
                                                Urgent: "warning",
                                            }[log.priority || "Medium"];

                                            const statusColors = {
                                                Todo: "secondary",
                                                InProgress: "info",
                                                InReview: "primary",
                                                InChanges: "warning",
                                                Completed: "success",
                                            };

                                            return (
                                                <tr key={index}>
                                                    <td>{log.task?.task_name || "N/A"}</td>
                                                    <td>
                                                        <p>
                                                            {log.task?.task_description || "N/A"}
                                                        </p>
                                                    </td>
                                                    <td>
                                                        <Badge className={`bg-${priorityClass}`}>
                                                            {log.priority || "Medium"}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        {log.user?.first_name && log.user?.last_name
                                                            ? `${log.user.first_name} ${log.user.last_name}`
                                                            : "N/A"}
                                                    </td>
                                                    <td>
                                                        <Badge className={`bg-${statusColors[log.status_initial] || "secondary"}`}>
                                                            {log.status_initial || "N/A"}
                                                        </Badge>
                                                    </td>
                                                    <td>{new Date(log.time_stamp).toLocaleString('en-GB')}</td>
                                                    <td>
                                                        <Badge className={`bg-${statusColors[log.status_final] || "secondary"}`}>
                                                            {log.status_final || "N/A"}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="text-center">
                                                No task logs available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>



            </Row>
        </Row>
    );
};

export default TaskLog;