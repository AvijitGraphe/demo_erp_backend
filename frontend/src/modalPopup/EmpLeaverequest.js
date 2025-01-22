import React, { useState, useEffect } from "react";
import { Col, Form, Row, Card, Alert } from 'react-bootstrap';
import { Calendar } from 'primereact/calendar';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { useAuth } from "../context/AuthContext";
import config from "../config";
import { Button } from 'primereact/button';

function EmpLeaverequest({ onSuccess }) {
    const { accessToken, userId } = useAuth();
    const [leaves, setLeaves] = useState([]); // Leave balances array
    const [leaveType, setLeaveType] = useState('');
    const [leaveTypeId, setLeaveTypeId] = useState('');
    const [selectedDates, setSelectedDates] = useState([]);
    const [totalDays, setTotalDays] = useState(0);
    const [leaveBalance, setLeaveBalance] = useState(0);
    const [leaveReason, setLeaveReason] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch leave balances on component mount
    useEffect(() => {
        const fetchLeaveBalances = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/leaveRoutes/fetch-leave-balances/${userId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                setLeaves(response.data); // Set leave balances array
            } catch (error) {
                console.error("Error fetching leave balances:", error);
                setErrorMessage("Failed to fetch leave balances.");
            }
        };

        fetchLeaveBalances();
    }, [userId, accessToken]);

    const handleLeaveTypeChange = (e) => {
        const selectedLeaveTypeId = parseInt(e.target.value, 10); // Parse the ID as an integer
        setLeaveTypeId(selectedLeaveTypeId);

        const selectedLeaveTypeData = leaves.find((type) => type.leave_type_id === selectedLeaveTypeId);

        if (selectedLeaveTypeData) {
            setLeaveType(selectedLeaveTypeData.name); // Set the leave name
            setLeaveBalance(selectedLeaveTypeData.total_days || 0); // Set the leave balance
        } else {
            setLeaveType(''); // Reset if no valid selection
            setLeaveBalance(0); // Reset the balance
        }
    };

    const handleDateSelection = (dates) => {
        const validDates = dates.filter(date => date.getDay() !== 0); // Exclude Sundays
        setSelectedDates(validDates);
        setTotalDays(validDates.length); // Update total days
    };

    const handleSave = async (event) => {
        event.preventDefault();

        if (totalDays > leaveBalance) {
            setErrorMessage("The number of days exceeds the available leave balance.");
            return;
        }

        setLoading(true);

        try {
            const dates = selectedDates.map(date =>
                new Date(date).toLocaleDateString('en-CA')
            ); // Format selected dates as 'YYYY-MM-DD'

            const response = await axios.post(`${config.apiBASEURL}/leaveRoutes/add-leave`, {
                user_id: userId,
                Leave_type_Id: leaveTypeId,
                dates,
                Total_days: totalDays,
                reason: leaveReason,
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (response.status === 200) {
                setLeaveType('');
                setLeaveTypeId('');
                setSelectedDates([]);
                setTotalDays(0);
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

    // Custom date filter to disable Sundays and past dates
    const dateFilter = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date.getDay() !== 0 && date >= today;
    };

    return (
        <>
            <Form>
                <Row>
                    <Col lg={5} md={6} className="mb-3">
                        <div className="mb-2">
                            <Form.Label>Leave Type <span className='text-danger'>*</span></Form.Label>
                            <Form.Select
                                aria-label="Select Leave Type"
                                onChange={handleLeaveTypeChange}
                                value={leaveTypeId || ""} // Use leaveTypeId to set the selected value
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
                            <Form.Control type="number" value={totalDays} disabled />
                        </div>
                        <div className="mb-2">
                            <Form.Label>Available Balance</Form.Label>
                            <Form.Control type="number" value={leaveBalance} disabled />
                        </div>
                        <div className="mb-2">
                            <Form.Label>Reason <span className='text-danger'>*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={6}
                                className="h-auto"
                                value={leaveReason}
                                onChange={(e) => setLeaveReason(e.target.value)}
                            />
                        </div>
                    </Col>
                    <Col lg={7} md={6} className="mb-3">
                        <Form.Label>Select Dates <span className='text-danger'>*</span></Form.Label>
                        <Calendar
                            value={selectedDates}
                            onChange={(e) => handleDateSelection(e.value)}
                            selectionMode="multiple"
                            minDate={new Date()}
                            dateFormat="dd/mm/yy"
                            placeholder="Select Leave Dates"
                            disabledDays={[0]} // Disable Sundays
                            inline
                            className="h-auto w-100 custom-calendar"
                            filterDate={dateFilter} // Custom date filter
                        />
                    </Col>
                </Row>
                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                <Col lg='12' className='d-flex justify-content-end'>
                    <Button
                        severity="primary"
                        className="py-2"
                        onClick={handleSave}
                        disabled={totalDays > leaveBalance || loading}
                    >
                        {loading ? 'Submitting...' : 'Submit'}
                    </Button>
                </Col>
            </Form>
        </>
    );
}

export default EmpLeaverequest;
