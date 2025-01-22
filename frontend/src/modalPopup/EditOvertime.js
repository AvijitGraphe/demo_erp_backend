import React, { useState, useEffect } from "react";
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

const EditOvertime = ({ overtime_id, onSuccess }) => {

    const { accessToken } = useAuth();

    const [overtimeData, setOvertimeData] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [totalTime, setTotalTime] = useState(0);
    const [status, setStatus] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch overtime data on component mount
        const fetchOvertime = async () => {
            try {
                const response = await axios.get(
                    `${config.apiBASEURL}/overtimeRoutes/overtime/${overtime_id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
                const data = response.data;
        
                setOvertimeData(data);
        
                setStartDate(new Date(data.ovetime_date));
                setStartTime(parseTime(data.start_time));
                setEndTime(parseTime(data.end_time));
                setTotalTime(data.total_time);
                setStatus(data.status);
            } catch (err) {
                console.error("Error fetching overtime record:", err);
                setError("Failed to fetch overtime data. Please try again.");
            }
        };

        fetchOvertime();
    }, [overtime_id, accessToken]);

    const parseTime = (timeString) => {
        const [hours, minutes, seconds] = timeString.split(":").map(Number);
        const date = new Date();
        date.setHours(hours, minutes, seconds);
        return date;
    };
    

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

        if (status !== "Pending") {
            setError("Only records with 'Pending' status can be edited.");
            return;
        }

        if (!startTime || !endTime || totalTime <= 0 || !startDate) {
            setError("All fields are required.");
            return;
        }

        try {
            await axios.put(
                `${config.apiBASEURL}/overtimeRoutes/edit-overtime/${overtime_id}`,
                {
                    start_time: formatTimeForMySQL(startTime),
                    end_time: formatTimeForMySQL(endTime),
                    total_time: totalTime,
                    ovetime_date: startDate.toISOString().split("T")[0],
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            onSuccess();
        } catch (err) {
            console.error("Error updating overtime record:", err);
            setError("Failed to update overtime record. Please try again.");
        }
    };

    const calculateTotalTime = (start_time, end_time) => {
        if (!start_time || !end_time) {
            return 0;
        }
        const timeDifference = new Date(end_time) - new Date(start_time);
        return Math.floor(timeDifference / (1000 * 60)); // Total minutes
    };

    useEffect(() => {
        if (startTime && endTime) {
            setTotalTime(calculateTotalTime(startTime, endTime));
        }
    }, [startTime, endTime]);

    if (!overtimeData) {
        return <div>Loading...</div>;
    }

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
                                        dateFormat="dd/MM/yy"
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
                                    <Form.Control type="text" value={totalTime} readOnly />
                                </Col>
                                <Col lg={12} className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Control type="text" value={status} readOnly />
                                </Col>
                            </Row>
                            {error && <div className="text-danger mb-3">{error}</div>}
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

export default EditOvertime;
