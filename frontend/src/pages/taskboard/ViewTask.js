import React, { useState, useEffect } from 'react';
import { Col, Row, Breadcrumb, Card, Table, Badge, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Timeline } from 'primereact/timeline';
import { Button } from 'primereact/button';
import { Avatar } from "primereact/avatar";
import { Tooltip } from 'primereact/tooltip';
import { Dialog } from "primereact/dialog";
import EditTask from '../../modalPopup/EditTask';
import AddSubTask from '../../modalPopup/AddSubTask';
import EditSubTask from '../../modalPopup/EditSubTask';
import { Dropdown } from 'primereact/dropdown';
import Marquee from "react-fast-marquee"
import noUserImg from '../../assets/images/no_user.png'; // Placeholder for missing profile images
const ViewTask = () => {
    const { accessToken, role, userId } = useAuth();
    const navigate = useNavigate();
    const { taskId } = useParams();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [isSubTaskDialogVisible, setIsSubTaskDialogVisible] = useState(false);
    const [isSubTasEditDialogVisible, setIsSubTasEditDialogVisible] = useState(false);
    const [selectedSubTaskId, setSelectedSubTaskId] = useState(null);
    /*----------------Timeline----------------*/

    const [events, setEvents] = useState([]);

    // Define allowed roles
    const allowedRoles = [
        'Founder',
        'Admin',
        'SuperAdmin',
        'HumanResource',
        'Accounts',
        'Department_Head',
        'Task_manager'
    ];

    const fetchTaskData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${config.apiBASEURL}/projectRoutes/fetchspecifictask/${taskId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            console.log("log the darta +++++", response.data)
            setTask(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load task data');
            setLoading(false);
        }
    };


    const fetchTaskLogs = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/projectRoutes/task-logs/${taskId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const logs = response.data.logs || [];

            const formattedEvents = logs.map((log) => ({
                status: `${log.status_initial} → ${log.status_final}`,
                date: log.time_stamp,
                user: log.user,
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching task logs:', error);
            setEvents([]);
        }
    };




    useEffect(() => {

        fetchTaskData();
        fetchTaskLogs();
    }, [taskId, accessToken]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;




    const getPriorityBadgeClass = (priority) => {
        switch (priority) {
            case 'Low':
                return 'bg-success'; // Green for low priority
            case 'Medium':
                return 'bg-warning'; // Yellow for medium priority
            case 'High':
                return 'bg-danger'; // Red for high priority
            case 'Urgent':
                return 'bg-dark'; // Dark for urgent priority
            default:
                return 'bg-secondary'; // Default gray for unspecified priority
        }
    };


    const handleDialogClose = (success) => {
        setIsDialogVisible(false);
        if (success) {
            fetchTaskData();
        }
    };

    const handleSubTaskDialogClose = (success) => {
        setIsSubTaskDialogVisible(false);
        if (success) {
            fetchTaskData();
        }
    };

    const handleEditButtonClick = (subtaskId) => {
        setSelectedSubTaskId(subtaskId); // Store the selected subtask ID
        setIsSubTasEditDialogVisible(true); // Open the dialog
    };


    const handleSubTaskEditDialogClose = (success) => {
        setIsSubTasEditDialogVisible(false);
        if (success) {
            fetchTaskData();
        }
    };



    const handleStatusChange = async (subtaskId, newStatus) => {
        try {
            // Update the status of the subtask
            const response = await axios.put(
                `${config.apiBASEURL}/projectRoutes/subtasks/${subtaskId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (response.status === 200) {
                // If the new status is 'Completed', call the additional API
                if (newStatus === 'Completed') {
                    const additionalResponse = await axios.post(
                        `${config.apiBASEURL}/tasksheetRoutes/handle-subtask-status`,
                        {
                            subtask_id: subtaskId,
                            task_id: taskId,
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        }
                    );

                    if (additionalResponse.status === 200) {
                        console.log("Subtask data added to Subtasksheet successfully.");
                    } else {
                        console.error("Failed to add subtask data to Subtasksheet.");
                    }
                }

                // Refresh task data
                fetchTaskData();
            } else {
                console.error("Failed to update subtask status");
            }
        } catch (error) {
            console.error("Error updating subtask status:", error);
        }
    };


    /*------------Badge_color----------*/

    function getPriorityClass(priority) {
        switch (priority.toLowerCase()) {
            case 'high':
                return 'bg-danger'; // Red badge for High priority
            case 'medium':
                return 'bg-warning'; // Yellow badge for Medium priority
            case 'low':
                return 'bg-primary'; // Green badge for Low priority
            default:
                return 'bg-secondary'; // Grey badge for Unknown priority
        }
    }

    const canViewButton = allowedRoles.includes(role) || task?.task_user_id === userId;

    return (
        <Row className="body_content">
            <Row className="mx-0">
                <Col md={6} lg={3} className="mb-4">
                    <Breadcrumb>
                        <Breadcrumb.Item onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
                            <i className="pi pi-angle-left"></i> Back
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>Task Details</Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
                <Col md={6} lg={9}>
                    {task.missed_deadline && (
                        <Marquee
                            gradient={false}
                            speed={50}
                            className="text-danger"
                            style={{ fontWeight: '400', fontSize: '14px' }}
                        >
                            {Array(10).fill('  Deadline Missed  ').join(' || ')}
                        </Marquee>
                    )}
                </Col>

                <Col md={12} lg={4}>
                    <div className='sticky-top'>
                        <Card className='h-auto'>
                            <Card.Body className='px-0'>
                                <Table striped hover>
                                    <thead>
                                        <tr>
                                            <td style={{ width: '140px' }}>Brand Name :</td>
                                            <th>{task.project.brand.brand_name}</th>
                                        </tr>
                                        <tr>
                                            <td>Project Name :</td>
                                            <th>{task.project.project_name}</th>
                                        </tr>
                                        <tr>
                                            <td>Assigned To :</td>
                                            <th className='d-flex align-items-center'>
                                                <Avatar
                                                    image={
                                                        task.assignee?.profileImage?.image_url
                                                            ? task.assignee.profileImage.image_url
                                                            : noUserImg
                                                    }
                                                    shape="circle"
                                                    className="me-2"
                                                    style={{ width: '30px', height: '30px' }}
                                                />
                                                {task.assignee.first_name}{' '} {task.assignee.last_name}
                                            </th>
                                        </tr>
                                    </thead>
                                </Table>
                            </Card.Body>
                        </Card>
                        <Card className="mt-3 h-auto timeline-card">
                            <Card.Header className='h6'>
                                Task Timeline
                            </Card.Header>
                            <Card.Body>
                                <div className='card-scroll'>
                                    <Timeline
                                        value={events}
                                        content={(item) => (
                                            <div className="mb-3">
                                                <div>
                                                    <p className="text-primary mb-0">{item.status}</p>
                                                    <small className="text-muted d-block">
                                                        {new Date(item.date).toLocaleDateString('en-GB')}{' '}
                                                        {new Date(item.date).toLocaleTimeString()}
                                                    </small>
                                                    <div className='d-flex align-items-center py-2'>
                                                        <span style={{ fontSize: '13px', fontWeight: '500' }}>
                                                            Status
                                                        </span>
                                                        <span className="d-flex align-items-center">
                                                            <Avatar
                                                                image={item.user.profileImage?.image_url || noUserImg}
                                                                shape="circle"
                                                                className="ms-2 userName"
                                                                data-pr-tooltip={`Updated By: ${item.user.first_name} ${item.user.last_name}`}
                                                                style={{ width: '22px', height: '22px' }}
                                                            />
                                                            <Tooltip target=".userName" mouseTrack mouseTrackLeft={10} />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>
                <Col md={12} lg={8}>
                    <Card className='subtaskb_det h-auto'>
                        <Card.Header className='d-flex justify-content-between align-items-center'>
                            <span className='w-80'>
                                <small className='text-muted'>Task Name</small> : <b>{task.task_name}</b>
                                <small className='text-secondary d-block'>Last Edited : {new Date(task.updatedAt).toLocaleString('en-GB')}</small>
                            </span>
                            <span>
                                {allowedRoles.includes(role) && (
                                    <Button
                                        outlined
                                        severity="help"
                                        icon="pi pi-pencil"
                                        className="p-0 border-0"
                                        title="Edit Task"
                                        onClick={() => setIsDialogVisible(true)}
                                    />
                                )}
                            </span>
                        </Card.Header>
                        <Card.Body>
                            <Badge className={getPriorityBadgeClass(task.priority)}>
                                Priority: {task.priority}
                            </Badge>
                            <ul className='list-taskunstyled'>
                                <li><span>Status:</span> {task.status}</li>
                                <li>
                                    <span>Start Date:</span>{' '}
                                    {new Date(task.task_startdate).toLocaleString('en-GB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false, // Optional, use 24-hour format. Remove for 12-hour format.
                                    })}
                                </li>
                                <li>
                                    <span>Deadline:</span>{' '}
                                    {new Date(task.task_deadline).toLocaleString('en-GB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false, // Optional
                                    })}
                                </li>

                                <li className='w-100'><span>Description:</span> {task.task_description}</li>
                            </ul>
                        </Card.Body>
                    </Card>
                    <Card className='mt-3 h-auto'>
                        <Card.Header className='d-flex justify-content-between align-items-center h6'>
                            Subtasks
                            <span>
                                {canViewButton && (
                                    <Button
                                        label="Add"
                                        severity="info"
                                        icon="pi pi-plus"
                                        className="py-1 px-2"
                                        title="Add Subtask"
                                        onClick={() => setIsSubTaskDialogVisible(true)}
                                    />
                                )}
                            </span>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup>
                                {task.subtasks.map((subtask, index) => (
                                    <ListGroup.Item key={subtask.subtask_id}>
                                        <p><em className='me-2 text-secondary'>Subtask {index + 1} :</em> <span>{subtask.subtask_name}</span></p>
                                        <p><em className='me-2 text-secondary'>Role: </em> <span>{subtask.projectRole.project_role_name}</span></p>
                                        <p><em className='me-2 text-secondary'>Description :</em> <span className='text-black'>{subtask.sub_task_description}</span></p>
                                        <p><em className='me-2 text-secondary'>Start Date and Time :</em> <b className='text-info'>{new Date(subtask.sub_task_startdate).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: false, // Optional
                                        })}</b></p>
                                        <p><em className='me-2 text-secondary'>Deadline :</em> <b className='text-danger'>{new Date(subtask.sub_task_deadline).toLocaleString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: false, // Optional
                                        })}</b></p>
                                        <p>
                                            <em>Priority :</em> &nbsp;
                                            <span className={`badge ${getPriorityClass(subtask.priority)}`}>
                                                {subtask.priority}
                                            </span>
                                        </p>
                                        <div className='d-flex align-items-center gap-2 p-2 px-3 mt-3 border bg-light justify-content-end'>
                                            <small className='text-danger'><b>Status :</b></small>
                                            <select
                                                className="form-select form-select-sm bg-white"
                                                value={subtask.status}
                                                onChange={(e) => handleStatusChange(subtask.subtask_id, e.target.value)}
                                                style={{ width: '150px', height: '30px', fontSize: '12px', lineHeight: '1', padding: '0px' }}
                                                disabled={!canViewButton} // Enable only if the user can view/edit
                                            >
                                                <option value="" disabled>Select Status</option>
                                                <option value="Todo">Todo</option>
                                                <option value="InProgress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>

                                        {/* Edit button */}
                                        {canViewButton && (
                                            <Button
                                                outlined
                                                severity="help"
                                                icon="pi pi-pencil"
                                                className="p-0 border-0"
                                                title="Edit Subtask"
                                                onClick={() => handleEditButtonClick(subtask.subtask_id)} // Pass the subtask_id
                                                style={{ position: 'absolute', right: '10px', top: '10px' }}
                                            />
                                        )}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                <Dialog
                    visible={isDialogVisible}
                    onHide={() => setIsDialogVisible(false)}
                    header="Edit Task"
                    style={{ width: '50vw' }}
                >
                    <EditTask
                        taskId={task.task_id}
                        onSuccess={() => handleDialogClose(true)}
                    />
                </Dialog>

                <Dialog
                    visible={isSubTaskDialogVisible}
                    onHide={() => setIsSubTaskDialogVisible(false)}
                    header="Add Subtask"
                    style={{ width: '50vw' }}
                >
                    <AddSubTask
                        taskId={task.task_id}
                        ProjectId={task.project_id}
                        BrandId={task.brand_id}
                        User_Id={task.task_user_id}
                        onSuccess={() => handleSubTaskDialogClose(true)}
                    />
                </Dialog>

                <Dialog
                    visible={isSubTasEditDialogVisible}
                    onHide={() => setIsSubTasEditDialogVisible(false)}
                    header="Edit Subtask"
                    style={{ width: '50vw' }}
                >
                    {selectedSubTaskId && (
                        <EditSubTask
                            subtaskId={selectedSubTaskId} // Pass the selected subtask_id
                            taskId={task.task_id}
                            ProjectId={task.project_id}
                            BrandId={task.brand_id}
                            User_Id={task.task_user_id}
                            onSuccess={() => handleSubTaskEditDialogClose(true)} // Close dialog on success
                        />
                    )}
                </Dialog>



            </Row>

        </Row>
    );
};

export default ViewTask;
