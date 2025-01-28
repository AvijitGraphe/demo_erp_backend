import React, { useState, useEffect } from 'react';
import { Card, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/AuthContext';
import { Tooltip } from 'primereact/tooltip';

const Pendingleave = ({ pendingLeaves, fetchLeaveRequests }) => {
    const { accessToken, userId } = useAuth();
    const [leaveRequests, setLeaveRequests] = useState(pendingLeaves);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedLeaveType, setSelectedLeaveType] = useState(null);
    const [errorMessage, setErrorMessage] = useState(''); // State to hold error message
    useEffect(() => {
        setLeaveRequests(pendingLeaves);
    }, [pendingLeaves]);


    const statusOptions = [
        { name: 'Approved', code: 'Approved' },
        { name: 'Rejected', code: 'Rejected' },
    ];

    const handleStatusChange = (id, newStatus) => {
        setLeaveRequests((prev) =>
            prev.map((leave) =>
                leave.Leave_request_id === id ? { ...leave, Status: newStatus } : leave
            )
        );
    };

    const handleCommentChange = (id, newComment) => {
        setLeaveRequests((prev) =>
            prev.map((leave) =>
                leave.Leave_request_id === id ? { ...leave, Comment: newComment } : leave
            )
        );
    };

    const handleSave = async (id) => {
        const leaveRequest = leaveRequests.find((leave) => leave.Leave_request_id === id);
        if (!leaveRequest) return;

        const { Status, Comment } = leaveRequest;

        try {
            const response = await axios.put(
                `${config.apiBASEURL}/leaveRoutes/update-leave-status`,
                {
                    Leave_request_id: id,
                    Approved_By: userId,
                    Status,
                    Comment,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (response.data.success) {
                fetchLeaveRequests(); // Refresh leave requests
            }
        } catch (error) {
            console.error('Error updating leave status:', error);
        }
    };

    // Fetch leave balances for the selected user

    const fetchLeaveBalances = async (user_id) => {
        try {
            const response = await axios.get(
                `${config.apiBASEURL}/leaveRoutes/fetch-user-leave-balances/${user_id}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            setLeaveBalances(response.data.data); // Set leave balances array
        } catch (error) {
            console.error('Error fetching leave balances:', error);
        }
    };

    const handleOpenDialog = (request) => {
        setSelectedRequest(request);
        fetchLeaveBalances(request.requestor.User_id);
        setShowDialog(true);
    };

    const handleSaveLeaveType = async () => {
        if (!selectedRequest || !selectedLeaveType) {
            setErrorMessage('Please select a leave type.');
            return;
        }

        try {
            const response = await axios.put(
                `${config.apiBASEURL}/leaveRoutes/update-leave-type`,
                {
                    leave_request_id: selectedRequest.Leave_request_id,
                    new_leave_type_id: selectedLeaveType.leave_type_id,
                },
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            // Check for status 200
            if (response.status === 200) {
                fetchLeaveRequests(); // Refresh leave requests
                setShowDialog(false); // Close dialog
                setErrorMessage(''); // Clear error message
            }
        } catch (error) {
            console.error('Error updating leave type:', error);
            // Extract the error message based on the API response structure
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage("An unexpected error occurred. Please try again.");
            }
        }
    };


    return (
        <Card className="shadow-0">
            <Table hover bordered size="sm" className="table-responsive">
                <thead>
                    <tr>
                        <th style={{ width: '250px' }}>Name</th>
                        <th>Dates</th>
                        <th style={{ width: '280px' }}>Reason</th>
                        <th style={{ width: '100px' }}>Issued On</th>
                        <th style={{ width: '100px' }}>Status</th>
                        <th style={{ width: '200px' }}>Comment</th>
                        <th style={{ width: '120px' }} className="text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {leaveRequests.map((request) => {
                        const parsedDates = JSON.parse(request.dates); // Parse JSON string to array
                        return (
                            <tr key={request.Leave_request_id}>
                                <td>
                                    <Link to="">
                                        <div className="d-flex align-items-center justify-content-start">
                                            <img
                                                src={
                                                    request.requestor.profileImage?.image_url ||
                                                    require('../assets/images/no_user.png')
                                                }
                                                alt=""
                                                style={{ width: '30px', height: '30px' }}
                                                className="rounded-circle"
                                            />
                                            <div className="ms-3">
                                                <p className="mb-0 text-dark">
                                                    <b>
                                                        {`${request.requestor[0]?.first_name} ${request.requestor[0]?.last_name}`}
                                                    </b>
                                                </p>
                                                <p className="text-muted mb-0">
                                                    <b className="text-info">{request.Total_days} Days</b>
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </td>
                                <td>
                                    <div>
                                        <p className="mb-2 text-primary fw-bold">
                                            {request.leaveType.name}
                                        </p>
                                        <span className='d-block'>
                                            {parsedDates.map((date, index) => (
                                                <small key={index} className='alldateSpan'>
                                                    {new Date(date).toLocaleDateString("en-GB")}
                                                </small>
                                            ))}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <Tooltip target={`.custom-tooltip-btn-${request.Leave_request_id}`}>
                                    <p style={{ fontWeight: '400', lineHeight: '1.5' }}>{request.reason}</p>
                                    </Tooltip>
                                    <p className={`mb-0 custom-tooltip-btn-${request.Leave_request_id}`}>{request.reason}</p>

                                </td>
                                <td>{new Date(request.createdAt).toLocaleDateString("en-GB")}</td>
                                <td>
                                    <Dropdown
                                        value={statusOptions.find(
                                            (status) => status.code === request.Status
                                        )}
                                        onChange={(e) =>
                                            handleStatusChange(request.Leave_request_id, e.value.code)
                                        }
                                        options={statusOptions}
                                        optionLabel="name"
                                        placeholder="Status"
                                        className="table_dropdown"
                                    />
                                </td>
                                <td>
                                    <InputText
                                        value={request.Comment || ''}
                                        onChange={(e) =>
                                            handleCommentChange(
                                                request.Leave_request_id,
                                                e.target.value
                                            )
                                        }
                                        placeholder="Comment"
                                    />
                                </td>
                                <td className="w-10 text-center">
                                    <Button
                                        title="Edit Leave Type"
                                        outlined
                                        severity='info'
                                        icon="pi pi-pencil"
                                        onClick={() => handleOpenDialog(request)}
                                        className='border-0'
                                    />
                                    <Button
                                        title="Save"
                                        icon="pi pi-save"
                                        outlined
                                        className='ms-2 border-0'
                                        severity="success"
                                        onClick={() => handleSave(request.Leave_request_id)}
                                    />

                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>

            {/* Dialog for Editing Leave Type */}
            <Dialog
                visible={showDialog}
                header="Change Leave Type"
                style={{ width: '350px' }}
                modal
                onHide={() => setShowDialog(false)} // This ensures the dialog closes when you click outside or press "X".

                footer={
                    <div>
                        {errorMessage && (
                            <div className="text-danger d-flex text-start justify-content-start align-items-center">
                                {/* <i className="pi pi-exclamation-triangle me-2"></i> */}
                                <small>{errorMessage}</small>
                            </div>
                        )}

                    </div>
                }

            >
                <div>
                    <Dropdown
                        value={selectedLeaveType}
                        options={leaveBalances}
                        onChange={(e) => setSelectedLeaveType(e.value)}
                        optionLabel="name"
                        placeholder="Select Leave Type"
                    />
                    <div className="mt-3 text-end">
                        <Button
                            label="Save"
                            icon="pi pi-check"
                            onClick={handleSaveLeaveType}
                            className="border-0 py-2 px-3"
                            severity='success'
                        />
                    </div>
                </div>
            </Dialog>
        </Card>
    );
};

export default Pendingleave;
