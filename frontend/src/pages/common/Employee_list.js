import React, { useEffect, useState } from "react";
import { Col, Row, Card, Breadcrumb, Badge } from 'react-bootstrap';
import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import noUserImg from '../../assets/images/no_user.png'; // Placeholder for missing profile images
import '../../assets/css/employelist.css';
const Employee_list = () => {
    const { accessToken, role } = useAuth(); // Get accessToken and role from the context
    const [employeesByType, setEmployeesByType] = useState({});
    const [selectedEmployee, setSelectedEmployee] = useState(null); // State for selected employee
    const allowedRoles = ['Admin', 'SuperAdmin', 'Founder', 'HumanResource'];
    const [unverifiedCount, setUnverifiedCount] = useState(0);
    
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/user-profile/getallusers`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                // Group employees by role
                const groupedEmployees = response.data.reduce((acc, employee) => {
                    const role = employee.user_type;
                    if (!acc[role]) {
                        acc[role] = [];
                    }
                    acc[role].push(employee);
                    return acc;
                }, {});
                setEmployeesByType(groupedEmployees);
                // Automatically select the first employee in "Admin" role if available
                if (groupedEmployees['Founder'] && groupedEmployees['Founder'].length > 0 && selectedEmployee === null) {
                    setSelectedEmployee(groupedEmployees['Founder'][0]);
                }
            } catch (error) {
                console.error('Error fetching employee data:', error);
            }
        };
        fetchEmployees();
    }, [accessToken]);


    useEffect(() => {
        const fetchUnverifiedCount = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/promotion/unverified_count`, {
                    headers: { Authorization: `Bearer ${accessToken}` } // Adjust for your auth token handling
                });

                if (response.status === 200) {
                    setUnverifiedCount(response.data.count);
                }
            } catch (error) {
                console.error('Error fetching unverified users count:', error);
            }
        };

        fetchUnverifiedCount();
    }, [accessToken]); // Empty dependency array to run this on component mount


    return (
        <>
            <Row className='body_content'>
                <Row className='mx-0'>
                    <Col md={6} lg={6} className='mb-4'>
                        <Breadcrumb>
                            <Breadcrumb.Item active>All Employees</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={6} lg={6} className="mb-4 text-end">
                        {allowedRoles.includes(role) && (
                            <Link to="/dashboard/verify">
                                <Button
                                    type="button"
                                    label="Verify Employee"
                                    severity="help"
                                    icon="pi pi-users"
                                    badge={unverifiedCount}
                                    badgeClassName="p-badge-warning"
                                    className="p-2 glow-button"
                                />
                            </Link>
                        )}
                    </Col>
                    <Col lg={12} className='mb-4'>
                        <Row>
                            <Col lg={3} className='mb-4 ps-lg-0'>
                                {selectedEmployee && (
                                    <Card className='sticky-top h-auto'>
                                        {/* <Card.Header className='border-0 text-end'>
                                            <img src={require("../../assets/images/logo.png")} alt="Logo" style={{ width: '80px' }} />
                                        </Card.Header> */}
                                        <Card.Body>
                                            <div className="worterMark">
                                                <img src={require("../../assets/images/logo.png")} alt="Logo" className="w-100" />
                                            </div>

                                            <div
                                                className="worterMark"
                                                style={{ position: 'absolute', right: '-15px', top: '5px' }}
                                            >
                                                <Badge
                                                    className={selectedEmployee?.attendances?.[0]?.checkin_status ? "bg-success" : "bg-secondary"}
                                                >
                                                    {selectedEmployee?.attendances?.[0]?.checkin_status ? "Office" : "Offline"}
                                                </Badge>
                                            </div>
                                            <div className='userImg text-center'>
                                                <img
                                                    src={selectedEmployee.profileImage?.image_url || noUserImg}
                                                    alt={selectedEmployee.first_name}
                                                    className='profile-image'
                                                />

                                            </div>

                                            <div className='userfinfo'>
                                                <h5>{`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}</h5>
                                                <p>
                                                    {/* Role: {selectedEmployee.user_type} */}
                                                    <small className='d-block text-dark'>{selectedEmployee.userDetails?.forte || 'N/A'}</small>
                                                    <small className='d-block'>ID: <b className="text-dark">{selectedEmployee.userDetails?.employee_id || 'N/A'}</b></small>

                                                </p>
                                            </div>
                                            <div className='userfinfo_contact'>
                                                <Button
                                                    icon="pi pi-envelope"
                                                    severity='help'
                                                    rounded
                                                    outlined
                                                    aria-label="Email"
                                                    tooltip={selectedEmployee.email}
                                                    tooltipOptions={{ position: 'top' }}
                                                    className='me-2'
                                                />
                                                <Button
                                                    icon="pi pi-phone"
                                                    severity='info'
                                                    rounded
                                                    outlined
                                                    aria-label="Phone"
                                                    tooltip={selectedEmployee.userDetails?.phone || 'N/A'}
                                                    tooltipOptions={{ position: 'top' }}
                                                    className='me-2'
                                                />
                                                {allowedRoles.includes(role) && (
                                                    <Link to={`/dashboard/associateedit/${selectedEmployee.user_id}`}>
                                                        <Button
                                                            icon="pi pi-eye"
                                                            severity='success'
                                                            rounded
                                                            outlined
                                                            aria-label="View Profile"
                                                            tooltip="View Profile"
                                                            tooltipOptions={{ position: 'top' }}
                                                        />
                                                    </Link>
                                                )}
                                            </div>
                                        </Card.Body>
                                        <Card.Footer className='border-0 userfinfo_foot'>
                                            <p>
                                                {selectedEmployee?.resignations?.[0]?.last_working_day ? (
                                                    <>
                                                        {new Date(selectedEmployee.resignations[0].last_working_day).toLocaleDateString('en-GB')}{' '}
                                                        <small>Last working day</small>
                                                    </>
                                                ) : (
                                                    <>
                                                        {selectedEmployee?.joiningDates?.[0]?.joining_date
                                                            ? new Date(selectedEmployee.joiningDates[0].joining_date).toLocaleDateString('en-GB')
                                                            : 'N/A'}{' '}
                                                        <small>Joining</small>
                                                    </>
                                                )}
                                            </p>
                                            <p>{selectedEmployee.userTimes?.[0]?.start_time || 'N/A'}<small>Punch In Time</small></p>
                                        </Card.Footer>
                                    </Card>
                                )}
                            </Col>

                            <Col lg={9} className='mb-4 ps-lg-5'>
                                {/* Dynamically render employee data grouped by role */}
                                {Object.entries(employeesByType).map(([role, employees]) => (
                                    <div className='allempList' key={role}>
                                        <div className='rol-title'>{role}</div>
                                        <ul>
                                            {employees.map((employee) => (
                                                <li key={employee.user_id} onClick={() => setSelectedEmployee(employee)} className="position-relative">
                                                    <div className='userImg text-center'>
                                                        <img
                                                            src={employee.profileImage?.image_url || noUserImg}
                                                            alt={`${employee.first_name} ${employee.last_name}`}
                                                            className='profile-image'
                                                        />
                                                    </div>
                                                    <div className='userfinfo'>
                                                        <h5>{`${employee.first_name} ${employee.last_name}`}</h5>
                                                        <p>Role: {role}</p>
                                                    </div>

                                                    <div
                                                        className="worterMark"
                                                        style={{ position: 'absolute', right: '-15px', top: '5px' }}
                                                    >
                                                        <Badge
                                                            className={employee?.attendances?.[0]?.checkin_status ? "bg-success" : "bg-secondary"}
                                                        >
                                                            {employee?.attendances?.[0]?.checkin_status ? "Office" : "Offline"}
                                                        </Badge>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Row>
        </>
    );
};

export default Employee_list;
