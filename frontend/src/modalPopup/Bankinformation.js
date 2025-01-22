import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Col, Card, Row } from 'react-bootstrap';
import config from '../config';
import { useAuth } from '../context/AuthContext';
function Bankinformation({ userId, bankInfo, setVisibleModal4, fetchBankDetails }) {
    const { accessToken } = useAuth(); // Get userId from the context
    const [formData, setFormData] = useState({
        id_bank_details: '', // Include id_bank_details for editing
        bankName: '',
        bankAccountNo: '',
        ifscCode: '',
        branchName: '',
        accountHolderName: '',
    });

    // Populate form data with `bankInfo` on component mount or update
    useEffect(() => {
        if (bankInfo) {
            setFormData({
                id_bank_details: bankInfo.id_bank_details || '', // Include id_bank_details for editing
                bankName: bankInfo.bank_name || '',
                bankAccountNo: bankInfo.bank_account_no || '',
                ifscCode: bankInfo.ifsc_code || '',
                branchName: bankInfo.branch_name || '',
                accountHolderName: bankInfo.accountHolder_name || '',
            });
        }
    }, [bankInfo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            console.error('Form is invalid. Please fill all required fields.');
            return;
        }

        try {
            const response = await axios.post(
                `${config.apiBASEURL}/user-profile/bank-details`,
                {
                    user_id: userId,
                    id_bank_details: formData.id_bank_details || undefined, // Only include if editing
                    bank_name: formData.bankName,
                    bank_account_no: formData.bankAccountNo,
                    ifsc_code: formData.ifscCode,
                    branch_name: formData.branchName,
                    accountHolder_name: formData.accountHolderName,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, // Add the Authorization header
                    },
                }
            );
            console.log(response.data.message);
            setVisibleModal4(false); // Close the modal on successful operation
            fetchBankDetails(); // Refresh bank details
        } catch (error) {
            console.error('Error updating/adding bank details:', error);
        }
    };

    const isFormValid = () => {
        return (
            formData.bankName &&
            formData.bankAccountNo &&
            formData.ifscCode &&
            formData.branchName &&
            formData.accountHolderName
        );
    };

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Col Col='12' lg='12' className='mb-4'>
                    <Card className='addEm shadow-0 p-0'>
                        <Card.Body className='p-0'>
                            <Row className="mb-3">
                                <Col lg={6} md={6} className='mb-3'>
                                    <Form.Label className='mb-1'>Bank Name <span className='text-danger'>*</span></Form.Label>
                                    <Form.Control type="text" name="bankName" value={formData.bankName} onChange={handleChange} placeholder="Bank name" />
                                </Col>
                                
                                <Col lg={6} md={6} className='mb-3'>
                                    <Form.Label className='mb-1'>Bank Account No. <span className='text-danger'>*</span></Form.Label>
                                    <Form.Control type="number" name="bankAccountNo" value={formData.bankAccountNo} onChange={handleChange} placeholder="xxxxxxxxxxx" min="0" onKeyDown={(e) => e.key === 'e' || e.key === '-' || e.key === '.' ? e.preventDefault() : null} />
                                </Col>
                                
                                <Col lg={6} md={6} className='mb-3'>
                                    <Form.Label className='mb-1'>IFSC Code<span className='text-danger'>*</span></Form.Label>
                                    <Form.Control type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="ICIxxxxx" />
                                </Col>
                               
                                <Col lg={6} md={6} className='mb-3'>
                                    <Form.Label className='mb-1'>Branch Name<span className='text-danger'>*</span></Form.Label>
                                    <Form.Control type="text" name="branchName" value={formData.branchName} onChange={handleChange} placeholder="Branch name" />
                                </Col>
                                
                                <Col lg={6} md={6} className='mb-3'>
                                    <Form.Label className='mb-1'>Account Holder Name<span className='text-danger'>*</span></Form.Label>
                                    <Form.Control type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} placeholder="Account holder name" />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg='12' className='d-flex justify-content-end pt-3'>
                    <button type="submit" className='btn btn-primary btn-lg' disabled={!isFormValid()}>SAVE</button>
                </Col>
            </Form>
        </>
    );
}

export default Bankinformation;
