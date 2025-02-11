import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Card, Breadcrumb, Table, Badge } from 'react-bootstrap';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import config from '../../config';
import CustomToast from '../../components/CustomToast';
import { Link } from 'react-router-dom';
import { IoTicketOutline, IoFolderOpenOutline, IoCheckmarkDoneOutline } from "react-icons/io5";
import { GiSandsOfTime } from "react-icons/gi";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';
import { IconField } from "primereact/iconfield";
import { InputText } from "primereact/inputtext";
import { InputIcon } from "primereact/inputicon";
import { Avatar } from 'primereact/avatar';
import noUserImage from '../../assets/images/no_user.png';
import { Tooltip } from 'primereact/tooltip';
import { useAuth } from "../../context/AuthContext";
import AddTicketPage from '../../modalPopup/AddTicketPage';
const Ticket_list_admin = () => {
    const { accessToken } = useAuth();
    const [dateRange, setDateRange] = useState({
        startDate: moment().startOf("month"),
        endDate: moment().endOf("month"),
    });
    const [tickets, setTickets] = useState([]);
    const [counts, setCounts] = useState({
        New_ticket: 0,
        Solved: 0,
        InProgress: 0,
        Rejected: 0,
    });


    const getBadgeColor = (status) => {
        switch (status) {
            case 'New_ticket':
                return 'primary'; // Blue
            case 'Solved':
                return 'success'; // Green
            case 'In-progress':
                return 'warning'; // Yellow
            case 'Rejected':
                return 'danger'; // Red
            default:
                return 'secondary'; // Gray for undefined or other statuses
        }
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [dialogVisible, setDialogVisible] = useState(false);
    // Fetch tickets from API
    const fetchTickets = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/ticketRoutes/fetchalltickets`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    start_date: dateRange.startDate.format('YYYY-MM-DD'),
                    end_date: dateRange.endDate.format('YYYY-MM-DD'),
                    subject: searchTerm,
                },
            });
            console.log("log the data ", response)
            setTickets(response.data.tickets);
            setCounts(response.data.counts);
        } catch (error) {
            console.error("Error fetching tickets:", error);

        }
    };

    useEffect(() => {
        fetchTickets();
    }, [dateRange, searchTerm, accessToken]);


    const handleDateRangeChange = (start, end) => {
        setDateRange({ startDate: start, endDate: end });
    };

    const handleDialogClose = () => {
        setDialogVisible(false);
    };

    const handleDialogSuccess = () => {
        fetchTickets();
        // Add logic to refresh task list if needed
    };


    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col xs={6} sm={6} lg={4} className="mb-4">
                        <Breadcrumb>
                            <Breadcrumb.Item active>Ticket List</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col sm={6} lg={8} xs={6} className="mb-4 d-flex justify-content-end align-items-center text-end">
                        <Button
                            label="Add Ticket"
                            icon="pi pi-ticket"
                            severity="help"
                            className="border-0"
                            onClick={() => setDialogVisible(true)}
                        />
                    </Col>

                    <Col sm={12} lg={12} className="mb-4">
                        <ul className='justify-content-start taskperform ticketlist'>
                            <li className='dashboard_card'>
                                <Card className="shadow-0">
                                    <Card.Header>
                                        <div className="d-flex justify-content-between">
                                            <div className='repTItle'>
                                                <span className="d-block">New Tickets</span>
                                                <span className="d-block h4 mt-3">{counts.New_ticket}</span>
                                            </div>
                                            <div className='hrshortdata'>
                                                <span style={{ color: '#cdf0ff' }}><IoTicketOutline /></span>
                                            </div>
                                        </div>
                                    </Card.Header>
                                </Card>
                            </li>
                            <li className='dashboard_card'>
                                <Card className="shadow-0">
                                    <Card.Header>
                                        <div className="d-flex justify-content-between">
                                            <div className='repTItle'>
                                                <span className="d-block">Open Tickets</span>
                                                <span className="d-block h4 mt-3">{counts.InProgress}</span>
                                            </div>
                                            <div className='hrshortdata'>
                                                <span style={{ color: '#fff3cf' }}><IoFolderOpenOutline /></span>
                                            </div>
                                        </div>
                                    </Card.Header>
                                </Card>
                            </li>
                            <li className='dashboard_card'>
                                <Card className="shadow-0">
                                    <Card.Header>
                                        <div className="d-flex justify-content-between">
                                            <div className='repTItle'>
                                                <span className="d-block">Solved Tickets</span>
                                                <span className="d-block h4 mt-3">{counts.Solved}</span>
                                            </div>
                                            <div className='hrshortdata'>
                                                <span style={{ color: '#dfffe1' }}>
                                                    <IoCheckmarkDoneOutline />
                                                </span>
                                            </div>

                                        </div>
                                    </Card.Header>
                                </Card>
                            </li>
                            <li className='dashboard_card'>
                                <Card className="shadow-0">
                                    <Card.Header>
                                        <div className="d-flex justify-content-between">
                                            <div className='repTItle'>
                                                <span className="d-block">Rejected Tickets</span>
                                                <span className="d-block h4 mt-3">{counts.Rejected}</span>
                                            </div>
                                            <div className='hrshortdata'>
                                                <span style={{ color: '#ffeeee' }}><GiSandsOfTime /></span>
                                            </div>
                                        </div>
                                    </Card.Header>
                                </Card>
                            </li>
                        </ul>
                    </Col>

                    <Col sm={12} lg={12} className="mb-2">
                        <Card className="d-lg-flex d-md-flex d-sm-flex d-block justify-content-end align-items-center p-2 shadow-0 responsiveView" style={{ flexDirection: 'row' }}>
                            <div className='me-0 me-lg-2 mb-2 mb-lg-0'>
                                <DateRangePicker
                                    initialSettings={{
                                        startDate: moment(dateRange.startDate).toDate(),
                                        endDate: moment(dateRange.endDate).toDate(),
                                        locale: { format: "DD/MM/YYYY" },
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
                            </div>
                            <div className='me-0 me-lg-2'>
                                <IconField iconPosition="left" style={{ width: '200px' }}>
                                    <InputIcon className="pi pi-search"> </InputIcon>
                                    <InputText
                                        placeholder="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className='ps-5'
                                    />
                                </IconField>
                            </div>
                            {/* <div>
                                <Button
                                    title="Filter"
                                    icon="pi pi-search"
                                    severity="primary"
                                    className=""
                                    style={{ height: '46px', width: '46px' }}
                                    onClick={fetchTickets}
                                />
                            </div> */}
                        </Card>
                    </Col>

                    <Col sm={12} lg={12} className="mb-4">
                        <ul className='ticketlist_Admin'>
                            {tickets.map((ticket) => (
                                <li key={ticket.id}>
                                    <Link to={`/dashboard/ticket_details/${ticket.ticket_id}`} className="d-block">
                                        <Card>
                                            <Card.Header className='border-0 text-center'>
                                                <Avatar image={ticket.raiser?.profileImage.image_url || noUserImage} className="mb-2 logo2" shape="circle" size="large" data-pr-tooltip={ticket.raiser?.first_name || "N/A"} />
                                                <p className='mb-0'><b>{ticket.category}</b></p>
                                                <Badge className='bg-info-transparent'>Tic - {ticket.ticket_no}</Badge>
                                                <Tooltip target=".logo2" mouseTrack mouseTrackLeft={10} />
                                            </Card.Header>
                                            <Card.Body className='pb-0'>
                                                <p>
                                                    <span>Subject</span>
                                                    <span>{ticket.subject || "N/A"}</span>
                                                </p>
                                                <p>
                                                    <span>Status</span>
                                                    <Badge bg={getBadgeColor(ticket.status)} className="text-white">
                                                        {ticket.status || "N/A"}
                                                    </Badge>
                                                </p>
                                                <p>
                                                    <span>Assigned To</span>
                                                    <span>
                                                        <Avatar image={ticket.resolver?.profileImage.image_url || noUserImage} shape="circle" className="logo" data-pr-tooltip={ticket.resolver?.first_name || "Unassigned"} />
                                                        <Tooltip target=".logo" mouseTrack mouseTrackLeft={10} />
                                                    </span>
                                                </p>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Col>

                    <Dialog
                        header="Add Ticket"
                        visible={dialogVisible}
                        onHide={handleDialogClose}
                        style={{ width: "350px" }}
                    >
                        <AddTicketPage
                            onClose={handleDialogClose}
                            onSuccess={handleDialogSuccess}
                        />
                    </Dialog>
                </Row>
            </Row>
        </>
    );
};
export default Ticket_list_admin;