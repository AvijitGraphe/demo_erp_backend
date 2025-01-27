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
import { Col, Row, Breadcrumb, Card, Badge } from "react-bootstrap";

const EditTask = ({ taskId, onSuccess }) => {
    const { accessToken } = useAuth();
    const [formData, setFormData] = useState({
        task_name: '',
        task_description: '',
        task_startdate: null,
        task_deadline: null,
        task_user_id: '',
        missed_deadline: false,
        task_type: '',
        status: '',
        priority: '',
        is_active: true,
        on_hold: false,
        priority_flag: 'No-Priority',
    });

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch task data for editing
    useEffect(() => {
        const fetchTask = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/projectRoutes/fetchtaskforedit/${taskId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (response.data) {
                    const task = response.data;
                    setFormData({
                        ...task,
                        task_startdate: new Date(task.task_startdate),
                        task_deadline: new Date(task.task_deadline),
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching task:', error);
                setLoading(false);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/projectRoutes/fetch-all-users`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                setUsers(response.data.map(user => ({
                    label: `${user.first_name} ${user.last_name}`,
                    value: user.user_id,
                })));
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchTask();
        fetchUsers();
    }, [taskId, accessToken]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${config.apiBASEURL}/projectRoutes/edit-task/${taskId}`, formData, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            onSuccess && onSuccess();
        } catch (error) {
            console.error('Error updating task:', error);

        }
    };
    if (loading) return <div>Loading...</div>;
    return (
        <div className="edit-task">
             <form onSubmit={handleSubmit}>
                <Row>
                    <Col md={6} lg={4} className='mb-3'>
                        <label htmlFor="task_name">Task Name</label>
                        <InputText
                            id="task_name"
                            name="task_name"
                            value={formData.task_name}
                            onChange={handleInputChange}
                        />
                    </Col>
                    <Col md={6} lg={4} className='mb-3'>
                        <label htmlFor="task_startdate">Start Date & Time</label>
                        <Calendar
                            id="task_startdate"
                            name="task_startdate"
                            value={formData.task_startdate}
                            onChange={(e) => setFormData({ ...formData, task_startdate: e.value })}
                            showTime
                            hourFormat="12"
                            dateFormat="dd/mm/yy"
                        />
                    </Col>
                    <Col md={6} lg={4} className='mb-3'>
                        <label htmlFor="task_deadline">Deadline</label>
                        <Calendar
                            id="task_deadline"
                            name="task_deadline"
                            value={formData.task_deadline}
                            onChange={(e) => setFormData({ ...formData, task_deadline: e.value })}
                            showTime
                            hourFormat="12"
                            dateFormat="dd/mm/yy"
                        />
                    </Col>
                    <Col md={6} lg={4} className='mb-3'>
                        <label htmlFor="task_user_id">Assign To</label>
                        <Dropdown
                            id="task_user_id"
                            name="task_user_id"
                            value={formData.task_user_id}
                            options={users}
                            onChange={(e) => setFormData({ ...formData, task_user_id: e.value })}
                            placeholder="Select a user"
                        />
                    </Col>
                    <Col md={6} lg={4} className='mb-3'>
                        <label>Status</label>
                        <Dropdown
                            id="status"
                            name="status"
                            value={formData.status}
                            options={[
                                { label: 'Todo', value: 'Todo' },
                                { label: 'In Progress', value: 'InProgress' },
                                { label: 'In Review', value: 'InReview' },
                                { label: 'In Changes', value: 'InChanges' },
                                { label: 'Completed', value: 'Completed' },
                            ]}
                            onChange={(e) => setFormData({ ...formData, status: e.value })}
                            placeholder="Select a status"
                        />
                    </Col>
                    <Col md={6} lg={4} className='mb-3'>
                        <label>Priority</label>
                        <Dropdown
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            options={['Low', 'Medium', 'High']}
                            onChange={(e) => setFormData({ ...formData, priority: e.value })}
                            placeholder="Select priority"
                        />
                    </Col>
                    
                    <Col md={6} lg={4} className='mb-3'>
                        <label>Task type</label>
                        <Dropdown
                            id="task_type"
                            name="task_type"
                            value={formData.task_type}
                            options={[
                                { label: 'Graphe', value: 'Graphe' },
                                { label: 'Weddings', value: 'Weddings' },
                            ]}
                            onChange={(e) => setFormData({ ...formData, task_type: e.value })}
                            placeholder="Select a task_type"
                        />
                    </Col>



                    <Col md={12} lg={12} className='mb-3'>
                        <label htmlFor="task_description">Task Description</label>
                        <InputTextarea
                            id="task_description"
                            name="task_description"
                            value={formData.task_description}
                            onChange={(e) => setFormData({ ...formData, task_description: e.target.value })}
                            rows={5} // Adjust the number of rows as needed
                            cols={30} // Adjust the number of columns as needed
                            placeholder="Enter task description"
                            className='h-auto'
                        />
                    </Col>
                    <Col md={6} lg={4} className='mb-3'>
                        <label className='d-block mb-2'>Active</label>
                        <label className='me-3'>
                            <RadioButton
                                name="is_active"
                                value={true}
                                onChange={() => setFormData({ ...formData, is_active: true })}
                                checked={formData.is_active === true}
                            />
                            &nbsp; Yes
                        </label>
                        <label>
                            <RadioButton
                                name="is_active"
                                value={false}
                                onChange={() => setFormData({ ...formData, is_active: false })}
                                checked={formData.is_active === false}
                            />
                            &nbsp; No
                        </label>
                    </Col>
                    <Col md={6} lg={4} className='mb-3'>
                        <label className='d-block mb-2'>On Hold</label>
                        <label className='me-3'>
                            <RadioButton
                                name="on_hold"
                                value={true}
                                onChange={() => setFormData({ ...formData, on_hold: true })}
                                checked={formData.on_hold === true}
                            />
                            &nbsp; Yes
                        </label>
                        <label>
                            <RadioButton
                                name="on_hold"
                                value={false}
                                onChange={() => setFormData({ ...formData, on_hold: false })}
                                checked={formData.on_hold === false}
                            />
                            &nbsp; No
                        </label>
                    </Col>
                    <Col md={6} lg={4} className='mb-3'>
                        <label className='d-block mb-2'>Priority</label>
                        <label className='me-3'>
                            <RadioButton
                                name="priority_flag"
                                value="Priority"
                                onChange={() => setFormData({ ...formData, priority_flag: 'Priority' })}
                                checked={formData.priority_flag === 'Priority'}
                            />
                            &nbsp; Yes
                        </label>
                        <label>
                            <RadioButton
                                name="priority_flag"
                                value="No-Priority"
                                onChange={() => setFormData({ ...formData, priority_flag: 'No-Priority' })}
                                checked={formData.priority_flag === 'No-Priority'}
                            />
                            &nbsp; No
                        </label>
                    </Col>
                    <Col md={12} lg={12} className='mt-3 text-end'>
                        <Button type="submit" label="Save" className="py-2" />
                    </Col>
                </Row>
            </form>
        </div>
    );
};

export default EditTask;
