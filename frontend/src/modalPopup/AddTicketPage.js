import React, { useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { InputText, InputTextarea, Button } from "primereact"; // Retaining PrimeReact for other components
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import config from "../config";

const AddTicketPage = ({ onClose, onSuccess }) => {
    const { accessToken, userId } = useAuth();
    const [subject, setSubject] = useState("");
    const [issue, setIssue] = useState("");
    const [category, setCategory] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Predefined categories
    const categoryOptions = [
        { label: "IT Support", value: "IT_Support" },
        { label: "Connectivity", value: "Connectivity" },
        { label: "Network Issue", value: "NetworkIssue" },
        { label: "Hardware Issue", value: "Hardware_issue" },
        { label: "Software Issue", value: "Software_issue" },
        { label: "Security", value: "Security" },
        { label: "Others", value: "Others" },
    ];

    const handleFileUpload = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length + images.length > 10) {
            return;
        }
        setImages([...images, ...selectedFiles]);
    };

    const handleSubmit = async () => {
        if (loading) return; // Prevent multiple submissions
        setLoading(true);

        const formData = new FormData();
        formData.append("Raiser_id", userId); // Automatically set Raiser_id
        formData.append("subject", subject);
        formData.append("issue", issue);
        formData.append("category", category);

        images.forEach((image) => {
            formData.append("images", image);
        });

        try {
            const response = await axios.post(`${config.apiBASEURL}/ticketRoutes/addtickets`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${accessToken}`, // Add auth header
                },
            });
            onClose(); // Close the dialog
            onSuccess(); // Callback to refresh the parent page
        } catch (error) {
            console.error("Error adding ticket:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Col lg="12" className="mb-0">
            <Card className="addEm shadow-0 p-0">
                <Card.Body className="p-0">
                    <Row className="mb-2">
                        <Col lg={12} md={12} className="mb-2">
                            <label htmlFor="subject" className="form-label">
                                Subject
                            </label>
                            <InputText
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </Col>
                        <Col lg={12} md={12} className="mb-2">
                            <label htmlFor="category" className="form-label">
                                Category
                            </label>
                            <select
                                id="category"
                                className="form-select"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="" disabled>
                                    Select a category
                                </option>
                                {categoryOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </Col>
                        <Col lg={12} md={12} className="mb-3">
                            <label htmlFor="issue" className="form-label">
                                Issue
                            </label>
                            <InputTextarea
                                id="issue"
                                rows={3}
                                value={issue}
                                onChange={(e) => setIssue(e.target.value)}
                                className="form-control h-auto"
                            />
                        </Col>
                        <Col lg={12} md={12}className="mb-3">
                            <label htmlFor="images" className="form-label">
                                Upload Images
                            </label>
                            <input
                                id="images"
                                type="file"
                                className="form-control"
                                multiple
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                            <small className="text-secondary" style={{ fontSize: '12px' }}>
                                {images.length}/10 images uploaded
                            </small>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Col lg={12} md={12} className="text-end">
                <Button
                    label="Cancel"
                    severity="danger"
                    className="py-2 border-0"
                    onClick={onClose}
                    disabled={loading}
                    
                />
                <Button
                    label={loading ? "Submitting..." : "Submit"}
                    severity="success"
                    className="py-2 border-0 ms-2"
                    onClick={handleSubmit}
                    disabled={loading}
                />
            </Col>
        </Col>
    );
};

export default AddTicketPage;
