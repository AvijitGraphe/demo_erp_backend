import React, { useState } from "react";
import { Row, Col, Card, Form } from "react-bootstrap";
import { Button } from "primereact/button";
import moment from "moment";
import DateRangePicker from "react-bootstrap-daterangepicker";
import "bootstrap-daterangepicker/daterangepicker.css";
import axios from "axios";
import config from "../config";
import { useAuth } from "../context/AuthContext";
import CustomToast from "../components/CustomToast";
const AddHoliday = ({ onSuccess, fetchHolidays }) => {
    const { accessToken } = useAuth(); // Get the access token from the context
    const [dateRange, setDateRange] = useState({
        startDate: moment().format("YYYY-MM-DD"),
        endDate: moment().format("YYYY-MM-DD"),
    });
    const [holidayName, setHolidayName] = useState("");
    const [status, setStatus] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleDateRangeChange = (start, end) => {
        setDateRange({
            startDate: moment(start).format("YYYY-MM-DD"), // Format start date
            endDate: moment(end).format("YYYY-MM-DD"), // Format end date
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {

            return;
        }

        const startDate = moment(dateRange.startDate);
        const endDate = moment(dateRange.endDate);

        const dateArray = [];
        while (startDate.isSameOrBefore(endDate)) {
            dateArray.push(startDate.format("YYYY-MM-DD"));
            startDate.add(1, "day");
        }

        setLoading(true); // Start loading

        try {
            // Loop through dates to submit holidays
            for (const holidayDate of dateArray) {
                const formData = new FormData();
                formData.append("holiday_name", holidayName);
                formData.append("holiday_date", holidayDate);
                formData.append("status", status);
                formData.append("image", image);

                await axios.post(`${config.apiBASEURL}/HolidayRoutes/addholiday`, formData, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            // Fetch the updated list of holidays
            await fetchHolidays();



        } catch (error) {
            console.error("Error adding holidays:", error.response?.data || error);

        } finally {
            setLoading(false); // Ensure loading is stopped
            // Close the modal
            onSuccess();
        }
    };


    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Col lg="12" className="mb-0">
                    <Card className="addEm shadow-0 p-0">
                        <Card.Body className="p-0">
                            <Row className="mb-3">
                                <Col lg={12} md={12}>
                                    <Form.Label>
                                        Event Name <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Event Name"
                                        value={holidayName}
                                        onChange={(e) => setHolidayName(e.target.value)}
                                        required
                                    />
                                </Col>
                                <Col lg={12} md={12} className="mt-3">
                                    <Form.Label>
                                        Holiday Date <span className="text-danger">*</span>
                                    </Form.Label>
                                    <br />
                                    <DateRangePicker
                                        initialSettings={{
                                            startDate: moment(dateRange.startDate).toDate(),
                                            endDate: moment(dateRange.endDate).toDate(),
                                            locale: { format: "DD/MM/YYYY" },
                                        }}
                                        onCallback={(start, end) =>
                                            handleDateRangeChange(start, end)
                                        }
                                    >
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Select Date"
                                            value={`${moment(dateRange.startDate).format(
                                                "DD/MM/YYYY"
                                            )} - ${moment(dateRange.endDate).format("DD/MM/YYYY")}`}
                                            readOnly
                                        />
                                    </DateRangePicker>
                                </Col>
                                <Col lg={12} md={12} className="mt-3">
                                    <Form.Label>
                                        Status <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </Form.Control>
                                </Col>
                                <Col lg={12} md={12} className="mt-3">
                                    <Form.Label>
                                        Upload Image <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setImage(e.target.files[0])}
                                        required
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg="12" className="d-flex justify-content-end">
                    <Button
                        label={loading ? "Saving..." : "Save"}
                        icon="pi pi-save"
                        severity="info"
                        className="py-2"
                        disabled={loading}
                    />
                </Col>
            </Form>
        </>
    );
};

export default AddHoliday;
