import React, { useState, useEffect, useRef } from 'react';
import { Form, Row, Col, Card, Breadcrumb, Table, Badge } from 'react-bootstrap';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import axios from 'axios';
import config from '../../config';
import { Dialog } from 'primereact/dialog';
import CustomToast from '../../components/CustomToast';
import { Link, useParams } from 'react-router-dom';
import { Galleria } from 'primereact/galleria';
import { Avatar } from 'primereact/avatar';
import noUserImage from '../../assets/images/no_user.png';
import { Tooltip } from 'primereact/tooltip';
import { useAuth } from "../../context/AuthContext";
import { InputTextarea } from 'primereact/inputtextarea';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
const Ticket_details = () => {
    const { accessToken, userId, role } = useAuth();
    const { ticket_id } = useParams(); // Get ticket_id from URL params
    const galleria = useRef(null);
    const navigate = useNavigate(); // Initialize navigate
    const [ticket, setTicket] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateDialogVisible, setUpdateDialogVisible] = useState(false);
    const [status, setStatus] = useState('');
    const [remarks, setRemarks] = useState('');
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



    const fetchTicketDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${config.apiBASEURL}/ticketRoutes/specificticket/${ticket_id}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            setTicket(response.data.ticket);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch ticket details.');
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTicketDetails();
    }, [ticket_id, accessToken]);



    const handleUpdate = async () => {
        try {
            const payload = {
                status,
                remarks,
                user_id: userId,
            };

            const response = await axios.put(
                `${config.apiBASEURL}/ticketRoutes/tickets/${ticket_id}`,
                payload,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            fetchTicketDetails();
            setUpdateDialogVisible(false);
        } catch (error) {
            console.error('Error updating ticket:', error);
            setError('Failed to update ticket.');
        }
    };



    const itemTemplate = (item) => {
        return <img src={item.image_url_ticket} alt={`Screenshot ${item.Ticket_image_id}`} style={{ width: '100%' }} />;
    };

    const thumbnailTemplate = (item) => {
        return <img src={item.image_url_ticket} alt={`Thumbnail ${item.Ticket_image_id}`} style={{ width: '100%' }} />;
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;



    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col sm={12} lg={4} className="mb-4">
                        <Breadcrumb>
                            <Breadcrumb.Item  onClick={() => navigate(-1)}><i className="pi pi-angle-left"></i> Ticket</Breadcrumb.Item>
                            <Breadcrumb.Item active>Tickets Detail</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col sm={12} lg={8} className="mb-4 d-flex justify-content-end align-items-center">
                        {['SuperAdmin', 'Admin', 'Founder'].includes(role) && (
                            <Button
                                label="Update"
                                icon="pi pi-save"
                                severity="primary"
                                className="border-0"
                                onClick={() => setUpdateDialogVisible(true)}
                            />
                        )}
                    </Col>
                    <Col sm={12} lg={12}>
                        <Row className="mx-0">
                            <Col sm={12} lg={8} className="mb-4 mb-lg-0">
                                <Card className="h-auto">
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h6>
                                            {ticket.category}
                                            <span className="d-block">
                                                <Badge className="bg-info-transparent" style={{ fontSize: '15px' }}>
                                                    {ticket.ticket_no}
                                                </Badge>
                                            </span>
                                        </h6>
                                        <Badge bg={getBadgeColor(ticket.status)} className="text-white">
                                            {ticket.status || 'NA'}
                                        </Badge>


                                    </Card.Header>
                                    <Card.Body className='pb-0'>
                                        <h6>{ticket.subject}</h6>
                                        <p>
                                            <small className="text-muted d-block">
                                                Date & Time: {new Date(ticket.createdAt).toLocaleString('en-GB')}
                                            </small>
                                        </p>
                                        <p>{ticket.issue}</p>

                                    </Card.Body>
                                    <Card.Footer className="bg-light border-0">
                                        <small className="text-muted d-block">
                                            <strong>Remarks:</strong> {ticket.remarks || 'Remarks Available on Starting Ticket'}
                                        </small>
                                    </Card.Footer>
                                </Card>
                            </Col>
                            <Col sm={12} lg={4} className="mb-3">
                                <Card className="shadow-0 mb-3 h-auto">
                                    <Card.Header className="h6">Ticket Update</Card.Header>
                                    <Card.Body className="tick_det">
                                        <p>
                                            <span>Subject</span>
                                            <span>{ticket.subject}</span>
                                        </p>
                                        <p>
                                            <span>Status Update</span>
                                            <span><Badge bg={getBadgeColor(ticket.status)} className="text-white">
                                                {ticket.status || 'NA'}
                                            </Badge></span>
                                        </p>
                                        <p className="justify-content-start align-items-center">
                                            <span className="me-2">
                                                <Avatar image={ticket.raiser.profileImage?.image_url || noUserImage} shape="circle" />
                                            </span>
                                            <span>
                                                <small className="d-block text-muted">User</small>
                                                {`${ticket.raiser.first_name} ${ticket.raiser.last_name}`}
                                            </span>
                                        </p>
                                        {ticket.resolver && (
                                            <p className="justify-content-start align-items-center">
                                                <span className="me-2">
                                                    <Avatar image={ticket.resolver.profileImage?.image_url || noUserImage} shape="circle" />
                                                </span>
                                                <span>
                                                    <small className="d-block text-muted">Worked By</small>
                                                    {`${ticket.resolver?.first_name || 'NA'} ${ticket.resolver?.last_name || ''}`}
                                                </span>
                                            </p>
                                        )}




                                    </Card.Body>
                                </Card>
                                <Card className="shadow-0 h-auto">
                                    <Card.Header className="h6">Screenshot</Card.Header>
                                    <Card.Body>
                                        <Galleria
                                            ref={galleria}
                                            value={ticket.images}
                                            numVisible={7}
                                            style={{ maxWidth: '100%' }}
                                            activeIndex={activeIndex}
                                            onItemChange={(e) => setActiveIndex(e.index)}
                                            circular
                                            fullScreen
                                            showItemNavigators
                                            showThumbnails={false}
                                            item={itemTemplate}
                                            thumbnail={thumbnailTemplate}
                                        />
                                        <div className="d-flex gap-2 resp_scrinshot" style={{ maxWidth: '100%', flexWrap: 'wrap' }}>
                                            {ticket.images.map((image, index) => (
                                                <div key={index} style={{ width: '130px', height: '130px', border: '1px solid #e5e7eb'}}>
                                                    <img
                                                        src={image.image_url_ticket}
                                                        alt={`Thumbnail ${index}`}
                                                        style={{ cursor: 'pointer', width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onClick={() => {
                                                            setActiveIndex(index);
                                                            galleria.current.show();
                                                        }}
                                                        className="w-100"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Row>
            <Dialog
                visible={updateDialogVisible}
                header="Update Ticket"
                onHide={() => setUpdateDialogVisible(false)}
                footer={
                    <>
                        <Button 
                            severity='danger' 
                            label="Cancel" 
                            icon="pi pi-times" 
                            onClick={() => setUpdateDialogVisible(false)} 
                            className="py-2 border-0"
                        />
                        <Button 
                            severity='success' 
                            label="Update" 
                            icon="pi pi-check" 
                            onClick={handleUpdate} 
                            autoFocus
                            className="py-2 border-0 ms-2"
                        />
                    </>
                }
            >
                <Form>
                    <Form.Group controlId="formTicketStatus" className="mb-2">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option disabled value="">Select Status</option>

                            <option value="Solved">Solved</option>
                            <option value="In-progress">In-progress</option>
                            <option value="Rejected">Rejected</option>
                        </Form.Select>

                    </Form.Group>
                    <Form.Group controlId="formTicketRemarks" className="mb-2">
                        <Form.Label>Remarks</Form.Label>
                        <InputTextarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={3}
                            placeholder="Enter remarks"
                            className='h-auto'
                        />
                    </Form.Group>
                </Form>
            </Dialog>
        </>
    );
};
export default Ticket_details;