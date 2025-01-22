import React, { useState, useEffect } from "react";
import { Col, Form, Row, Card, Alert } from 'react-bootstrap';
import { Calendar } from 'primereact/calendar';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { useAuth } from "../context/AuthContext";
import config from "../config";
import { Button } from 'primereact/button';

function AdminAddLeave({ onSuccess }) {
    const { accessToken } = useAuth();
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [leaves, setLeaves] = useState([]);
    const [leaveType, setLeaveType] = useState('');
    const [leaveTypeId, setLeaveTypeId] = useState('');
    const [selectedDates, setSelectedDates] = useState([]); // For selected dates
    const [leaveBalance, setLeaveBalance] = useState(0);
    const [leaveReason, setLeaveReason] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch users on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/leaveRoutes/fetch-all-users`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
                setErrorMessage("Failed to fetch users.");
            }
        };

        fetchUsers();
    }, [accessToken]);

    // Fetch leave balances when user selection changes
    useEffect(() => {
        if (selectedUserId) {
            const fetchLeaveBalances = async () => {
                try {
                    const response = await axios.get(`${config.apiBASEURL}/leaveRoutes/fetch-leave-balances/${selectedUserId}`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    setLeaves(response.data);
                } catch (error) {
                    console.error("Error fetching leave balances:", error);
                    setErrorMessage("Failed to fetch leave balances.");
                }
            };

            fetchLeaveBalances();
        }
    }, [selectedUserId, accessToken]);

    const handleLeaveTypeChange = (e) => {
        const selectedLeaveTypeId = parseInt(e.target.value, 10);
        setLeaveTypeId(selectedLeaveTypeId);

        const selectedLeaveTypeData = leaves.find((type) => type.leave_type_id === selectedLeaveTypeId);

        if (selectedLeaveTypeData) {
            setLeaveType(selectedLeaveTypeData.name);
            setLeaveBalance(selectedLeaveTypeData.total_days || 0);
        } else {
            setLeaveType('');
            setLeaveBalance(0);
        }
    };

    const handleSave = async (event) => {
        event.preventDefault();
        if (!selectedUserId) {
            setErrorMessage("Please select a user.");
            return;
        }
        if (selectedDates.length > leaveBalance) {
            setErrorMessage("The number of selected days exceeds the available leave balance.");
            return;
        }

        setLoading(true);

        try {
            const dates = selectedDates.map((date) => date.toLocaleDateString('en-CA'));

            const response = await axios.post(`${config.apiBASEURL}/leaveRoutes/add-leave`, {
                user_id: selectedUserId,
                Leave_type_Id: leaveTypeId,
                dates,
                Total_days: selectedDates.length,
                reason: leaveReason,
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (response.status === 200) {
                setLeaveType('');
                setLeaveTypeId('');
                setSelectedDates([]);
                setLeaveBalance(0);
                setLeaveReason('');
            } else {
                setErrorMessage("Failed to submit leave request. Please try again.");
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Failed to submit leave request.");
        } finally {
            setLoading(false);
            onSuccess();
        }
    };

    // Date filter to disable Sundays and past dates
    const dateFilter = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isSunday = date.getDay() === 0;
        const isPastDate = date < today;

        return !isSunday && !isPastDate;
    };

    return (
        <>
            <Form>
                <Row className="mx-0 m-0">
                    <Col lg={5} md={6} className="mb-3">
                        <div className="mb-2">
                            <Form.Label>Employee <span className='text-danger'>*</span></Form.Label>
                            <Form.Select
                                aria-label="Select User"
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                value={selectedUserId || ""}
                                required
                            >
                                <option value="">Select User</option>
                                {users.map((user) => (
                                    <option key={user.user_id} value={user.user_id}>
                                        {`${user.first_name} ${user.last_name}`}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>
                        <div className="mb-2">
                            <Form.Label>Leave Type <span className='text-danger'>*</span></Form.Label>
                            <Form.Select
                                aria-label="Select Leave Type"
                                onChange={handleLeaveTypeChange}
                                value={leaveTypeId || ""}
                                required
                            >
                                <option value="">Select Leave Type</option>
                                {Array.isArray(leaves) && leaves.map((leave) => (
                                    <option key={leave.leave_type_id} value={leave.leave_type_id}>
                                        {leave.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>
                        <div className="mb-2">
                            <Form.Label>Number of Days</Form.Label>
                            <Form.Control type="number" value={selectedDates.length} disabled />
                        </div>
                        <div className="mb-2">
                            <Form.Label>Available Balance</Form.Label>
                            <Form.Control type="number" value={leaveBalance} disabled />
                        </div>
                    </Col>
                    <Col lg={7} md={6} className="mb-3">
                        <Form.Label>Select Dates <span className='text-danger'>*</span></Form.Label>
                        <Calendar
                            value={selectedDates}
                            onChange={(e) => setSelectedDates(e.value)}
                            selectionMode="multiple"
                            minDate={new Date()}
                            dateFormat="dd/mm/yy"
                            placeholder="Select Leave Dates"
                            disabledDates={[]}
                            disabledDays={[0]} // Sundays
                            inline
                            className="h-auto w-100 custom-calendar"
                            filterDate={dateFilter} // Custom date filter
                        />
                    </Col>
                    <Col lg={12} className='mb-3'>
                        <Form.Label>Reason <span className='text-danger'>*</span></Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            className="h-auto"
                            value={leaveReason}
                            onChange={(e) => setLeaveReason(e.target.value)}
                        />
                    </Col>
                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                    <Col lg='12' className='d-flex justify-content-end'>
                        <Button
                            severity="primary"
                            className="py-2"
                            onClick={handleSave}
                            disabled={selectedDates.length > leaveBalance || loading}
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Col>
                </Row>
            </Form>
        </>
    );
}

export default AdminAddLeave;
