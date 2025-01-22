import React, { useState, useEffect } from "react";
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { Col, Row, Card, Tab, Nav, CardBody } from 'react-bootstrap';
import { InputText } from "primereact/inputtext";
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { DateRangePicker } from "react-bootstrap-daterangepicker";
import "bootstrap-daterangepicker/daterangepicker.css";
import moment from "moment";
import "../../assets/css/filedownload.css";
import { MdOutlineRunningWithErrors } from "react-icons/md";
import { FcApproval, FcCancel } from "react-icons/fc";
import Approvedleave from '../../components/Approvedleave';
import Rejectedleave from '../../components/Rejectedleave';
import Pendingleave from '../../components/Pendingleave';
import axios from 'axios';
import config from '../../config';
import { useAuth } from "../../context/AuthContext";
import AdminAddLeave from "../../modalPopup/AdminAddLeave";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import successVideo from '../../assets/video/paperplane.mp4';
const All_leaves = () => {
    const { accessToken } = useAuth();
    const [dateRange, setDateRange] = useState({
        startDate: moment().startOf("month"),
        endDate: moment().endOf("month"),
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [leaveData, setLeaveData] = useState({
        Pending: [],
        Approved: [],
        Rejected: []
    });
    const [videoDialogVisible, setVideoDialogVisible] = useState(false); // New state for video dialog
    const [visible, setVisible] = useState(false);


    // Fetch leave data
    const fetchLeaveData = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/leaveRoutes/leave-requests-by-status`, {
                params: {
                    start_date: dateRange.startDate.format("YYYY-MM-DD"),
                    end_date: dateRange.endDate.format("YYYY-MM-DD"),
                    search_query: searchQuery,
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Adding the auth header
                },

            });
            if (response.data.success) {
                setLeaveData(response.data.data);
            } else {
                console.error("Failed to fetch leave data:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching leave data:", error.message);
        }
    };

    // Handle date range change
    const handleDateRangeChange = (start, end) => {
        setDateRange({
            startDate: moment(start),
            endDate: moment(end),
        });
    };

    // Fetch data on component mount and when filters change
    useEffect(() => {
        fetchLeaveData();
    }, [dateRange, searchQuery]);


    // Centralized success handler
    const handleLeaveRequestSuccess = () => {
        // Close the modal
             setVideoDialogVisible(true);
             setTimeout(() => {
                 // Hide video dialog after 5 seconds
                 fetchLeaveData(); // Refresh the leave requests
                 setVisible(false);    // Close the modal
                 setVideoDialogVisible(false);
     
             }, 5000);
         };


    return (
        <>
            <Row className='body_content'>
                <Row className='mx-0'>
                    <Col md={6} lg={6} className='mb-4'>
                        <Breadcrumb>
                            <Breadcrumb.Item active>All Leaves</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={6} lg={6} className='mb-4 text-end'>
                        <Button label="Leave Request" severity="primary" icon="pi pi-plus" size="small" onClick={() => setVisible(true)} />
                    </Col>
                    <Col lg={12}>
                        <Card className='leaves-card ps-0'>
                            <Card.Header className='d-flex justify-content-end mb-0 pt-4 align-items-center'>
                                <p className="mb-0">Filter By : </p>
                                <DateRangePicker
                                    initialSettings={{
                                        startDate: dateRange.startDate,
                                        endDate: dateRange.endDate,
                                        locale: { format: "DD/MM/YYYY" },
                                        ranges: {
                                            Today: [moment(), moment()],
                                            "This Month": [moment().startOf("month"), moment().endOf("month")],
                                            "Last Month": [
                                                moment().subtract(1, "month").startOf("month"),
                                                moment().subtract(1, "month").endOf("month"),
                                            ],
                                        },
                                    }}
                                    onCallback={handleDateRangeChange}
                                >
                                    <input
                                        type="text"
                                        className="form-control mx-2"
                                        style={{ width: "200px" }}
                                        placeholder="Select Date Range"
                                    />
                                </DateRangePicker>
                                <IconField iconPosition="left">
                                    <InputIcon className="pi pi-search"> </InputIcon>
                                    <InputText
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search"
                                        className="ps-5"
                                    />
                                </IconField>
                            </Card.Header>
                            <CardBody>
                                <Tab.Container id="left-tabs-example" defaultActiveKey="pending">
                                    <Row>
                                        <Col sm={12} lg={12}>
                                            <Nav variant="pills" className="flex">
                                                <Nav.Item>
                                                    <Nav.Link eventKey="pending"><i><MdOutlineRunningWithErrors /></i> Pending Requests</Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link eventKey="approve"><i><FcApproval /></i> Approved Requests</Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link eventKey="reject"><i><FcCancel /></i> Rejected Requests</Nav.Link>
                                                </Nav.Item>
                                            </Nav>
                                        </Col>
                                        <Col sm={12} lg={12} className='p-0'>
                                            <Tab.Content className='p-4'>
                                                <Tab.Pane eventKey="pending">
                                                    <Pendingleave pendingLeaves={leaveData.Pending} fetchLeaveRequests={fetchLeaveData} />
                                                </Tab.Pane>
                                                <Tab.Pane eventKey="approve">
                                                    <Approvedleave approvedLeaves={leaveData.Approved} fetchLeaveRequests={fetchLeaveData} />
                                                </Tab.Pane>
                                                <Tab.Pane eventKey="reject">
                                                    <Rejectedleave rejectedLeaves={leaveData.Rejected} fetchLeaveRequests={fetchLeaveData} />
                                                </Tab.Pane>
                                            </Tab.Content>
                                        </Col>
                                    </Row>
                                </Tab.Container>
                            </CardBody>
                        </Card>
                    </Col>


                    <Dialog
                        header="Applying for Leave"
                        visible={visible}
                        style={{ width: '60vw' }}
                        onHide={() => setVisible(false)}
                    >
                        <AdminAddLeave
                            onSuccess={handleLeaveRequestSuccess}
                        />
                    </Dialog>

                    <Dialog visible={videoDialogVisible} className='fadeInUp_dilog'
                        onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                        <video src={successVideo} autoPlay loop muted style={{ width: '100%' }} />
                        <h6 className="text-center mt-0 fadeInUp">Process Completed <span className='text-success'>Successfully</span></h6>
                    </Dialog>


                </Row>
            </Row>
        </>
    );
};

export default All_leaves;