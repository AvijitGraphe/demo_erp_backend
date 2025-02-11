import React, { useState, useEffect } from 'react';
import { Row, Col, Breadcrumb, Card, Table, Form, CardBody, CardFooter } from 'react-bootstrap';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import axios from 'axios';
import config from '../../config';
import '../../assets/css/verify.css';
import { useAuth } from '../../context/AuthContext';
import nouserimg from '../../assets/images/no_user.png';
const UpdateDesignation = () => {
    const { accessToken } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [roles, setRoles] = useState([]);
    const [editRowId, setEditRowId] = useState(null);
    const [editedRole, setEditedRole] = useState([]);


    // Fetch employees
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/promotion/users_verified`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
               
                setEmployees(response.data.users);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };
        fetchEmployees();
    }, [accessToken]);

    // Fetch roles
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/promotion/allroles`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                setRoles(response.data.data);
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };
        fetchRoles();
    }, [accessToken]);

    // Handle edit click
    const handleEditClick = (employee) => {
        setEditRowId(employee._id);
        setEditedRole(employee.Role_id);
    };

    // Handle save click
    const handleSaveClick = async () => {
        try {
            const selectedRole = roles.find(role => role._id === editedRole.roleId);
            if (!selectedRole) {
                return ;
            }
            await axios.post(
                `${config.apiBASEURL}/promotion/promotion-users`,
                {
                    user_id: editRowId,
                    user_type: selectedRole.role_name,
                    user_role_id: selectedRole._id
                },
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            setEmployees((prev) =>
                prev.map((emp) =>
                    emp._id === editRowId
                        ? { ...emp, Role_id: selectedRole._id }
                        : emp
                )
            );
            setEditRowId(null);
        } catch (error) {
            console.error('Error saving changes:', error); 
        }
    };



    // Handle cancel click
    const handleCancelClick = () => {
        setEditRowId(null);
        setEditedRole("");
    };

    // Handle role change
    const handleRoleChange = (e) => {
        const { name, value, selectedOptions } = e.target;
        const roleId = selectedOptions[0].getAttribute('data-id');
        if (name === 'user_type') {
            setEditedRole({ roleId, role_name: value });
        }
    };
    
    

    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col md={6} lg={6} className="mb-4">
                        <Breadcrumb>
                            <Breadcrumb.Item active>Role Assig</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Card className="pt-2 mt-4">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h6>Total: <b className="text-danger h6">{employees.length}</b> <small className="text-muted">Employees</small></h6>
                        </Card.Header>
                        <CardBody className="empRolltable">
                            <Table responsive size="sm" striped>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Joining Date</th>
                                        <th>Role</th>
                                        <th style={{ width: '150px' }} className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((employee) => (
                                        <tr key={employee._id}>
                                            <td>
                                                <div className='d-flex align-items-center'>
                                                    <Avatar
                                                        image={employee.profileImage?.image_url || nouserimg}
                                                        shape="circle"
                                                        size="large"
                                                        className='me-2'
                                                    />
                                                    <span className='h6 mb-0'>{`${employee.first_name} ${employee.last_name}`}</span>
                                                </div>
                                            </td>
                                            <td>{employee.email}</td>
                                            <td>{ new Date(employee.joiningDates?.[0]?.joining_date).toLocaleDateString('en-GB') || "N/A"}</td>
                                            <td>
                                                {editRowId === employee._id ? (
                                                    <select
                                                        name='user_type'
                                                        value={editedRole.role_name}
                                                        onChange={handleRoleChange}
                                                        className="form-control form-select"
                                                    >
                                                        <option value="Select a Role" disabled>Select a Role</option>
                                                        {roles.map((role) => (
                                                            <option key={role._id} value={role.role_name} data-id={role._id}>
                                                                {role.role_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    roles.find(role => role._id === employee.Role_id)?.role_name || "N/A"
                                                )}
                                            </td>

                                            <td className="text-center">
                                                {editRowId === employee._id ? (
                                                    <>
                                                        <Button
                                                            className="border-0"
                                                            severity="success"
                                                            onClick={handleSaveClick}
                                                            icon="pi pi-save"
                                                            outlined
                                                            title="Save"
                                                        />
                                                        <Button
                                                            className="border-0"
                                                            title="Cancel"
                                                            severity="danger"
                                                            onClick={handleCancelClick}
                                                            outlined
                                                            icon="pi pi-times"
                                                        />
                                                    </>
                                                ) : (
                                                    <Button
                                                        className="border-0"
                                                        icon="pi pi-pencil"
                                                        outlined
                                                        severity="help"
                                                        title="Edit"
                                                        onClick={() => handleEditClick(employee)}
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </CardBody>
                        <CardFooter></CardFooter>
                    </Card>
                </Row>
            </Row>
        </>
    );
};

export default UpdateDesignation;
