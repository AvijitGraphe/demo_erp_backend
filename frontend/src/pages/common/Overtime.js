import React, { useState, useEffect } from "react";
import { Row, Col, Breadcrumb, Card, Table, Badge } from 'react-bootstrap';
import { Dialog } from 'primereact/dialog';
import Addovertime from '../../modalPopup/Addovertime';
import { Button } from 'primereact/button';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Calendar } from 'primereact/calendar';
import { InputText } from "primereact/inputtext";
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';

const Overtime = () => {
    const { accessToken, userId } = useAuth();
    const [visible, setVisible] = useState(false);
    const [approvalDialogVisible, setApprovalDialogVisible] = useState(false);
    const [selectedOvertime, setSelectedOvertime] = useState(null);
    const [date, setDate] = useState(null);
    const [requesterName, setRequesterName] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchOvertimeData();
    }, [date, requesterName]);

    const fetchOvertimeData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (requesterName) params.requesterName = requesterName;
            if (date) {
                const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                params.monthYear = monthYear;
            }

            const response = await axios.get(`${config.apiBASEURL}/overtimeRoutes/allovertime`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params,
            });
            const { Pending, Approved, Rejected } = response.data;
            setData([...Pending, ...Approved, ...Rejected]);
        } catch (error) {
            console.error("Error fetching overtime data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (overtime) => {
        setSelectedOvertime(overtime);
        setApprovalDialogVisible(true);
    };

    const handleApprovalSubmit = async () => {
        if (approvalStatus === 'Rejected' && !reason) {
            return;
        }
        try {
            const payload = {
                approved_by: userId, // Replace with the approver's actual name or ID
                reason: approvalStatus === 'Rejected' ? reason : null,
                status: approvalStatus,
            };

            await axios.put(
                `${config.apiBASEURL}/overtimeRoutes/update-overtime-status/${selectedOvertime._id}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );


            fetchOvertimeData();
            setApprovalDialogVisible(false);
            setSelectedOvertime(null);
            setReason('');
            setApprovalStatus('');
        } catch (error) {
            console.error('Error updating overtime status:', error);

        }
    };

    const handleSuccess = () => {
        fetchOvertimeData();
        setVisible(false);
    };


    return (
        <>
            <Row className='body_content'>
                <Row className='mx-0'>
                    <Col md={6} lg={6} className='mb-4'>
                        <Breadcrumb>
                            <Breadcrumb.Item active>Overtime</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={6} lg={6} className='mb-4 text-end'>
                        <Button
                            className='border-0 py-2'
                            onClick={() => setVisible(true)}
                            icon="pi pi-plus"
                            label="Add Overtime"
                            severity="info"
                        />
                    </Col>
                    <Col md={12} lg={12}>
                        <Card className='verify-table h-auto'>
                            <div className='d-flex justify-content-end mb-4 align-items-center pt-3 pe-3'>
                                <IconField iconPosition="left" className="me-2">
                                    <InputText
                                        placeholder="Search Name"
                                        className="ps-5"
                                        value={requesterName}
                                        onChange={(e) => setRequesterName(e.target.value)}
                                    />
                                </IconField>
                                <IconField iconPosition="left">
                                    <InputIcon className="pi pi-calendar"> </InputIcon>
                                    <Calendar
                                        value={date}
                                        onChange={(e) => setDate(e.value)}
                                        view="month"
                                        dateFormat="mm/yy"
                                        placeholder="Select Month"
                                    />
                                </IconField>
                            </div>
                            {loading ? (
                                <p>Loading...</p>
                            ) : (
                                <Table responsive hover >
                                    <thead>
                                        <tr>
                                            <th>Sl.No</th>
                                            <th>Name</th>
                                            <th>OT Date</th>
                                            <th>Start Time</th>
                                            <th>End Time</th>
                                            <th>OT minutes</th>
                                            <th>Status</th>
                                            <th>Approved By</th>
                                            <th>Reason</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{row.first_name} {row.last_name}</td>
                                                <td>{new Date(row.overtime_date).toLocaleDateString('en-GB')}</td>
                                                <td>{row.start_time}</td>
                                                <td>{row.end_time}</td>
                                                <td>{row.total_time}</td>
                                                <td>
                                                    <Badge className={`bg-${row.status === 'Approved' ? 'success' : row.status === 'Pending' ? 'warning' : 'danger'}`}>
                                                        {row.status}
                                                    </Badge>
                                                </td>
                                                <td>{row.approver_first_name} {row.approverlast_name}</td>
                                                <td>{row.reason || 'NA'}</td>
                                                <td>
                                                    {row.status === 'Pending' && (
                                                        <Button
                                                            icon="pi pi-pencil"
                                                            outlined
                                                            severity="warning"
                                                            className="border-0 p-button-text"
                                                            onClick={() => handleEditClick(row)}
                                                        />
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card>
                    </Col>
                    <Dialog
                        header="Add Overtime"
                        visible={visible}
                        style={{ width: '20vw' }}
                        onHide={() => setVisible(false)}
                    >
                        <Addovertime onSuccess={handleSuccess} />
                    </Dialog>
                    <Dialog
                        header="Approve/Reject"
                        visible={approvalDialogVisible}
                        style={{ width: '320px' }}
                        onHide={() => setApprovalDialogVisible(false)}
                    >
                        <div className="p-fluid">
                            <div className="field">
                                <label>Status</label>
                                <select
                                    className="form-control form-select"
                                    value={approvalStatus}
                                    onChange={(e) => setApprovalStatus(e.target.value)}
                                >
                                    <option value="">Select</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                            {approvalStatus === 'Rejected' && (
                                <div className="field mt-3">
                                    <label>Reason</label>
                                    <textarea
                                        className="form-control "
                                        rows="3"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                    ></textarea>
                                </div>
                            )}
                        </div>
                        <div className="mt-3 text-end">
                            <Button
                                label="Submit"
                                className="py-2 px-4 border-0 bg-success text-white"
                                icon="pi pi-check"
                                onClick={handleApprovalSubmit}
                            />
                        </div>
                    </Dialog>
                </Row>
            </Row>
        </>
    );
};

export default Overtime;
