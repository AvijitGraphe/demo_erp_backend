import React, { useState, useEffect } from "react";
import { Row, Col, Breadcrumb, Card, Form, Table } from 'react-bootstrap';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Editor } from 'primereact/editor';
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import axios from 'axios';
import config from '../../config';
import { useAuth } from "../../context/AuthContext";
import { MultiSelect } from 'primereact/multiselect'; // Import MultiSelect component
const Add_policy = () => {
    const { userId, accessToken } = useAuth();
    const [text, setText] = useState('');
    const [visible, setVisible] = useState(false);
    const [selectedCity, setSelectedCity] = useState([]);

    const cities = [
        { name: 'HumanResource', code: 'HR' },
        { name: 'Accounts', code: 'AC' },
        { name: 'Department_Head', code: 'DH' },
        { name: 'Employee', code: 'EMP' },
        { name: 'Social_Media_Manager', code: 'SMM' },
        { name: 'Task_manager', code: 'TM' }
    ];

    const [policyName, setPolicyName] = useState('');
    const [policySubject, setPolicySubject] = useState('');
    const [policyFile, setPolicyFile] = useState(null);
    const [policies, setPolicies] = useState([]); // State to store fetched policies
    const [selectedPolicy, setSelectedPolicy] = useState(null); // State to store selected policy for viewing
    const [isEditMode, setIsEditMode] = useState(false); // State to track if the form is in edit mode

    const fetchPolicies = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/policyRoutes/allpolicies`, {
                headers: {
                    Authorization: `Bearer ${accessToken}` // Add Authorization header
                }
            });
            setPolicies(response.data);
        } catch (error) {
            console.error('Failed to fetch policies', error);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const handleSubmit = async () => {
        try {
            const policyData = {
                policy_name: policyName,
                policy_type: selectedCity.map((city) => city.name), // Map selected cities to names
                policy_subject: policySubject,
                policy_desc: text,
                created_by: userId
            };

            const response = await axios.post(`${config.apiBASEURL}/policyRoutes/policies`, policyData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            console.log(response.data);
            fetchPolicies();
        } catch (error) {
            console.error(error);
        }
    };


    const handleEdit = async (id) => {
        try {
            const policyData = {
                policy_name: policyName,
                // policy_type: selectedCity.name,
                policy_type: selectedCity[0]?.name,
                policy_subject: policySubject,
                policy_desc: text,
                updated_by: userId
            };
            const response = await axios.put(`${config.apiBASEURL}/policyRoutes/policies/${id}`, policyData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            fetchPolicies();
            setIsEditMode(false);
            clearForm();
        } catch (error) {
            console.error(error);
            // Handle error (e.g., display an error message)
        }
    };


    const handleEditClick = (policy) => {
        console.log("log the all policies data ok", policy);
        setSelectedPolicy(policy);
        setPolicyName(policy.policy_name);
        const city = cities.find(c => c.name === policy.policy_type);
        if (city) {
            setSelectedCity([{ name: city.name, code: city.code }]);
        } else {
            setSelectedCity([]);
        }
        setPolicySubject(policy.policy_subject);
        setText(policy.policy_desc);
        setIsEditMode(true);
    };
    
    
    const clearForm = () => {
        setPolicyName('');
        setSelectedCity([]);
        setPolicySubject('');
        setText('');
        setPolicyFile(null);
        setSelectedPolicy(null);
        setIsEditMode(false);
    };


    //delete the police data 
    const handleDeleteClick = async(id)=>{
        try {
            await axios.delete(`${config.apiBASEURL}/policyRoutes/policiesdelete/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            fetchPolicies();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <Row className='body_content'>
                <Row className='mx-0'>
                    <Col md={6} lg={5} className='mb-4'>
                        <Breadcrumb>
                            <Breadcrumb.Item active>Policy</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Row className="policyTable">
                        <Col md={6} lg={5} className='mb-4 ps-0'>
                            <Card>
                                <Card.Header><b>{isEditMode ? 'Edit Policy' : 'Add Policy'}</b></Card.Header>
                                <Card.Body>
                                    <InputText
                                        placeholder="Policy Name"
                                        className="mb-2"
                                        value={policyName}
                                        onChange={(e) => setPolicyName(e.target.value)}
                                    />
                                    {isEditMode ? (
                                        <Dropdown
                                            // value={selectedCity[0]}
                                            value={selectedCity[0] || {}}
                                            onChange={(e) => setSelectedCity([e.value])}
                                            options={cities}
                                            optionLabel="name"
                                            disabled
                                            placeholder="Policy Type"
                                            className="mb-2"
                                        />
                                    ) : (
                                        <MultiSelect
                                            value={selectedCity}
                                            onChange={(e) => setSelectedCity(e.value)}
                                            options={cities}
                                            optionLabel="name"
                                            placeholder="Policy Type"
                                            className="mb-2"
                                            display="chip"
                                        />
                                    )}
                                    <InputText
                                        placeholder="Subjects"
                                        className="mb-2"
                                        value={policySubject}
                                        onChange={(e) => setPolicySubject(e.target.value)}
                                    />
                                    <Editor
                                        value={text}
                                        onTextChange={(e) => setText(e.htmlValue)}
                                        style={{ height: '250px' }}
                                    />
                                    <Form.Group controlId="formFile" className="mt-3">
                                        <Form.Label>Add signature</Form.Label>
                                        <Form.Control
                                            type="file"
                                            className="ms-0"
                                            onChange={(e) => setPolicyFile(e.target.files[0])}
                                        />
                                    </Form.Group>
                                    <div className="d-flex justify-content-end">
                                        {isEditMode && (
                                            <Button
                                                label="Cancel"
                                                className="mt-4 me-2 py-2"
                                                onClick={clearForm}
                                                severity="secondary"
                                            />
                                        )}
                                        <Button
                                            label={isEditMode ? 'Update Policy' : 'Save Policy'}
                                            severity="success"
                                            className="mt-4 py-2"
                                            onClick={() => isEditMode ? handleEdit(selectedPolicy.policy_id) : handleSubmit()}
                                        />

                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6} lg={7} className='mb-4'>
                            <Card>
                                <Card.Header><b>List of Policies</b></Card.Header>
                                <Card.Body className='pt-0'>
                                    <Table striped hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>Policy Name</th>
                                                <th>Policy Type</th>
                                                <th style={{ width: '160px' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {policies.map((policy) => (
                                                <tr key={policy.policy_id}>
                                                    <td>{policy.policy_name}</td>
                                                    <td>{policy.policy_type}</td>
                                                    <td>
                                                        <Button
                                                            className="p-button-sm p-0"
                                                            icon="pi pi-eye"
                                                            rounded
                                                            text
                                                            severity="help"
                                                            onClick={() => { setSelectedPolicy(policy); setVisible(true); }}
                                                        />
                                                        <Button
                                                            className="p-button-sm p-0"
                                                            icon="pi pi-file-edit"
                                                            rounded
                                                            text
                                                            severity="info"
                                                            onClick={() => handleEditClick(policy)}
                                                        />
                                                        <Button
                                                            className="p-button-sm"
                                                            icon="pi pi-times"
                                                            rounded
                                                            text
                                                            severity="danger"
                                                            onClick={() => handleDeleteClick(policy.policy_id)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Dialog
                        visible={visible}
                        style={{ width: '40vw' }}
                        className="policy_modal_padding"
                        onHide={() => { if (!visible) return; setVisible(false); }}
                    >
                        {selectedPolicy && (
                            <Table bordered size="sm" className="polisy_table">
                                <thead>
                                    <tr className="border-0">
                                        <td colSpan={5} className="slslip_card border-0">
                                            <span className="d-block">
                                                <img
                                                    src={require("../../assets/images/logo.png")}
                                                    alt=''
                                                />
                                            </span>
                                            <h5>
                                                <small className="mb-4">THE GRAPHE - A DESIGN STUDIO</small>
                                                {selectedPolicy.policy_subject}
                                            </h5>
                                            <span className="mt-4 d-block text-muted">
                                                {/* Display avatar and name */}
                                                {selectedPolicy.creator || selectedPolicy.updater ? (
                                                    <>
                                                        Update by: {selectedPolicy.creator ? `${selectedPolicy.creator.first_name} ${selectedPolicy.creator.last_name}` : `${selectedPolicy.updater.first_name} ${selectedPolicy.updater.last_name}`}
                                                    </>
                                                ) : (
                                                    <span>Update by: Unknown</span>
                                                )}
                                                &nbsp; | &nbsp; Last Updated: {new Date(selectedPolicy.updatedAt).toLocaleString('en-GB')}
                                            </span>

                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-0">
                                        <td colSpan={4} className="text-start border-0">
                                            <div dangerouslySetInnerHTML={{ __html: selectedPolicy.policy_desc }} />
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr className="border-0">
                                        <td colSpan={4} className="signature text-end border-0">
                                            <span className="d-block text-end mt-5">
                                                <img
                                                    src={require("../../assets/images/sign_n.png")}
                                                    alt=''
                                                    style={{ width: '80px', height: '80px' }}
                                                />
                                            </span>
                                            <small className="mb-4">Authorized Signatory</small>
                                        </td>
                                    </tr>
                                    <tr className="border-0"><td colSpan={4} className="border-0"></td></tr>
                                    <tr className="border-bottom-0">
                                        <td colSpan={4} className="text-center border-0">
                                            <small className="d-block">193/1 MAHATAMA GANDI ROAD, KOLKATA - 700007</small>
                                            <small>Email: <a href="mailto:Saurabh@thegraphe.com" className="text-primary">Saurabh@thegraphe.com</a></small>
                                        </td>
                                    </tr>
                                </tfoot>
                            </Table>
                        )}
                    </Dialog>
                </Row>
            </Row>
        </>
    );
};

export default Add_policy;
