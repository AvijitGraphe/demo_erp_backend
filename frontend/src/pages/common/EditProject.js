import React, { useEffect, useState } from "react";
import { Col, Row, Form, Breadcrumb, Card } from 'react-bootstrap';
import axios from "axios";
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import { MultiSelect } from "primereact/multiselect";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import moment from "moment";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { useParams, useNavigate } from "react-router-dom";
const EditProject = () => {
    const { accessToken } = useAuth(); // Get the access token from the context
    const { project_id } = useParams(); // Get project_id from route params
    const navigate = useNavigate(); // React Router's navigate hook
    const [brands, setBrands] = useState([]);
    const [users, setUsers] = useState([]);
    const [projectData, setProjectData] = useState({
        project_name: "",
        brand_id: "",
        start_date: "",
        end_date: "",
        description: "",
        priority: "Medium",
        lead_id: "",
        member_id: [],
        project_files: "",
    });
    const [newBrand, setNewBrand] = useState("");
    const [showAddBrand, setShowAddBrand] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: moment().startOf("day"),
        endDate: moment().endOf("day"),
    });

    // Fetch all users and brands
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await axios.get(
                    `${config.apiBASEURL}/projectRoutes/fetch-all-users`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
                setUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        const fetchBrands = async () => {
            try {
                const { data } = await axios.get(
                    `${config.apiBASEURL}/projectRoutes/fetchallbrands`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
                setBrands(data);
            } catch (error) {
                console.error("Error fetching brands:", error);
            }
        };

        const fetchProject = async () => {
            try {
                const { data } = await axios.get(
                    `${config.apiBASEURL}/projectRoutes/projects/${project_id}`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
                const project = data.project;

                // Set the project data and adjust the date range
                setProjectData({
                    project_name: project.project_name,
                    brand_id: project.brand.brand_id,
                    start_date: project.start_date,
                    end_date: project.end_date,
                    description: project.description,
                    priority: project.priority,
                    lead_id: project.lead.user_id,
                    member_id: project.members.map(member => member.user_id),
                    project_files: project.project_files,
                });
                setDateRange({
                    startDate: moment(project.start_date),
                    endDate: moment(project.end_date),
                });
            } catch (error) {
                console.error("Error fetching project:", error);
            }
        };
        fetchProject();
        fetchUsers();
        fetchBrands();
    }, [accessToken, project_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjectData({ ...projectData, [name]: value });
    };

    const handleDateRangeChange = (start, end) => {
        setDateRange({ startDate: start, endDate: end });
        setProjectData({
            ...projectData,
            start_date: start.format("YYYY-MM-DD"),
            end_date: end.format("YYYY-MM-DD"),
        });
    };

    // Handle form submission to edit project
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Send PUT request to update the project
            const { data } = await axios.put(
                `${config.apiBASEURL}/projectRoutes/edit-project/${project_id}`,
                projectData,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
           
            navigate(`/dashboard/projects_details/${project_id}`); // Redirect to project details page
        } catch (error) {
            console.error("Error editing project:", error);
            
        }
    };


    return (
        <>
            <Row className='body_content'>
                <Row className='mx-0'>
                    <Col md={6} lg={6} className="mb-4">
                        <Breadcrumb>
                            <Breadcrumb.Item onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
                                <i className="pi pi-angle-left"></i> Back
                            </Breadcrumb.Item>
                            <Breadcrumb.Item active>Edit Project</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={12} lg={12}>
                        <Card>
                            <Card.Body>
                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6} lg={4} className="mb-3">
                                            <Form.Group controlId="formProjectName">
                                                <Form.Label>Project Name</Form.Label>
                                                <InputText
                                                    name="project_name"
                                                    value={projectData.project_name}
                                                    onChange={handleChange}
                                                    className="form-control m-0"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} lg={4} className="mb-3">
                                            <Form.Group controlId="formBrand">
                                                <Form.Label>Brand</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    name="brand_id"
                                                    className="m-0"
                                                    value={projectData.brand_id}
                                                    onChange={handleChange}
                                                    disabled
                                                >
                                                    {brands.map((brand) => (
                                                        <option key={brand.brand_id} value={brand.brand_name}>
                                                            {brand.brand_name}
                                                        </option>
                                                    ))}
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} lg={4} className="mb-3">
                                            <Form.Label>Date Range</Form.Label>
                                            <DateRangePicker
                                                initialSettings={{
                                                    startDate: dateRange.startDate,
                                                    endDate: dateRange.endDate,
                                                    locale: { format: 'DD/MM/YYYY' }
                                                    
                                                }}
                                                onCallback={(start, end) => handleDateRangeChange(start, end)}
                                            >
                                                <input
                                                    type="text"
                                                    className="form-control w-full m-0"
                                                    placeholder="Select Date Range"
                                                    readOnly
                                                />
                                            </DateRangePicker>
                                        </Col>
                                        <Col md={6} lg={4} className="mb-3">
                                            <Form.Group controlId="formLead">
                                                <Form.Label>Lead</Form.Label>
                                                <Form.Control
                                                    as="select"
                                                    name="lead_id"
                                                    value={projectData.lead_id}
                                                    onChange={handleChange}
                                                    className="m-0"
                                                >
                                                    {users.map((user) => (
                                                        <option key={user.user_id} value={user.user_id}>
                                                            {user.first_name} {user.last_name}
                                                        </option>
                                                    ))}
                                                </Form.Control>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} lg={4} className="mb-3">
                                            <Form.Group controlId="formMembers">
                                                <Form.Label>Members</Form.Label>
                                                <MultiSelect
                                                    name="member_id"
                                                    value={projectData.member_id}
                                                    options={users.map(user => ({
                                                        label: `${user.first_name} ${user.last_name}`,
                                                        value: user.user_id
                                                    }))}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} lg={4} className="mb-3">
                                            <Form.Group controlId="formPriority className='position-relative">
                                                <Form.Label>Priority</Form.Label>
                                                <Dropdown
                                                    value={projectData.priority}
                                                    options={['Low', 'Medium', 'High']}
                                                    onChange={handleChange}
                                                    name="priority"
                                                    className="position-relative m-0"
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={12}>
                                            <Form.Group controlId="formDescription">
                                                <Form.Label>Description</Form.Label>
                                                <InputTextarea
                                                    name="description"
                                                    value={projectData.description}
                                                    onChange={handleChange}
                                                    rows={10}
                                                    className="form-control h-auto m-0"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <div className="d-flex justify-content-end align-items-center">
                                        <Button type="submit" severity="info" label="Save Changes" className="mt-3 py-2" />
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
export default EditProject
