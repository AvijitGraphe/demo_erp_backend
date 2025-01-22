import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip'; // Optional for tooltip on the button
import config from '../config';
import { useAuth } from '../context/AuthContext';
import { Col, Row, Breadcrumb, Card, Badge } from "react-bootstrap";

const AddSubTask = ({ taskId, ProjectId, BrandId, User_Id, onSuccess }) => {
    const { accessToken, userId } = useAuth(); 
    const [formData, setFormData] = useState({
        subtask_name: '',
        task_id: taskId,
        project_id: ProjectId,
        brand_id: BrandId,
        project_role_id: '',
        sub_task_description: '',
        sub_task_startdate: null,
        sub_task_deadline: null,
        sub_task_user_id: User_Id || userId,
        missed_deadline: false,
        status: '',
        priority: '',
        is_active: true,
        on_hold: false,
        priority_flag: 'No-Priority'
    });

    const [roles, setRoles] = useState([]); // To store roles from the API
    const [newRole, setNewRole] = useState({ project_role_name: '', description: '' });
    const [showAddRole, setShowAddRole] = useState(false); // Toggle for "Add Role" section
    const statuses = ['Todo', 'InProgress', 'Completed'];
    const priorities = ['Low', 'Medium', 'High'];

    useEffect(() => {
        if (!User_Id) {
            setFormData((prevData) => ({
                ...prevData,
                sub_task_user_id: userId
            }));
        }

        fetchRoles();
    }, [User_Id, userId]);

    // Fetch roles from API
    const fetchRoles = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/projectRoutes/viewproject-user-role`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            setRoles(response.data.map(role => ({ label: role.project_role_name, value:  role.project_role_id  })));
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDateChange = (name, date) => {
        setFormData({ ...formData, [name]: date });
    };

    const handleNewRoleSubmit = async () => {
        try {
            const response = await axios.post(
                `${config.apiBASEURL}/projectRoutes/project-user-role`,
                newRole,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            setShowAddRole(false); // Hide "Add Role" section after successful submission
            fetchRoles(); // Refresh roles
        } catch (error) {
            console.error('Failed to add role:', error);
            
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post(
                `${config.apiBASEURL}/projectRoutes/subtask_add`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            onSuccess();
        } catch (error) {
            console.error('Failed to create subtask:', error);
        }
    };

    return (
        <div className="p-fluid">
            <Row>
                <Col md={12} lg={12} className="mb-4 position-relative">
                        <label className='d-flex justify-content-between align-items-center mb-2'>
                            Subtask Role
                        <Button 
                            icon="pi pi-plus"
                            outlined
                            severity='danger'
                            className="p-0 border-0"
                            onClick={() => setShowAddRole(!showAddRole)} 
                            label="Add New Role"
                            tooltipOptions={{ position: 'top' }} 
                            style={{ width: 'fit-content' }}
                        />
                    </label>
                    <Dropdown
                        value={formData.project_role_id}
                        options={roles}
                        onChange={(e) => setFormData({ ...formData, project_role_id: e.value })}
                        placeholder="Select Role"
                    />
                    <div>
                        {showAddRole && (
                            <div className="bg-white py-1 pe-3" style={{ position: 'absolute', top: '6px', left: '12', width: '100%', zIndex: '1' }}>
                                <label>Add New Role</label>
                                <div className='d-flex gap-2 w-100'>
                                    <div className='d-flex gap-2 w-100'>
                                        <InputText
                                            id="project_role_name"
                                            name="project_role_name"
                                            placeholder='Role Name'
                                            value={newRole.project_role_name}
                                            onChange={(e) => setNewRole({ ...newRole, project_role_name: e.target.value })}
                                        />
                                        <InputTextarea
                                            id="description"
                                            placeholder='Description'
                                            name="description"
                                            value={newRole.description}
                                            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                                            rows={2}
                                            autoResize
                                            style={{ height: '46px' }}
                                        />
                                    </div>
                                    <div className='d-flex justify-content-end gap-2 '>
                                        <Button 
                                            title="Add Role" 
                                            icon="pi pi-check"
                                            severity='success'
                                            onClick={handleNewRoleSubmit} 
                                        />
                                        <Button 
                                            title="Cancel"
                                            severity='danger'
                                            icon="pi pi-times" 
                                            onClick={() => setShowAddRole(false)} 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Col>
                <Col md={12} lg={4} className="mb-3">
                    <label htmlFor="subtask_name">Subtask Name</label>
                    <InputText
                        id="subtask_name"
                        name="subtask_name"
                        value={formData.subtask_name}
                        onChange={handleInputChange}
                    />
                </Col>
                
                <Col md={12} lg={4} className="mb-3">
                    <label htmlFor="sub_task_startdate">Start Date</label>
                    <Calendar
                        id="sub_task_startdate"
                        value={formData.sub_task_startdate}
                        onChange={(e) => handleDateChange('sub_task_startdate', e.value)}
                        showTime
                        placeholder="Select Date and Time"
                    />
                </Col>
                <Col md={12} lg={4} className="mb-3">
                    <label htmlFor="sub_task_deadline">Deadline</label>
                    <Calendar
                        id="sub_task_deadline"
                        value={formData.sub_task_deadline}
                        onChange={(e) => handleDateChange('sub_task_deadline', e.value)}
                        showTime
                        placeholder="Select Date and Time"
                    />
                </Col>
                
                <Col md={12} lg={4} className="mb-3">
                    <label>Priority</label>
                    <Dropdown
                        value={formData.priority}
                        options={priorities.map((p) => ({ label: p, value: p }))}
                        onChange={(e) => setFormData({ ...formData, priority: e.value })}
                        placeholder="Select Priority"
                    />
                </Col>
                <Col md={12} lg={8} className="mb-3">
                    <label>Status</label>
                    <div className='d-flex flex-wrap gap-2 py-2'>
                        {statuses.map((status) => (
                            <div key={status}>
                                <label htmlFor={status}>
                                    <RadioButton
                                        inputId={status}
                                        name="status"
                                        value={status}
                                        onChange={handleInputChange}
                                        checked={formData.status === status}
                                    />
                                    &nbsp; {status}
                                </label>
                            </div>
                        ))}
                    </div>
                </Col>
                <Col md={12} lg={12} className="mb-3">
                    <label htmlFor="sub_task_description">Description</label>
                    <InputTextarea
                        id="sub_task_description"
                        name="sub_task_description"
                        value={formData.sub_task_description}
                        onChange={handleInputChange}
                        rows={3}
                        autoResize
                    />
                </Col>
                <Col md={12} lg={12} className="text-end">
                    <Button 
                        label="Submit Subtask" 
                        icon="pi pi-check" 
                        style={{ width: 'fit-content' }}
                        className='py-2'
                        severity='info'
                        onClick={handleSubmit} 
                    />
                </Col>
            </Row>

            
        </div>
    );
};

export default AddSubTask;
