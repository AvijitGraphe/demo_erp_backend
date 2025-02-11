import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import { Col, Row, Card, Breadcrumb, Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Calendar } from "primereact/calendar";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../../assets/css/table.css'
// Importing the image file
import logoImage from '../../assets/images/logo.png';
import signature_image from '../../assets/images/sign_n.png';
import { InputNumber } from 'primereact/inputnumber';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import nouserImg from '../../assets/images/no_user.png';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import successVideo from '../../assets/video/paperplane.mp4';
const Reg_template_view = () => {
    const { accessToken, userId, role } = useAuth();
    const { resignation_id } = useParams(); // Extract the resignation ID from the URL parameters
    const [videoDialogVisible, setVideoDialogVisible] = useState(false); // New state for video dialog
    const [resignation, setResignation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [value4, setValue4] = useState('');
    // State variables for form fields
    const [status, setStatus] = useState('');
    const [lastWorkingDay, setLastWorkingDay] = useState('');
    const [noticeDuration, setNoticeDuration] = useState('');
    const [loader, setLoader] = useState(false);
    const [date, setDate] = useState(null);
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1); // Navigate back to the previous page
    };

    // Roles allowed to see the buttons
    const allowedRoles = ['SuperAdmin', 'Admin', 'Founder', 'HumanResource'];
    useEffect(() => {
        // Set the date to current date on mount
        setDate(new Date());
    }, []);

    const payslipRef = useRef();

    const fetchResignationDetails = async () => {
        try {
            const response = await axios.get(
                `${config.apiBASEURL}/resignationRoutes/fetch-specific-resignation/${resignation_id}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            setResignation(response.data);
        } catch (error) {
            console.error('Error fetching resignation details:', error);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (resignation_id) {
            fetchResignationDetails();
        } else {
            setLoading(false);
        }
    }, [resignation_id, accessToken]);


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoader(true);

        try {
            const response = await axios.put(
                `${config.apiBASEURL}/resignationRoutes/update-resignation-status/${resignation_id}`,
                {
                    status,
                    last_working_day: lastWorkingDay,
                    notice_duration: noticeDuration,
                },
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );


        } catch (error) {
            console.error('Error updating resignation status:', error);

        } finally {
            setLoader(false);
            setFormVisible(false);
            setVideoDialogVisible(true); // Show video dialog
            setTimeout(() => {
                setVideoDialogVisible(false); // Hide video dialog after 6 seconds
                fetchResignationDetails();
            }, 5000);



        }
    };




    const downloadPDF = () => {
        const content = document.querySelector('.letterTable'); // Select the content to render

        if (!content) {
            console.error('Content not found for PDF generation.');
            return;
        }

        html2canvas(content, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pageWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const margin = 10; // Margin in mm
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = margin;

            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = margin - (imgHeight - heightLeft);
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            setVideoDialogVisible(true); // Show video dialog
            setTimeout(() => {
                pdf.save('resignation_letter.pdf'); // Save the PDF with the desired name
                setVideoDialogVisible(false); // Hide video dialog after 6 seconds
            }, 5000);

        }).catch((error) => {
            console.error('Error generating PDF:', error);
        });
    };

    const toggleFormVisibility = () => {
        setFormVisible((prev) => !prev);
    };


    if (loading) {
        return (
            <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p>Loading resignation details...</p>
            </div>
        );
    }




    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col md={12} lg={12} className="mb-4">
                        <Breadcrumb>
                            <Breadcrumb.Item onClick={handleBack} style={{ cursor: 'pointer' }}>
                                <i className="pi pi-arrow-left me-2"></i>
                                Back
                            </Breadcrumb.Item>
                            <Breadcrumb.Item active>
                                View Letter
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col lg={8}>
                        <Card>
                            <Card.Body className={`letterTable rgwater pb-0 ${resignation.status === 'Approved'
                                    ? 'RG_worterMark'
                                    : resignation.status === 'Rejected'
                                        ? 'RG_worterMark-rg'
                                        : ''
                                }`}> {/* RG_worterMark-rg */}
                                <Table border={0}>
                                    <thead>
                                        <tr>
                                            <td className='p-0'><span className="d-block p-0 pb-4"><img src={logoImage} alt="brand-logo" style={{ width: '120px' }} /></span></td>
                                            <td className='text-end p-0'>
                                                <div className='d-flex justify-content-end'>
                                                    <p style={{ width: '252px' }}>
                                                        Godrej Genesis Building, 11th Floor, EN-34, EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700105
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <b className='ps-0 mb-2'>From,</b>
                                                <span className='d-block p-0'><b>{`${resignation.user.first_name} ${resignation.user.last_name}`}</b></span>
                                            </td>
                                            <td className='text-end'>Date : {new Date(resignation.resignation_date).toLocaleDateString('en-GB')}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} className='pt-4'>
                                                <b className='ps-0 pe-0'>Subject :  </b>
                                                <span className='p-0'><b> Resignation</b></span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <td colSpan={5}>
                                                {resignation.resignation_reason}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={5} className='text-warning'>

                                                {resignation.notice_period_served ? 'Willing to serve notice period' : 'Not willing to serve notice period'}
                                            </td>
                                        </tr>

                                        <tr>
                                            <td className='pt-0' colSpan={5}>
                                                <hr/>
                                                <p className='pt-3'><b>Response:</b></p>
                                                {resignation.status === 'Pending' && (
                                                    <p className='text-dark'>
                                                        Your resignation application has been sent to the Admin, HR, and Founder for review. You will be notified once a decision is made.
                                                    </p>
                                                )}
                                                {resignation.status === 'Approved' && (
                                                    <p className='text-dark'>
                                                        Your resignation application has been approved. Please proceed with the offboarding formalities and coordinate with HR for a seamless transition.
                                                        Your Last Working Day has been decided to be <b>{resignation.last_working_day ? new Date(resignation.last_working_day).toLocaleDateString('en-GB') : 'Not Available'}. </b>
                                                        Thank you for your contribution to the team.
                                                        Best of luck

                                                    </p>
                                                )}
                                                {resignation.status === 'Rejected' && (
                                                    <p className='text-dark'>
                                                        Unfortunately, your resignation application has been rejected. For further details or clarification, please contact the Admin or HR department.
                                                    </p>
                                                )}

                                                <p className='mb-2 mt-2'>
                                                    {resignation.status === 'Approved' && (
                                                        <>

                                                            <span className="ps-0 pe-0 text-muted">Notice Period (Assigned) : </span>
                                                            <b className="p-0 text-dark">
                                                                {resignation.notice_duration
                                                                    ? resignation.notice_duration + ' days'
                                                                    : 'Not Available'}
                                                            </b>
                                                        </>
                                                    )}
                                                </p>
                                                <p>
                                                    <span className="ps-0 pe-0 text-muted">Status: </span>
                                                    <span className="p-0">
                                                        <Badge
                                                            value={resignation.status}
                                                            severity={
                                                                resignation.status === 'Approved'
                                                                    ? 'success'
                                                                    : resignation.status === 'Pending'
                                                                        ? 'warning'
                                                                        : 'danger'
                                                            }
                                                            className="ms-2"
                                                        />
                                                    </span>
                                                </p>
                                            </td>
                                        </tr>

                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={5} className="text-center pt-5">
                                                <small className='text-muted'>Godrej Genesis Building, 11th Floor, EN-34, EN Block, Sector V, Bidhannagar, Kolkata, West Bengal 700105</small>

                                            </td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </Card.Body>
                        </Card>

                    </Col>
                    <Col lg={4}>
                        <div className='sticky-top'>
                            <Card className='h-auto mb-3'>
                                <Card.Body className='py-2 text-end'>
                                    {allowedRoles.includes(role) && (
                                        formVisible ? (
                                            <Button
                                                icon="pi pi-times"
                                                label="Close"
                                                className="shadow-none py-2 me-2"
                                                severity="danger"
                                                onClick={toggleFormVisibility}
                                            />
                                        ) : (
                                            <Button
                                                icon="pi pi-pencil"
                                                label="Edit"
                                                className="shadow-none py-2 me-2"
                                                severity="help"
                                                onClick={toggleFormVisibility}
                                            />
                                        )
                                    )}


                                    {resignation?.status === 'Approved' && (
                                        <Button
                                            icon="pi pi-file-pdf"
                                            label="Download Letter"
                                            className="shadow-none py-2"
                                            severity="warning"
                                            raised
                                            onClick={downloadPDF}
                                        />
                                    )}


                                </Card.Body>
                            </Card>
                            <Card className='h-auto'>
                                <Card.Body className='pb-0'>
                                    <div className='d-flex'>
                                        <Avatar
                                            image={resignation.user.profileImage?.image_url || nouserImg}
                                            className="me-3"
                                            size="large"
                                            shape="circle"
                                        />
                                        <p className='pb-0'>
                                            <span className='d-block mb-1'><b>{`${resignation.user.first_name} ${resignation.user.last_name}`}</b></span>
                                            <small className='d-block mb-1'>{resignation.user.user_type}</small>
                                            <small className='d-block mb-1'>{resignation.user.email}</small>
                                            <small className='d-block mb-1'><small><em>Joining Date : </em></small><b>{resignation.user.joiningDates?.[0]?.joining_date
                                                ? new Date(resignation.user.joiningDates[0].joining_date).toLocaleDateString('en-GB')
                                                : 'Not Available'}</b></small>
                                        </p>
                                    </div>
                                </Card.Body>
                            </Card>
                            {formVisible && (
                                <Card className="h-auto mt-3 formCard">
                                    <Card.Body className='pb-2'>
                                        <Form onSubmit={handleSubmit}>
                                            <Row>
                                                <Col md={6} lg={6} className="px-1 mb-3">
                                                    <Form.Group controlId="status">
                                                        <label>Status</label>
                                                        <Form.Select
                                                            as="select"
                                                            value={status}
                                                            onChange={(e) => setStatus(e.target.value)}
                                                            required
                                                        >
                                                            <option value="">Select Status</option>
                                                            <option value="Pending">Pending</option>
                                                            <option value="Approved">Approved</option>
                                                            <option value="Rejected">Rejected</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6} lg={6} className="px-1 mb-3">
                                                    <Form.Group controlId="lastWorkingDay">
                                                        <label>Last Working Day</label>
                                                        {/* <Form.Control
                                                            type="date"
                                                            value={lastWorkingDay}
                                                            onChange={(e) => setLastWorkingDay(e.target.value)}
                                                        /> */}
                                                        <Calendar
                                                            id="lastWorkingDay"
                                                            value={lastWorkingDay}
                                                            onChange={(e) => {
                                                                const localDate = new Date(e.value.getTime() - e.value.getTimezoneOffset() * 60000);
                                                                setLastWorkingDay(localDate);
                                                            }}
                                                            dateFormat="dd/mm/yy" // Customize date format
                                                            placeholder="Select a date"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                {resignation?.notice_period_served ? (
                                                    <>

                                                        <Col md={6} lg={6} className="px-1">
                                                            <Form.Group controlId="noticeDuration">
                                                                <label>Notice Duration (in days)</label>
                                                                <Form.Select
                                                                    as="select"
                                                                    value={noticeDuration}
                                                                    onChange={(e) => setNoticeDuration(e.target.value)}
                                                                >
                                                                    <option value="">Select Duration</option>
                                                                    <option value="0">0</option>
                                                                    <option value="15">15</option>
                                                                    <option value="30">30</option>
                                                                    <option value="45">45</option>
                                                                    <option value="60">60</option>
                                                                    <option value="90">90</option>
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </Col>
                                                    </>
                                                ) : null}

                                                <Col md={12} lg={12} className='px-1 py-4 text-end'>
                                                    <hr />
                                                    <Button
                                                        icon="pi pi-save"
                                                        label={loader ? 'Saving...' : 'Save'}
                                                        className='shadow-none py-2 mt-3'
                                                        severity="help"
                                                        type="submit"
                                                        disabled={loader}
                                                    />

                                                </Col>
                                            </Row>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            )}
                        </div>
                    </Col>
                </Row>
            </Row>
            <Dialog visible={videoDialogVisible} className='fadeInUp_dilog'
                onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                <video src={successVideo} autoPlay loop muted style={{ width: '100%' }} />
                <h6 className="text-center mt-0 fadeInUp">Process Completed <span className='text-success'>Successfully</span></h6>
            </Dialog>


        </>
    );
};

export default Reg_template_view;