import { Col, Form, Row, Card, Alert, Container } from 'react-bootstrap';
import FormWizard from 'react-form-wizard-component'; // Import default export
import 'react-form-wizard-component/dist/style.css';
import 'primeicons/primeicons.css';
import React, { useState } from "react";
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { FileUpload } from 'primereact/fileupload';
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';

function WebmobileOnbord() {

    const handleComplete = () => {
        console.log("Form completed!");
        // Handle form completion logic here
    };

    return (
        <>
            <FormWizard stepSize="sm" onComplete={handleComplete}>
                <FormWizard.TabContent title="Step 1" icon="pi pi-file-edit">
                <h3>Company Information</h3>
                <Row className='mt-4'>
                    <Col lg='12' className='mb-2'>
                        <label className='mb-2'>What is the name of your company?</label>
                        <InputText keyfilter="int" />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Can you provide a brief overview of your company and its mission?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>What products or services do you offer?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                </Row>
                </FormWizard.TabContent>
                <FormWizard.TabContent title="Step 2" icon="pi pi-megaphone">
                    <h3>Website or App Objectives</h3>
                    <Row className='mt-4'>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>What are your primary goals for the website?</label>
                            <InputTextarea className='h-auto' rows={3} cols={30} />
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Who is your target audience?</label>
                            <InputTextarea className='h-auto' rows={3} cols={30} />
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Do you have any specific features or functionalities in mind for the website?</label>
                            <InputTextarea className='h-auto' rows={3} cols={30} />
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Are there any specific design elements or branding guidelines that should be incorporated?</label>
                            <InputTextarea className='h-auto' rows={3} cols={30} />
                        </Col>
                    </Row>
                </FormWizard.TabContent>
                <FormWizard.TabContent title="Step 3" icon="pi pi-globe">
                    <h3>Existing Webiste or App</h3>
                    <Row className='mt-4'>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Do you currently have a website? If yes, what is the URL?</label>
                            <InputTextarea className='h-auto' rows={3} cols={30} />
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>What do you like and dislike about your current website?</label>
                            <InputTextarea className='h-auto' rows={3} cols={30} />
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Are there any specific elements from your existing website that you would like to keep or improve upon?</label>
                            <InputTextarea className='h-auto' rows={3} cols={30} />
                        </Col>
                    </Row>
                </FormWizard.TabContent>
                <FormWizard.TabContent title="Step 4" icon="pi pi-file-word">
                    <h3>Content</h3>
                    <Row className='mt-4'>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Do you have the content ready for the website? If not, when do you expect to have it available?</label>
                            <InputTextarea className='h-auto mb-0' rows={4} cols={30} />
                            <small>(text, images, videos, etc.)</small>
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Will you require assistance with content creation or copywriting?</label>
                            <InputTextarea className='h-auto' rows={4} cols={30} />
                        </Col>
                    </Row>
                </FormWizard.TabContent>
                <FormWizard.TabContent title="Step 5" icon="pi pi-tag">
                    <h3>Branding</h3>
                    <Row className='mt-4'>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Do you have a logo and a branding style guide?</label>
                            <InputTextarea className='h-auto mb-0' rows={3} cols={30} />
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Do you wish to maintain the current branding?</label>
                            <InputTextarea className='h-auto' rows={3} cols={30} />
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Which visual features, like images, graphics, etc., do you want to use from your existing website or marketing materials?</label>
                            <InputTextarea className='h-auto mb-0' rows={3} cols={30} />
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>List 3 adjectives to describe how your ideal customer should regard your website. For example, innovative, fun, friendly, corporate and so on.</label>
                            <InputTextarea className='h-auto' rows={3} cols={30} />
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>How is your company regarded, offline? Do you want the same for your website?</label>
                            <InputTextarea className='h-auto' rows={3} cols={30} />
                        </Col>
                    </Row>
                </FormWizard.TabContent>
                <FormWizard.TabContent title="Step 6" icon="pi pi-users">
                    <h3>Competitors</h3>
                    <Row className='mt-4'>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Are there any websites of your competitors that you admire or would like to use as a reference?</label>
                            <InputTextarea className='h-auto mb-0' rows={4} cols={30} />
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>What differentiates your company from your competitors?</label>
                            <InputTextarea className='h-auto' rows={4} cols={30} />
                        </Col>
                    </Row>
                </FormWizard.TabContent>
                <FormWizard.TabContent title="Step 7" icon="pi pi-code">
                    <h3>Website or App Functionality</h3>
                    <Row className='mt-4'>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Are there any specific functionalities required for the website?</label>
                            <InputTextarea className='h-auto mb-0' rows={4} cols={30} />
                            <small>e.g., e-commerce, contact forms, user registration, blog, etc.</small>
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Are there any third-party integrations that need to be considered?</label>
                            <InputTextarea className='h-auto' rows={4} cols={30} />
                            <small>e.g., CRM, email marketing, payment gateways, etc.</small>
                        </Col>
                    </Row>
                </FormWizard.TabContent>
                <FormWizard.TabContent title="Step 8" icon="pi pi-calendar">
                    <h3>Timeline & Budget</h3>
                    <Row className='mt-4'>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>What is your desired timeline for website development?</label>
                            <InputTextarea className='h-auto mb-0' rows={4} cols={30} />
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Do you have a budget in mind for this project?</label>
                            <InputTextarea className='h-auto' rows={4} cols={30} />
                        </Col>
                    </Row>
                </FormWizard.TabContent>
                <FormWizard.TabContent title="Step 9" icon="pi pi-cog">
                    <h3>Maintenance & Support</h3>
                    <Row className='mt-4'>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Will you require ongoing website maintenance and support?</label>
                            <InputTextarea className='h-auto mb-0' rows={4} cols={30} />
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Are there any specific service-level agreements or maintenance plans you are interested in?</label>
                            <InputTextarea className='h-auto' rows={4} cols={30} />
                        </Col>
                    </Row>
                </FormWizard.TabContent>
                <FormWizard.TabContent title="Step 10" icon="pi pi-phone">
                    <h3>Point of Contact</h3>
                    <Row className='mt-4'>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Who will be the primary point of contact from your company throughout the project?</label>
                            <InputTextarea className='h-auto mb-0' rows={4} cols={30} />
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Are there any other stakeholders involved in the decision-making process?</label>
                            <InputTextarea className='h-auto' rows={4} cols={30} />
                        </Col>
                        <Col lg='12' md='12' className='mb-2'>
                            <label className='mb-2'>Is there anything else you would like to add or any specific concerns or requirements you would like to address?</label>
                            <InputTextarea className='h-auto' rows={4} cols={30} />
                        </Col>
                    </Row>
                </FormWizard.TabContent>
            </FormWizard>
        </>
    );
}

export default WebmobileOnbord;