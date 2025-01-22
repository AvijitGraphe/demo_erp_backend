import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Breadcrumb, Table, Card } from 'react-bootstrap'; // Added Button import
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import config from '../../config';
import CustomToast from '../../components/CustomToast';
import { Button } from 'primereact/button'; // Import PrimeReact Button
import { Link } from 'react-router-dom';
import CustomConfirmPopup from '../../components/CustomConfirmPopup';
import { Dialog } from 'primereact/dialog'; // Import PrimeReact Dialog
import logoImage from '../../assets/images/logo.png';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../../context/AuthContext';
import successVideo from '../../assets/video/paperplane.mp4';
import crossVideo from '../../assets/video/cross.mp4';
const Letter_template = () => {
    const { accessToken } = useAuth();
    const navigate = useNavigate(); // Initialize the navigate function
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const toastRef = useRef(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null); // State for the selected template data
    const [dialogVisible, setDialogVisible] = useState(false); // Dialog visibility state
    const showMessage = (severity, detail) => {
        const summary = severity.charAt(0).toUpperCase() + severity.slice(1);
        toastRef.current.show(severity, summary, detail);
    };

    const [employeeName, setEmployeeName] = useState('Employee Name');
    const [videoDialogVisible, setVideoDialogVisible] = useState(false); // New state for video dialog
    const [videocrossDialogVisible, setVideocrossDialogVisible] = useState(false); // New state for video dialog



    // Function to fetch letter templates from API
    const fetchLetterTemplates = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${config.apiBASEURL}/letterRoutes/fetchallletters`, {
                headers: { Authorization: `Bearer ${accessToken}` }, // Add Authorization header
            });
            setTemplates(response.data);
            setError('');
            showMessage('success', 'Letter templates fetched successfully');
        } catch (error) {
            console.error('Error fetching letter templates', error);
            setError('Error fetching letter templates. Please try again.');
            showMessage('error', 'Error fetching letter templates. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplateDetails = async (templateId) => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/letterRoutes/viewallletters/${templateId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }, // Add Authorization header
            });
            setSelectedTemplate(response.data); // Set the fetched template data
            setDialogVisible(true); // Show the dialog
        } catch (error) {
            console.error('Error fetching template details:', error);
            showMessage('error', 'Failed to fetch template details. Please try again.');
        }
    };

    // Fetch templates when the component mounts
    useEffect(() => {
        fetchLetterTemplates();
    }, []);

    // Helper function to format date as dd/mm/yyyy
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Action button click handler
    const handleAction = async (action, templateId) => {
        switch (action) {
            case 'view':
                fetchTemplateDetails(templateId); // Fetch template details and show in dialog
                break;
            case 'edit':
                console.log(`Editing template with ID: ${templateId}`);
                navigate(`/dashboard/editemployletter/${templateId}`); // Navigate to the edit page
                break;
            case 'delete':
                try {
                    const response = await axios.delete(`${config.apiBASEURL}/letterRoutes/letter-template-delete`, {
                        data: { template_id: templateId },
                        headers: { Authorization: `Bearer ${accessToken}` }, // Add Authorization header
                    });
                    if (response.status === 200) {
                        setVideoDialogVisible(true); // Show video dialog

                        setTimeout(() => {
                            setVideoDialogVisible(false); // Hide video dialog after 5 seconds           
                            fetchLetterTemplates(); // Refresh the template list
                        }, 5000);
                        
                    }
                } catch (error) {
                    console.error('Error deleting template', error);
                    setVideocrossDialogVisible(true); // Show video dialog

                    setTimeout(() => {
                        setVideocrossDialogVisible(false); // Hide video dialog after 5 seconds           

                    }, 5000);
                }
                break;
            case 'copy': {
                try {
                    const response = await axios.post(
                        `${config.apiBASEURL}/letterRoutes/duplicate-letter-template`,
                        { template_id: templateId },
                        {
                            headers: { Authorization: `Bearer ${accessToken}` }, // Add Authorization header
                        }
                    );
                    if (response.status === 201) {
                        setVideoDialogVisible(true); // Show video dialog

                        setTimeout(() => {
                            setVideoDialogVisible(false); // Hide video dialog after 5 seconds           
                            fetchLetterTemplates(); // Refresh the template list
                        }, 5000);
                    }
                } catch (error) {
                    setVideocrossDialogVisible(true); // Show video dialog

                    setTimeout(() => {
                        setVideocrossDialogVisible(false); // Hide video dialog after 5 seconds           

                    }, 5000);
                }
                break;
            }
            default:
                console.log(`Action ${action} not recognized`);
        }
    };

    // Custom action button
    const actionBodyTemplate = (rowData) => {
        return (
            <div>
                <Button
                    title="View"
                    outlined
                    icon="pi pi-eye"
                    severity='warning'
                    className="p-button-sm border-0"
                    onClick={() => handleAction('view', rowData.template_id)}
                />
                <Button
                    title="Edit"
                    outlined
                    icon="pi pi-pencil"
                    severity='primary'
                    className="p-button-sm border-0"
                    onClick={() => handleAction('edit', rowData.template_id)}
                />
                <CustomConfirmPopup
                    message="Are you sure you want to duplicate this Template?"
                    icon="pi pi-exclamation-triangle"
                    defaultFocus="accept"
                    acceptClassName='p-button-success'
                    buttonLabel="Duplicate"
                    title='Duplicate'
                    buttonClass="p-button-secondary p-button-text"
                    buttonIcon="pi pi-clone"
                    onConfirm={() => handleAction('copy', rowData.template_id)}
                    onReject={() => console.log('Duplicate action canceled')}
                />

                {/* <Button
                    title="Send"
                    outlined
                    icon="pi pi-send"
                    severity='help'
                    className="p-button-sm border-0"
                    onClick={() => handleAction('send', rowData.template_id)}
                /> */}

                <CustomConfirmPopup
                    message="Are you sure you want to Delete this Template?"
                    icon="pi pi-exclamation-triangle"
                    acceptClassName='p-button-danger'
                    defaultFocus="reject"
                    title='Delete'
                    buttonLabel="Delete"
                    buttonClass="p-button-danger p-button-text"
                    buttonIcon="pi pi-trash"
                    onConfirm={() => handleAction('delete', rowData.template_id)}
                    onReject={() => console.log('Duplicate action canceled')}
                />




            </div>
        );
    };

    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col md={6} lg={12} className=''>
                        <Card>
                            <Card.Header className='d-flex justify-content-between align-items-center'>
                                <h6>Letter Template List</h6>
                                <Link to="/dashboard/addemployeeletter">
                                    <Button
                                        label='Add Template'
                                        icon='pi pi-plus'
                                        className='py-2'
                                    />
                                </Link>
                            </Card.Header>
                            <Card.Body>
                                {loading ? (
                                    <p>Loading data...</p> // Display loading message while fetching
                                ) : error ? (
                                    <p>{error}</p> // Display error message if fetching fails
                                ) : (
                                    <DataTable value={templates} sortMode="multiple" tableStyle={{ minWidth: '50rem' }}>

                                        <Column field="template_name" header="Template Name" sortable ></Column>
                                        <Column field="template_subject" header="Subject" sortable ></Column>
                                        <Column
                                            field="createdAt"
                                            header="Created At"
                                            sortable
                                            style={{ width: '15%' }}
                                            body={(rowData) => formatDate(rowData.createdAt)} // Formatting date
                                        ></Column>
                                        <Column
                                            field="updatedAt"
                                            header="Updated At"
                                            sortable
                                            style={{ width: '15%' }}
                                            body={(rowData) => formatDate(rowData.updatedAt)} // Formatting date
                                        ></Column>
                                        {/* Action column */}
                                        <Column header="Actions" body={actionBodyTemplate} style={{ width: '210px' }}></Column>
                                    </DataTable>
                                )}
                            </Card.Body>
                            <CustomToast ref={toastRef} />
                        </Card>
                    </Col>
                </Row>
            </Row>
            {/* Dialog to display template details */}
            <Dialog

                visible={dialogVisible}
                style={{ width: '50vw', height: '80vh', overflow: 'auto' }}
                onHide={() => setDialogVisible(false)}
            >
                {selectedTemplate ? (
                    <div>
                        <Card className='shadow-0'>
                            <Card.Body className="letterTable pb-0">
                                <Table border={0}>
                                    <thead>
                                        <tr>
                                            <td className="p-0">
                                                <span className="d-block p-0 pb-4">
                                                    <img
                                                        src={logoImage}
                                                        alt="brand-logo"
                                                        style={{ width: '120px' }}
                                                    />
                                                </span>
                                            </td>
                                            <td className="text-end p-0">
                                                <div className="d-flex justify-content-end">
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
                                                <b className="ps-0 mb-2">To,</b>
                                                <span className="d-block p-0"><b></b></span>
                                            </td>
                                            <td className="text-end">Date: {new Date().toLocaleDateString('en-GB')}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} className="pt-4">
                                                <b className="ps-0 pe-0">Subject: </b>
                                                <span className="p-0">
                                                    <b>{selectedTemplate.template_subject}</b>
                                                </span>
                                            </td>
                                        </tr>
                                        {selectedTemplate.sections && selectedTemplate.sections.length > 0 ? (
                                            selectedTemplate.sections
                                                .sort((a, b) => a.section_order - b.section_order) // Ensure sections are rendered in order
                                                .map((section) => (
                                                    <tr key={section.section_id}>
                                                        <td colSpan={2}>
                                                            <h6>{section.section_heading}</h6>
                                                            <div dangerouslySetInnerHTML={{ __html: section.section_body }} />
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan={2}>
                                                    <p>No sections available.</p>
                                                </td>
                                            </tr>
                                        )}

                                        <tr>
                                            <td colSpan={2} className="pt-2">
                                                <div>
                                                    <p>Let us start rolling</p>
                                                    <p>Thanking you</p>
                                                    <span className="mt-2 mb-2">
                                                        {selectedTemplate.signature_url && (
                                                            <img
                                                                src={selectedTemplate.signature_url}
                                                                alt="Signature"
                                                                style={{ width: '150px', height: 'auto' }}
                                                            />
                                                        )}
                                                    </span>
                                                    <p className="d-block">Yashashwi Malani <span className="d-block">Founder</span></p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={5} className="text-center">
                                                <small>193/1 MAHATAMA GANDI ROAD, KOLKATA - 700007</small> &nbsp; | &nbsp;
                                                <small>Email: <a href="mailto:Saurabh@thegraphe.com" className="text-primary">Saurabh@thegraphe.com</a></small>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </Card.Body>
                        </Card>
                    </div>
                ) : (
                    <p>No template data available</p>
                )}
            </Dialog>

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

export default Letter_template;