import React, { useEffect, useState, useRef } from "react";
import { Col, Row, Card, Table, Form, Breadcrumb, Spinner } from 'react-bootstrap';
import { Button } from 'primereact/button';
import axios from 'axios';
import moment from 'moment'; // Optional, if you want to use moment for formatting
import { useAuth } from '../../context/AuthContext';
import config from "../../config";
import CustomToast from '../../components/CustomToast';
import { Calendar } from 'primereact/calendar';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ProgressSpinner } from 'primereact/progressspinner'; // PrimeReact spinner
import { Avatar } from 'primereact/avatar';
import nouserImg from '../../assets/images/no_user.png';
const Verify_employee = () => {
    const { accessToken } = useAuth(); // Get the access token from the context
    const [roles, setRoles] = useState([]);
    const [unverifiedUsers, setUnverifiedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '',
        username: '', // Add this
        user_type: '',
        joining_date: '',
        start_time: ''
    });
    const toastRef = useRef(null);
    const showMessage = (severity, detail) => {
        const summary = severity.charAt(0).toUpperCase() + severity.slice(1);
        toastRef.current.show(severity, summary, detail);
    };

    // Fetch roles and unverified users on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const headers = { Authorization: `Bearer ${accessToken}` }; // Add the auth header
                const [rolesResponse, usersResponse] = await Promise.all([
                    axios.get(`${config.apiBASEURL}/promotion/allroles`, { headers }),
                    axios.get(`${config.apiBASEURL}/promotion/users_unverified`, { headers })
                ]);

                if (rolesResponse.data.success) {
                    console.log("log the data", rolesResponse.data.data)
                    setRoles(rolesResponse.data.data);
                }
                setUnverifiedUsers(usersResponse.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [accessToken]); // Dependency array includes accessToken to refresh data if it changes

    // Handle row click to prefill form
    const handleRowClick = (user) => {
        setFormData({
            user_id: user._id,
            username: `${user.first_name} ${user.last_name}`, // Assuming `first_name` represents the username
            user_type: '',
            joining_date: '',
            start_time: ''
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const headers = { Authorization: `Bearer ${accessToken}` }; // Add the auth header

            // Format the joining_date to exclude the time zone offset
            const formattedData = {
                ...formData,
                joining_date: formData.joining_date
                    ? moment(formData.joining_date).format('YYYY-MM-DD') // Format the date as YYYY-MM-DD
                    : '', // Handle the case where the date is empty
            };

            const response = await axios.post(
                `${config.apiBASEURL}/promotion/update-user-role-location`,
                formattedData,
                { headers }
            );

            if (response.status === 200) {
                showMessage('success', response.data.message);

                // Clear the form data
                setFormData({
                    user_id: '',
                    user_type: '',
                    joining_date: '',
                    start_time: ''
                });

                // Refresh unverified users list after successful verification
                const updatedUsers = await axios.get(
                    `${config.apiBASEURL}/promotion/users_unverified`,
                    { headers }
                );
                setUnverifiedUsers(updatedUsers.data || []);
            } else {
                showMessage('error', response.data.message || 'Something went wrong!');
            }
        } catch (error) {
            console.error('Error updating user role:', error);

            if (error.response) {
                showMessage('error', error.response.data.message || 'Failed to update user role. Please try again.');
            } else if (error.request) {
                showMessage('error', 'No response from server. Please check your network connection.');
            } else {
                showMessage('error', 'Error in request setup. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };



    // Handle form input changes
    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData((prevData) => ({
    //         ...prevData,
    //         [name]: value
    //     }));

    // };

    const handleChange = (e) => {
        const { name, value, selectedOptions } = e.target;
        if (name === 'user_type') {
            const selectedRoleId = selectedOptions[0].getAttribute('data-id');
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
                user_type_id: selectedRoleId, 
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };
    



    
    // JSX for the Role Dropdown
    <Col md={6} lg={3} className="px-2 mb-3">
        <Form.Group>
            <label className="mb-2">Select Role</label>
            <Form.Select
                name="user_type"
                value={formData.user_type}
                onChange={handleChange} // Handle change here
                required
            >
                <option value="">Select a Role</option>
                {roles.map((role) => (
                    <option key={role._id} value={role.role_name} data-id={role._id}>
                        {role.role_name}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>
    </Col>
    


    const renderAccordion = (user) => (
        <Accordion>
            <AccordionTab
                header={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar
                            image={user.profileImage?.image_url || nouserImg} // Placeholder for no image
                            shape="circle"
                            size="large"
                        />
                        <span>{`${user.first_name} ${user.last_name}`}</span>
                    </div>
                }
            >
                <div className="empListvery">
                    <p><small>Email:</small> {user.email}</p>
                    <p><small>Phone:</small> {user.userDetails?.phone || 'Not provided'}</p>
                    <p><small>Address:</small> {user.userDetails?.address || 'Not provided'}</p>
                    <p><small>City:</small> {user.userDetails?.city || 'Not provided'}</p>
                    <p><small>Pincode:</small> {user.userDetails?.pincode || 'Not provided'}</p>
                    <p><small>State:</small> {user.userDetails?.state || 'Not provided'}</p>
                    <p><small>Country:</small> {user.userDetails?.country || 'Not provided'}</p>
                    <p><small>Forte:</small> {user.userDetails?.forte || 'Not provided'}</p>
                    <p><small>PAN Card No.:</small> {user.userDetails?.pan_card_no || 'Not provided'}</p>
                    <p><small>Passport No.:</small> {user.userDetails?.passport_no || 'Not provided'}</p>
                    <p><small>Aadhar No.:</small> {user.userDetails?.aadhar_no || 'Not provided'}</p>
                    <p><small>Nationality:</small> {user.userDetails?.nationality || 'Not provided'}</p>
                    <p><small>Religion:</small> {user.userDetails?.religion || 'Not provided'}</p>
                    <p><small>Marital Status:</small> {user.userDetails?.marital_status || 'Not provided'}</p>
                    <p><small>Employment of Spouse:</small> {user.userDetails?.employment_of_spouse || 'Not provided'}</p>
                    <p><small>No. of Children:</small> {user.userDetails?.no_of_children || 'Not provided'}</p>   







                    <p><small>Bank Details:</small> {user.bankDetails?.bank_name || 'Not provided'}</p>
                    <p><small>Account Holder's Name:</small> {user.bankDetails?.accountHolder_name || 'Not provided'}</p>
                    <p><small>IFSC Code:</small> {user.bankDetails?.ifsc_code || 'Not provided'}</p>
                    <p><small>Branch Name:</small> {user.bankDetails?.branch_name || 'Not provided'}</p>
                    <p>
                        <small>Emergency Contacts:</small>
                        <ul>
                            {user.emergencyContacts?.length ? (
                                user.emergencyContacts.map((contact, index) => (
                                    <li key={index}>
                                        <span className="d-block"><em>Name</em> - {contact.name} </span>
                                        <span className="d-block"><em>Phone</em> - {contact.phone} </span>    
                                    </li>
                                ))
                            ) : (
                                <li>No contacts available</li>
                            )}
                        </ul>
                    </p>
                    {/* <p>
                        <small>Education:</small>
                        <ul>
                            {user.educationInfos?.length ? (
                                user.educationInfos.map((info, index) => (
                                    <li key={index}>
                                        {info.degree_name} from {info.institute}</li>
                                ))
                            ) : (
                                <li>No education info available</li>
                            )}
                        </ul>
                    </p> */}
                </div>
            </AccordionTab>
        </Accordion>
    );




    return (
        <>
            <Row className='body_content'>
                <Row className='mx-0'>
                    <Col md={6} lg={6} className='mb-4'>
                        <Breadcrumb>
                            <Breadcrumb.Item active>Verify Employee</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={12} lg={12} className="mb-3 updateCard_form">
                        <Card>
                            <Card.Body className="pb-0">
                                <Form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col md={6} lg={3} className="px-2 mb-3">
                                            <Form.Group>
                                                <label className="mb-2">User Name</label> {/* Updated label */}
                                                <Form.Control
                                                    type="text"
                                                    name="username"
                                                    value={formData.username} // Bind to username
                                                    onChange={handleChange}
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} lg={3} className="px-2 mb-3">
                                            <Form.Group>
                                                <label className="mb-2">Select Role</label>
                                                <Form.Select
                                                    name="user_type"
                                                    value={formData.user_type}
                                                    onChange={handleChange} // Handle change here
                                                    required
                                                >
                                                    <option value="">Select a Role</option>
                                                    {roles.map((role) => (
                                                        <option key={role._id} value={role.role_name} data-id={role._id}>
                                                            {role.role_name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6} lg={3} className="px-2 mb-3">
                                            <Form.Group>
                                                <label className="mb-2">Joining Date</label>
                                                <Calendar
                                                    value={formData.joining_date}
                                                    onChange={(e) => handleChange({ target: { name: 'joining_date', value: e.value } })}
                                                    dateFormat="dd-mm-yy"
                                                    required
                                                    placeholder="dd-mm-yy"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6} lg={3} className="px-2 mb-3">
                                            <Form.Group className="mb-3 d-flex align-items-end">
                                                <div>
                                                    <label className="mb-2">Start Time</label>
                                                    <Calendar
                                                        value={formData.start_time}
                                                        onChange={(e) => handleChange({ target: { name: 'start_time', value: e.value } })}
                                                        timeOnly
                                                        hourFormat="12"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <Button
                                                        severity="success"
                                                        icon="pi pi-check-circle"
                                                        className="py-2 px-2 ms-1"
                                                        style={{ width: '90px', height: '46px' }}
                                                        type="submit"
                                                        disabled={loading}
                                                    >
                                                        &nbsp; {loading ? 'Submitting...' : 'Verify'}
                                                    </Button>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={12} lg={12}>
                        <Card>
                            <Card.Header>
                                <h6>Unverified Users</h6>
                            </Card.Header>
                            <Card.Body>
                                {loading ? (
                                    <ProgressSpinner />
                                ) : (
                                    unverifiedUsers.map((user) => (
                                        <div key={user._id} onClick={() => handleRowClick(user)}>
                                            {renderAccordion(user)}
                                        </div>
                                    ))
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                    <CustomToast ref={toastRef} />
                </Row>
            </Row>
        </>
    );
};

export default Verify_employee;