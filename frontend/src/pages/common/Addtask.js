import React, { useEffect, useState } from "react";
import { Col, Row, Breadcrumb, Form, Card } from "react-bootstrap";
import axios from "axios";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { AutoComplete } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from 'primereact/calendar';
import { Avatar } from 'primereact/avatar';
import { FaUserCheck, FaUserTimes } from "react-icons/fa";
import successVideo from '../../assets/video/paperplane.mp4';
import { Dialog } from "primereact/dialog";
const AddTask = () => {
    const { accessToken } = useAuth();
    const [users, setUsers] = useState([]);
    const [brands, setBrands] = useState([]);
    const [brandSuggestions, setBrandSuggestions] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedProject, setSelectedProject] = useState("");
    const [projects, setProjects] = useState([]);
    const [selectedUserDetails, setSelectedUserDetails] = useState(null);
    const [videoDialogVisible, setVideoDialogVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const createEmptyTaskForm = () => ({
        user_id: "",
        task_name: "",
        task_description: "",
        task_startdate: "",
        task_deadline: "",
        task_type: "Graphe",
        priority: "Low",
        userDetails: null, 
    });

    const [taskForms, setTaskForms] = useState([createEmptyTaskForm()]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersResponse = await axios.get(
                    `${config.apiBASEURL}/projectRoutes/fetch-all-users`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                setUsers(usersResponse.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchData();
    }, [accessToken]);

    //fetchbrandandprojects
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
                        projects.map((project) =>   [
                            project.brand.brand_id,
                            { id: project.brand.brand_id, name: project.brand.brand_name },
                        ]
                    )
                    ).values()
                );
                setBrands(uniqueBrands);
                setProjects(projects);
            }
        } catch (error) {
            console.error("Error fetching brands/projects:", error);
        }
    };

    //search brands
    const searchBrands = (event) => {
        const query = event.query.toLowerCase();
        const filteredBrands = brands.filter((brand) =>
            brand.name.toLowerCase().includes(query)
        );
        setBrandSuggestions(filteredBrands);
    };

    //handel task changes 
    const handleTaskFormChange = async (index, key, value) => {
        const updatedForms = [...taskForms];
        updatedForms[index][key] = value;

        if (key === "user_id" || key === "task_startdate") {
            const { user_id, task_startdate } = updatedForms[index];
            if (user_id && task_startdate) {
                try {
                    const response = await axios.get(
                        `${config.apiBASEURL}/projectRoutes/fetch-all-task-users`,
                        {
                            headers: { Authorization: `Bearer ${accessToken}` },
                            params: {
                                user_id: user_id,
                                start_date: task_startdate
                            },
                        }
                    );
                    const usersData = response.data;
                    const userDetails = usersData.find(
                        (user) => user.user_id === user_id
                    );
                    updatedForms[index].userDetails = userDetails || null;
                } catch (error) {
                    console.error("Error fetching user details:", error);
                    updatedForms[index].userDetails = null;
                }
            } else {
                updatedForms[index].userDetails = null;
            }
        }
        setTaskForms(updatedForms);
    };
    

    //addtaskform
    const addTaskForm = () => {
        setTaskForms([createEmptyTaskForm(), ...taskForms]);
    };

    //removetaskform
    const removeTaskForm = (index) => {
        const updatedForms = taskForms.filter((_, i) => i !== index);
        setTaskForms(updatedForms);
    };

    //save task the data
    const handleTaskSubmit = async (e) => {
        e.preventDefault(); 
        setLoading(true); 
        const tasksWithBrandAndProject = taskForms.map((task) => ({
            ...task,
            brand_id: selectedBrand?.id || "",
            project_id: selectedProject || "",
        }));
        try {
            await axios.post(
                `${config.apiBASEURL}/projectRoutes/add-tasks`,
                { tasks: tasksWithBrandAndProject },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            setVideoDialogVisible(true);
            setTimeout(() => {
                setVideoDialogVisible(false);
                navigate("/dashboard/task_board_admin");
            }, 5000);
        } catch (error) {
            console.error("Error adding tasks:", error);
        }finally {
            setLoading(false); 
        }
    };

    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col md={12} className="mb-3">
                        <Breadcrumb>
                            <Breadcrumb.Item active>Add Tasks</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={12}>
                        <Card>
                            <Card.Header className="sticky-top bg-light shadow-sm" style={{ top: '-40px' }}>
                                <div className="d-flex justify-content-between">
                                    <Form.Group className="w-50 mx-2">
                                        <Form.Label>Brand</Form.Label>
                                        <AutoComplete
                                            className="w-100 "
                                            value={selectedBrand}
                                            suggestions={brandSuggestions}
                                            completeMethod={(e) => {
                                                fetchBrandsAndProjects(e.query);
                                                searchBrands(e);
                                            }}
                                            onChange={(e) => setSelectedBrand(e.value)}
                                            field="name"
                                            placeholder="Search Brand"
                                        />
                                    </Form.Group>
                                    <Form.Group className="w-50 mx-2">
                                        <Form.Label>Project</Form.Label>
                                        <Form.Select
                                            value={selectedProject}
                                            onChange={(e) => setSelectedProject(e.target.value)}
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map((project) => (
                                                <option key={project.project_id} value={project.project_id}>
                                                    {project.project_name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>

                            </Card.Header>
                            {selectedBrand && selectedProject && (
                                <Card.Body>
                                    <div className="d-flex justify-content-end mb-3">
                                        <Button
                                            severity="primary"
                                            outlined
                                            label="Add Task"
                                            icon="pi pi-plus"
                                            className="py-2 me-2"
                                            onClick={addTaskForm}
                                        />
                                        <Button
                                            severity="success"
                                            label="Save All"
                                            icon="pi pi-check"
                                            className="py-2 border-0"
                                            loading={loading}
                                            onClick={handleTaskSubmit}
                                        />
                                    </div>
                                    <Row>
                                        {taskForms.map((task, index) => (
                                            <div key={index} className="mb-2 border p-3 oddBox">
                                                <div className="d-flex justify-content-between align-items-center position-relative">
                                                    <h6 className="cardNum">{index + 1}</h6>
                                                    <Button
                                                        severity="danger"
                                                        title="Remove Task"
                                                        icon="pi pi-times"
                                                        rounded
                                                        className="p-0 border-0"
                                                        onClick={() => removeTaskForm(index)}
                                                        style={{ position: "absolute", right: '-25px', top: '-20px', fontSize: '15px' }}
                                                    />
                                                </div>
                                                <Row>
                                                    <Col md={6} lg={4} className="mb-3">
                                                        {task.userDetails ? (
                                                            <Card className="shadow-0 bg-transparent border-end">
                                                                <Card.Header className="border-bottom ps-0 position-relative">
                                                                    <div className="d-flex align-items-center">
                                                                        <Avatar className="me-2"
                                                                            image={task.userDetails.profile_image}
                                                                            shape="circle"
                                                                            size="large"
                                                                        />
                                                                        <p className="mb-0" style={{ lineHeight: '1.3' }}>
                                                                            <b>{task.userDetails.first_name} {task.userDetails.last_name}</b>
                                                                            <small className="d-block text-secondary">{task.userDetails.user_type}</small>
                                                                        </p>
                                                                    </div>
                                                                    <p style={{ position: 'absolute', right: '20px', top: '0' }}>
                                                                        {task.userDetails.limit_exceeded ? (
                                                                            <>
                                                                                <FaUserTimes className="text-danger" title="Limit  Exceeded" />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <FaUserCheck className="text-success" title="Limit Not Exceeded" />
                                                                            </>
                                                                        )}
                                                                    </p>
                                                                </Card.Header>
                                                                <Card.Body className="ps-0">
                                                                    <ul className="totaltaskUseral">
                                                                        <li>
                                                                            <small>Max <sub>/ Per Day</sub></small> {task.userDetails.max_tasks_per_day}
                                                                        </li>
                                                                        <li>
                                                                            <small> Allocated <sub>/ Selected Day</sub></small> {task.userDetails.tasks_today}
                                                                        </li>
                                                                        <li>
                                                                            <small>Remaining </small> {task.userDetails.remaining_tasks}
                                                                        </li>
                                                                    </ul>

                                                                    <p style={{ fontSize: '14px' }} className="mt-4">
                                                                        <small> <em><b>Info :</b></em> Dont Assign more than Permitted else excess tasks wont Be Submitted</small>
                                                                    </p>

                                                                </Card.Body>
                                                            </Card>
                                                        ) : (
                                                            <p>Select a user to view details</p>
                                                        )}
                                                    </Col>
                                                    <Col md={6} lg={8} className="mb-3">
                                                        <Row>
                                                            <Col md={6} lg={8} className="mb-3">
                                                                <Form.Group>
                                                                    <Form.Label>Task Name</Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        value={task.task_name}
                                                                        onChange={(e) => handleTaskFormChange(index, 'task_name', e.target.value)}
                                                                        required
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6} lg={4} className="mb-3">
                                                                <Form.Group>
                                                                    <Form.Label>Task Type</Form.Label>
                                                                    <Form.Control
                                                                        as="select"
                                                                        value={task.task_type || 'Graphe'}
                                                                        onChange={(e) => handleTaskFormChange(index, 'task_type', e.target.value)}
                                                                    >
                                                                        <option value="Graphe">Graphe</option>
                                                                        <option value="Weddings">Weddings</option>
                                                                    </Form.Control>
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6} lg={4} className="mb-3">
                                                                <Form.Group>
                                                                    <Form.Label>Assign To</Form.Label>
                                                                    <Form.Select
                                                                        value={task._id}
                                                                        onChange={(e) => handleTaskFormChange(index, 'user_id', e.target.value)}
                                                                    >
                                                                        <option value="" >Select User</option>
                                                                        {users.map((user) => (
                                                                           
                                                                            <option key={user._id} value={user._id}>
                                                                                {user.first_name} {user.last_name}
                                                                            </option>
                                                                        ))}
                                                                    </Form.Select>
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6} lg={4} className="mb-3">
                                                                <Form.Group>
                                                                    <Form.Label>Start Date and Time</Form.Label>
                                                                    <Calendar
                                                                        value={task.task_startdate}
                                                                        onChange={(e) => handleTaskFormChange(index, 'task_startdate', e.target.value)}
                                                                        showTime
                                                                        hourFormat="12" // Use "12" for 12-hour format with AM/PM
                                                                        dateFormat="dd-mm-yy"
                                                                        placeholder="Select Date and Time"
                                                                        required
                                                                        className="p-inputtext-sm" // Optional: Smaller input size
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6} lg={4} className="mb-3">
                                                                <Form.Group>
                                                                    <Form.Label>Deadline Date and Time</Form.Label>
                                                                    <Calendar
                                                                        value={task.task_deadline}
                                                                        onChange={(e) => handleTaskFormChange(index, 'task_deadline', e.target.value)}
                                                                        showTime
                                                                        hourFormat="12" // Use "12" for 12-hour format with AM/PM
                                                                        dateFormat="dd-mm-yy"
                                                                        placeholder="Select Date and Time"
                                                                        required
                                                                        className="p-inputtext-sm" // Optional: Smaller input size
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6} lg={4} className="mb-3">
                                                                <Form.Group>
                                                                    <Form.Label>Priority</Form.Label>
                                                                    <Form.Select
                                                                        value={task.priority}
                                                                        onChange={(e) => handleTaskFormChange(index, 'priority', e.target.value)}
                                                                    >
                                                                        <option value="Low">Low</option>
                                                                        <option value="Medium">Medium</option>
                                                                        <option value="High">High</option>
                                                                    </Form.Select>
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={12} lg={8}>
                                                                <Form.Group>
                                                                    <Form.Label>Task Description</Form.Label>
                                                                    <InputTextarea
                                                                        value={task.task_description}
                                                                        onChange={(e) => handleTaskFormChange(index, 'task_description', e.target.value)}
                                                                        autoResize
                                                                        className="w-100"
                                                                        placeholder="Enter task description"
                                                                    />
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                    </Col>

                                                </Row>
                                            </div>
                                        ))}

                                    </Row>
                                </Card.Body>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Row>
            <Dialog visible={videoDialogVisible} className='fadeInUp_dilog'
                onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                <video src={successVideo} autoPlay loop muted style={{ width: '100%' }} />
                <h6 className="text-center mt-0 fadeInUp">Process Completed <span className='text-success'>Successfully</span></h6>
            </Dialog>
        </>
    );
};

export default AddTask;
