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
import { useNavigate } from "react-router-dom";
import { Dialog } from 'primereact/dialog';
import { Avatar } from 'primereact/avatar';
import nouserpng from '../../assets/images/no_user.png';
import successVideo from '../../assets/video/paperplane.mp4';
const AddProjects = () => {
    const { accessToken } = useAuth(); // Get the access token from the context
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const navigate = useNavigate(); // React Router's navigate hook
    const [brands, setBrands] = useState([]);
    const [users, setUsers] = useState([]);
    const [videoDialogVisible, setVideoDialogVisible] = useState(false); // New state for video dialog
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
                console.log("logn the data", data)
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

        fetchUsers();
        fetchBrands();
    }, [accessToken]);

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

    const handleAddBrand = async () => {
        if (!newBrand.trim()) return;
        try {
            const { data } = await axios.post(
                `${config.apiBASEURL}/projectRoutes/AddeditBrands`,
                { brand_name: newBrand },
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            setBrands((prevBrands) => [...prevBrands, data]);
            setProjectData((prevData) => ({ ...prevData, brand_id: data.brand_id }));
            setNewBrand("");
            setShowAddBrand(false);
        } catch (error) {
            console.error("Error adding new brand:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${config.apiBASEURL}/projectRoutes/add-project`,
                projectData,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            // Show the video dialog only if the submission is successful
            setVideoDialogVisible(true);
            setTimeout(() => {
                // Navigate to the admin task board
                setIsDialogVisible(true); // Show dialog on successful submission
                // Hide video dialog after 5 seconds
                setVideoDialogVisible(false);

            }, 5000);

        } catch (error) {
            console.error("Error creating project:", error);
        }
    };

    const handleNavigateToAddTask = () => {
        setIsDialogVisible(false);
        navigate("/dashboard/addtask");
    };

    const handleNavigateToProjectList = () => {
        setIsDialogVisible(false);
        navigate("/dashboard/all_projects");
    };

    const headerElement = (
        <div className="d-flex align-items-center justify-content-center gap-2">
            <Avatar image={nouserpng} size="large" shape="circle" title="User Avatar" />
            <span className="font-bold white-space-nowrap h6">System Message</span>
        </div>
    );

    return (
        <>
            <Row className='body_content'>
                <Row className='mx-0'>
                    <Col md={6} lg={6} className='mb-4'>
                        <Breadcrumb>
                            <Breadcrumb.Item active>Add Projects</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={12} lg={12}>
                        <Card>
                            <Card.Body>
                                <form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6} lg={6} className="px-2 mb-3">
                                            <label className="mb-2">Project Name</label>
                                            <InputText
                                                name="project_name"
                                                value={projectData.project_name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter project name"
                                                className="w-full"
                                            />
                                        </Col>
                                        <Col md={6} lg={6} className="px-2 mb-3">
                                            <label className="d-flex align-items-center justify-content-between mb-2">
                                                Brand
                                                <span>
                                                    {!showAddBrand && (
                                                        <Button
                                                            severity="danger"
                                                            outlined
                                                            onClick={() => setShowAddBrand(true)}
                                                            label="Add Brand"
                                                            icon="pi pi-plus"
                                                            className="border-0 p-0"
                                                        />
                                                    )}
                                                </span>
                                            </label>
                                            <div className="position-relative">
                                                <div className="w-100">
                                                    <Dropdown
                                                        name="brand_id"
                                                        value={projectData.brand_id}
                                                        options={brands.map((brand) => ({
                                                            label: brand.brand_name,
                                                            value: brand._id,
                                                        }))}
                                                        onChange={handleChange}
                                                        placeholder="Select a brand"
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="add_BRAND">
                                                    {showAddBrand && (
                                                        <div className="mt-2 d-flex align-items-center border pe-2">
                                                            <InputText
                                                                value={newBrand}
                                                                onChange={(e) => setNewBrand(e.target.value)}
                                                                placeholder="Enter new brand name"
                                                                className="w-full border-0"
                                                            />
                                                            <div className="d-flex gap-2">
                                                                <Button
                                                                    severity="success"
                                                                    onClick={handleAddBrand}
                                                                    title="Save"
                                                                    icon="pi pi-check"
                                                                    className="p-0"
                                                                />
                                                                <Button
                                                                    severity="danger"
                                                                    onClick={() => setShowAddBrand(false)}
                                                                    title="Cancel"
                                                                    icon="pi pi-times"
                                                                    className="p-0"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={6} lg={4} className="px-2 mb-3">
                                            <label className="mb-2">Date Range</label>
                                            <DateRangePicker
                                                initialSettings={{
                                                    startDate: dateRange.startDate,
                                                    endDate: dateRange.endDate,
                                                    locale: { format: "DD/MM/YYYY" },

                                                }}
                                                onCallback={(start, end) => handleDateRangeChange(start, end)}
                                            >
                                                <input
                                                    type="text"
                                                    className="form-control w-full"
                                                    placeholder="Select Date Range"
                                                />
                                            </DateRangePicker>
                                        </Col>

                                        <Col md={6} lg={4} className="px-2 mb-3">
                                            <label className="mb-2">Project Lead</label>
                                            <Dropdown
                                                name="lead_id"
                                                value={projectData.lead_id}
                                                options={users.map((user) => ({
                                                    label: `${user.first_name} ${user.last_name}`,
                                                    value: user._id,
                                                }))}
                                                onChange={handleChange}
                                                placeholder="Select a project lead"
                                                className="w-full"
                                            />
                                        </Col>

                                        <Col md={6} lg={4} className="px-2 mb-3">
                                            <label className="mb-2">Priority</label>
                                            <Dropdown
                                                name="priority"
                                                value={projectData.priority}
                                                options={[
                                                    { label: "Low", value: "Low" },
                                                    { label: "Medium", value: "Medium" },
                                                    { label: "High", value: "High" },
                                                ]}
                                                onChange={handleChange}
                                                placeholder="Select priority"
                                                className="w-full"
                                            />
                                        </Col>

                                        <Col md={6} lg={6} className="px-2 mb-3">
                                            <label className="mb-2">Add Team Members</label>
                                            <MultiSelect
                                                value={projectData.member_id}
                                                options={users.map((user) => ({
                                                    label: `${user.first_name} ${user.last_name}`,
                                                    value: user._id,
                                                }))}
                                                onChange={(e) =>
                                                    setProjectData({ ...projectData, member_id: e.value })
                                                }
                                                placeholder="Select team members"
                                                className="w-full position-relative"
                                                display="chip"
                                            />
                                        </Col>

                                        
                                        <Col md={6} lg={6} className="px-2 mb-3">
                                            <label className="mb-2">Project Files (URL)</label>
                                            <InputTextarea
                                                rows={2}
                                                name="project_files"
                                                value={projectData.project_files}
                                                onChange={handleChange}
                                                placeholder="Enter a link or URL for project files"
                                                className="w-full"
                                            />
                                        </Col>
                                        <Col md={6} lg={12} className="px-2 mb-3">
                                            <label className="mb-2">Description</label>
                                            <InputTextarea
                                                rows={4}
                                                name="description"
                                                value={projectData.description}
                                                onChange={handleChange}
                                                placeholder="Enter description"
                                                className="w-full h-auto"
                                            />
                                        </Col>
                                        <Col md={12} lg={12} className="px-2 mb-3 text-end">
                                            <Button severity="info" type="submit" label="Add Project" icon="pi pi-save" className="py-2" />
                                        </Col>
                                    </Row>
                                </form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Row>
            {/* Dialog */}
            <Dialog
                visible={isDialogVisible}
                onHide={() => setIsDialogVisible(false)}
                header={headerElement}
                style={{ width: '350px' }}
                modal
                footer={
                    <div className="d-flex justify-content-end ">
                        <Button
                            label="Yes"
                            icon="pi pi-check"
                            outlined
                            severity="success"
                            className="border-0 me-2 py-0"
                            onClick={handleNavigateToAddTask}
                        />
                        <Button
                            label="No"
                            icon="pi pi-times"
                            outlined
                            severity="danger"
                            className="border-0 ms-2 py-0"
                            onClick={handleNavigateToProjectList}
                        />
                    </div>
                }
            >
                <p className="mb-0">Do you want to <b>Add Tasks</b> to this project?</p>

            </Dialog>

            <Dialog visible={videoDialogVisible} className='fadeInUp_dilog'
                onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                <video src={successVideo} autoPlay loop muted style={{ width: '100%' }} />
                <h6 className="text-center mt-0 fadeInUp">Process Completed <span className='text-success'>Successfully</span></h6>
            </Dialog>


        </>
    );
};

export default AddProjects;
