import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';
import config from '../config';
import { useAuth } from '../context/AuthContext';
import { Col, Row, Breadcrumb, Card, Table, Badge, ListGroup } from 'react-bootstrap';

const EditSubTask = ({ subtaskId, onSuccess }) => {

    console.log("subtaskId", subtaskId)
    
    const { accessToken } = useAuth();
    const [formData, setFormData] = useState({});
    const [statuses] = useState(['Todo', 'InProgress', 'Completed']);
    const [priorities] = useState(['Low', 'Medium', 'High']); 
    const [loading, setLoading] = useState(true);
    // Fetch subtask data for editing
    useEffect(() => {
        const fetchSubTask = async () => {
            try {
                const response = await axios.get(
                    `${config.apiBASEURL}/projectRoutes/fetchsubtaskforedit/${subtaskId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
                if (response.data) {
                    setFormData(response.data);
                }
            } catch (error) {
                console.error('Error fetching subtask:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubTask();
    }, [subtaskId, accessToken]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDateChange = (name, date) => {
        setFormData({ ...formData, [name]: date });
    };

    const handleSubmit = async () => {
        try {
            await axios.put(
                `${config.apiBASEURL}/projectRoutes/subtask_edit/${subtaskId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            onSuccess(); // Notify parent component or refresh list
        } catch (error) {
            console.error('Failed to update subtask:', error);
        }
    };

    if (loading) return <div>Loading...</div>; 

    return (
        <>
            <Row>
                <Col md={12} lg={12} className="mb-3 position-relative">
                    <label htmlFor="subtask_name">Subtask Name</label>
                    <InputText
                        id="subtask_name"
                        name="subtask_name"
                        value={formData?.subtask_name || ''}
                        onChange={handleInputChange}
                    />
                </Col>
                <Col md={12} lg={4} className="mb-3">
                    <label htmlFor="sub_task_startdate">Start Date</label>
                    <Calendar
                        id="sub_task_startdate"
                        value={new Date(formData?.sub_task_startdate) || null}
                        onChange={(e) => handleDateChange('sub_task_startdate', e.value)}
                        showTime // Enables time selection
                        placeholder="Select Date and Time"
                    />
                </Col>
                <Col md={12} lg={4} className="mb-3">
                    <label htmlFor="sub_task_deadline">Deadline</label>
                    <Calendar
                        id="sub_task_deadline"
                        value={new Date(formData?.sub_task_deadline) || null}
                        onChange={(e) => handleDateChange('sub_task_deadline', e.value)}
                        showTime // Enables time selection
                        placeholder="Select Date and Time"
                    />
                </Col>
                
                <Col md={12} lg={4} className="mb-3">
                    <label>Priority</label>
                    <Dropdown
                        value={formData?.priority || ''}
                        options={priorities.map((p) => ({ label: p, value: p }))}
                        onChange={(e) => setFormData({ ...formData, priority: e.value })}
                        placeholder="Select Priority"
                    />
                </Col>
                
                <Col md={12} lg={8} className="mb-3">
                    <label >Status</label>
                    <div className='d-flex gap-3 mt-2'>
                        {statuses.map((status) => (
                            <div key={status}>
                                <label htmlFor={status}>
                                    <RadioButton
                                        inputId={status}
                                        name="status"
                                        value={status}
                                        onChange={handleInputChange}
                                        checked={formData?.status === status}
                                    />
                                    &nbsp; {status}
                                </label>
                            </div>
                        ))}
                    </div>
                    
                </Col>
                <Col md={12} lg={12} className="mb-4 position-relative">
                <label htmlFor="sub_task_description" className='mb-2'>Description</label>
                    <InputTextarea
                        id="sub_task_description"
                        name="sub_task_description"
                        value={formData?.sub_task_description || ''}
                        onChange={handleInputChange}
                        rows={3}
                        autoResize
                    />
                </Col>
                
                <Col md={12} lg={12} className="text-end">
                    <Button label="Update Subtask" icon="pi pi-check" onClick={handleSubmit} />
                </Col>

            </Row>
        </>
    );
};

export default EditSubTask;
