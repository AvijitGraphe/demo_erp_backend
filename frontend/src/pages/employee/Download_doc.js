import React, { useState } from "react";
import { Col, Row, Card, Table } from 'react-bootstrap';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
//import { useAuth } from "../../context/AuthContext";
//import { Tooltip } from 'primereact/tooltip';
import { Badge } from 'primereact/badge';
import { DateRangePicker } from "react-bootstrap-daterangepicker";
import "bootstrap-daterangepicker/daterangepicker.css";
import moment from 'moment';
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import EmpPayslip from "../../modalPopup/EmpPayslip";

const Download_doc = () => {
    const [visible, setVisible] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ brand_name: "", start_date: null, end_date: null });

    // Handle filter change
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page after applying filters
    };

    // Handle Date Range Change
    const handleDateRangeChange = (start, end) => {
        handleFilterChange("start_date", start);
        handleFilterChange("end_date", end);
    };

    return (
        <>
            <Row className='body_content'>
                <Row>
                    <Col md={12} lg={12}>
                        <Card>
                            <Card.Header className='d-flex justify-content-between align-items-center'>
                                <h6 className="mb-0">Download Documents</h6>
                                <div className="d-flex align-items-center">
                                    <label className="me-3">Filter by Date Range</label>
                                    <DateRangePicker
                                        initialSettings={{
                                            startDate: filters.start_date ? moment(filters.start_date) : moment(),
                                            endDate: filters.end_date ? moment(filters.end_date) : moment(),
                                            locale: { format: "DD/MM/YYYY" },
                                        }}
                                        onCallback={(start, end) => handleDateRangeChange(start.toDate(), end.toDate())}
                                    >
                                        <input
                                            type="text"
                                            className="form-control mx-2"
                                            placeholder="Select Date Range"
                                            style={{ width: "200px" }}
                                        />
                                    </DateRangePicker>
                                    <IconField iconPosition="left">
                                        <InputIcon className="pi pi-search"> </InputIcon>
                                        <InputText placeholder="Search" className="ps-5" style={{ width: "200px" }}/>
                                    </IconField>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <div className="table-responsive">
                                    <Table striped size="sm">
                                        <thead>
                                            <tr className="table-secondary">
                                                <th style={{ width: '50px' }}>#</th>
                                                <th>Document Name</th>
                                                <th>Type</th>
                                                <th>Sender Name</th>
                                                <th style={{ width: '220px' }}>Date & Time</th>
                                                <th style={{ width: '100px' }} className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>1</td>
                                                <td>Payslip.pdf</td>
                                                <td>Payslip</td>
                                                <td>Jon Dow</td>
                                                <td>01/12/2024 12:00 PM</td>
                                                <td className="text-center">
                                                    <Button
                                                        outlined
                                                        severity="primary"
                                                        label="View"
                                                        className="border-0 p-0"
                                                        onClick={() => setVisible(true)}
                                                    />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>2</td>
                                                <td>Leave Policies.pdf</td>
                                                <td>Leave Policies</td>
                                                <td>Jon Dow</td>
                                                <td>01/01/2022</td>
                                                <td className="text-center">
                                                    <Button
                                                        outlined
                                                        severity="primary"
                                                        label="View"
                                                        className="border-0 p-0"
                                                        onClick={() => setVisible(true)}
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Row>
            <Dialog visible={visible} style={{ width: '60vw' }} onHide={() => {if (!visible) return; setVisible(false); }}>
                <EmpPayslip />
            </Dialog>
        </>
    );
};

export default Download_doc;