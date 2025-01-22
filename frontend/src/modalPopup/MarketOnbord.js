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

function MarketOnbord() {

    const handleComplete = () => {
        console.log("Form completed!");
        // Handle form completion logic here
    };

    return (
        <>
        <FormWizard stepSize="sm" onComplete={handleComplete}>
            <FormWizard.TabContent title="Step 1" icon="pi pi-file-edit">
                <h3>Brand Overview</h3>
                <Row className='mt-4'>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2'>Company Name</label>
                        <InputText keyfilter="int" placeholder="Company Name" />
                    </Col>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2'>Industry</label>
                        <InputText keyfilter="int" placeholder="Industry" />
                    </Col>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2'>Company Tagline</label>
                        <InputText keyfilter="int" placeholder="Company Tagline" />
                    </Col>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2'>Website URL</label>
                        <InputText keyfilter="int" placeholder="Website URL" />
                    </Col>
                    <Col lg='6' md='12' className='mb-2'>
                        <label className='mb-2'>Briefly describe your brand, its mission, and core values</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='6' md='12' className='mb-2'>
                        <label className='mb-2'>What products or services does your brand offer?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='6' md='12' className='mb-2'>
                        <label className='mb-2'>What is your mode of selling?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='6' md='12' className='mb-2'>
                        <label className='mb-2'>What sets your brand apart from competitors?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>What is the story behind the conception of your brand?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Attach logo open file (Allowed formats - ai, svg, cdr, psd, pdf)</label>
                        <FileUpload name="demo[]" url={'/api/upload'} multiple accept="image/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} />
                        <small>(Max size 10 MB per image, Max files - 4)</small>
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Attach logo animation (Allowed formats - mov, mp4, avi)</label>
                        <FileUpload name="demo[]" url={'/api/upload'} multiple accept="image/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} />
                        <small>(Max size 10 MB per image, Max files - 4)</small>
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Attach company profile (Allowed formats - pptx, pdf)</label>
                        <FileUpload name="demo[]" url={'/api/upload'} multiple accept="image/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} />
                        <small>(Max size 10 MB per image, Max files - 4)</small>
                    </Col>
                </Row>
            </FormWizard.TabContent>
            <FormWizard.TabContent title="Step 2" icon="pi pi-megaphone">
                <h3>Target Audience</h3>
                <Row className='mt-4'>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Who is your ideal customer?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Describe their demographics, interests, behaviours, and pain points.</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Are you solving any specific problem of your audience? How?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>What is your current marketing strategy to reach your target audience?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>What is your current marketing strategy to reach your target audience?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                </Row>
            </FormWizard.TabContent>
            <FormWizard.TabContent title="Step 3" icon="pi pi-database">
                <h3>Goals & Objectives</h3>
                <Row className='mt-4'>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>What are your social media marketing goals? (e.g., brand awareness, lead generation, community engagement)</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Are there specific metrics you want to improve? (e.g., follower count, engagement rate, website traffic)</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Where do you see your brand in the next 5 years? / What is the vision of your brand?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Are there specific campaigns or milestones you want to achieve within certain timeframes?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                </Row>
            </FormWizard.TabContent>
            <FormWizard.TabContent title="Step 4" icon="pi pi-chart-bar">
                <h3>Competitor Analysis</h3>
                <Row className='mt-4'>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Who are your main competitors on social media?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>What do you like about them / their marketing the most?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>What makes you different than them?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                </Row>
            </FormWizard.TabContent>
            <FormWizard.TabContent title="Step 5" icon="pi pi-sitemap">
                <h3>Content Strategy</h3>
                <Row className='mt-4'>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>What type of content resonates with your target audience? (e.g., videos, infographics, blog posts)</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Which brands do you follow on social media?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>What makes you follow any brand / influencer on social media?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Any brands or marketing activities that caught your attention?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Are you comfortable in being recorded for a content or have anyone in your team for video content?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Do you have an in house photographer / videographer to capture content for us with our guidance?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>How do you want us to respond to negative comments on social media?</label>
                        <InputTextarea className='h-auto' rows={3} cols={30} />
                    </Col>
                </Row>
            </FormWizard.TabContent>
            <FormWizard.TabContent title="Step 6" icon="pi pi-id-card">
                <h3>Brand Voice, Tone and Visual Identity</h3>
                <Col lg='12' md='12' className='mb-2'>
                    <label className='mb-2'>Describe the desired brand voice and tone for your social media content. (e.g., friendly, informative, witty)</label>
                    <InputTextarea className='h-auto' rows={3} cols={30} />
                </Col>
                <Col lg='12' md='12' className='mb-2'>
                    <label className='mb-2'>Are there specific messaging guidelines or keywords to incorporate?</label>
                    <InputTextarea className='h-auto' rows={3} cols={30} />
                </Col>
                <Col lg='12' md='12' className='mb-2'>
                    <label className='mb-2'>What are your brand's colours, fonts, and design elements?</label>
                    <InputTextarea className='h-auto' rows={3} cols={30} />
                </Col>
                <Col lg='12' md='12' className='mb-2'>
                    <label className='mb-2'>Attach Brand Book (Allowed Format - pdf)</label>
                    <FileUpload name="demo[]" url={'/api/upload'} multiple accept="image/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} />
                    <small>(Max size 10 MB per image, Max files - 4)</small>
                </Col>

            </FormWizard.TabContent>
            <FormWizard.TabContent title="Step 7" icon="pi pi-credit-card">
                <h3>Budget Allocation</h3>
                <Col lg='12' md='12' className='mb-2'>
                    <label className='mb-2'>What is your budget for social media marketing, including content creation, advertising, and tools?</label>
                    <InputTextarea className='h-auto' rows={3} cols={30} />
                </Col>
                <Col lg='12' md='12' className='mb-2'>
                    <label className='mb-2'>Which platforms do you want to opt for?</label>
                    <InputTextarea className='h-auto' rows={3} cols={30} />
                </Col>
                <Col lg='12' md='12' className='mb-2'>
                    <label className='mb-2'>How often do you want to post on each platform?</label>
                    <InputTextarea className='h-auto' rows={3} cols={30} />
                </Col>
                <Col lg='12' md='12' className='mb-2'>
                    <label className='mb-2'>Do you plan to run paid social media advertising campaigns? If yes, on which platforms?</label>
                    <InputTextarea className='h-auto' rows={3} cols={30} />
                </Col>
                <Col lg='12' md='12' className='mb-2'>
                    <label className='mb-2'>How much are you willing to allocate for paid advertising?</label>
                    <InputTextarea className='h-auto' rows={3} cols={30} />
                </Col>
                <Col lg='12' md='12' className='mb-2'>
                    <label className='mb-2'>How much are you willing to allocate for offline marketing activities?</label>
                    <InputTextarea className='h-auto' rows={3} cols={30} />
                </Col>
            </FormWizard.TabContent>
            <FormWizard.TabContent title="Step 8" icon="pi pi-chart-line">
                <h3>Measurement and Analytics</h3>
                <Col lg='12' md='12' className='mb-2'>
                    <label className='mb-2'>What are your expectations from us?</label>
                    <InputTextarea className='h-auto' rows={3} cols={30} />
                </Col>
                <Col lg='12' md='12' className='mb-2'>
                    <label className='mb-2'>Which key performance indicators (KPIs) will you track? (e.g., reach, engagement, conversion rate)</label>
                    <InputTextarea className='h-auto' rows={3} cols={30} />
                </Col>
                <Col lg='12' md='12' className='mb-2'>
                    <label className='mb-2'>How often will you analyse data and adjust your social media strategy?</label>
                    <InputTextarea className='h-auto' rows={3} cols={30} />
                </Col>
            </FormWizard.TabContent>
        </FormWizard>
        </>
    );
}

export default MarketOnbord;