import React, { useState, useRef, useEffect } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import { Calendar } from "primereact/calendar";
import { CiCircleRemove } from "react-icons/ci";
import axios from "axios";
import config from "../config";
import { useAuth } from "../context/AuthContext";

const EducationInformation = ({
    userId,
    educationalInfo = [],
    setVisibleModal5,
    fetchEducationalInfo,
}) => {
    const { accessToken } = useAuth();
    const [rows, setRows] = useState([]);
    const [isFormValid, setIsFormValid] = useState(false);
    const lastRowRef = useRef(null);

    useEffect(() => {
        if (educationalInfo && educationalInfo.length > 0) {
            const initialRows = educationalInfo.map((info) => ({
                id_educational_info: info.id_educational_info || null,
                institute: info.institute || "",
                degree: info.degree_name || "",
                year_of_passing: info.year_of_passing || null,
            }));
            setRows(initialRows);
        } else {
            setRows([{ id_educational_info: null, institute: "", degree: "", year_of_passing: null }]);
        }
    }, [educationalInfo]);

    useEffect(() => {
        validateForm();
    }, [rows]);

    const addRow = () => {
        setRows([...rows, { id_educational_info: null, institute: "", degree: "", year_of_passing: null }]);
    };

    const handleDelete = (index) => {
        if (rows.length > 1) {
            const newRows = rows.filter((_, i) => i !== index);
            setRows(newRows);
        }
    };

    const handleChange = (index, field, value) => {
        const newRows = rows.map((row, i) =>
            i === index
                ? { ...row, [field]: field === "year_of_passing" ? new Date(value).getFullYear() : value }
                : row
        );
        setRows(newRows);
    };

    const validateForm = () => {
        const isValid = rows.every(
            (row) =>
                row.institute.trim() !== "" &&
                row.degree.trim() !== "" &&
                row.year_of_passing !== null
        );
        setIsFormValid(isValid);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        try {
            // Loop through rows to create or update data
            for (const row of rows) {
                const payload = {
                    user_id: userId,
                    id_educational_info: row.id_educational_info,
                    institute: row.institute,
                    degree_name: row.degree,
                    year_of_passing: row.year_of_passing,
                };

                // Call the API
                const response = await axios.post(`${config.apiBASEURL}/user-profile/education-info`, payload, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            }

            // Refresh data and close modal
            setVisibleModal5(false);
            fetchEducationalInfo();
        } catch (error) {
            console.error("Error adding/updating educational information:", error);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Col lg="12">
                <div className="modalscroll">
                    {rows.map((row, index) => (
                        <Row
                            key={index}
                            className="mb-3 addEm shadow-0 p-0 position-relative"
                            ref={index === rows.length - 1 ? lastRowRef : null}
                        >
                            <Col lg={6} md={12} className="mb-3">
                                <Form.Label>
                                    Institute <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="institute"
                                    placeholder="Institute"
                                    value={row.institute}
                                    onChange={(e) => handleChange(index, "institute", e.target.value)}
                                />
                            </Col>
                            <Col lg={6} md={12} className="mb-3">
                                <Form.Label>
                                    Degree<span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="degree"
                                    placeholder="Degree"
                                    value={row.degree}
                                    onChange={(e) => handleChange(index, "degree", e.target.value)}
                                />
                            </Col>
                            <Col lg={6} md={12} className="mb-3">
                                <Form.Label>
                                    Year of Passing<span className="text-danger">*</span>
                                </Form.Label>
                                <Calendar
                                    id={`year_of_passing-${index}`}
                                    value={row.year_of_passing ? new Date(row.year_of_passing, 0, 1) : null}
                                    onChange={(e) => handleChange(index, "year_of_passing", e.value)}
                                    view="year"
                                    dateFormat="yy"
                                    yearNavigator
                                    yearRange="1900:2100"
                                />
                            </Col>
                            {index !== 0 && (
                                <div className="d-flex justify-content-end mb-3">
                                    <i
                                        onClick={() => handleDelete(index)}
                                        className="delite_row"
                                    >
                                        <CiCircleRemove />
                                    </i>
                                </div>
                            )}
                        </Row>
                    ))}
                </div>
                <div className="d-flex justify-content-end">
                    <Button type="button" className="btn btn-info mb-0" onClick={addRow}>
                        Add
                    </Button>
                    <Button
                        type="submit"
                        className="btn btn-primary mb-0 ms-2"
                        disabled={!isFormValid}
                    >
                        Save
                    </Button>
                </div>
            </Col>
        </Form>
    );
};

export default EducationInformation;
