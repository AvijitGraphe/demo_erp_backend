import React, { useState, useEffect } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import { Calendar } from 'primereact/calendar';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import axios from 'axios';
import config from '../config';
import { Button } from 'primereact/button';
import { useAuth } from "../context/AuthContext";

function Profileinformation({ userId, userDetails, setVisibleModal1, fetchUserDetails }) {
    const {  accessToken } = useAuth(); // Get userId from the context
    const [formData, setFormData] = useState({
        user_id: userId || '', // Ensure `user_id` is included
        details_id: '', // Include details_id for edit functionality
        phone: '',
        date_of_birth: new Date(),
        gender: '',
        country: '',
        state: '', // Add state to the formData
        address: '',
        city: '',
        pincode: '',
        forte: '',
        other_skills: '',
        pan_card_no: '',
        passport_no: '',
        aadhar_no: '',
        nationality: '',
        religion: '',
        marital_status: '',
        employment_of_spouse: '',
        no_of_children: 0,
    });

    const [error, setError] = useState('');

    useEffect(() => {
        if (userDetails) {
            setFormData({
                user_id: userId ||  '', // Set user_id from context or existing details
                details_id: userDetails.details_id || '', // Include details_id for editing
                phone: userDetails.phone || '',
                date_of_birth: userDetails.date_of_birth ? new Date(userDetails.date_of_birth) : new Date(),
                gender: userDetails.gender || '',
                country: userDetails.country || '',
                state: userDetails.state || '', // Ensure state is populated
                address: userDetails.address || '',
                city: userDetails.city || '',
                pincode: userDetails.pincode || '',
                forte: userDetails.forte || '',
                other_skills: userDetails.other_skills || '',
                pan_card_no: userDetails.pan_card_no || '',
                passport_no: userDetails.passport_no || '',
                aadhar_no: userDetails.aadhar_no || '',
                nationality: userDetails.nationality || '',
                religion: userDetails.religion || '',
                marital_status: userDetails.marital_status || '',
                employment_of_spouse: userDetails.employment_of_spouse || '',
                no_of_children: userDetails.no_of_children || 0,
            });
        }
    }, [userDetails, userId]);
    


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleDateChange = (date) => {
        const adjustedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        setFormData((prevState) => ({
            ...prevState,
            date_of_birth: adjustedDate,
        }));
    };
    

    const handlePhoneChange = (value) => {
        setFormData(prevState => ({
            ...prevState,
            phone: value
        }));
    };

    const validateForm = () => {
        const {  phone, gender, country, address, city, pincode } = formData;
        return (
           phone && gender && country && address && city && pincode
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!formData.gender) {
            setError('Gender is required.');
            return;
        }
    
        setError(''); // Clear any previous error
    
        try {
            const response = await axios.post(
                `${config.apiBASEURL}/user-profile/user-details`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, // Add the Authorization header
                    },
                }
            );
            console.log(response.data);
            setVisibleModal1(false);
            if (fetchUserDetails) fetchUserDetails(); // Fetch data on successful update
        } catch (error) {
            console.error('Error updating user details:', error);
        }
    };
    

    const isFormValid = validateForm();

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Col Col="12" lg="12" className="mb-4">
                    <Card className="addEm shadow-0 p-0">
                        <Card.Body className="p-0">
                            <Row className="mb-3">

                                <Col lg={4} md={6}>
                                    <Form.Label>Phone</Form.Label>
                                    <PhoneInput
                                        international
                                        defaultCountry="IN"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        required
                                    />
                                </Col>

                                <Col lg={4} md={6}>
                                    <Form.Label>Birthday</Form.Label>
                                    <Calendar
                                        value={formData.date_of_birth}
                                        onChange={(e) => handleDateChange(e.value)}
                                        showIcon
                                    />
                                </Col>
                                <Col lg={4} md={6}>
                                    <Form.Label>Gender</Form.Label>
                                    <Form.Select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </Form.Select>
                                    {error && <div className="text-danger">{error}</div>}
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col lg={6} md={6}>
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.address}
                                        name="address"
                                        placeholder="Address"
                                        onChange={handleChange}
                                        required
                                    />
                                </Col>
                                <Col lg={3} md={6}>
                                    <Form.Label>City</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.city}
                                        name="city"
                                        placeholder="City"
                                        onChange={handleChange}
                                        required
                                    />
                                </Col>
                                <Col lg={3} md={6}>
                                    <Form.Label>Postal Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.pincode}
                                        name="pincode"
                                        placeholder="Postal Code"
                                        onChange={handleChange}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-3">
                            <Col lg={4} md={6}>
                                    <Form.Label>State</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.state}
                                        name="state"
                                        placeholder="State"
                                        onChange={handleChange}
                                        required
                                    />
                                </Col>
                                <Col lg={4} md={6}>
                                    <Form.Label>Country</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.country}
                                        name="country"
                                        placeholder="Country"
                                        onChange={handleChange}
                                        required
                                    />
                                </Col>
                                <Col lg={4} md={6}>
                                    <Form.Label>Forte</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.forte}
                                        name="forte"
                                        placeholder="forte"
                                        onChange={handleChange}
                                        required
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col lg={4} md={6}>
                                    <Form.Label>PAN Card No</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.pan_card_no}
                                        name="pan_card_no"
                                        placeholder="PAN Card No"
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col lg={4} md={6}>
                                    <Form.Label>Passport No</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.passport_no}
                                        name="passport_no"
                                        placeholder="Passport No"
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col lg={4} md={6}>
                                    <Form.Label>Aadhar No</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.aadhar_no}
                                        name="aadhar_no"
                                        placeholder="Aadhar No"
                                        onChange={handleChange}
                                    />
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col lg={4} md={6}>
                                    <Form.Label>Nationality</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.nationality}
                                        name="nationality"
                                        placeholder="Nationality"
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col lg={4} md={6}>
                                    <Form.Label>Religion</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.religion}
                                        name="religion"
                                        placeholder="Religion"
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col lg={4} md={6}>
                                    <Form.Label>Marital Status</Form.Label>
                                    <Form.Select
                                        name="marital_status"
                                        value={formData.marital_status}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled>Select Marital Status</option>
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                    </Form.Select>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col lg={6} md={6}>
                                    <Form.Label>Employment of Spouse</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.employment_of_spouse}
                                        name="employment_of_spouse"
                                        placeholder="Employment of Spouse"
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col lg={6} md={6}>
                                    <Form.Label>Number of Children</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.no_of_children}
                                        name="no_of_children"
                                        placeholder="Number of Children"
                                        onChange={handleChange}
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg="12" className="d-flex justify-content-end pt-3">
                    <Button type="button" className="btn btn-dark btn-lg me-2" onClick={() => setVisibleModal1(false)}>CANCEL</Button>
                    <Button type="submit" className="btn btn-primary mb-0 ms-2" disabled={!isFormValid}>Save</Button>
                </Col>
            </Form>
        </>
    );
}

export default Profileinformation;
