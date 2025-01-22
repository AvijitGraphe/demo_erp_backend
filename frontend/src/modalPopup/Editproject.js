import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { Dropdown } from 'primereact/dropdown';
import { InputText } from "primereact/inputtext";
import { MultiSelect } from 'primereact/multiselect';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import config from '../config';

const EditProject = ({ users, members, brands, projectDetails, onHide }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [company, setCompany] = useState('');
    const [selectedPriority, setSelectedPriority] = useState(null);
    const [selectedLeader, setSelectedLeader] = useState(null);
    const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [projectFilesLink, setProjectFilesLink] = useState('');
    const [formValid, setFormValid] = useState(false);
    const [errors, setErrors] = useState({});
    const [brand, setBrand] = useState(null);
    const [status, setStatus] = useState('');
    const [department, setDepartment] = useState('');
    const [missedDeadline, setMissedDeadline] = useState(false);

    const priorities = [
        { name: 'High', code: 'HIG' },
        { name: 'Medium', code: 'MED' },
        { name: 'Low', code: 'LOW' },
        { name: 'Urgent', code: 'URG' }
    ];

    const statuses = [
        { label: 'On Time', value: 'On Time' },
        //{ label: 'In Progress', value: 'In Progress' },
        { label: 'Completed', value: 'Completed' },
        //{ label: 'Missed', value: 'Missed' },
        { label: 'On Hold', value: 'On Hold' }
    ];

    useEffect(() => {
        if (projectDetails) {
            setProjectName(projectDetails.project_name);
            setCompany(projectDetails.client);
            setStartDate(new Date(projectDetails.start_date));
            setEndDate(new Date(projectDetails.end_date));
            setSelectedPriority(priorities.find(p => p.name === projectDetails.priority));
            setSelectedLeader(users.find(user => user.user_id === projectDetails.lead_id) || null);

            const selectedMembers = projectDetails.members.map(member =>
                members.find(m => m.user_id === member.user_id)
            ).filter(Boolean);

            setSelectedTeamMembers(selectedMembers);
            setDescription(projectDetails.description);
            setProjectFilesLink(projectDetails.project_files);
            setBrand(brands.find(brand => brand.id === projectDetails.brand_id) || null);
            setStatus(projectDetails.status || '');
            setDepartment(users.find(user => user.user_id === projectDetails.lead_id)?.departmentDetails?.name || '');
            setMissedDeadline(!!projectDetails.missed_deadline);
        }
    }, [projectDetails, users, members, brands]);

    useEffect(() => {
        if (selectedLeader) {
            setDepartment(selectedLeader.departmentDetails?.name || '');
        }
    }, [selectedLeader]);

    useEffect(() => {
        const validateForm = () => {
            const errors = {};
            if (!projectName) errors.projectName = "Project Name is required";
            if (!company) errors.company = "Client is required";
            if (!startDate) errors.startDate = "Start Date is required";
            if (!endDate) errors.endDate = "End Date is required";
            if (!selectedPriority) errors.selectedPriority = "Priority is required";
            if (!selectedLeader) errors.selectedLeader = "Project Leader is required";
            if (selectedTeamMembers.length === 0) errors.selectedTeamMembers = "At least one Team Member is required";
            if (!description) errors.description = "Description is required";
            if (!projectFilesLink) errors.projectFilesLink = "Project Files Link is required";
            if (!brand) errors.brand = "Brand is required";
            if (!status) errors.status = "Status is required";

            setErrors(errors);
            setFormValid(Object.keys(errors).length === 0);
        };

        validateForm();
    }, [projectName, company, startDate, endDate, selectedPriority, selectedLeader, selectedTeamMembers, description, projectFilesLink, brand, status]);

    const handleBrandChange = (e) => {
        setBrand(e.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const leaderId = selectedLeader ? selectedLeader.user_id : '';
        const leaderName = selectedLeader ? selectedLeader.name : '';
        const memberIds = selectedTeamMembers.map(member => member.user_id);

        try {
            const response = await axios.put(`${config.apiBASEURL}/projandtask/updateProject/${projectDetails.project_id}`, {
                brand_id: brand ? brand.brand_id : '',          // Ensure brand ID is sent
                brand_name: brand ? brand.brand_name : '', // Ensure brand name is sent
                client: company,
                project_name: projectName,
                start_date: startDate,
                end_date: endDate,
                priority: selectedPriority.name,
                lead_id: leaderId,
                lead_name: leaderName,
                member_ids: memberIds,
                description,
                project_files: projectFilesLink,
                status,
                department,
                missed_deadline: missedDeadline ?? 0
            });
            console.log('Project updated:', response.data);
            onHide();
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    return (
        <Container fluid className='p-0'>
            <Form onSubmit={handleSubmit}>
                <Row className="mx-0">
                    <Col lg={6} className='plr addprof mb-2'>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="brands" className="mb-2">Add Brand</label>
                            <Dropdown
                                value={brand}
                                onChange={handleBrandChange}
                                options={brands}
                                optionLabel="brand_name"
                                placeholder="Select a Brand"
                                className="w-full md:w-14rem"
                            />
                            {errors.brand && <small className="p-error">{errors.brand}</small>}
                        </div>
                    </Col>
                    <Col lg={6} className='plr addprof mb-2'>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="company" className='mb-2'>Client</label>
                            <InputText id="company" aria-describedby="company-help" value={company} onChange={(e) => setCompany(e.target.value)} />
                            {errors.company && <small className="p-error">{errors.company}</small>}
                        </div>
                    </Col>
                    <Col lg={6} className='plr addprof mb-2'>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="projectName" className='mb-2'>Project Name</label>
                            <InputText id="projectName" aria-describedby="projectName-help" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                            {errors.projectName && <small className="p-error">{errors.projectName}</small>}
                        </div>
                    </Col>
                    <Col lg={6} className='plr addprof mb-2'>
                        <label htmlFor="priority" className='mb-2'>Priority</label>
                        <Dropdown
                            value={selectedPriority}
                            onChange={(e) => setSelectedPriority(e.value)}
                            options={priorities}
                            optionLabel="name"
                            placeholder="Select Priority Type"
                            className="w-full md:w-14rem"
                        />
                        {errors.selectedPriority && <small className="p-error">{errors.selectedPriority}</small>}
                    </Col>
                    <Col lg={6} className='plr addprof mb-2'>
                        <label htmlFor="startDate" className='mb-2'>Start Date</label>
                        <DatePicker
                            showIcon
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            className='w-100'
                        />
                        {errors.startDate && <small className="p-error">{errors.startDate}</small>}
                    </Col>
                    <Col lg={6} className='plr addprof mb-2'>
                        <label htmlFor="endDate" className='mb-2'>End Date</label>
                        <DatePicker
                            showIcon
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            className='w-100'
                        />
                        {errors.endDate && <small className="p-error">{errors.endDate}</small>}
                    </Col>
                    <Col lg={6} className='plr addprof mb-2'>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="pLeader" className='mb-2'>Project Leader</label>
                            <Dropdown
                                value={selectedLeader}
                                onChange={(e) => setSelectedLeader(e.value)}
                                options={users}
                                optionLabel="name"
                                placeholder="Select a Project Leader"
                                className="w-full md:w-14rem"
                            />
                            {errors.selectedLeader && <small className="p-error">{errors.selectedLeader}</small>}
                        </div>
                    </Col>
                    <Col lg={6} className='plr addprof mb-2'>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="department" className='mb-2'>Department</label>
                            <InputText id="department" aria-describedby="department-help" value={department} readOnly />
                        </div>
                    </Col>
                    <Col lg={12} className='plr addprof mb-2'>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="teamMembers" className='mb-2'>Team Members</label>
                            <MultiSelect
                                value={selectedTeamMembers}
                                onChange={(e) => setSelectedTeamMembers(e.value)}
                                options={members}
                                optionLabel="name"
                                placeholder="Select Team Members"
                                className="w-full pt-2 ps-2 pb-0 h-auto"
                                display="chip"
                            />
                            {errors.selectedTeamMembers && <small className="p-error">{errors.selectedTeamMembers}</small>}
                        </div>
                    </Col>
                    <Col lg={12} className='plr addprof mb-2'>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="description" className='mb-2'>Description</label>
                            <InputText id="description" aria-describedby="description-help" value={description} onChange={(e) => setDescription(e.target.value)} />
                            {errors.description && <small className="p-error">{errors.description}</small>}
                        </div>
                    </Col>
                    <Col lg={12} className='plr addprof mb-2'>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="projectFiles" className='mb-2'>Project Files Link</label>
                            <InputText id="projectFiles" aria-describedby="projectFiles-help" value={projectFilesLink} onChange={(e) => setProjectFilesLink(e.target.value)} />
                            {errors.projectFilesLink && <small className="p-error">{errors.projectFilesLink}</small>}
                        </div>
                    </Col>
                    <Col lg={12} className='plr addprof mb-2'>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="status" className='mb-2'>Status</label>
                            <Dropdown
                                value={status}
                                onChange={(e) => setStatus(e.value)}
                                options={statuses}
                                placeholder="Select Status"
                                className="w-full md:w-14rem"
                            />
                            {errors.status && <small className="p-error">{errors.status}</small>}
                        </div>
                    </Col>

                    <Col lg={12} className='plr addprof mb-2'>
                        <button type="submit" className="btn btn-primary" disabled={!formValid}>
                            Update Project
                        </button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default EditProject;
