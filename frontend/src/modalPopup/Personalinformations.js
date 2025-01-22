import React, { useState, useEffect } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import axios from 'axios';
import { Button } from 'primereact/button';
import config from '../config';

function PersonalInformations({ userId, personalInfo, setVisibleModal2, fetchUserDetails }) {
    const [formData, setFormData] = useState({
        pan_card_no: '',
        passport_no: '',
        aadhar_no: '',
        nationality: '',
        religion: '',
        marital_status: 'Unmarried',
        employment_of_spouse: 'No',
        no_of_children: '0'
    });

    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        if (personalInfo) {
            setFormData({
                pan_card_no: personalInfo.pan_card_no || '',
                passport_no: personalInfo.passport_no || '',
                aadhar_no: personalInfo.aadhar_no || '',
                nationality: personalInfo.nationality || '',
                religion: personalInfo.religion || '',
                marital_status: personalInfo.marital_status || 'Unmarried',
                employment_of_spouse: personalInfo.employment_of_spouse || 'No',
                no_of_children: personalInfo.no_of_children || '0'
            });
        }
    }, [personalInfo]);

    useEffect(() => {
        validateForm();
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validateForm = () => {
        const { pan_card_no, passport_no, aadhar_no, nationality, religion } = formData;
        const isValid = pan_card_no && passport_no && aadhar_no && nationality && religion;
        setIsFormValid(isValid);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        try {
            const response = await axios.put(`${config.apiBASEURL}/profile/userdetails/update?userId=${userId}`, formData);
            console.log('User details updated:', response.data);
            setVisibleModal2(false); // Close the modal on successful update
            fetchUserDetails();
        } catch (error) {
            console.error('Error updating user details:', error);
        }
    };

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Col lg={4} md={6}>
                        <Form.Label>Pan card No. <span className='text-danger'>*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="pan_card_no"
                            placeholder="xxxxxxxxxx"
                            value={formData.pan_card_no}
                            onChange={handleChange}
                        />
                    </Col>
                    <Col lg={4} md={6}>
                        <Form.Label>Passport No. <span className='text-danger'>*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="passport_no"
                            placeholder="xxxxxxxxxx"
                            value={formData.passport_no}
                            onChange={handleChange}
                        />
                    </Col>
                    <Col lg={4} md={6}>
                        <Form.Label>Aadhar No. <span className='text-danger'>*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="aadhar_no"
                            placeholder="xxx-xxx-xxx"
                            value={formData.aadhar_no}
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col lg={4} md={6}>
                        <Form.Label>Nationality<span className='text-danger'>*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                        />
                    </Col>
                    <Col lg={4} md={6}>
                        <Form.Label>Religion<span className='text-danger'>*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="religion"
                            value={formData.religion}
                            onChange={handleChange}
                        />
                    </Col>
                    <Col lg={4} md={6}>
                        <Form.Label>Marital status<span className='text-danger'>*</span></Form.Label>
                        <Form.Select
                            name="marital_status"
                            value={formData.marital_status}
                            onChange={handleChange}
                        >
                            <option value="Married">Married</option>
                            <option value="Unmarried">Unmarried</option>
                        </Form.Select>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col lg={4} md={6}>
                        <Form.Label>Employment of spouse<span className='text-danger'>*</span></Form.Label>
                        <Form.Select
                            name="employment_of_spouse"
                            value={formData.employment_of_spouse}
                            onChange={handleChange}
                        >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </Form.Select>
                    </Col>
                    <Col lg={4} md={6}>
                        <Form.Label>No. of children <span className='text-danger'>*</span></Form.Label>
                        <Form.Select
                            name="no_of_children"
                            value={formData.no_of_children}
                            onChange={handleChange}
                        >
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </Form.Select>
                    </Col>
                </Row>
                <Col lg='12' className='d-flex justify-content-end pt-3'>
                    <Button type="button" className='btn btn-dark btn-lg me-2' onClick={() => setVisibleModal2(false)}>CANCEL</Button>
                    <Button type="submit" className='btn btn-primary mb-0 ms-2' disabled={!isFormValid}>Save</Button>
                </Col>
            </Form>
        </>
    );
}

export default PersonalInformations;
