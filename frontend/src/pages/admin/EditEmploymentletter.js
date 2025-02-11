import React, { useEffect, useState } from 'react';
import { Col, Row, Card, Breadcrumb, Form, Table } from 'react-bootstrap';
import { Button } from 'primereact/button';
import { Editor } from 'primereact/editor';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import logoImage from '../../assets/images/logo.png';
import { useAuth } from '../../context/AuthContext';
import successVideo from '../../assets/video/paperplane.mp4';
import crossVideo from '../../assets/video/cross.mp4';
import { Dialog } from "primereact/dialog";
const EditEmploymentletter = () => {
    const { accessToken } = useAuth();
    const { template_id } = useParams();
    const [loading, setLoading] = useState(true);
    const [templateName, setTemplateName] = useState('');
    const [subject, setSubject] = useState('');
    const [sections, setSections] = useState([]);
    const [employeeName, setEmployeeName] = useState('Employee Name');
    const [currentDate, setCurrentDate] = useState('');
    const [videoDialogVisible, setVideoDialogVisible] = useState(false); // New state for video dialog
    const [videocrossDialogVisible, setVideocrossDialogVisible] = useState(false); // New state for video dialog
    const navigate = useNavigate();
    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-GB');
        setCurrentDate(formattedDate);

        if (template_id) {
            fetchTemplate();
        }
    }, [template_id]);
    const fetchTemplate = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/letterRoutes/viewallletters/${template_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, 
                        'Content-Type': 'application/json'
                    },
                }
            );

            
            const { template_name, template_subject, sections } = response.data;
            setTemplateName(template_name);
            setSubject(template_subject);
            setSections(sections);
        } catch (error) {
            console.error('Error fetching template data:', error);
            setSections([]);
        } finally {
            setLoading(false);
        }
    };

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
                template_id: template_id,
                template_name: templateName,
                template_subject: subject,
                sections,
            };

            const response = await axios.post(
                `${config.apiBASEURL}/letterRoutes/letter-template`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, // Add the Authorization header
                        'Content-Type': 'application/json', // Ensure the correct content type is set
                    },
                }
            );

            if (response.status === 200) {
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
                                <Form onSubmit={handleSubmit}>

                                    <Form.Group className="mb-3">
                                        <Form.Label htmlFor="templateName">Template Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="templateName"
                                            value={templateName}
                                            onChange={(e) => setTemplateName(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label htmlFor="subject">Subject</Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="subject"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                        />
                                    </Form.Group>
                                    <div className='d-flex justify-content-end sticky-top bg-white pt-2' style={{ top: '-35px'}}>
                                        <Button
                                            type="button"
                                            label="Section"
                                            severity='help'
                                            icon="pi pi-plus"
                                            onClick={handleAddSection}
                                            outlined
                                            className="mb-4 py-2"
                                        />
                                    </div>
                                    {sections.map((section, index) => (
                                        <React.Fragment key={index}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className='d-flex justify-content-between align-items-center'>
                                                    Section {index + 1} Heading
                                                    <Button
                                                        type="button"
                                                        title="Remove Section"
                                                        severity="danger"
                                                        icon="pi pi-trash"
                                                        onClick={() => handleRemoveSection(index)}
                                                        outlined
                                                        className="border-0 rounded-0"
                                                    />
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={section.section_heading}
                                                    onChange={(e) =>
                                                        handleSectionChange(index, 'section_heading', e.target.value)
                                                    }
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Section {index + 1} Body</Form.Label>
                                                <Editor
                                                    value={section.section_body}
                                                    onTextChange={(e) =>
                                                        handleSectionChange(index, 'section_body', e.htmlValue)
                                                    }
                                                    style={{ height: '200px' }}
                                                />
                                            </Form.Group>

                                        </React.Fragment>
                                    ))}
                                    <Col sm={12} lg={12} className="d-flex justify-content-end">
                                        <Button type="submit" icon="pi pi-save" label="Save" severity="primary" />
                                    </Col>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col sm={12} lg={6} className="mb-4 h-auto">
                        <Card className='h-auto'>
                            <Card.Body className="letterTable pb-0">
                                <Table border={0}>
                                    <thead>
                                        <tr>
                                            <td>
                                                <img src={logoImage} alt="brand-logo" style={{ width: '120px' }} />
                                            </td>
                                            <td className="text-end">Date: {currentDate}</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <b>To,</b>
                                                <br />
                                                <b>{employeeName}</b>
                                            </td>
                                            <td className="text-end">Subject: {subject}</td>
                                        </tr>
                                        {sections.map((section, index) => (
                                            <tr key={index}>
                                                <td colSpan={2}>
                                                    <h5>{section.section_heading}</h5>
                                                    <div dangerouslySetInnerHTML={{ __html: section.section_body }}></div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
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

export default EditEmploymentletter;
