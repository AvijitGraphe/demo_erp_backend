import React, { useState, useEffect, useRef } from 'react';
import { Form, Row, Col, Card, Breadcrumb, Table } from 'react-bootstrap';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import logoImage from '../../assets/images/logo.png';
import { Editor } from 'primereact/editor';
import { AutoComplete } from "primereact/autocomplete";
import successVideo from '../../assets/video/paperplane.mp4';
import crossVideo from '../../assets/video/cross.mp4';
import { Dialog } from "primereact/dialog";
import { useNavigate } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
const Send_letter = () => {
    const { accessToken, userId } = useAuth();
    const [templateName, setTemplateName] = useState('');
    const [templates, setTemplates] = useState([]);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [employeeName, setEmployeeName] = useState('');
    const [email, setEmail] = useState('');
    const [sections, setSections] = useState([]);
    const [mainUserDetails, setMainUserDetails] = useState(null);
    const [admindesignation, setAdminDesignation] = useState('');
    const [useExistingEmployee, setUseExistingEmployee] = useState(true);
    const [subject, setSubject] = useState('');
    const [openMenuIndex, setOpenMenuIndex] = useState(null); // Track the open menu index
    const [loading, setLoading] = useState(false);
    const menuRefs = useRef([]);
    const [signatureImage, setSignatureImage] = useState(null);
    const [employeeDetails, setEmployeeDetails] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [videoDialogVisible, setVideoDialogVisible] = useState(false); // New state for video dialog
    const [videocrossDialogVisible, setVideocrossDialogVisible] = useState(false); // New state for video dialog

    const navigate = useNavigate();
    // Fetch Templates
    useEffect(() => {
        axios.get(`${config.apiBASEURL}/letterRoutes/fetchalllettertemplates`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        }).then((res) => setTemplates(res.data))
            .catch((err) => console.error('Error fetching templates:', err));
    }, [accessToken]);

    // Fetch Users
    useEffect(() => {
        axios.get(`${config.apiBASEURL}/projectRoutes/fetch-all-users`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        }).then((res) => setUsers(res.data))
            .catch((err) => console.error('Error fetching users:', err));
    }, [accessToken]);

    const fetchMainUserDetails = async () => {
        try {
            const response = await axios.get(
                `${config.apiBASEURL}/user-profile/main-user-details?userId=${userId}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            setMainUserDetails(response.data);
        } catch (err) {
            console.error("Error fetching main user details:", err.message);
        }
    };

    useEffect(() => {
        if (!userId || !accessToken) return;
        fetchMainUserDetails();
    }, [userId, accessToken]);

    const onTemplateSelect = (e) => {
        const selectedTemplateId = e.target.value;
        setTemplateName(selectedTemplateId); // Keep this for dropdown value

        axios
            .get(`${config.apiBASEURL}/letterRoutes/viewallletters/${selectedTemplateId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            .then((response) => {
                const { template_name, template_subject, sections } = response.data;

                // Update template details without overwriting templateName
                setSubject(template_subject); // Assuming there's a state for the subject
                setSections(sections.map((section, index) => ({
                    ...section,
                    order_id: index + 1, // Ensure sections are ordered correctly
                })));
            })
            .catch((err) => console.error('Error fetching template details:', err));
    };


    const searchUsers = (event) => {
        const query = event.query.toLowerCase();
        const enrichedUsers = users.map((user) => ({
            ...user,
            fullName: `${user.first_name} ${user.last_name}`,
        }));
        setFilteredUsers(
            enrichedUsers.filter((user) => user.fullName.toLowerCase().includes(query))
        );
    };

    const handleEmployeeSelection = (selectedUser) => {
        setEmployeeName(selectedUser);
        setEmail(selectedUser?.email || '');
        setSelectedEmployeeId(selectedUser.user_id); // Assuming 'id' is the identifier
    };

    const handleAddEmail = (index, position) => {
        const newSection = {
            order_id: 0, // Temporary, will be recalculated
            section_heading: 'Email',
            section_body: `${employeeDetails.email || "N/A"}`,
        };

        const updatedSections = [...sections];
        updatedSections.splice(index + (position === 'below' ? 1 : 0), 0, newSection);

        // Recalculate order_ids
        updatedSections.forEach((section, idx) => {
            section.order_id = idx + 1;
        });

        setSections(updatedSections);
    };

    const handleAddRole = (index, position) => {
        const newSection = {
            order_id: 0, // Temporary, will be recalculated
            section_heading: 'Employee Role',
            section_body: `${employeeDetails.role?.role_name || "N/A"}`,
        };

        const updatedSections = [...sections];
        updatedSections.splice(index + (position === 'below' ? 1 : 0), 0, newSection);

        // Recalculate order_ids
        updatedSections.forEach((section, idx) => {
            section.order_id = idx + 1;
        });

        setSections(updatedSections);
    };



    const handleAddJoiningDate = (index, position) => {
        const newSection = {
            order_id: 0, // Temporary, will be recalculated
            section_heading: 'Joining Date',
            section_body: `
                Joining Date: ${employeeDetails.joiningDates?.[0]?.joining_date
                    ? new Date(employeeDetails.joiningDates[0].joining_date).toLocaleDateString('en-GB')
                    : 'Not Available'
                }
            `,
        };

        const updatedSections = [...sections];
        updatedSections.splice(index + (position === 'below' ? 1 : 0), 0, newSection);

        // Recalculate order_ids
        updatedSections.forEach((section, idx) => {
            section.order_id = idx + 1;
        });

        setSections(updatedSections);
    };

    const handleAddLastWorkingDate = (index, position) => {
        const newSection = {
            order_id: 0, // Temporary, will be recalculated
            section_heading: 'Last Working Date',
            section_body: `
                Last Working Date: ${employeeDetails.resignations?.[0]?.last_working_day
                    ? new Date(employeeDetails.resignations[0].last_working_day).toLocaleDateString('en-GB')
                    : 'Not Available'
                }
            `,
        };

        const updatedSections = [...sections];
        updatedSections.splice(index + (position === 'below' ? 1 : 0), 0, newSection);

        // Recalculate order_ids
        updatedSections.forEach((section, idx) => {
            section.order_id = idx + 1;
        });

        setSections(updatedSections);
    };



    const handleSectionAdd = (index, position) => {
        const newSection = {
            order_id: 0, // Temporary, will be recalculated
            section_heading: '',
            section_body: '',
        };

        const updatedSections = [...sections];
        updatedSections.splice(index + (position === 'below' ? 1 : 0), 0, newSection);

        // Recalculate order_ids
        updatedSections.forEach((section, idx) => {
            section.order_id = idx + 1;
        });

        setSections(updatedSections);
    };

    const handleSectionRemove = (index) => {
        const updatedSections = sections.filter((_, idx) => idx !== index);

        // Recalculate order_ids
        updatedSections.forEach((section, idx) => {
            section.order_id = idx + 1;
        });

        setSections(updatedSections);
    };

    const handleSectionChange = (index, key, value) => {
        const updatedSections = [...sections];
        updatedSections[index][key] = value;
        setSections(updatedSections);
    };

    const handleSignatureUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSignatureImage(e.target.files[0]); // Update state with the selected file
        }
    };


    // Close menu on outside click
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (menuRefs.current.every((ref) => ref && !ref.contains(event.target))) {
                setOpenMenuIndex(null);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);



    const fetchSelectedUserDetails = async (userId) => {
        setVideoDialogVisible(true); // Show video dialog
        try {
            const response = await axios.get(`${config.apiBASEURL}/letterRoutes/Selected-user-details`, {
                params: { userId },
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            setEmployeeDetails(response.data);

            setTimeout(() => {
                setVideoDialogVisible(false); // Hide video dialog after 5 seconds           
            }, 5000);


        } catch (error) {
            console.error('Error fetching user details:', error.response?.data || error.message);
        }
    };









    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure sections are properly formatted
        const formattedSections = sections.map((section) => ({
            heading: section.section_heading,
            body: section.section_body,
            order: section.order_id, // Assuming order_id exists in sections
        }));

        // Create FormData for multipart/form-data request
        const formData = new FormData();

        // Add text fields to FormData
        formData.append('template_id', templateName);
        formData.append('user_id', useExistingEmployee ? employeeName?.user_id || null : null);
        formData.append('user_email', email);
        formData.append('employee_name', useExistingEmployee ? employeeName?.fullName || '' : employeeName);
        formData.append('creator_name', `${mainUserDetails?.first_name} ${mainUserDetails?.last_name}`);
        formData.append('creator_designation', admindesignation);
        formData.append('sections', JSON.stringify(formattedSections)); // Serialize sections as JSON

        // Add file to FormData if a signature image is selected
        if (signatureImage) {
            formData.append('signature', signatureImage);
        }
        setLoading(true); // Set loading to true 
        try {
            const response = await axios.post(
                `${config.apiBASEURL}/letterRoutes/send-letter`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'multipart/form-data', // Required for file uploads
                    },
                }
            );
            setVideoDialogVisible(true); // Show video dialog

            setTimeout(() => {
                setVideoDialogVisible(false); // Hide video dialog after 5 seconds           
                navigate('/dashboard/send_letter_list');
            }, 5000);
        } catch (error) {
            console.error('Error sending letter:', error);
            setVideocrossDialogVisible(true); // Show video dialog

            setTimeout(() => {
                setVideocrossDialogVisible(false); // Hide video dialog after 5 seconds           

            }, 5000);
        }
        finally {
            setLoading(false); // Set loading to false after fetching
        }
    };


    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col sm={12} lg={12} className="mb-4">
                        <Breadcrumb>
                            <Breadcrumb.Item active>Send Letter</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col sm={12} lg={6} className="mb-4">
                        <Card className="shadow-0 sticky-top letterForm addEm">
                            <Card.Body>
                                <Card.Title>Letter Details</Card.Title>
                                {loading ? (
                                    <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                                    </div>
                                ) : (
                                    <Form className="mt-4" onSubmit={handleSubmit}>
                                        <Row>
                                            <Col sm={12} lg={12} className="mb-3 ps-0">
                                                <Form.Check
                                                    type="switch"
                                                    id="toggle-employee-type"
                                                    label="Use Existing Employee"
                                                    checked={useExistingEmployee}
                                                    onChange={(e) =>
                                                        setUseExistingEmployee(e.target.checked)
                                                    }
                                                />
                                            </Col>
                                            {useExistingEmployee ? (
                                                <>
                                                    <Col sm={12} lg={12} className="mb-3 ps-0">
                                                        <Form.Label>Select Existing Employee</Form.Label>
                                                        <AutoComplete
                                                            value={employeeName}
                                                            suggestions={filteredUsers}
                                                            completeMethod={searchUsers}
                                                            onChange={(e) => handleEmployeeSelection(e.value)}
                                                            field="fullName"
                                                            className="w-100"
                                                        />
                                                    </Col>
                                                    {selectedEmployeeId && ( // Show button if an employee is selected
                                                        <Col sm={12} lg={12} className="mb-3 ps-0">
                                                            <Button
                                                                variant="primary"
                                                                onClick={(event) => {
                                                                    event.preventDefault(); // Prevent form submission
                                                                    fetchSelectedUserDetails(selectedEmployeeId);
                                                                }}
                                                            >
                                                                Fetch User Details
                                                            </Button>
                                                        </Col>
                                                    )}


                                                </>
                                            ) : (
                                                <>
                                                    <Col sm={12} lg={12} className="mb-3 ps-0">
                                                        <Form.Label>Employee Name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={employeeName}
                                                            onChange={(e) => setEmployeeName(e.target.value)}
                                                            placeholder="Enter Employee Name"
                                                        />
                                                    </Col>
                                                    <Col sm={12} lg={12} className="mb-3 ps-0">
                                                        <Form.Label>Email</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            placeholder="Enter Email"
                                                        />
                                                    </Col>
                                                </>
                                            )}
                                            <Col sm={12} lg={12} className="mb-3 ps-0">
                                                <Form.Label>Select Template</Form.Label>
                                                <Form.Select
                                                    onChange={onTemplateSelect}
                                                    value={templateName} // Ensure this matches template_id
                                                >
                                                    <option disabled value="">
                                                        Select Template
                                                    </option>
                                                    {templates.map((template) => (
                                                        <option
                                                            key={template.template_id}
                                                            value={template.template_id}
                                                        >
                                                            {template.template_name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Col>

                                            <Col sm={12} lg={12}>
                                                {sections.map((section, index) => (
                                                    <div key={section.order_id} className="mb-3">
                                                        <Form.Label className="d-flex justify-content-between align-items-center">
                                                            <span>Section Title</span>
                                                            <div
                                                                className="d-flex justify-content-between mt-2 position-relative"
                                                                ref={(el) => (menuRefs.current[index] = el)}
                                                            >
                                                                <Button
                                                                    icon="pi pi-plus"
                                                                    className="border-0 p-0"
                                                                    outlined
                                                                    severity="help"
                                                                    onClick={(event) => {
                                                                        event.preventDefault();
                                                                        setOpenMenuIndex((prev) => (prev === index ? null : index));
                                                                    }}
                                                                />
                                                                {openMenuIndex === index && (
                                                                    <div className="floating-menu">
                                                                        <div
                                                                            className="menu-item"
                                                                            onClick={(event) => {
                                                                                event.preventDefault(); // Prevent form submission
                                                                                handleSectionAdd(index, 'above');
                                                                                setOpenMenuIndex(null);
                                                                            }}
                                                                        >
                                                                            <i className="pi pi-arrow-up"></i> Add Above
                                                                        </div>
                                                                        {employeeDetails && Object.keys(employeeDetails).length > 0 ? (
                                                                            <>
                                                                                <div
                                                                                    className="menu-item"
                                                                                    onClick={(event) => {
                                                                                        event.preventDefault(); // Prevent form submission
                                                                                        handleAddEmail(index, 'above');
                                                                                        setOpenMenuIndex(null);
                                                                                    }}
                                                                                >
                                                                                    <i className="pi pi-arrow-up"></i> Add Email Above
                                                                                </div>
                                                                                <div
                                                                                    className="menu-item"
                                                                                    onClick={(event) => {
                                                                                        event.preventDefault(); // Prevent form submission
                                                                                        handleAddRole(index, 'above');
                                                                                        setOpenMenuIndex(null);
                                                                                    }}
                                                                                >
                                                                                    <i className="pi pi-arrow-up"></i> Add Role Above
                                                                                </div>
                                                                                <div
                                                                                    className="menu-item"
                                                                                    onClick={(event) => {
                                                                                        event.preventDefault(); // Prevent form submission
                                                                                        handleAddJoiningDate(index, 'above');
                                                                                        setOpenMenuIndex(null);
                                                                                    }}
                                                                                >
                                                                                    <i className="pi pi-arrow-up"></i> Add Joining Date Above
                                                                                </div>
                                                                                <div
                                                                                    className="menu-item"
                                                                                    onClick={(event) => {
                                                                                        event.preventDefault(); // Prevent form submission
                                                                                        handleAddLastWorkingDate(index, 'above');
                                                                                        setOpenMenuIndex(null);
                                                                                    }}
                                                                                >
                                                                                    <i className="pi pi-arrow-up"></i> Add Last Working Date Above
                                                                                </div>
                                                                            </>
                                                                        ) : null}

                                                                        <div
                                                                            className="menu-item"
                                                                            onClick={(event) => {
                                                                                event.preventDefault(); // Prevent form submission
                                                                                handleSectionAdd(index, 'below');
                                                                                setOpenMenuIndex(null);
                                                                            }}
                                                                        >
                                                                            <i className="pi pi-arrow-down"></i> Add Below
                                                                        </div>
                                                                        {employeeDetails && Object.keys(employeeDetails).length > 0 ? (
                                                                            <>
                                                                                <div
                                                                                    className="menu-item"
                                                                                    onClick={(event) => {
                                                                                        event.preventDefault(); // Prevent form submission
                                                                                        handleAddEmail(index, 'below');
                                                                                        setOpenMenuIndex(null);
                                                                                    }}
                                                                                >
                                                                                    <i className="pi pi-arrow-down"></i> Add Email Below
                                                                                </div>
                                                                                <div
                                                                                    className="menu-item"
                                                                                    onClick={(event) => {
                                                                                        event.preventDefault(); // Prevent form submission
                                                                                        handleAddRole(index, 'below');
                                                                                        setOpenMenuIndex(null);
                                                                                    }}
                                                                                >
                                                                                    <i className="pi pi-arrow-down"></i> Add Role Below
                                                                                </div>
                                                                                <div
                                                                                    className="menu-item"
                                                                                    onClick={(event) => {
                                                                                        event.preventDefault(); // Prevent form submission
                                                                                        handleAddJoiningDate(index, 'below');
                                                                                        setOpenMenuIndex(null);
                                                                                    }}
                                                                                >
                                                                                    <i className="pi pi-arrow-down"></i> Add Joining Date Below
                                                                                </div>
                                                                                <div
                                                                                    className="menu-item"
                                                                                    onClick={(event) => {
                                                                                        event.preventDefault(); // Prevent form submission
                                                                                        handleAddLastWorkingDate(index, 'below');
                                                                                        setOpenMenuIndex(null);
                                                                                    }}
                                                                                >
                                                                                    <i className="pi pi-arrow-down"></i> Add Last Working Date Below
                                                                                </div>
                                                                            </>
                                                                        ) : null}

                                                                        <div
                                                                            className="menu-item"
                                                                            onClick={(event) => {
                                                                                event.preventDefault();
                                                                                handleSectionRemove(index);
                                                                                setOpenMenuIndex(null);
                                                                            }}
                                                                        >
                                                                            <i className="pi pi-trash"></i> Remove
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={section.section_heading}
                                                            onChange={(e) => handleSectionChange(index, 'section_heading', e.target.value)}
                                                        />
                                                        <Form.Label className="mt-2">Content</Form.Label>
                                                        <Editor
                                                            value={section.section_body}
                                                            onTextChange={(e) => handleSectionChange(index, 'section_body', e.htmlValue)}
                                                            style={{ height: '200px' }}
                                                        />
                                                    </div>
                                                ))}
                                            </Col>


                                            <Col sm={12} lg={12} className="mb-3 ps-0">
                                                <Form.Label>Admin Signature</Form.Label>
                                                <Form.Control
                                                    type="file"
                                                    onChange={(e) => handleSignatureUpload(e)}
                                                    accept="image/*"
                                                />
                                                {signatureImage && (
                                                    <div className="mt-3">
                                                        <img
                                                            src={URL.createObjectURL(signatureImage)}
                                                            alt="Signature Preview"
                                                            style={{ maxWidth: "100%", maxHeight: "200px" }}
                                                        />
                                                    </div>
                                                )}
                                            </Col>

                                            <Col sm={12} lg={12} className="mb-3 ps-0">
                                                <Form.Label>Admin Designation</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={admindesignation}
                                                    onChange={(e) => setAdminDesignation(e.target.value)}
                                                    placeholder="Enter Admin Designation"
                                                />
                                            </Col>

                                            <Col sm={12} lg={12} className="d-flex justify-content-end">
                                                <Button
                                                    type="submit"
                                                    icon="pi pi-save"
                                                    label="Save & Send"
                                                    severity="primary"
                                                />
                                            </Col>
                                        </Row>
                                    </Form>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col sm={12} lg={6}>
                        <Card className='h-auto'>
                            <Card.Body className='letterTable pb-0'>
                                <Table border={0}>
                                    <thead>
                                        <tr>
                                            <td className='p-0'><span className="d-block p-0 pb-4"><img src={logoImage} alt="brand-logo" style={{ width: '120px' }} /></span></td>
                                            <td className='text-end p-0'>
                                                <div className='d-flex justify-content-end'>
                                                    <p style={{ width: '252px' }}>
                                                        Godrej Genesis Building, 11th Floor, EN-34, EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700105
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <b className='ps-0 mb-2'>To,</b>
                                                <span className='d-block p-0'><b>{employeeName.fullName || employeeName}</b></span>
                                                <span className='d-block p-0'><b>{email || 'Email'}</b></span>
                                            </td>
                                            <td className="text-end">
                                                Date : {/*{date ? new Date(date).toLocaleDateString('en-GB') : 'DD / MM / YYYY'} */}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} className='pt-2'>
                                                <span className='ps-0 pe-0'>Subject : <b>{subject || 'Letter Subject'}</b></span>
                                            </td>
                                        </tr>
                                        {/* <tr>
                                            <td colSpan={2} className='pt-1'>
                                                <span className='ps-0 pe-0'>Offered Position : <b>{designation || 'NA'}</b></span>
                                            </td>
                                        </tr> */}
                                        {/* <tr>
                                            <td colSpan={5}>
                                                <div dangerouslySetInnerHTML={{ __html: html }} />
                                            </td>
                                        </tr> */}

                                        {sections.map((section, index) => (
                                            <tr key={index}>
                                                <td colSpan={2}>
                                                    <h5 className='mb-1'>{section.section_heading}</h5>
                                                    <div dangerouslySetInnerHTML={{ __html: section.section_body }}></div>
                                                </td>
                                            </tr>
                                        ))}

                                        <tr>
                                            <td colSpan={5} className="pt-4 text-end">
                                                <div>
                                                    {/* <p>Let us start rolling</p>
                                                    <p>Thanking you</p> */}
                                                    <div className='' style={{ flexDirection: 'column' }}>
                                                        {signatureImage && (
                                                            <span className='mt-2 mb-2'>
                                                                <img
                                                                    src={URL.createObjectURL(signatureImage)}
                                                                    alt="Signature"
                                                                    style={{ width: '110px', height: 'auto' }}
                                                                />
                                                            </span>
                                                        )}

                                                    </div>
                                                    <p className=''><span className='d-block'>{mainUserDetails?.first_name} {mainUserDetails?.last_name}</span> <small className='d-block'>{admindesignation || 'NA'} </small></p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>

                                    <tfoot>
                                        <tr>
                                            <td colSpan={5} className="text-center">
                                                <small className='text-secondary'> Godrej Genesis Building, 11th Floor, EN-34, EN Block, Sector V, Kolkata, West Bengal 700105</small> <br />
                                                <small className='text-secondary'>Email : <a href="mailto:Saurabh@thegraphe.com" className="text-primary">Saurabh@thegraphe.com</a></small>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </Table>

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Row >
            <Dialog visible={videoDialogVisible} className='fadeInUp_dilog'
                onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                <video src={successVideo} autoPlay loop muted style={{ width: '100%' }} />
                <h6 className="text-center mt-0 fadeInUp">Process Completed <span className='text-success'>Successfully</span></h6>
            </Dialog>


            <Dialog visible={videocrossDialogVisible} className='fadeInUp_dilog'
                onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                <video src={crossVideo} autoPlay loop muted style={{ width: '100%' }} />
                <h6 className="text-center mt-0 fadeInUp">Process <span className='text-danger'>Denied</span></h6>
            </Dialog>
        </>
    );
};
export default Send_letter;