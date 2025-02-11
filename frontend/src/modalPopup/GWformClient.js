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

function GWformClient() {
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);
    const [value, setValue] = useState('');
    const [selectedBride, setSelectedBride] = useState(null);
    const bride = [
        { name: 'Groom', code: 'GM' },
        { name: 'Bride', code: 'BD' }
    ];

    const handleComplete = () => {
        console.log("Form completed!");
        // Handle form completion logic here
    };


    const [events, setEvents] = useState([
        {
            eventName: '',
            eventVenue: '',
            eventDate: null,
            eventTime: null,
            eventDescription: ''
        }
    ]);

    const addNewEvent = () => {
        const newEvent = {
            eventName: '',
            eventVenue: '',
            eventDate: null,
            eventTime: null,
            eventDescription: ''
        };
        setEvents([...events, newEvent]);
    };

    const deleteEvent = (index) => {
        // Allow deletion only if it's not the first event
        if (index !== 0) {
            const updatedEvents = [...events];
            updatedEvents.splice(index, 1);
            setEvents(updatedEvents);
        }
    };

    const handleEventChange = (index, field, fieldValue) => {
        const updatedEvents = [...events];
        updatedEvents[index][field] = fieldValue;
        setEvents(updatedEvents);
    };

    const [selectedCategories, setSelectedCategories] = useState(null);
    const categories = [
        { name: 'Logo', code: 'LG' },
        { name: 'Hashtag', code: 'HAS' },
        { name: 'Static Invite', code: 'STI' },
        { name: '2D Video Invite', code: '2DVI' },
        { name: '3D Invite', code: '3DVI' },
        { name: 'Welcome boards', code: 'WB' },
        { name: 'Program Itinerary', code: 'PI' },
        { name: 'Love-Story Based', code: 'LSB' }
    ];


    return (
        <>
            <FormWizard
                stepSize="sm"
                onComplete={handleComplete}
            >
            <FormWizard.TabContent title="Step 1" icon="pi pi-user">
                <h3>Person 1 Details</h3>
                <Row className='mt-4'>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2' >Bride / Groom</label>
                        <Dropdown value={selectedBride} onChange={(e) => setSelectedBride(e.value)} options={bride} optionLabel="name" placeholder='----Select----' className="w-full md:w-14rem" />
                    </Col>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2'>Person's 1 Full Name</label>
                        <InputText keyfilter="int" placeholder="Full Name" />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Instagram ID</label>
                        <InputText keyfilter="int" placeholder="Instagram ID" />
                    </Col>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2'>Mother's Name</label>
                        <InputText keyfilter="int" placeholder="Mother's Name" />
                    </Col>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2'>Father's Name</label>
                        <InputText keyfilter="int" placeholder="Father's Name" />
                    </Col>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2'>Grand Mother's Name</label>
                        <InputText keyfilter="int" placeholder="Grand Mother's Name" />
                    </Col>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2'>Grand Father's Name</label>
                        <InputText keyfilter="int" placeholder="Grand Father's Name" />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Upload Hi-Res <b>Front Facing</b> Images</label>
                        <FileUpload name="demo[]" url={'/api/upload'} multiple accept="image/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} />
                        <small>(Max size 10 MB per image, Max files - 4)</small>
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Upload Hi-Res <b>Side Facing</b> Images</label>
                        <FileUpload name="demo[]" url={'/api/upload'} multiple accept="image/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} />
                        <small>(Max size 10 MB per image, Max files - 4)</small>
                    </Col>
                </Row>
            </FormWizard.TabContent>
            <FormWizard.TabContent title="Step 2" icon="pi pi-users">
                <h3>Person 2 Details</h3>
                <Row className='mt-4'>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2' >Bride / Groom</label>
                        <Dropdown value={selectedBride} onChange={(e) => setSelectedBride(e.value)} options={bride} optionLabel="name" placeholder='----Select----' className="w-full md:w-14rem" />
                    </Col>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2'>Person's 2 Full Name</label>
                        <InputText keyfilter="int" placeholder="Full Name" />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Instagram ID</label>
                        <InputText keyfilter="int" placeholder="Instagram ID" />
                    </Col>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2'>Mother's Name</label>
                        <InputText keyfilter="int" placeholder="Mother's Name" />
                    </Col>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2'>Father's Name</label>
                        <InputText keyfilter="int" placeholder="Father's Name" />
                    </Col>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2'>Grand Mother's Name</label>
                        <InputText keyfilter="int" placeholder="Grand Mother's Name" />
                    </Col>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2'>Grand Father's Name</label>
                        <InputText keyfilter="int" placeholder="Grand Father's Name" />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Upload Hi-Res <b>Front Facing</b> Images</label>
                        <FileUpload name="demo[]" url={'/api/upload'} multiple accept="image/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} />
                        <small>(Max size 10 MB per image, Max files - 4)</small>
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Upload Hi-Res <b>Side Facing</b> Images</label>
                        <FileUpload name="demo[]" url={'/api/upload'} multiple accept="image/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Drag and drop files to here to upload.</p>} />
                        <small>(Max size 10 MB per image, Max files - 4)</small>
                    </Col>
                </Row>
            </FormWizard.TabContent>
            <FormWizard.TabContent title="Step 3" icon="pi pi-calendar">
                <div>
                    {events.map((event, index) => (
                        <div key={index} className='mt-4'>
                            <Row>
                                <Col lg='12' md='12' className='mb-4 d-flex justify-content-between align-items-center'>
                                    <h6 className='text-danger'>Event {index + 1}</h6>
                                    {index !== 0 && ( // Display delete button only for additional events
                                        <Button
                                            label="Delete"
                                            icon="pi pi-trash"
                                            className="p-button-danger p-button-text bg-transperante"
                                            onClick={() => deleteEvent(index)}
                                        />
                                    )}
                                </Col>
                                <Col lg='6' md='6' className='mb-2'>
                                    <label className='mb-2'>Event Name</label>
                                    <InputText placeholder="Event Name" value={event.eventName} onChange={(e) => handleEventChange(index, 'eventName', e.target.value)} />
                                </Col>
                                <Col lg='6' md='6' className='mb-2'>
                                    <label className='mb-2'>Event Venue</label>
                                    <InputText placeholder="Event Venue" value={event.eventVenue} onChange={(e) => handleEventChange(index, 'eventVenue', e.target.value)} />
                                </Col>
                                <Col lg='6' md='6' className='mb-2'>
                                    <label className='mb-2'>Event Date</label>
                                    <Calendar value={event.eventDate} onChange={(e) => handleEventChange(index, 'eventDate', e.value)} dateFormat="dd/mm/yy" />
                                </Col>
                                <Col lg='6' md='6' className='mb-2'>
                                    <label className='mb-2'>Event Time</label>
                                    <Calendar id={`calendar-timeonly-${index}`} value={event.eventTime} onChange={(e) => handleEventChange(index, 'eventTime', e.value)} timeOnly />
                                </Col>
                                <Col lg='12' md='12' className='mb-2'>
                                    <label className='mb-2'>Event Description</label>
                                    <InputTextarea className='h-auto' placeholder='Enter Event Description' value={event.eventDescription} onChange={(e) => handleEventChange(index, 'eventDescription', e.target.value)} rows={3} cols={30} />
                                </Col>
                            </Row>
                        </div>
                    ))}
                    <div className='d-flex justify-content-end mt-4'>
                        <Button label="Add New Event" severity="help" onClick={addNewEvent} />
                    </div>
                </div>
            </FormWizard.TabContent>
            
            <FormWizard.TabContent title="Step 4" icon="pi pi-inbox">
                <h3>Deliverables</h3>
                <Row className='mt-4'>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2' >Theme</label>
                        <Dropdown value={selectedBride} onChange={(e) => setSelectedBride(e.value)} options={bride} optionLabel="name" placeholder='----Select----' className="w-full md:w-14rem" />
                    </Col>
                    <Col lg='6' md='6' className='mb-2'>
                        <label className='mb-2' >Style</label>
                        <Dropdown value={selectedBride} onChange={(e) => setSelectedBride(e.value)} options={bride} optionLabel="name" placeholder='----Select----' className="w-full md:w-14rem" />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Categories</label>
                        <MultiSelect value={selectedCategories} onChange={(e) => setSelectedCategories(e.value)} options={categories} optionLabel="name" filter placeholder="Select Categories" maxSelectedLabels={6} className="w-full" />
                    </Col>
                    <Col lg='12' md='12' className='mb-2'>
                        <label className='mb-2'>Any Suggestion or Remarks?</label>
                        <InputTextarea className='h-auto po' autoResize value={value} onChange={(e) => setValue(e.target.value)} rows={3} cols={30} />
                    </Col>
                </Row>
            </FormWizard.TabContent>
            </FormWizard>
        </>
    );
}

export default GWformClient;