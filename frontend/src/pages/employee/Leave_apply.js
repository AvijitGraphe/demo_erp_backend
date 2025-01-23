import axios from "axios";
import React, { useState, useEffect } from "react";
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Col, Row, Card, Table } from 'react-bootstrap';
import { Button } from 'primereact/button';
import config from '../../config';
import { Dialog } from 'primereact/dialog';
import { MDBProgress, MDBProgressBar } from 'mdb-react-ui-kit';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';
import { Badge } from 'primereact/badge';
import { useAuth } from "../../context/AuthContext";
import EmpLeaverequest from '../../modalPopup/EmpLeaverequest';
import successVideo from '../../assets/video/paperplane.mp4';
const Leave_apply = () => {
    const { accessToken, userId } = useAuth();
    const [loading, setLoading] = useState(false);

    const [leaveBalances, setLeaveBalances] = useState([]);
    const [visible, setVisible] = useState(false);
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [videoDialogVisible, setVideoDialogVisible] = useState(false); // New state for video dialog
    const [dateRange, setDateRange] = useState({
        startDate: moment().startOf('month').format('YYYY-MM-DD'),
        endDate: moment().endOf('month').format('YYYY-MM-DD'),
    });

    const getBadgeSeverity = (status) => {
        switch (status) {
            case 'Approved':
                return 'success'; // Green
            case 'Rejected':
                return 'danger';  // Red
            case 'Pending':
                return 'warning'; // Yellow
            default:
                return 'info';    // Neutral
        }
    };

    //Get Leve lists
    const fetchLeaveRequests = async () => {
        try {
            const { startDate, endDate } = dateRange;
            console.log("Fetching data with params:", { startDate, endDate });
            const response = await axios.get(
                `${config.apiBASEURL}/leaveRoutes/leave-requests/user/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    params: { start_date: startDate, end_date: endDate },
                }
            );
            console.log("log the data is now ", response.data)
            
            if (response.data.success) {
                const combinedRequests = [
                    ...response.data.data.Pending,
                    ...response.data.data.Approved,
                    ...response.data.data.Rejected,
                ];
                setLeaveRequests(combinedRequests);
                setFilteredRequests(combinedRequests);
            }
        } catch (error) {
            console.error("Error fetching leave requests:", error);
        }
    };

    const handleDateRangeChange = (start, end) => {
        setDateRange({
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD'),
        });
        fetchLeaveRequests(); // Refresh leave requests on date change
    };

    const handleDeleteLeave = async (leaveRequestId) => {
        setLoading(true); // Show loader
        try {
            const response = await axios.delete(
                `${config.apiBASEURL}/leaveRoutes/delete-leave`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    data: { Leave_request_id: leaveRequestId, user_id: userId },
                }
            );
            if (response.data.success) {

                setVideoDialogVisible(true);
                setTimeout(() => {
                    // Hide video dialog after 5 seconds
                    setVideoDialogVisible(false);
                    fetchLeaveRequests(); // Refresh leave requests after deletion
                    fetchLeaveBalances(); // Refresh leave balances after deletion
                }, 5000);


            }
        } catch (error) {
            console.error("Error deleting leave request:", error);

        }
        finally {
            setLoading(false); // Hide loader
        }
    };



    const fetchLeaveBalances = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/leaveRoutes/fetch-user-leave-balances/${userId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setLeaveBalances(response.data.data); // Set leave balances array
        } catch (error) {
            console.error('Error fetching leave balances:', error);
        }
    };
    useEffect(() => {
        fetchLeaveBalances();
    }, [userId, accessToken]);



    useEffect(() => {
        fetchLeaveRequests();
    }, [dateRange]);



    // Centralized success handler
    const handleLeaveRequestSuccess = () => {
        // Close the modal
        setVideoDialogVisible(true);
        setTimeout(() => {
            // Hide video dialog after 5 seconds
            fetchLeaveRequests(); // Refresh the leave requests
            fetchLeaveBalances(); // Refresh the leave balances
            setVisible(false);
            setVideoDialogVisible(false);

        }, 5000);
    };





    return (
        <>
            <Row className='body_content'>
                <Row>
                    <Col md={12} lg={9} className='mb-4'>
                        <Breadcrumb>
                            <Breadcrumb.Item active>Leaves</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={12} lg={3} className='mb-4 text-end'>
                        <Button label="Leave Request" severity="primary" icon="pi pi-plus" size="small" onClick={() => setVisible(true)} />
                    </Col>
                    <Row className="mx-0 mb-5 justify-content-center">
                        {leaveBalances.map((leave) => {
                            const maxDays = leave.total_days; // Use total_days from the API data
                            const remainingDays = leave.earned_days;
                            // Determine if carry-over exists
                            const carryOverDays = remainingDays > maxDays ? remainingDays - maxDays : 0;
                            const adjustedRemainingDays = remainingDays > maxDays ? maxDays : remainingDays;
                            return (
                                <Col key={leave.leave_balance_id} md={6} lg={4} className="dashboard_card mb-3">
                                    <Card>
                                        <Card.Header>
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <span className="d-block">{leave.name}</span>
                                                </div>
                                                <div>
                                                    <span className="text-secondary">{maxDays} days</span>
                                                </div>
                                            </div>
                                        </Card.Header>
                                        <Card.Body>
                                            <Card.Title>
                                                {adjustedRemainingDays || 0} days
                                                {carryOverDays > 0 && (
                                                    <sub className="text-success ms-1" style={{ fontSize: '13px' }}>
                                                        / +{carryOverDays} carry over
                                                    </sub>
                                                )}
                                            </Card.Title>
                                            <Card.Text>
                                                <MDBProgress>
                                                    <MDBProgressBar
                                                        bgColor="warning"
                                                        width={
                                                            adjustedRemainingDays
                                                                ? ((maxDays - adjustedRemainingDays) / maxDays) * 100
                                                                : 100
                                                        }
                                                        valuemin={0}
                                                        valuemax={100}
                                                    />
                                                </MDBProgress>
                                                <span>
                                                    Year_{new Date().getFullYear()}:{' '}
                                                    <span className="text-danger">
                                                        <b>
                                                            {adjustedRemainingDays || 0} days left out of {maxDays} days
                                                        </b>
                                                    </span>
                                                </span>
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>


                    <Col md={12} className="p-0">
                        <Card>
                            <Card.Header className='d-flex justify-content-end align-items-center'>
                                <label className="me-2">Filter by Date Range</label>
                                <DateRangePicker
                                    initialSettings={{
                                        startDate: moment(dateRange.startDate).toDate(),
                                        endDate: moment(dateRange.endDate).toDate(),
                                        locale: { format: "DD/MM/YYYY" },
                                        ranges: {
                                            Today: [moment(), moment()],
                                            "This Month": [moment().startOf("month"), moment().endOf("month")],
                                        },
                                    }}
                                    onCallback={handleDateRangeChange}
                                >
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Select Date Range"
                                        style={{ width: '200px' }}
                                    />
                                </DateRangePicker>
                            </Card.Header>
                            <Card.Body>
                                {loading ? (
                                    <div className="d-flex justify-content-center align-items-center">
                                        <div style={{ width: "100%" }}>
                                            <MDBProgress>
                                                <MDBProgressBar animated bgColor="secondary" width="100%" />
                                            </MDBProgress>
                                            <p className="text-center mt-2">Deleting leave request...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {filteredRequests.length === 0 ? (
                                            <p className="text-center text-muted">
                                                No leave requests found.
                                            </p>
                                        ) : (
                                            <Table hover bordered size="sm">
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "60px" }}>S.No</th>
                                                        <th>Name</th>
                                                        <th style={{ width: "400px" }}>Dates</th>
                                                        <th>Reason</th>
                                                        <th>Applied On</th>
                                                        <th>Status</th>
                                                        <th>Comment</th>
                                                        <th style={{ width: "80px" }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredRequests.map((request, index) => (
                                                        <tr key={request.Leave_request_id}>
                                                            <td>{index + 1}</td>
                                                            <td>
                                                                {request.leaveType?.name || "N/A"}
                                                                <span className="d-block text-info">
                                                                    <b>{request.Total_days} Days</b>
                                                                </span>
                                                            </td>
                                                            <td>
                                                                {request.dates
                                                                    ? JSON.parse(request.dates).map(
                                                                        (date, index) => (
                                                                            <span
                                                                                className="alldateSpan"
                                                                                key={index}
                                                                            >
                                                                                {moment(date).format(
                                                                                    "DD/MM/YYYY"
                                                                                )}
                                                                            </span>
                                                                        )
                                                                    )
                                                                    : "N/A"}
                                                            </td>
                                                            <td>
                                                                {request.reason ||
                                                                    "No reason provided"}
                                                            </td>
                                                            <td>
                                                                {moment(request.createdAt).format(
                                                                    "DD/MM/YYYY"
                                                                )}
                                                            </td>
                                                            <td>
                                                                <Badge
                                                                    value={request.Status}
                                                                    severity={getBadgeSeverity(
                                                                        request.Status
                                                                    )}
                                                                />
                                                            </td>
                                                            <td>{request.Comment}</td>
                                                            <td>
                                                                {request.Status === "Pending" && (
                                                                    <Button
                                                                        title="Delete"
                                                                        icon="pi pi-trash"
                                                                        severity="danger"
                                                                        className="border-0 p-0"
                                                                        outlined
                                                                        onClick={() =>
                                                                            handleDeleteLeave(
                                                                                request.Leave_request_id
                                                                            )
                                                                        }
                                                                    />
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        )}
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Row>
            <Dialog
                header="Applying for Leave"
                visible={visible}
                style={{ width: '60vw' }}
                onHide={() => setVisible(false)}
            >
                <EmpLeaverequest
                    onSuccess={handleLeaveRequestSuccess}
                />
            </Dialog>
            <Dialog visible={videoDialogVisible} className='fadeInUp_dilog'
                onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                <video src={successVideo} autoPlay loop muted style={{ width: '100%' }} />
                <h6 className="text-center mt-0 fadeInUp">Process Completed <span className='text-success'>Successfully</span></h6>
            </Dialog>


        </>
    );
};

export default Leave_apply;
