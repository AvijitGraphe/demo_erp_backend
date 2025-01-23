import React, { useState, useEffect } from "react";
import { Row, Col, Breadcrumb, Card, Table } from 'react-bootstrap';
import { Calendar } from 'primereact/calendar';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import Addovertime from '../../modalPopup/Addovertime';
import EditOvertime from "../../modalPopup/EditOvertime";
const EmployeeOvertime = () => {
    const { accessToken, userId } = useAuth();
    const [visible, setVisible] = useState(false);
    const [visible2, setVisible2] = useState(false);
    const [selectedOvertimeId, setSelectedOvertimeId] = useState(null);
    const [date, setDate] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userId) fetchUserOvertimeData();
    }, [date, userId]);

    const fetchUserOvertimeData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (date) {
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                params.monthYear = monthYear;
            }

            const response = await axios.get(`${config.apiBASEURL}/overtimeRoutes/overtime/user/${userId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params,
            });

            console.log("log the data", response.data)
            const { Pending, Approved, Rejected } = response.data;
            setData([...Pending, ...Approved, ...Rejected]);
        } catch (error) {
            console.error("Error fetching user overtime data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (overtime_id) => {
        setSelectedOvertimeId(overtime_id); // Set the ID of the selected record
        setVisible2(true); // Show the dialog
    };

    const handleEditSuccess = () => {
        setVisible2(false); // Close the dialog after a successful update
        fetchUserOvertimeData();
    }
    const handleSuccess = () => {
        fetchUserOvertimeData();
        setVisible(false);
    };


    return (
        <Row className="body_content">
            <Row className="mx-0">
                <Col md={12} lg={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h6>Employee Overtime</h6>
                            <div className="d-flex justify-content-end align-items-center">
                                <Calendar
                                    value={date}
                                    onChange={(e) => setDate(e.value)}
                                    view="month"
                                    dateFormat="mm/yy"
                                    placeholder="Filter by Month"
                                    style={{ width: '180px' }}
                                />
                                <Button
                                    className='border-0 ms-2'
                                    onClick={() => setVisible(true)}
                                    icon="pi pi-plus"
                                    label="Overtime"
                                    severity="info"
                                />
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {loading ? (
                                <p>Loading...</p>
                            ) : (
                                <>
                                    <Table responsive hover size="sm" bordered>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>OT Date</th>
                                                <th>Start Time</th>
                                                <th>End Time</th>
                                                <th>OT Minutes</th>
                                                <th>Status</th>
                                                <th>Approver</th>
                                                <th>Reason</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.length > 0 ? (
                                                data.map((row, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            {row.requester?.first_name} {row.requester?.last_name}
                                                        </td>
                                                        <td>
                                                            {new Date(row.overtime_date).toLocaleDateString('en-GB')}
                                                        </td>
                                                        <td>{row.start_time}</td>
                                                        <td>{row.end_time}</td>
                                                        <td>{row.total_time}</td>
                                                        <td>
                                                            <span
                                                                className={`badge ${
                                                                row.status === "Approved"
                                                                    ? "bg-success"
                                                                    : row.status === "Pending"
                                                                    ? "bg-warning"
                                                                    : row.status === "Rejected"
                                                                    ? "bg-danger"
                                                                    : "bg-secondary"
                                                                }`}
                                                            >
                                                                {row.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {row.approverDetails?.first_name} {row.approverDetails?.last_name}
                                                        </td>
                                                        <td>{row.reason || "N/A"}</td>
                                                        <td>
                                                            {row.status === "Pending" && (
                                                                <Button
                                                                    severity="warning"
                                                                    icon="pi pi-pencil"
                                                                    title="Edit"
                                                                    size="sm"
                                                                    onClick={() => handleEdit(row._id)}
                                                                />

                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="10" className="text-center">
                                                        No overtime records found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </Table>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
                <Dialog
                    header="Add Overtime"
                    visible={visible}
                    style={{ width: '320px' }}
                    onHide={() => setVisible(false)}
                >
                    <Addovertime onSuccess={handleSuccess} />
                </Dialog>
                <Dialog
                    header="Edit Overtime"
                    visible={visible2}
                    style={{ width: "320px" }}
                    onHide={() => setVisible2(false)}
                >
                    <EditOvertime overtime_id={selectedOvertimeId} onSuccess={handleEditSuccess} />
                </Dialog>

            </Row>
        </Row>
    );
};

export default EmployeeOvertime;
