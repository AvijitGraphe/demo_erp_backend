import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Col, Row, Card, Badge, Breadcrumb, Table } from "react-bootstrap";
import axios from "axios";
import config from "../../config";
import { useAuth } from "../../context/AuthContext";
import { FiCopy } from "react-icons/fi";
import {
    MDBBadge,
    MDBTable,
    MDBTableBody,
} from 'mdb-react-ui-kit';
import { MDBTabs, MDBTabsItem, MDBTabsLink, MDBTabsContent, MDBTabsPane } from 'mdb-react-ui-kit';
import { Tooltip } from 'primereact/tooltip';
import '../../assets/css/dashboard.css';
import '../../assets/css/projects.css';
import noUserImg from '../../assets/images/no_user.png'; // Placeholder for missing profile images
const Project_details = () => {
    const { accessToken } = useAuth(); // Access token from context
    const { project_id } = useParams(); // Get project_id from route params
    const navigate = useNavigate(); // React Router's navigate hook
    const [project, setProject] = useState(null); // State to store project details
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state


    const [fillActive, setFillActive] = useState('tab1');
    const [tasks, setTasks] = useState({
        todoTasks: [],
        inProgressTasks: [],
        inReviewTasks: [],
        inChangesTasks: [],
        completedTasks: []
    });
    const [taskCountByStatus, setTaskCountByStatus] = useState([]);

    useEffect(() => {
        // Function to fetch tasks based on project_id
        const fetchTasks = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/projectRoutes/fetch-project-all-tasks?project_id=${project_id}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                console.log("log the data is now", response)
                const { tasks, taskCountByStatus } = response.data;

                // Categorize tasks by status
                const todoTasks = tasks.filter(task => task.status === 'Todo');
                const inProgressTasks = tasks.filter(task => task.status === 'InProgress');
                const inReviewTasks = tasks.filter(task => task.status === 'InReview');
                const inChangesTasks = tasks.filter(task => task.status === 'InChanges');
                const completedTasks = tasks.filter(task => task.status === 'Completed');

                console.log("log hte data", inReviewTasks);
                

                // Set the tasks and task counts in state
                setTasks({
                    todoTasks,
                    inProgressTasks,
                    inReviewTasks,
                    inChangesTasks,
                    completedTasks
                });

                setTaskCountByStatus(taskCountByStatus);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchTasks();
    }, [accessToken, project_id]);

    useEffect(() => {
        // Fetch project details
        const fetchProjectDetails = async () => {
            try {
                setLoading(true); // Start loading
                const response = await axios.get(
                    `${config.apiBASEURL}/projectRoutes/projects/${project_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
                setProject(response.data.project); // Set project data
            } catch (err) {
                setError("Failed to fetch project details");
                console.error(err);
            } finally {
                setLoading(false); // Stop loading
            }
        };

        if (project_id) {
            fetchProjectDetails();
        }
    }, [project_id, accessToken]);

    if (loading) {
        return <p>Loading project details...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!project) {
        return <p>No project data found</p>;
    }

    const getBadgeColor = (priority) => {
        switch (priority) {
            case 'High':
                return 'danger'; // Red for high priority
            case 'Medium':
                return 'warning'; // Yellow for medium priority
            case 'Low':
                return 'success'; // Green for low priority
            default:
                return 'secondary'; // Grey for unknown or "N/A"
        }
    };

    return (
        <Row className="body_content">
            <Row className="mx-0">
                <Col md={6} lg={6} className="mb-4">
                    <Breadcrumb>
                        <Breadcrumb.Item onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
                            <i className="pi pi-angle-left"></i> Back
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>Project Details</Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
                <Col md={12} lg={9}>
                    <Card className='mb-3 h-auto'>
                        <Card.Header className='h5'>
                            <h6 className="pt-2"><small className="text-secondary">Brand Name : </small>{project.brand?.brand_name || "N/A"}</h6>
                            <Table size="sm" borderless className="mb-0 mt-4 prodetTable">
                                <thead>
                                    <tr>
                                        <td>Project Name</td>
                                        <td>Created</td>
                                        <td>Deadline</td>
                                        <td>Priority</td>
                                        <td>Status</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th>{project.project_name || "N/A"}</th>
                                        <th className='text-info'>
                                            {project.start_date ? new Date(project.start_date).toLocaleDateString('en-GB') : "N/A"}
                                        </th>
                                        <th className='text-danger'>
                                            {project.end_date ? new Date(project.end_date).toLocaleDateString('en-GB') : "N/A"}
                                        </th>

                                        <th>
                                            <Badge className={`bg-${getBadgeColor(project.priority)}`}>
                                                {project.priority || "N/A"}
                                            </Badge>
                                        </th>
                                        <th>{project.status || "N/A"}</th>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Header>
                        <Card.Body>
                            {project.description || "No description available"}
                        </Card.Body>
                    </Card>
                    <Card className='mb-3 h-auto'>
                        <Card.Header className='h5'>Uploaded Files Drive Link</Card.Header>
                        <Card.Body>
                            <ul className='fileupload_card'>
                                <li>
                                    <div className='d-flex align-items-center'>
                                        <div className='filecoppy_ic'><FiCopy /></div>
                                        <div className='ms-3'>
                                            <p className='fw-bold mb-0'>{project.project_files || "No files uploaded"}</p>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>

                    <Card className='h-auto p-0 ps-2'>
                        <Card.Body className="p-0">
                            <MDBTabs pills fill className='mb-3'>
                                <MDBTabsItem>
                                    <MDBTabsLink onClick={() => setFillActive('tab1')} active={fillActive === 'tab1'} className="d-flex justify-content-between">
                                        To Do <Badge className='bg-danger'>{tasks.todoTasks.length}</Badge>
                                    </MDBTabsLink>
                                </MDBTabsItem>
                                <MDBTabsItem>
                                    <MDBTabsLink onClick={() => setFillActive('tab2')} active={fillActive === 'tab2'} className="d-flex justify-content-between">
                                        In Progress <Badge className='bg-danger'>{tasks.inProgressTasks.length}</Badge>
                                    </MDBTabsLink>
                                </MDBTabsItem>
                                <MDBTabsItem>
                                    <MDBTabsLink onClick={() => setFillActive('tab3')} active={fillActive === 'tab3'} className="d-flex justify-content-between">
                                        In Review <Badge className='bg-danger'>{tasks.inReviewTasks.length}</Badge>
                                    </MDBTabsLink>
                                </MDBTabsItem>
                                <MDBTabsItem>
                                    <MDBTabsLink onClick={() => setFillActive('tab5')} active={fillActive === 'tab5'} className="d-flex justify-content-between">
                                        Changes <Badge className='bg-danger'>{tasks.inChangesTasks.length}</Badge>
                                    </MDBTabsLink>
                                </MDBTabsItem>
                                <MDBTabsItem>
                                    <MDBTabsLink onClick={() => setFillActive('tab4')} active={fillActive === 'tab4'} className="d-flex justify-content-between">
                                        Completed <Badge className='bg-danger'>{tasks.completedTasks.length}</Badge>
                                    </MDBTabsLink>
                                </MDBTabsItem>

                            </MDBTabs>

                            <MDBTabsContent>
                                <MDBTabsPane open={fillActive === 'tab1'}>
                                    <div className='card-scroll ps-4'>
                                        <ul className="dalytask">
                                            {tasks.todoTasks.map(task => (
                                                <li key={task.task_id}>
                                                    <Link to={`/dashboard/view_task/${task.task_id}`} className="text-decoration-none text-dark">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Name:</small> {task.task_name}
                                                                </small>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Deadline:</small> {new Date(task.task_deadline).toLocaleDateString('en-GB')}
                                                                </small>
                                                                <small className='pd_tasklist d-flex align-items-center'>
                                                                    <small>Assigned To:</small>
                                                                    <div className="d-flex align-items-center ms-2">
                                                                        <img
                                                                            src={task.assignee?.profileImage?.image_url || noUserImg}
                                                                            alt={task.assignee.first_name}
                                                                            className="rounded-circle"
                                                                            width="30"
                                                                            height="30"
                                                                        />
                                                                        <span className="ms-2">
                                                                            {task.assignee.first_name} {task.assignee.last_name}
                                                                            &nbsp; | &nbsp; <Badge className='bg-primary'>To Do</Badge>
                                                                        </span>
                                                                    </div>
                                                                </small>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Description:</small>
                                                                    <small className="text-black d-block mt-2" style={{ lineHeight: '1.5' }}>
                                                                        {task.task_description}
                                                                    </small>
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </MDBTabsPane>

                                <MDBTabsPane open={fillActive === 'tab2'}>
                                    <div className='card-scroll ps-4'>
                                        <ul className="dalytask">
                                            {tasks.inProgressTasks.map(task => (
                                                <li key={task.task_id}>
                                                    <Link to={`/dashboard/view_task/${task.task_id}`} className="text-decoration-none text-dark">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Name:</small> {task.task_name}
                                                                </small>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Deadline:</small> {new Date(task.task_deadline).toLocaleDateString('en-GB')}
                                                                </small>
                                                                <small className='pd_tasklist d-flex align-items-center'>
                                                                    <small>Assigned To:</small>
                                                                    <div className="d-flex align-items-center ms-2">
                                                                        <img
                                                                            src={task.assignee?.profileImage?.image_url || noUserImg}
                                                                            alt={task.assignee.first_name}
                                                                            className="rounded-circle"
                                                                            width="30"
                                                                            height="30"
                                                                        />
                                                                        <span className="ms-2">
                                                                            {task.assignee.first_name} {task.assignee.last_name}
                                                                            &nbsp; | &nbsp; <Badge className='bg-info'>In-Progress</Badge>
                                                                        </span>
                                                                    </div>
                                                                </small>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Description:</small>
                                                                    <small className="text-black d-block mt-2" style={{ lineHeight: '1.5' }}>{task.task_description}</small>
                                                                </small>
                                                            </div>

                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </MDBTabsPane>

                                <MDBTabsPane open={fillActive === 'tab3'}>
                                    <div className='card-scroll ps-4'>
                                        <ul className="dalytask">
                                            {tasks.inReviewTasks.map(task => (
                                                <li key={task.task_id}>
                                                    <Link to={`/dashboard/view_task/${task.task_id}`} className="text-decoration-none text-dark">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Name:</small> {task.task_name}
                                                                </small>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Deadline:</small> {new Date(task.task_deadline).toLocaleDateString('en-GB')}
                                                                </small>
                                                                <small className='pd_tasklist d-flex align-items-center'>
                                                                    <small>Assigned To:</small>
                                                                    <div className="d-flex align-items-center ms-2">
                                                                        <img
                                                                            src={task.assignee?.profileImage?.image_url || noUserImg}
                                                                            alt={task.assignee.first_name}
                                                                            className="rounded-circle"
                                                                            width="30"
                                                                            height="30"
                                                                        />
                                                                        <span className="ms-2">
                                                                            {task.assignee.first_name} {task.assignee.last_name}
                                                                            &nbsp; | &nbsp; <Badge className='bg-warning'>In-Review</Badge>
                                                                        </span>
                                                                    </div>
                                                                </small>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Description:</small>
                                                                    <small className="text-black d-block mt-2" style={{ lineHeight: '1.5' }}>{task.task_description}</small>
                                                                </small>
                                                            </div>

                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </MDBTabsPane>

                                <MDBTabsPane open={fillActive === 'tab4'}>
                                    <div className='card-scroll ps-4'>
                                        <ul className="dalytask">
                                            {tasks.completedTasks.map(task => (
                                                <li key={task.task_id}>
                                                    <Link to={`/dashboard/view_task/${task.task_id}`} className="text-decoration-none text-dark">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Name:</small> {task.task_name}
                                                                </small>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Deadline:</small> {new Date(task.task_deadline).toLocaleDateString('en-GB')}
                                                                </small>
                                                                <small className='pd_tasklist d-flex align-items-center'>
                                                                    <small>Assigned To:</small>
                                                                    <div className="d-flex align-items-center ms-2">
                                                                        <img
                                                                            src={task.assignee?.profileImage?.image_url || noUserImg}
                                                                            alt={task.assignee.first_name}
                                                                            className="rounded-circle"
                                                                            width="30"
                                                                            height="30"
                                                                        />
                                                                        <span className="ms-2">
                                                                            {task.assignee.first_name} {task.assignee.last_name}
                                                                            &nbsp; | &nbsp; <Badge className='bg-success'>Completed</Badge>
                                                                        </span>
                                                                    </div>
                                                                </small>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Description:</small>
                                                                    <small className="text-black d-block mt-2" style={{ lineHeight: '1.5' }}>{task.task_description}</small>
                                                                </small>
                                                            </div>

                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </MDBTabsPane>

                                <MDBTabsPane open={fillActive === 'tab5'}>
                                    <div className='card-scroll ps-4'>
                                        <ul className="dalytask">
                                            {tasks.inChangesTasks.map(task => (
                                                <li key={task.task_id}>
                                                    <Link to={`/dashboard/view_task/${task.task_id}`} className="text-decoration-none text-dark">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Name:</small> {task.task_name}
                                                                </small>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Deadline:</small> {new Date(task.task_deadline).toLocaleDateString('en-GB')}
                                                                </small>
                                                                <small className='pd_tasklist d-flex align-items-center'>
                                                                    <small>Assigned To:</small>
                                                                    <div className="d-flex align-items-center ms-2">
                                                                        <img
                                                                            src={task.assignee?.profileImage?.image_url || noUserImg}
                                                                            alt={task.assignee.first_name}
                                                                            className="rounded-circle"
                                                                            width="30"
                                                                            height="30"
                                                                        />
                                                                        <span className="ms-2">
                                                                            {task.assignee.first_name} {task.assignee.last_name}
                                                                            &nbsp; | &nbsp; <Badge className='bg-primary'>In-Changes</Badge>
                                                                        </span>
                                                                    </div>
                                                                </small>
                                                                <small className='pd_tasklist'>
                                                                    <small>Task Description:</small>
                                                                    <small className="text-black d-block mt-2" style={{ lineHeight: '1.5' }}>{task.task_description}</small>
                                                                </small>
                                                            </div>

                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </MDBTabsPane>
                            </MDBTabsContent>
                        </Card.Body>
                    </Card>


                </Col>

                <Col md={12} lg='3'>
                    <div className="sticky-top">
                        <Card className='mb-3 h-auto'>
                            <Card.Header className='h5'>Assigned Leader</Card.Header>
                            <Card.Body>
                                <Tooltip target=".leader-tooltip" mouseTrack mouseTrackLeft={10} mouseTrackTop={10} />
                                <ul className="list-unstyled d-flex flex-wrap align-items-center m-0">
                                    <li className="d-flex align-items-center me-3 mt-2 leader-tooltip">
                                        <img
                                            src={project.lead?.profileImage?.image_url || noUserImg}
                                            alt="Lead Profile"
                                            className="rounded-circle me-2"
                                            width="30"
                                            height="30"
                                        />
                                        <span>{`${project.lead?.first_name || ""} ${project.lead?.last_name || ""}`.trim()}</span>
                                    </li>
                                </ul>
                            </Card.Body>
                        </Card>
                        <Card className='mb-3 h-auto'>
                            <Card.Header className='h5'>Assigned Team Members</Card.Header>
                            <Card.Body>
                                <Tooltip target=".member-tooltip" mouseTrack mouseTrackLeft={10} mouseTrackTop={10} />
                                <ul className="list-unstyled m-0">
                                    {project.members?.length ? (
                                        project.members.map((member) => (
                                            <li key={member.user_id} className="d-flex align-items-center me-3 mt-2 member-tooltip">
                                                <img
                                                    src={member.profileImage?.image_url || noUserImg}
                                                    alt="Member Profile"
                                                    className="rounded-circle me-2"
                                                    width="25"
                                                    height="25"
                                                />
                                                <span style={{ fontSize: '13px' }}>{`${member.first_name || ""} ${member.last_name || ""}`.trim()}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <p>No team members assigned</p>
                                    )}
                                </ul>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>

            </Row>
        </Row >
    );
};

export default Project_details;
