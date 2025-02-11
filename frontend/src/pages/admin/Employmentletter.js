import React, { useEffect, useState } from 'react';
import { Col, Row, Card, Badge, Breadcrumb, Nav, Tab, Table, Form } from 'react-bootstrap';
import logoImage from '../../assets/images/logo.png';
import { Button } from 'primereact/button';
import { Editor } from 'primereact/editor'; // Import PrimeReact Editor
import axios from 'axios';
import config from '../../config';
import CustomToast from '../../components/CustomToast';
import { useAuth } from '../../context/AuthContext';
import successVideo from '../../assets/video/paperplane.mp4';
import crossVideo from '../../assets/video/cross.mp4';
import { Dialog } from "primereact/dialog";
import { useNavigate } from 'react-router-dom';
const Employmentletter = () => {
    const { accessToken } = useAuth();
    const [templateName, setTemplateName] = useState('');
    const [subject, setSubject] = useState('');
    const [sections, setSections] = useState([
        { section_heading: '', section_body: '', section_order: 1 },
    ]);
    const [employeeName, setEmployeeName] = useState('Employee Name');
    const [currentDate, setCurrentDate] = useState('');
    const [videoDialogVisible, setVideoDialogVisible] = useState(false); // New state for video dialog
    const [videocrossDialogVisible, setVideocrossDialogVisible] = useState(false); // New state for video dialog
        const navigate = useNavigate();
    // Set the current date on component mount
    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-GB'); // Format the date as 'dd/mm/yyyy'
        setCurrentDate(formattedDate);
    }, []);

    // Handle changes to section fields
    const handleSectionChange = (index, field, value) => {
        const updatedSections = [...sections];
        updatedSections[index][field] = value;
        setSections(updatedSections);
    };

    // Add a new section
    const handleAddSection = () => {
        setSections([
            ...sections,
            { section_heading: '', section_body: '', section_order: sections.length + 1 },
        ]);
    };

    // Remove a section
    const handleRemoveSection = (index) => {
        const updatedSections = sections.filter((_, i) => i !== index);
        setSections(updatedSections);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                template_name: templateName,
                template_subject: subject,
                sections: sections,
            };
            const response = await axios.post(
                `${config.apiBASEURL}/letterRoutes/letter-template`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, 
                        'Content-Type': 'application/json', // Ensure the correct content type is set
                    },
                }
            );

            if (response.status === 201 || response.status === 200) {
                setVideoDialogVisible(true); // Show video dialog

                setTimeout(() => {
                    setVideoDialogVisible(false); // Hide video dialog after 5 seconds           
                    navigate('/dashboard/letter_template');
                }, 5000);
            }
        } catch (error) {
            console.error('Error saving letter template:', error);
            setVideocrossDialogVisible(true); // Show video dialog

            setTimeout(() => {
                setVideocrossDialogVisible(false); // Hide video dialog after 5 seconds           

            }, 5000);
        }
    };

    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col sm={12} lg={12} className="mb-4">
                        <Breadcrumb>
                            <Breadcrumb.Item active>Employment Letter</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col sm={12} lg={6} className="mb-4">
                        <Card className="shadow-0 sticky-top letterForm addEm">
                            <Card.Header className='h6'>
                                Letter Details
                            </Card.Header>
                            <Card.Body>
                                <Form className="mt-4" onSubmit={handleSubmit}>
                                    <Row>
                                        <Col sm={12} lg={12} className="mb-3 ps-0">
                                            <Form.Label htmlFor="templateName">Template Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="templateName"
                                                value={templateName}
                                                onChange={(e) => setTemplateName(e.target.value)}
                                            />
                                        </Col>
                                        <Col sm={12} lg={12} className="mb-3 ps-0">
                                            <Form.Label htmlFor="employeeName">Employee Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="employeeName"
                                                value={employeeName}
                                                onChange={(e) => setEmployeeName(e.target.value)}
                                                disabled
                                            />
                                        </Col>
                                        <Col sm={12} lg={12} className="mb-3 ps-0">
                                            <Form.Label htmlFor="subject">Subject</Form.Label>
                                            <Form.Control
                                                type="text"
                                                id="subject"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                            />
                                        </Col>
                                        {sections.map((section, index) => (
                                            <React.Fragment key={index}>
                                                <Col sm={12} lg={12} className="mb-3 ps-0 d-flex justify-content-end">
                                                    <Button
                                                        type="button"
                                                        title="Remove Section"
                                                        severity="danger"
                                                        icon="pi pi-trash"
                                                        onClick={() => handleRemoveSection(index)}
                                                        outlined
                                                        className="border-0 rounded-0"
                                                    />
                                                </Col>
                                                <Col sm={12} lg={12} className="mb-3 ps-0">
                                                    <Form.Label>Section {index + 1} Heading</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={section.section_heading}
                                                        onChange={(e) =>
                                                            handleSectionChange(index, 'section_heading', e.target.value)
                                                        }
                                                    />
                                                </Col>
                                                <Col sm={12} lg={12} className="mb-3 ps-0">
                                                    <Form.Label>Section {index + 1} Body</Form.Label>
                                                    <Editor
                                                        value={section.section_body}
                                                        onTextChange={(e) =>
                                                            handleSectionChange(index, 'section_body', e.htmlValue)
                                                        }
                                                        style={{ height: '200px' }}
                                                    />
                                                </Col>

                                            </React.Fragment>
                                        ))}
                                        <Col sm={12} lg={12} className="d-flex justify-content-start">
                                            <Button
                                                type="button"
                                                label="Add Section"
                                                icon="pi pi-plus"
                                                onClick={handleAddSection}
                                                outlined
                                                className="border-0 rounded-0"
                                            />
                                        </Col>
                                        <Col sm={12} lg={12} className="d-flex justify-content-end">
                                            <Button type="submit" icon="pi pi-save" label="Save" severity="primary" />
                                        </Col>
                                    </Row>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col sm={12} lg={6} className="mb-4">
                        <Card>
                            <Card.Body className="letterTable pb-0">
                                <Table border={0}>
                                    <thead>
                                        <tr>
                                            <td className="p-0">
                                                <span className="d-block p-0 pb-4">
                                                    <img src={logoImage} alt="brand-logo" style={{ width: '120px' }} />
                                                </span>
                                            </td>
                                            <td className="text-end p-0">
                                                <div className="d-flex justify-content-end">
                                                    <p style={{ width: '252px' }}>
                                                        Godrej Genesis Building, 11th Floor, EN-34, EN Block, Sector V,
                                                        Bidhannagar, Kolkata, West Bengal 700105
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <b className="ps-0 mb-2">To,</b>
                                                <span className="d-block p-0">
                                                    <b>{employeeName}</b>
                                                </span>
                                            </td>
                                            <td className="text-end">Date : {currentDate}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} className="pt-2">
                                                <b className="ps-0 pe-0">Subject : </b>
                                                <span className="p-0">
                                                    <b>{subject}</b>
                                                </span>
                                            </td>
                                        </tr>
                                        {sections.map((section, index) => (
                                            <tr key={index}>
                                                <td colSpan={2}>
                                                    <h5>{section.section_heading}</h5>
                                                    <div
                                                        dangerouslySetInnerHTML={{ __html: section.section_body }}
                                                    ></div>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan={2} className="pt-2">
                                                <div className="">
                                                    <p>Let us start rolling</p>
                                                    <p>Thanking you</p>
                                                    <p className="d-block">
                                                        Yashashwi Malani <span className="d-block">Founder</span>
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={5} className="text-center">
                                                <small>193/1 MAHATAMA GANDI ROAD, KOLKATA - 700007</small> &nbsp; | &nbsp;
                                                <small>
                                                    Email:{' '}
                                                    <a
                                                        href="mailto:Saurabh@thegraphe.com"
                                                        className="text-primary"
                                                    >
                                                        Saurabh@thegraphe.com
                                                    </a>
                                                </small>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Row>
            <Dialog visible={videoDialogVisible} className='fadeInUp_dilog'
                onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                <video src={successVideo} autoPlay loop muted style={{ width: '100%' }} />
                <h6 className="text-center mt-0 fadeInUp">Process Completed <span className='text-success'>Successfully</span></h6>
            </Dialog>


            <Dialog visible={videocrossDialogVisible} className='fadeInUp_dilog'
                onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                <video src={crossVideo} autoPlay loop muted style={{ width: '100%' }} />
                <h6 className="text-center mt-0 fadeInUp">Process <span className='text-danger'>Denied</span></h6>
            </Dialog>

        </>
    );
};
export default Employmentletter;