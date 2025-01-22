import React, { useState } from "react";
import DatePicker from "react-datepicker";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import { Calendar } from "primereact/calendar";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import config from "../config";
import { useAuth } from "../context/AuthContext";

const AddOvertime = ({onSuccess}) => {
    const { accessToken, userId } = useAuth();
    const [startDate, setStartDate] = useState(new Date());
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [totalTime, setTotalTime] = useState(0); // Total time in minutes
    const [error, setError] = useState(null);

    const formatTimeForMySQL = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${(d.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${d.getDate()
            .toString()
            .padStart(2, "0")} ${d.getHours()
            .toString()
            .padStart(2, "0")}:${d.getMinutes()
            .toString()
            .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!userId || !startTime || !endTime || totalTime <= 0 || !startDate) {
            setError("All fields are required.");
            return;
        }

        if (startTime.getTime() === endTime.getTime()) {
            setError("Start time and end time cannot be the same.");
            return;
        }

        if (startTime.getTime() > endTime.getTime()) {
            setError("Start time cannot be later than end time.");
            return;
        }

        // API call
        try {
            const response = await axios.post(
                `${config.apiBASEURL}/overtimeRoutes/add-overtime`,
                {
                    user_id: userId,
                    start_time: formatTimeForMySQL(startTime),
                    end_time: formatTimeForMySQL(endTime),
                    total_time: totalTime,
                    ovetime_date: startDate.toISOString().split("T")[0], // Extract only the date part
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
           
            setError(null); // Clear errors on success
            onSuccess();
        } catch (err) {
            console.error(err);
            setError("Failed to submit overtime. Please try again.");
        }
    };

    // Calculate total time
    const calculateTotalTime = (start_time, end_time) => {
        if (!start_time || !end_time) {
            return 0;
        }

        // Parse the start and end times into Date objects
        const startTime = new Date(start_time);
        const endTime = new Date(end_time);

        // Calculate the difference in milliseconds
        const timeDifference = endTime - startTime;

        // Convert the difference into minutes
        const totalMinutes = Math.floor(timeDifference / (1000 * 60));

        return totalMinutes;
    };

    // Update total time whenever startTime or endTime changes
    React.useEffect(() => {
        if (startTime && endTime) {
            const totalMinutes = calculateTotalTime(startTime, endTime);
            setTotalTime(totalMinutes);
        }
    }, [startTime, endTime]);

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Col col="12" lg="12" className="mb-4">
                    <Card className="addEm shadow-0 p-0">
                        <Card.Body className="p-0">
                            <Row className="mb-3">
                                <Col lg={12} className="mb-3">
                                    <Form.Label>
                                        Overtime Date<span className="text-danger">*</span>
                                    </Form.Label>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        className="form-control"
                                        dateFormat="dd/MM/yy" // Specify the desired date format
                                    />
                                </Col>
                                <Col lg={6} className="mb-3">
                                    <Form.Label>
                                        Start Time<span className="text-danger">*</span>
                                    </Form.Label>
                                    <Calendar
                                        value={startTime}
                                        hourFormat="12"
                                        onChange={(e) => setStartTime(e.value)}
                                        timeOnly
                                    />
                                </Col>
                                <Col lg={6} className="mb-3">
                                    <Form.Label>
                                        End Time<span className="text-danger">*</span>
                                    </Form.Label>
                                    <Calendar
                                        value={endTime}
                                        hourFormat="12"
                                        onChange={(e) => setEndTime(e.value)}
                                        timeOnly
                                    />
                                </Col>
                                <Col lg={12} className="mb-3">
                                    <Form.Label>Total Time (Minutes)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={totalTime}
                                        readOnly
                                    />
                                </Col>
                            </Row>
                            {error && (
                                <div className="text-danger mb-3">
                                    {error}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg="12" className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary btn-md">
                        Submit
                    </button>
                </Col>
            </Form>
        </>
    );
};

export default AddOvertime;
