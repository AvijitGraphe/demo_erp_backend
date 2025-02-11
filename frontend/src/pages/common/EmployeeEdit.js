import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Breadcrumb, Form, InputGroup, Card, Badge, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../../assets/css/profile.css';
import axios from 'axios';
import { TabView, TabPanel } from 'primereact/tabview';
import { MDBProgress, MDBProgressBar } from 'mdb-react-ui-kit';
import Table from 'react-bootstrap/Table';
import { Dialog } from 'primereact/dialog';
import Profileinformation from '../../modalPopup/Profileinformation';
import Emergencycontact from '../../modalPopup/Emergencycontact';
import Bankinformation from '../../modalPopup/Bankinformation';
import EducationInformation from '../../modalPopup/EducationInformation';
import { FiEdit3 } from "react-icons/fi";
import { IoChevronBackOutline } from "react-icons/io5";
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { AiTwotoneAlert } from "react-icons/ai";
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import CustomConfirmPopup from "../../components/CustomConfirmPopup";
import successVideo from '../../assets/video/paperplane.mp4';

const EmployeeEdit = () => {
    const navigate = useNavigate();
    const [checked, setChecked] = useState(true);
    const [visibleModal1, setVisibleModal1] = useState(false);
    const [visibleModal2, setVisibleModal2] = useState(false);
    const [visibleModal3, setVisibleModal3] = useState(false);
    const [visibleModal4, setVisibleModal4] = useState(false);
    const [visibleModal5, setVisibleModal5] = useState(false);
    const { accessToken } = useAuth(); // Get userId from the context
    const { user_id } = useParams(); // Get the user_id from the URL params
    const [userDetails, setUserDetails] = useState(null);
    const [bankDetails, setBankDetails] = useState(null);
    const [educationInfo, setEducationInfo] = useState([]);
    const [emergencyContact, setEmergencyContact] = useState(null);
    const [mainUserDetails, setMainUserDetails] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [salary, setSalary] = useState({
        Salary_basis: '',
        Salary_Amount: '',
        Payment_type: '',
        Ptax: '', // Add Ptax field
    });

    const [salaryId, setSalaryId] = useState(null); // Store Salary_id for editing

    // Function to navigate back to the previous page
    const goBack = () => {
        navigate(-1); // This will take the user back to the previous page in history
    };
    const [formData, setFormData] = useState({
        resignation_reason: '',
        last_working_day: '',
    });
    const [videoDialogVisible, setVideoDialogVisible] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                const response = await axios.get(
                    `${config.apiBASEURL}/profile-image/profile-image/${user_id}`,
                    { headers } // Add the headers object here
                );
                setProfileImageUrl(response.data.imageUrl);
            } catch (error) {
                console.error('Error fetching profile image:', error);
                // Handle error as needed
            }
        };

        fetchProfileImage();
    }, [user_id, accessToken]); // Include userId and accessToken in dependency array to refetch on change

    const onUpload = async (event) => {
        try {
            // The response from the XMLHttpRequest is available in event.xhr.response
            const response = JSON.parse(event.xhr.response);  // Parse the response manually

            const newImageUrl = response.imageUrl;  // Extract image URL from the response
            setProfileImageUrl(newImageUrl);  // Update the profile image URL in the state
        } catch (error) {
            console.error('Error handling upload response:', error);
        }
    };

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(
                `${config.apiBASEURL}/user-profile/getUserDetails?userId=${user_id}`,
                { headers }
            );
            setUserDetails(response.data);
        } catch (err) {
            console.error("Error fetching user details:", err.message);
        }
    };


    const fetchBankDetails = async () => {
        try {
            const response = await axios.get(
                `${config.apiBASEURL}/user-profile/getBankDetails?userId=${user_id}`,
                { headers }
            );

            setBankDetails(response.data);
        } catch (err) {
            console.error("Error fetching bank details:", err.message);
        }
    };


    const fetchEducationInfo = async () => {
        try {
            const response = await axios.get(
                `${config.apiBASEURL}/user-profile/getEducationInfo?userId=${user_id}`,
                { headers }
            );

            setEducationInfo(response.data);
        } catch (err) {
            console.error("Error fetching education info:", err.message);
        }
    };


    const fetchEmergencyContact = async () => {
        try {
            const response = await axios.get(
                `${config.apiBASEURL}/user-profile/getEmergencyContact?userId=${user_id}`,
                { headers }
            );
            setEmergencyContact(response.data);
        } catch (err) {
            console.error("Error fetching emergency contact:", err.message);
        }
    };


    const fetchMainUserDetails = async () => {
        try {
            const response = await axios.get(
                `${config.apiBASEURL}/user-profile/main-user-details?userId=${user_id}`,
                { headers }
            );

            setMainUserDetails(response.data);
        } catch (err) {
            console.error("Error fetching main user details:", err.message);
        }
    };


    useEffect(() => {
        if (!user_id || !accessToken) return;
        fetchBankDetails();
        fetchUserDetails();
        fetchEducationInfo();
        fetchEmergencyContact();
        fetchMainUserDetails();
    }, [user_id, accessToken]);





    // Fetch salary data on mount
    const fetchSalaryData = async () => {
        try {
            const response = await axios.get(
                `${config.apiBASEURL}/salaryRoutes/salary/${user_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, // Add authorization header
                    },
                }
            );

            if (response.data && response.data.data) {
                const data = response.data.data;
                setSalary({
                    Salary_basis: data.Salary_basis || '',
                    Salary_Amount: data.Salary_Amount || '',
                    Payment_type: data.Payment_type || '',
                    Ptax: data.Ptax || '', // Include Ptax
                });
                setSalaryId(data.Salary_id || null);
            } else {
                setSalary({
                    Salary_basis: '',
                    Salary_Amount: '',
                    Payment_type: '',
                    Ptax: '', // Reset Ptax
                });
                setSalaryId(null);
            }
        } catch (error) {
            console.error('Error fetching salary data:', error);
        }
    };

    useEffect(() => {
        fetchSalaryData();
    }, [user_id, accessToken]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setSalary((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };


    // Submit form for adding or updating
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${config.apiBASEURL}/salaryRoutes/salary`,
                {
                    ...salary,
                    user_id,
                    Salary_id: salaryId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (salaryId) {
                fetchSalaryData();
            } else {
                setSalaryId(response.data.data.Salary_id);
                fetchSalaryData();
            }
        } catch (error) {
            console.error('Error submitting salary data:', error);
        }
    };



    const openModalWithUserId = () => {
        setVisibleModal2(true);
    }

    const openModalWithUser = () => {
        setVisibleModal3(true);
    }



    const openModalWith = () => {
        setVisibleModal4(true);
    }


    const openModalWithedu = () => {
        setVisibleModal5(true);
    }




    const openModalWithu = () => {
        setVisibleModal1(true);
    }

    const handleDialogOpen = (resignation = null) => {
        setFormData({
            resignation_reason: resignation?.resignation_reason || '',
            last_working_day: resignation?.last_working_day || '',
        });
        setShowDialog(true);
    };



    const handleDialogClose = () => {
        setShowDialog(false);
        setFormData({

            resignation_reason: '',
            last_working_day: '',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    const handleresignationSubmit = async () => {
        try {
            const response = await axios.post(
                `${config.apiBASEURL}/resignationRoutes/admin_termination`,
                { ...formData, user_id: user_id },
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            setShowDialog(false);
            setVideoDialogVisible(true); // Show video dialog
            setTimeout(() => {

                setVideoDialogVisible(false); // Hide video dialog after 6 seconds

                fetchBankDetails();
                fetchUserDetails();
                fetchEducationInfo();
                fetchEmergencyContact();
                fetchMainUserDetails();
            }, 5000);
        } catch (error) {
            console.error('Error submitting resignation:', error);

        }
    };



    return (
        <>
            <Row className='body_content'>
                <Row className='mx-0'>
                    <Col md={6} lg={9} className='mb-4'>
                        <Breadcrumb>
                            <Breadcrumb.Item onClick={goBack}>
                                <IoChevronBackOutline /> Back
                            </Breadcrumb.Item>
                            <Breadcrumb.Item active>Profile</Breadcrumb.Item>
                        </Breadcrumb>

                    </Col>
                    <Card className='addEm p-0 profile_caed mb-3'>
                        <Card.Header className='p-0 border-0'>
                            {(mainUserDetails?.resignations?.[0]?.last_working_day || mainUserDetails?.role?.role_name === 'Unverified') && (
                                <Alert variant="danger" className="p-2 px-3 mt-0" style={{ borderRadius: '0' }}>
                                    <p className="mb-0 d-flex align-items-center" style={{ lineHeight: '1.3' }}>
                                        <span style={{ fontSize: '26px' }}><AiTwotoneAlert /></span>
                                        <small className="ps-2">
                                            {mainUserDetails?.resignations?.[0]?.last_working_day ? (
                                                <>
                                                    Last working day of this employee {' '}
                                                    <b>
                                                        {new Date(mainUserDetails.resignations[0].last_working_day).toLocaleDateString('en-GB')}
                                                    </b>.
                                                </>
                                            ) : (
                                                <>
                                                    Please share your Aadhar card and PAN card images or PDF to{' '}
                                                    <b>saurabh@thegraphe.com</b> for the Admin to cross-check and verify your account.
                                                </>
                                            )}
                                        </small>
                                    </p>
                                </Alert>
                            )}

                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col lg='6' md='6' className='position-relative'>
                                    <div className='d-flex align-items-center'>
                                        <div className='position-relative'>
                                            <img
                                                src={profileImageUrl ? profileImageUrl : require("../../assets/images/no_user.png")}
                                                alt=''
                                                style={{ width: '120px', height: '120px' }}
                                                className='rounded-circle'
                                            />
                                            {/* <FileUpload
                                                mode="basic"
                                                name="image"  // Change the name to 'image' as expected by the backend
                                                url={`${config.apiBASEURL}/profile-image/upload-or-update-profile-image/${user_id}`}
                                                accept="image/*"
                                                maxFileSize={300000}  // 300KB
                                                onUpload={onUpload}
                                                auto
                                                className='FlUpload'
                                            /> */}
                                        </div>
                                        <div className='ms-3'>
                                            <h3 className='fw-bold mb-0 text-black'>{mainUserDetails?.first_name} {mainUserDetails?.last_name}<small className='digi'>{mainUserDetails?.role?.role_name || 'Not Specified'}</small></h3>
                                            <p className='text-muted mb-1'>
                                                <small>{userDetails?.forte || 'Not Provided Yet'}</small>
                                            </p>
                                            <p className='text-black mb-0'>
                                                <small>
                                                    {mainUserDetails?.resignations && mainUserDetails.resignations.length > 0 ? (
                                                        <>
                                                            Last working day:{' '}
                                                            {mainUserDetails.resignations[0]?.last_working_day
                                                                ? new Date(mainUserDetails.resignations[0].last_working_day).toLocaleDateString('en-GB')
                                                                : 'Not Available'}
                                                        </>
                                                    ) : (
                                                        <>
                                                            Date of Joining:{' '}
                                                            {mainUserDetails?.joiningDates?.[0]?.joining_date
                                                                ? new Date(mainUserDetails.joiningDates[0].joining_date).toLocaleDateString('en-GB')
                                                                : 'Not Available'}
                                                        </>
                                                    )}

                                                </small>
                                                {mainUserDetails?.resignations?.length === 0 &&
                                                    !['Founder', 'Admin', 'SuperAdmin', 'Ex_employee', 'Unverified'].includes(mainUserDetails?.role?.role_name) && (
                                                        <Button
                                                            title="Terminate Employee"
                                                            severity="danger"
                                                            icon="pi pi-user-minus"
                                                            onClick={() => handleDialogOpen()}
                                                            outlined
                                                            className="border-0 ms-3"
                                                        />
                                                    )}


                                            </p>

                                            <p className='text-black mb-0'>
                                                <small>
                                                    Reporting Time :{' '}
                                                    <span>
                                                        {mainUserDetails?.userTimes?.[0]?.start_time?.trim()
                                                            ? mainUserDetails.userTimes[0].start_time
                                                            : 'Not Provided Yet'}
                                                    </span>
                                                </small>

                                            </p>
                                        </div>

                                    </div>

                                    <div
                                        className="worterMark"
                                        style={{ position: 'absolute', left: '-15px', top: '-15px' }}
                                    >
                                        <Badge
                                            className={mainUserDetails?.attendances?.[0]?.checkin_status ? "bg-success" : "bg-secondary"}
                                        >
                                            {mainUserDetails?.attendances?.[0]?.checkin_status ? "Office" : "Offline"}
                                        </Badge>
                                    </div>



                                </Col>
                                <Col lg='6' md='6' className='border-start ps-lg-5'>
                                    <table className='table pro_table'>
                                        <tr>
                                            <th>Phone :</th>
                                            <td>
                                                <a href="#!" className="p-0 m-0">{userDetails?.phone || "Not Available"}</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Email :</th>
                                            <td>
                                                <a href="#!" className="p-0 m-0">{mainUserDetails?.email || "Not Available"}</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Birthday :</th>
                                            <td>
                                                {userDetails?.date_of_birth
                                                    ? new Date(userDetails.date_of_birth).toLocaleDateString('en-GB')
                                                    : "Not Available"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Address :</th>
                                            <td>{userDetails?.address || "Not Available"}</td>
                                        </tr>
                                        <tr>
                                            <th>Pincode :</th>
                                            <td>{userDetails?.pincode || "Not Available"}</td>
                                        </tr>
                                        <tr>
                                            <th>City :</th>
                                            <td>{userDetails?.city || "Not Available"}</td>
                                        </tr>
                                        <tr>
                                            <th>Gender :</th>
                                            <td>{userDetails?.gender || "Not Available"}</td>
                                        </tr>
                                    </table>
                                </Col>

                            </Row>
                        </Card.Body>
                    </Card>

                    <Card className='addEm p-0 shadow-0'>
                        <TabView>
                            <TabPanel header="Profile" leftIcon="pi pi-user mr-2">
                                <Row className='mx-0 justify-content-between'>
                                    <Col lg='6' md='6' className='pcl-card border-end pe-lg-5 mb-3'>
                                        <Card className='shadow-0'>
                                            <Card.Body>
                                                <Card.Title>Personal Informations</Card.Title>
                                                <table className='table pro_table'>
                                                    <tr>
                                                        <th>Pan card No. :</th>
                                                        <td>{userDetails?.pan_card_no}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Passport No. :</th>
                                                        <td>{userDetails?.passport_no}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Aadhar No. :</th>
                                                        <td>{userDetails?.aadhar_no}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Nationality :</th>
                                                        <td>{userDetails?.nationality}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Religion :</th>
                                                        <td>{userDetails?.religion}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Marital status :</th>
                                                        <td>{userDetails?.marital_status || 'Not set'}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Employment of spouse :</th>
                                                        <td>{userDetails?.employment_of_spouse || 'Not set'}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>No. of children :</th>
                                                        <td>{userDetails?.no_of_children || 'Not set'}</td>
                                                    </tr>
                                                </table>
                                                <div className='pro-edit'>
                                                    <a className='edit-icon' onClick={openModalWithu}>
                                                        <FiEdit3 />
                                                    </a>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col lg="6" md="6" className="pcl-card border-end pe-lg-5 mb-3">
                                        <Card className="shadow-0">
                                            <Card.Body>
                                                <Card.Title>Bank Information</Card.Title>
                                                <table className="table pro_table">
                                                    <tr>
                                                        <th>Bank Name:</th>
                                                        <td>{bankDetails?.bank_name || 'Not set'}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Bank Account No.:</th>
                                                        <td>{bankDetails?.bank_account_no || 'Not set'}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Account Holder's Name:</th>
                                                        <td>{bankDetails?.accountHolder_name || 'Not set'}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>IFSC Code:</th>
                                                        <td>{bankDetails?.ifsc_code || 'Not set'}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Branch Name:</th>
                                                        <td>{bankDetails?.branch_name || 'Not set'}</td>
                                                    </tr>
                                                </table>
                                                <div className="pro-edit">
                                                    <a href="#!" className="edit-icon" onClick={openModalWith}>
                                                        <FiEdit3 />
                                                    </a>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <hr />
                                    <Col lg="6" md="6" className="pcl-card mb-3">
                                        <Card className="shadow-0">
                                            <Card.Body>
                                                <Card.Title>Education Information</Card.Title>
                                                <table className="table pro_table">
                                                    {educationInfo && educationInfo.length > 0 ? (
                                                        educationInfo.map((info) => (
                                                            <tr key={info.id_educational_info}>
                                                                <td colSpan={2}>
                                                                    <h6>Institute: {info.institute}</h6>
                                                                    <p>Degree: {info.degree_name}</p>
                                                                    <small>Year of Passing: {info.year_of_passing}</small>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={2}>Education information not added</td>
                                                        </tr>
                                                    )}
                                                </table>
                                                <div className="pro-edit">
                                                    <a href="#!" className="edit-icon" onClick={openModalWithedu}>
                                                        <FiEdit3 />
                                                    </a>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                    <Col lg="6" md="6" className="pcl-card mb-3">
                                        <Card className="shadow-0">
                                            <Card.Body>
                                                <Card.Title>Emergency Contact</Card.Title>
                                                <table className="table pro_table">
                                                    {emergencyContact && emergencyContact.length > 0 ? (
                                                        emergencyContact.map((contact) => (
                                                            <tr key={contact.id_emergency_contact}>
                                                                <td colSpan={2}>
                                                                    <h6>Name of Contact: {contact.name}</h6>
                                                                    <p>Relationship: {contact.relationship}</p>
                                                                    <small>Contact No: {contact.phone}</small>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={2}>Emergency Contact information not added</td>
                                                        </tr>
                                                    )}
                                                </table>
                                                <div className="pro-edit">
                                                    <a href="#!" className="edit-icon" onClick={openModalWithUser}>
                                                        <FiEdit3 />
                                                    </a>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>




                                </Row>
                            </TabPanel>
                            <TabPanel header="Bank & Statutory(Admin Only)">
                                <Form onSubmit={handleSubmit}>
                                    <Row className="mx-0 justify-content-between">
                                        <Col className="pcl-card mb-3">
                                            <Card className="shadow-0">
                                                <Card.Body>
                                                    <Card.Title>Basic Salary Information</Card.Title>
                                                    <Row>
                                                        <Col lg="4" md="6">
                                                            <Form.Label>Salary basis *</Form.Label>
                                                            <Form.Select
                                                                size="lg"
                                                                name="Salary_basis"
                                                                value={salary.Salary_basis}
                                                                onChange={handleChange}
                                                                required
                                                            >
                                                                <option disabled value="">Please Select</option>
                                                                <option value="Monthly">Monthly</option>
                                                                <option value="Weekly">Weekly</option>
                                                                <option value="Hourly">Hourly</option>
                                                                <option value="Daily">Daily</option>
                                                            </Form.Select>
                                                        </Col>
                                                        <Col lg="4" md="6">
                                                            <Form.Label>Salary amount (₹)</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                step="0.01"
                                                                name="Salary_Amount"
                                                                placeholder="0.00"
                                                                value={salary.Salary_Amount}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                        </Col>
                                                        <Col lg="4" md="6">
                                                            <Form.Label>Payment type</Form.Label>
                                                            <Form.Select
                                                                size="lg"
                                                                name="Payment_type"
                                                                value={salary.Payment_type}
                                                                onChange={handleChange}
                                                                required
                                                            >
                                                                <option disabled value="">Please Select</option>
                                                                <option value="Bank_transfer">Bank transfer</option>
                                                                <option value="Check">Check</option>
                                                                <option value="Cash">Cash</option>
                                                                <option value="Demand_draft">Demand draft</option>
                                                            </Form.Select>
                                                        </Col>
                                                        <Col lg="4" md="6">
                                                            <Form.Label>Professional Tax (Ptax) (₹)</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                step="0.01"
                                                                name="Ptax"
                                                                placeholder="0.00"
                                                                value={salary.Ptax}
                                                                onChange={handleChange}
                                                                required
                                                            />
                                                        </Col>
                                                    </Row>

                                                    <Row className="mt-4">
                                                        <Col>
                                                            <Button
                                                                type="submit"
                                                                variant="primary"
                                                            >
                                                                {salaryId ? 'Update Salary' : 'Add Salary'}
                                                            </Button>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Form>
                            </TabPanel>
                            <TabPanel header="Assets" leftIcon="pi pi-folder-open mr-2">
                                <p className="m-0">
                                    At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti
                                    quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in
                                    culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.
                                    Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.
                                </p>
                            </TabPanel>
                        </TabView>
                    </Card>
                </Row>
            </Row>

            {/*-- Modal part ---*/}
            <Dialog header="Profile Information" aria-labelledby="proIn" visible={visibleModal1} style={{ width: '50vw' }} onHide={() => {
                setVisibleModal1(false);
                fetchUserDetails(); // Fetch data on close
            }}>
                {visibleModal1 && <Profileinformation userId={user_id} userDetails={userDetails} setVisibleModal1={setVisibleModal1} fetchUserDetails={fetchUserDetails} />}
            </Dialog>
            <Dialog header="Bank Information" visible={visibleModal4} style={{ width: '50vw' }} onHide={() => {
                setVisibleModal4(false);
                fetchBankDetails(); // Fetch data on close
            }}>
                {visibleModal4 && <Bankinformation userId={user_id} bankInfo={bankDetails} setVisibleModal4={setVisibleModal4} fetchBankDetails={fetchBankDetails} />}
            </Dialog>
            <Dialog header="Emergency Contacts" visible={visibleModal3} style={{ width: '50vw' }} onHide={() => {
                setVisibleModal3(false);
                fetchEmergencyContact();
            }}>
                {visibleModal3 && <Emergencycontact userId={user_id} emergencyContacts={emergencyContact} setVisibleModal3={setVisibleModal3} fetchEmergencyContacts={fetchEmergencyContact} />}
            </Dialog>



            <Dialog header="Education Information" visible={visibleModal5} style={{ width: '40vw' }} onHide={() => {
                setVisibleModal5(false);
                fetchEducationInfo(); // Fetch data on close
            }}>
                {visibleModal5 && <EducationInformation userId={user_id} educationalInfo={educationInfo} setVisibleModal5={setVisibleModal5} fetchEducationalInfo={fetchEducationInfo} />}
            </Dialog>


            <Dialog
                visible={showDialog}
                onHide={handleDialogClose}
                style={{ width: '30vw' }}
                header={'Terminate Employee'}
                footer={
                    <div>
                        <Button
                            label="Cancel"
                            className='me-2 py-2 '
                            severity='danger'
                            icon="pi pi-times"
                            onClick={handleDialogClose}
                        />
                        <Button
                            label="Submit"
                            className='py-2'
                            severity='success'
                            icon="pi pi-check"
                            onClick={handleresignationSubmit}
                        />
                    </div>
                }
            >
                <div className="p-field mt-3">
                    <label htmlFor="last_working_day" className="mb-2">Last Working Day</label>
                    <InputText
                        id="last_working_day"
                        name="last_working_day"
                        type="date"
                        value={formData.last_working_day}
                        onChange={handleInputChange}
                        className="w-100"
                    />
                </div>
                <div className="p-field mt-3">
                    <label htmlFor="resignation_reason" className='mb-2'>Reason</label>
                    <InputTextarea
                        id="resignation_reason"
                        name="resignation_reason"
                        value={formData.resignation_reason}
                        onChange={handleInputChange}
                        rows={5}
                        className="h-auto"
                    />
                </div>


            </Dialog>

            <Dialog visible={videoDialogVisible} className='fadeInUp_dilog'
                onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                <video src={successVideo} autoPlay loop muted style={{ width: '100%' }} />
                <h6 className="text-center mt-0 fadeInUp">Process Completed <span className='text-success'>Successfully</span></h6>
            </Dialog>

        </>
    )
};

export default EmployeeEdit;