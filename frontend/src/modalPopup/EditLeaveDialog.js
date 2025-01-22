import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Form, Col, Card, Row, Alert, Button } from 'react-bootstrap';
import { Calendar } from 'primereact/calendar';
import axios from 'axios';
import config from '../config';

const EditLeaveDialog = ({ leave, leaveBalances, onSubmit }) => {
    const { accessToken, userId } = useAuth(); // Get userId from the context
    const [leaveTypeId, setLeaveTypeId] = useState(leave.Leave_type_Id || '');
    const [startDate, setStartDate] = useState(leave.dates ? new Date(leave.dates[0]) : null);
    const [endDate, setEndDate] = useState(leave.dates ? new Date(leave.dates[1]) : null);
    const [totalDays, setTotalDays] = useState(leave.Total_days || 0);
    const [leaveReason, setLeaveReason] = useState(leave.reason || '');
    const [leaveBalance, setLeaveBalance] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // Assuming leaveBalances is passed as a prop, you could set the balance here
        const selectedLeave = leaveBalances.find((balance) => balance.leave_type_id === leaveTypeId);
        if (selectedLeave) {
            setLeaveBalance(selectedLeave.total_days);
        }
    }, [leaveTypeId, leaveBalances]);

    const handleLeaveTypeChange = (e) => {
        const selectedLeaveType = e.target.value;
        setLeaveTypeId(selectedLeaveType);

        const selectedLeave = leaveBalances.find((leave) => leave.leave_type_id === selectedLeaveType);
        if (selectedLeave) {
            setLeaveBalance(selectedLeave.total_days); // Update leave balance
        }
    };

    // Function to calculate total days between startDate and endDate
    const calculateTotalDays = (start, end) => {
        if (!start || !end) return 0;
        const timeDiff = Math.abs(end - start);
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // Including start date
        setTotalDays(diffDays);
    };

    useEffect(() => {
        if (startDate && endDate) {
            calculateTotalDays(startDate, endDate);
        }
    }, [startDate, endDate]);

    const handleSave = () => {
        if (totalDays > leaveBalance) {
            setErrorMessage('Insufficient leave balance.');
            return;
        }
    
        setLoading(true);
        setErrorMessage('');
    
        // Prepare data for API call
        const leaveData = {
            Leave_request_id: leave.Leave_request_id, // Ensure the Leave_request_id is included
            Leave_type_Id: leaveTypeId,
            dates: [startDate, endDate],
            Total_days: totalDays,
            reason: leaveReason,
            user_id: userId, // Add user_id to the leave data
        };
    
        // Make the API call with headers
        axios
            .put(`${config.apiBASEURL}/leaveRoutes/edit-leave`, leaveData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Add the Authorization header
                },
            })
            .then((response) => {
                setLoading(false);
                onSubmit(response.data); // Pass the updated leave data to the parent
            })
            .catch((error) => {
                setLoading(false);
                setErrorMessage('Error updating leave request.');
                console.error('Error updating leave request:', error);
            });
    };

    return (
        <>
            <Form>
                <Col col="12" lg="12" className="mb-4">
                    <Card className="addEm shadow-0 p-0">
                        <Card.Body className="p-0">
                            <Row className="mb-3">
                                <Col lg={4} md={6}>
                                    <Form.Label>
                                        Leave Type <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Select
                                        aria-label="Select Leave Type"
                                        value={leaveTypeId || ''}
                                        required
                                        disabled // Make the leave type select non-editable
                                    >
                                        <option value="">Select Leave Type</option>
                                        {leaveBalances.map((leave) => (
                                            <option key={leave.leave_type_id} value={leave.leave_type_id}>
                                                {leave.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>

                                <Col lg={4} md={6} className="mb-3">
                                    <Form.Label>
                                        From <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Calendar
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.value)}
                                        minDate={new Date()}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                    />
                                </Col>

                                <Col lg={4} md={6} className="mb-3">
                                    <Form.Label>
                                        To <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Calendar
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.value)}
                                        minDate={startDate || new Date()}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                    />
                                </Col>

                                <Col lg={4} md={6} className="mb-3">
                                    <Form.Label>Number of Days</Form.Label>
                                    <Form.Control type="number" value={totalDays} disabled />
                                </Col>

                                <Col lg={4} md={6} className="mb-3">
                                    <Form.Label>Available Balance</Form.Label>
                                    <Form.Control type="number" value={leaveBalance} disabled />
                                </Col>

                                <Col lg={12} className="mb-3">
                                    <Form.Label>
                                        Reason <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={leaveReason}
                                        onChange={(e) => setLeaveReason(e.target.value)}
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                <Col lg="12" className="d-flex justify-content-end pt-3">
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={totalDays > leaveBalance || loading}
                    >
                        {loading ? 'Submitting...' : 'Submit'}
                    </Button>
                </Col>
            </Form>
        </>
    );
};

export default EditLeaveDialog;
