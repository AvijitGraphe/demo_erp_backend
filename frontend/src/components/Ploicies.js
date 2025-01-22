import React, { useEffect, useState } from 'react';
import { Card, Table } from 'react-bootstrap';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';

const Policies = () => {
    const [visible, setVisible] = useState(false);
    const [policies, setPolicies] = useState([]);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const { role } = useAuth();

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/policy/alldistpolicies?policy_type=${role}`);
                setPolicies(response.data);
            } catch (error) {
                console.error('Failed to fetch policies', error);
            }
        };

        fetchPolicies();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <>
            <Card className='shadow-0'>
                <Card.Header className='border-0 ps-0 mb-3 text-info'><b>List of Policy</b></Card.Header>
                <Table striped hover bordered>
                    <thead>
                        <tr>
                            <th>Policy Name</th>
                            <th>Policy Type</th>
                            <th style={{ width: '200px' }}>Date of Issue</th>
                            <th style={{ width: '100px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {policies.map(policy => (
                            <tr key={policy.id}>
                                <td>{policy.policy_name}</td>
                                <td>{policy.policy_type}</td>
                                <td>{formatDate(policy.updated_at)}</td>
                                <td>
                                    <Button
                                        className="p-button-sm p-0"
                                        label='View'
                                        text
                                        severity="help"
                                        onClick={() => {
                                            setSelectedPolicy(policy);
                                            setVisible(true);
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            <Dialog visible={visible} style={{ width: '40vw' }} className="policy_modal_padding" onHide={() => { if (!visible) return; setVisible(false); }}>
                {selectedPolicy && (
                    <Table bordered size="sm" className="sl-table">
                        <thead>
                            <tr className="border-0">
                                <td colSpan={5} className="slslip_card border-0">
                                    <span className="d-block">
                                        <img
                                            src={require("../assets/images/logo.png")}
                                            alt=''
                                        />
                                    </span>
                                    <h5>
                                        <small className="mb-4">THE GRAPHE - A DESIGN STUDIO</small>
                                        {selectedPolicy.policy_subject}
                                    </h5>
                                    <span className="mt-4 d-block text-muted">
                                        Update by: {selectedPolicy.updator_name} &nbsp; | &nbsp; Last Updated: {new Date(selectedPolicy.updated_at).toLocaleString()}
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
                                <td colSpan={4} className="signature text-start border-0">
                                    <span className="d-block text-start mt-5">
                                        <img
                                            src={require("../assets/images/sign_n.png")}
                                            alt=''
                                            style={{ width: '80px', height: '80px' }}
                                        />
                                    </span>
                                    <small className="mb-4">Authorized Signatory</small>
                                </td>
                            </tr>
                            <tr className="border-0">
                                <td colSpan={4} className="text-center border-0">
                                    <small className="d-block">193/1 MAHATAMA GANDI ROAD, KOLKATA - 700007</small>
                                    <small>Email: <a href="mailto:Saurabh@thegraphe.com" className="text-primary">Saurabh@thegraphe.com</a></small>
                                </td>
                            </tr>
                        </tfoot>
                    </Table>
                )}
            </Dialog>
        </>
    );
};

export default Policies;
