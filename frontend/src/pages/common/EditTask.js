import React, { useEffect, useState } from "react";
import { Card, Form, Row, Col, Breadcrumb } from "react-bootstrap";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import config from "../../config";


const EditTask = () => {
    const { accessToken } = useAuth();
    const { taskId } = useParams();
    const navigate = useNavigate();

    const [taskData, setTaskData] = useState({
        user_id: "",
        project_id: "",
        brand_id: "",
        task_name: "",
        task_description: "",
        task_startdate: "",
        task_deadline: "",
        task_type: "",
        priority: "Low",
        subtasks: [],
    });

    const [subtaskFields, setSubtaskFields] = useState([
        {
            subtask_name: "",
            sub_task_description: "",
            sub_task_startdate: "",
            sub_task_deadline: "",
            sub_task_user_id: "",
            priority: "Low",
            project_role_id: "",
        },
    ]);

    const [loading, setLoading] = useState(true);
    const formatDateToLocal = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().slice(0, 16); // Extract 'YYYY-MM-DDTHH:mm'
    };
    


    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                const response = await axios.get(
                    `${config.apiBASEURL}/projectRoutes/fetctaskandsubtaskforduplication/${taskId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
                if (response.status === 200) {
                    const task = response.data[0];
                    setTaskData({
                        ...task,
                        task_startdate: formatDateToLocal(task.task_startdate),
                        task_deadline: formatDateToLocal(task.task_deadline),
                        subtasks: task.subtasks.map((subtask) => ({
                            ...subtask,
                            sub_task_startdate: formatDateToLocal(subtask.sub_task_startdate),
                            sub_task_deadline: formatDateToLocal(subtask.sub_task_deadline),
                        })),
                    });
                }
            } catch (error) {
                console.error("Error fetching task data:", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchTaskData();
    }, [taskId, accessToken]);
    

    const handleTaskChange = (e) => {
        const { name, value } = e.target;
        setTaskData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubtaskChange = (index, field, value) => {
        setTaskData((prev) => {
            const updatedSubtasks = [...prev.subtasks];
            updatedSubtasks[index] = {
                ...updatedSubtasks[index],
                [field]: value,
            };
            return {
                ...prev,
                subtasks: updatedSubtasks,
            };
        });
    };

    const addSubtask = () => {
        setTaskData((prev) => ({
            ...prev,
            subtasks: [
                ...prev.subtasks,
                {
                    subtask_name: "",
                    sub_task_description: "",
                    sub_task_startdate: "",
                    sub_task_deadline: "",
                    sub_task_user_id: "",
                    priority: "Low",
                    project_role_id: "",
                },
            ],
        }));
    };

    const removeSubtask = (index) => {
        setTaskData((prev) => ({
            ...prev,
            subtasks: prev.subtasks.filter((_, i) => i !== index),
        }));
    };

    // const handleSave = async () => {
    //     try {
    //         const payload = {
    //             task,
    //             subtasks
    //         };
    //         const response = await axios.post(
    //             `${config.apiUrl}/update-task`,
    //             payload,
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${accessToken}`
    //                 }
    //             }
    //         );

    //         if (response.status === 200) {
    //             navigate("/tasks");
    //         } else {
    //             console.error("Failed to save task:", response);
    //         }
    //     } catch (error) {
    //         console.error("Error saving task:", error);
    //     }
    // };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!taskData) {
        return <div>No task found!</div>;
    }

    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col md={6}>
                        <Breadcrumb>
                            <Breadcrumb.Item active>Edit Task</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={12}>
                        <Card>
                            <Card.Body>
                                <Form>
                                    {/* Task Details Section */}
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <label htmlFor="task_name">Task Name</label>
                                                <InputText
                                                    id="task_name"
                                                    name="task_name"
                                                    value={taskData.task_name}
                                                    onChange={handleTaskChange}
                                                    placeholder="Enter task name"
                                                    className="w-100"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <label htmlFor="task_description">Task Description</label>
                                                <InputTextarea
                                                    id="task_description"
                                                    name="task_description"
                                                    value={taskData.task_description}
                                                    onChange={handleTaskChange}
                                                    rows={3}
                                                    placeholder="Enter task description"
                                                    className="w-100"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <label htmlFor="task_startdate">Start Date</label>
                                                <Form.Control
                                                    type="datetime-local"
                                                    id="task_startdate"
                                                    name="task_startdate"
                                                    value={taskData.task_startdate}
                                                    onChange={handleTaskChange}
                                                />

                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <label htmlFor="task_deadline">Deadline</label>
                                                <Form.Control
                                                    type="datetime-local"
                                                    id="task_deadline"
                                                    name="task_deadline"
                                                    value={taskData.task_deadline}
                                                    onChange={handleTaskChange}
                                                />

                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <label htmlFor="priority">Priority</label>
                                                <Form.Control
                                                    as="select"
                                                    id="priority"
                                                    name="priority"
                                                    value={taskData.priority}
                                                    onChange={handleTaskChange}
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Subtasks Section */}
                                    <h5>Subtasks</h5>
                                    {taskData.subtasks.map((subtask, index) => (
                                        <Card key={index} className="mb-3">
                                            <Card.Body>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <label htmlFor={`subtask_name_${index}`}>Subtask Name</label>
                                                            <InputText
                                                                id={`subtask_name_${index}`}
                                                                value={subtask.subtask_name}
                                                                onChange={(e) =>
                                                                    handleSubtaskChange(index, "subtask_name", e.target.value)
                                                                }
                                                                placeholder="Enter subtask name"
                                                                className="w-100"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <label htmlFor={`sub_task_description_${index}`}>
                                                                Subtask Description
                                                            </label>
                                                            <InputTextarea
                                                                id={`sub_task_description_${index}`}
                                                                value={subtask.sub_task_description}
                                                                onChange={(e) =>
                                                                    handleSubtaskChange(
                                                                        index,
                                                                        "sub_task_description",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                rows={2}
                                                                placeholder="Enter subtask description"
                                                                className="w-100"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <label htmlFor={`sub_task_startdate_${index}`}>Start Date</label>
                                                            <Form.Control
                                                                type="datetime-local"
                                                                id={`sub_task_startdate_${index}`}
                                                                value={subtask.sub_task_startdate}
                                                                onChange={(e) =>
                                                                    handleSubtaskChange(index, "sub_task_startdate", e.target.value)
                                                                }
                                                            />

                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={6}>
                                                        <Form.Group className="mb-3">
                                                            <label htmlFor={`sub_task_deadline_${index}`}>Deadline</label>
                                                            <Form.Control
                                                                type="datetime-local"
                                                                id={`sub_task_deadline_${index}`}
                                                                value={subtask.sub_task_deadline}
                                                                onChange={(e) =>
                                                                    handleSubtaskChange(index, "sub_task_deadline", e.target.value)
                                                                }
                                                            />

                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                                <Row>

                                                    <Col md={6}>
                                                        <Button
                                                            label="Remove Subtask"
                                                            icon="pi pi-trash"
                                                            className="p-button-danger mt-4"
                                                            onClick={() => removeSubtask(index)}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                    <Button
                                        label="Add Subtask"
                                        icon="pi pi-plus"
                                        className="p-button-secondary mt-3"
                                        onClick={addSubtask}
                                    />

                                    {/* Submit Section */}
                                    <div className="d-flex justify-content-end mt-4">
                                        <Button
                                            label="Save Task"
                                            icon="pi pi-check"
                                            className="p-button-success"
                                        // onClick={handleSave}
                                        />
                                    </div>
                                </Form>
                            </Card.Body>

                        </Card>
                    </Col>
                </Row>
            </Row>
        </>
    );
};

export default EditTask;
