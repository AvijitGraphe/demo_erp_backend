import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/AuthContext';

function Emergencycontact({ userId, emergencyContacts, setVisibleModal3, fetchEmergencyContacts }) {
    const { accessToken } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [errors, setErrors] = useState([]);

    // Initialize contacts and errors on load
    useEffect(() => {
        if (emergencyContacts && emergencyContacts.length > 0) {
            setContacts(emergencyContacts);
            setErrors(emergencyContacts.map(() => ({ name: '', relationship: '', phone: '' })));
        } else {
            setContacts([{ name: '', relationship: '', phone: '' }]);
            setErrors([{ name: '', relationship: '', phone: '' }]);
        }
    }, [emergencyContacts]);

    // Handle form input changes
    const handleChange = (e, index) => {
        const { name, value } = e.target;
        const updatedContacts = [...contacts];
        updatedContacts[index] = { ...updatedContacts[index], [name]: value };
        setContacts(updatedContacts);

        if (value.trim() !== '') {
            const updatedErrors = [...errors];
            if (updatedErrors[index]) {
                updatedErrors[index][name] = '';
            }
            setErrors(updatedErrors);
        }
    };

    // Validate the form before submitting
    const validateForm = () => {
        const newErrors = contacts.map(contact => ({
            name: contact.name.trim() === '' ? 'Name is required' : '',
            relationship: contact.relationship.trim() === '' ? 'Relationship is required' : '',
            phone: contact.phone.trim() === '' ? 'Phone number is required' : '',
        }));
        setErrors(newErrors);

        return !newErrors.some(errorObj => Object.values(errorObj).some(error => error !== ''));
    };

    // Handle form submission (add or update)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            try {
                for (const contact of contacts) {
                    const data = {
                        user_id: userId,
                        id_emergency_contact: contact.id_emergency_contact || undefined,
                        name: contact.name,
                        relationship: contact.relationship,
                        phone: contact.phone,
                    };

                    await axios.post(`${config.apiBASEURL}/user-profile/emergency-contact`, data, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                }
                setVisibleModal3(false);
                fetchEmergencyContacts();
            } catch (error) {
                console.error('Error updating emergency contacts:', error);
            }
        } else {
            console.log('Form contains errors');
        }
    };

    // Add a new contact row
    const addContact = () => {
        setContacts([...contacts, { name: '', relationship: '', phone: '' }]);
        setErrors([...errors, { name: '', relationship: '', phone: '' }]);
    };

    // Remove a contact
    const removeContact = async (index) => {
        const contactToRemove = contacts[index];
        if (contactToRemove.id_emergency_contact) {
            try {
                await axios.post(
                    `${config.apiBASEURL}/user-profile/emergency-contact`,
                    { user_id: userId, id_emergency_contact: contactToRemove.id_emergency_contact },
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );
            } catch (error) {
                console.error('Error deleting emergency contact:', error);
                return;
            }
        }

        const updatedContacts = [...contacts];
        updatedContacts.splice(index, 1);
        setContacts(updatedContacts);

        const updatedErrors = [...errors];
        updatedErrors.splice(index, 1);
        setErrors(updatedErrors);
    };

    return (
        <Form onSubmit={handleSubmit}>
            {contacts.map((contact, index) => (
                <Col key={index} lg="12" className="mb-4">
                    <Card className="addEm shadow-0 p-0">
                        <Card.Body className="p-0">
                            <Card.Title>
                                <small className="text-secondary">Emergency Contact {index + 1}</small>
                                {contacts.length > 1 && (
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="float-end"
                                        onClick={() => removeContact(index)}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </Card.Title>
                            <Row className="mb-3">
                                <Col lg={4} md={6}>
                                    <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={contact.name}
                                        onChange={(e) => handleChange(e, index)}
                                        placeholder="Name"
                                        isInvalid={!!errors[index]?.name}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors[index]?.name}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={4} md={6}>
                                    <Form.Label>Relationship <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="relationship"
                                        value={contact.relationship}
                                        onChange={(e) => handleChange(e, index)}
                                        placeholder="Relationship"
                                        isInvalid={!!errors[index]?.relationship}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors[index]?.relationship}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col lg={4} md={6}>
                                    <Form.Label>Phone No. <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="phone"
                                        value={contact.phone}
                                        onChange={(e) => handleChange(e, index)}
                                        placeholder="+91-xxxxxxxxx01"
                                        isInvalid={!!errors[index]?.phone}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors[index]?.phone}
                                    </Form.Control.Feedback>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            ))}
            <Col lg="12" className="d-flex justify-content-end pt-3">
                <Button variant="primary" size="lg" type="submit">
                    SAVE
                </Button>
                {contacts.length < 2 && (
                    <Button variant="success" size="lg" className="ms-2" onClick={addContact}>
                        Add Contact
                    </Button>
                )}
            </Col>
        </Form>
    );
}

export default Emergencycontact;
