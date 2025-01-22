import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Breadcrumb, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Assuming React Router is used
import { Button } from 'primereact/button';
import successVideo from '../../assets/video/paperplane.mp4';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import CustomConfirmPopup from "../../components/CustomConfirmPopup";


const ResignationTable = () => {
    const { accessToken } = useAuth();
    const [selecteduserId, setselectedUserId] = useState(null); // State to store selected user ID
    const [resignations, setResignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate(); // Hook to programmatically navigate
    const [formData, setFormData] = useState({
        resignation_id: null,
        resignation_reason: '',
        notice_period_served: false,
    });
    const [showDialog, setShowDialog] = useState(false);
    const [videoDialogVisible, setVideoDialogVisible] = useState(false);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersResponse = await axios.get(
                    `${config.apiBASEURL}/projectRoutes/fetch-all-users`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                setUsers(usersResponse.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchData();
    }, [accessToken]);





    const fetchResignations = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/resignationRoutes/fetch-all-resignations`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setResignations(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching resignations:', err);
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchResignations();
    }, []);

    const handleViewTemplate = (resignation_id) => {
        navigate(`/dashboard/reg_view_template/${resignation_id}`);
    };


    const handleDialogOpen = (resignation = null) => {
        setFormData({
            resignation_id: resignation?.resignation_id || null,
            resignation_reason: resignation?.resignation_reason || '',
            notice_period_served: resignation?.notice_period_served || false,
        });
        setselectedUserId(resignation?.user_id || null); // Use optional chaining and fallback to null if no user_id
        setShowDialog(true);
    };
    

    const handleDialogClose = () => {
        setShowDialog(false);
        setFormData({
            resignation_id: null,
            resignation_reason: '',
            notice_period_served: false,
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
        const { checked } = e.target;
        setFormData((prev) => ({ ...prev, notice_period_served: checked }));
    };
    const handleUserChange = (e) => {
        setselectedUserId(e.target.value); // Update selected user ID
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post(
                `${config.apiBASEURL}/resignationRoutes/add-resignation`,
                { ...formData, user_id: selecteduserId },
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            setShowDialog(false);
            setVideoDialogVisible(true); // Show video dialog
            setTimeout(() => {
                setVideoDialogVisible(false); // Hide video dialog after 6 seconds
                fetchResignations(); // Refresh data
            }, 5000);
        } catch (error) {
            console.error('Error submitting resignation:', error);

        }
    };


    const handleDelete = async (resignation_id) => {
        try {
            const response = await axios.delete(
                `${config.apiBASEURL}/resignationRoutes/delete-resignation/${resignation_id}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            // Update the state to remove the deleted resignation
            setShowDialog(false);
            setVideoDialogVisible(true); // Show video dialog
            setTimeout(() => {
                setVideoDialogVisible(false); // Hide video dialog after 6 seconds
                fetchResignations(); // Refresh data
            }, 5000);
        } catch (error) {
            console.error('Error deleting resignation:', error);

        }
    };






    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }


    const getStatusBadgeVariant = (status) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'success'; // Green badge
            case 'pending':
                return 'warning'; // Yellow badge
            case 'rejected':
                return 'danger'; // Red badge
            case 'in review':
                return 'info'; // Blue badge
            default:
                return 'secondary'; // Gray badge for unknown status
        }
    };
    const ResignationStatusBadge = ({ status }) => (
        <Badge bg={getStatusBadgeVariant(status)}>{status}</Badge>
    );


    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col sm={12} className="mb-4 d-flex justify-content-between align-items-center">
                        <Breadcrumb>
                            <Breadcrumb.Item active>Resignation List</Breadcrumb.Item>
                        </Breadcrumb>
                        {/* <Button
                            label="Add User Resignation"
                            severity="warning"
                            icon="pi pi-plus"
                            onClick={() => handleDialogOpen()}
                        /> */}
                    </Col>


                    {resignations.map((resignation) => (
                        <Card key={resignation.resignation_id} className='px-0 pt-3 mb-3'>
                            <Card.Header className='d-flex justify-content-between align-items-center border-0'>
                                <div className='d-flex align-items-center'>
                                    {resignation.user.profileImage ? (
                                        <img
                                            src={resignation.user.profileImage.image_url}
                                            alt="Profile"
                                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                        />
                                    ) : (
                                        'N/A'
                                    )}
                                    <h6 className='ms-2'>
                                        {resignation.user.first_name} {resignation.user.last_name}
                                        <small className='text-secondary d-block' style={{ textTransform: 'lowercase', fontWeight: '500' }}>{resignation.user.email}</small>
                                    </h6>
                                </div>
                                <div className='text-end'>
                                    <small className='text-secondary d-block'><em>Application Date</em> : <span className='text-dark'>{new Date(resignation.resignation_date).toLocaleDateString('en-GB')}</span></small>
                                    <small className='text-secondary d-block'><em>Status</em> : <ResignationStatusBadge className='ms-2' status={resignation.status} /> </small>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <p className='mb-0'>
                                    <span className='d-block'><b>Reason</b> :</span>
                                    {resignation.resignation_reason || 'N/A'}
                                </p>
                            </Card.Body>
                            <Card.Footer className='border-0 bg-light'>
                                <Row className='align-items-center'>
                                    <Col md={4} lg={3} xs={6} className='mb-2 p-0'>
                                        <p className='m-0'>
                                            <small className='text-primary d-block'>Notice Period</small>
                                            <b>{resignation.notice_period_served ? 'Willing' : 'Not Willing'}</b>
                                        </p>
                                    </Col>
                                    <Col md={4} lg={3} xs={6} className='mb-2'>
                                        <p className='text-center m-0'>
                                            <small className='text-primary d-block'>Notice Duration</small>
                                            <b>{resignation.notice_duration || 'N/A'}</b>
                                        </p>
                                    </Col>
                                    <Col md={4} lg={3} xs={6} className='mb-2 '>
                                        <p className='text-center m-0'>
                                            <small className='text-primary d-block'>Last Working Day</small>
                                            <b>
                                                {new Date(resignation.last_working_day).toLocaleDateString('en-GB')}

                                            </b>
                                        </p>
                                    </Col>
                                    <Col md={4} lg={3} xs={6} className='mb-2 p-0'>
                                        <p className='text-end m-0'>
                                            <Button
                                                onClick={() => handleViewTemplate(resignation.resignation_id)}
                                                severity='info'
                                                size="sm"
                                                outlined
                                                title="View"
                                                icon="pi pi-eye"
                                                className='me-2 border-0'

                                            />
                                            {resignation.status === 'Pending' && (
                                                <Button
                                                    onClick={() => handleDialogOpen(resignation)}
                                                    title="Edit"
                                                    icon="pi pi-pencil"
                                                    outlined
                                                    className='me-2 border-0'
                                                    severity='help'
                                                />


                                            )}

                                            {resignation.status === 'Pending' && (
                                                <CustomConfirmPopup
                                                    message="Are you sure you want to Delete Resignation?"
                                                    icon="pi pi-exclamation-triangle"
                                                    defaultFocus="accept"
                                                    acceptClassName="p-button-danger"
                                                    buttonLabel="Delete"
                                                    title="Delete Resignation"
                                                    buttonClass="p-button-secondary p-button-text"
                                                    className="border-0 p-0"
                                                    buttonIcon="pi pi-trash"
                                                    onConfirm={() => handleDelete(resignation.resignation_id)}
                                                    onReject={() => console.log('Duplicate action canceled')}
                                                />

                                            )}


                                        </p>
                                    </Col>
                                </Row>
                            </Card.Footer>
                        </Card>

                    ))}
                </Row>
            </Row>

            <Dialog
                visible={showDialog}
                onHide={handleDialogClose}
                style={{ width: '30vw' }}
                header={formData.resignation_id ? 'Edit Resignation' : 'Add Resignation'}
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
                            onClick={handleSubmit}
                        />
                    </div>
                }
            >
                <div className="p-field">
                    <label htmlFor="select_user" className='mb-2'>Select User</label>
                    <select
                        id="select_user"
                        value={selecteduserId || ''} // Set selected value
                        onChange={handleUserChange}
                        className="form-control"
                        disabled={!!formData.resignation_id} // Disable if in edit mode
                    >
                        <option value="" disabled>Select a user</option>
                        {users.map((user) => (
                            <option key={user.user_id} value={user.user_id}>
                                {user.first_name} {user.last_name}
                            </option>
                        ))}
                    </select>
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
                <div className="p-field-checkbox mt-2">
                    <Checkbox
                        inputId="notice_period_served"
                        checked={formData.notice_period_served}
                        onChange={handleCheckboxChange}
                        className='me-2'
                    />
                    <label htmlFor="notice_period_served">Serve Notice Period</label>
                </div>
            </Dialog>

            <Dialog visible={videoDialogVisible} className='fadeInUp_dilog'
                onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                <video src={successVideo} autoPlay loop muted style={{ width: '100%' }} />
                <h6 className="text-center mt-0 fadeInUp">Process Completed <span className='text-success'>Successfully</span></h6>
            </Dialog>


        </>
    );
};

export default ResignationTable;
