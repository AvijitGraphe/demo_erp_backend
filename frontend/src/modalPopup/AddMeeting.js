import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";
import { Button } from "primereact/button";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import config from "../config";
import CustomToast from "../components/CustomToast";

const AddMeeting = ({ onSuccess, fetchmeetings }) => {
    const { accessToken } = useAuth();
    const [date, setDate] = useState(new Date()); 
    const [selectedMembers, setSelectedMembers] = useState([]); // Array to hold selected members
    const [subject, setSubject] = useState("");
    const [startTime, setStartTime] = useState("");  // State for start time
    const [endTime, setEndTime] = useState("");      // State for end time
    const [users, setUsers] = useState([]);  // Users array
    const [error, setError] = useState("");

    // Fetch all users for meeting members
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/meetingRoutes/fetch-all-users`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                console.log("log the data ",response.data)
                setUsers(response.data); // Populate users array
            } catch (error) {
                console.error('Error fetching users:', error);
                setError('Error fetching users');
            }
        };

        fetchUsers();
    }, [accessToken]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Prepare meeting data to be sent to the backend
        const meetingData = {
            date,
            start_time: startTime,
            end_time: endTime,
            purpose: subject,
            meeting_member_id: selectedMembers 
        };

        try {
            // Send data to backend
            const response = await axios.post(`${config.apiBASEURL}/meetingRoutes/add-or-edit-meeting`, meetingData, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (response.data.success) {
                // Call the onSuccess function passed via props after successful meeting creation/edit
                onSuccess();
                fetchmeetings();
            } else {
                CustomToast.error(response.data.message || "Failed to save meeting");
            }
        } catch (error) {
            console.error("Error adding/editing meeting:", error);
        }
    };

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Col lg="12" className="mb-0">
                    <Card className="shadow-0 p-0">
                        <Card.Body className="p-0">
                            <Row className="mb-3">
                                <Col lg={12} md={12}>
                                    <Form.Label>
                                        Subject <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Add Subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                    />
                                </Col>
                                <Col lg={12} md={12} className="mt-3">
                                    <Form.Label>
                                        Date <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Calendar 
                                        value={date} 
                                        onChange={(e) => setDate(e.value)} 
                                        showIcon
                                        dateFormat="dd-mm-yy"
                                        required
                                    />
                                </Col>
                                <Col lg={12} md={12} className="mt-3">
                                    <Form.Label>
                                        Start Time <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control 
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required
                                    />
                                </Col>
                                <Col lg={12} md={12} className="mt-3">
                                    <Form.Label>
                                        End Time <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control 
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        required
                                    />
                                </Col>
                                <Col lg={12} md={12} className="mt-3">
                                    <Form.Label>
                                        Add Members <span className="text-danger">*</span>
                                    </Form.Label>
                                    <MultiSelect
                                        value={selectedMembers}
                                        onChange={(e) => setSelectedMembers(e.value)}  // Update selected members
                                        options={users}  // Pass the list of users
                                        optionLabel="first_name"  // Display first name for each option
                                        optionValue="user_id"     // Use user_id as the value
                                        filter
                                        placeholder="Select Members"
                                        maxSelectedLabels={3}
                                        className="w-full h-auto"
                                        display="chip"
                                        required
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg="12" className="d-flex justify-content-end">
                    <Button
                        label="Save"
                        icon="pi pi-save"
                        severity="info"
                        type="submit"
                        className="py-2"
                    />
                </Col>
            </Form>
            {error && <p className="text-danger">{error}</p>}
        </>
    );
};

export default AddMeeting;
