import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Breadcrumb, Card, Table, Form, CardBody, CardFooter } from 'react-bootstrap';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import '../../assets/css/leaves.css';
import { Dialog } from 'primereact/dialog';
import { Avatar } from 'primereact/avatar';
import userAvatar from '../../assets/images/no_user.png';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import CustomToast from '../../components/CustomToast';
const Add_leavebalance = () => {
    const { accessToken } = useAuth();
    const toastRef = useRef(null); // Reference for the CustomToast component
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visible, setVisible] = useState(false);
    const [selectedBalance, setSelectedBalance] = useState(null);
    const [newArrears, setNewArrears] = useState('');
 // Show toast message function
 const showMessage = (severity, detail) => {
    const summary = severity.charAt(0).toUpperCase() + severity.slice(1);
    toastRef.current.show(severity, summary, detail);
};

    // handelupdate
    const handleUpdateArrears = async () => {
        if (!selectedBalance || newArrears === '') {
            showMessage('warning', 'Please enter a valid arrear days value.');
            return;
        }
        try {
            const response = await axios.put(
                `${config.apiBASEURL}/leaveRoutes/update-arrear-days`,
                {
                    leave_balance_id: selectedBalance._id,
                    arrear_days: newArrears,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            if (response.data.success) {
                fetchData();
                setVisible(false);
            }
        } catch (error) {
            console.error('Error updating arrear days:', error);
            showMessage('error', 'Failed to update arrear days. Please try again.');
        }
    };


    //fetchdata
    const fetchData = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/leaveRoutes/fetch-all-leave-balances-for-adjustment`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log("log the data", response.data);
            
            setUsers(response.data.data);
        } catch (err) {
            setError('Failed to fetch leave balances.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [accessToken]);


    if (loading) return <p>Loading leave balances...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col md={6} lg={6} className="mb-4">
                        <Breadcrumb>
                            <Breadcrumb.Item active>Add Leave Balance</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={12} lg={12} className="mb-4 AddLeavebalance">
                        <Accordion multiple>
                            {users.map((user, index) => (
                                <AccordionTab
                                    key={index}
                                    header={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar
                                                image={user.profileImage?.image_url || userAvatar}
                                                shape="circle"
                                                size="small"
                                                className="me-2"
                                            />
                                            <span>
                                                {user.first_name} {user.last_name} &nbsp; | &nbsp;
                                                <small>Joining Date: {user.joiningDate ? new Date(user.joiningDate.joining_date).toLocaleDateString('en-GB') : 'N/A'}</small>
                                            </span>
                                        </div>
                                    }
                                >
                                    <Table size="sm" striped bordered hover>
                                        <thead>
                                            <tr className="table-secondary">
                                                <th>Leave Type</th>
                                                <th><sup>Days</sup> Total</th>
                                                <th><sup>Days</sup> Earned</th>
                                                <th>Arrears</th>
                                                <th style={{ width: '80px' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {user.leaveBalances.map((balance, idx) => (
                                                <tr key={idx}>
                                                    <th>{balance.leaveType.name}</th>
                                                    <td>{balance.total_days || '0'}</td>
                                                    <td>{balance.earned_days || '0'}</td>
                                                    <td>{balance.arrear_days || '0'}</td>
                                                    <td>
                                                        <Button
                                                            title="Edit"
                                                            icon="pi pi-pencil"
                                                            severity="info"
                                                            outlined
                                                            className="border-0 p-0"
                                                            onClick={() => {
                                                                setSelectedBalance(balance);
                                                                setNewArrears(balance.arrear_days || '0');
                                                                setVisible(true);
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </AccordionTab>
                            ))}
                        </Accordion>
                    </Col>
                </Row>
                <CustomToast ref={toastRef} />
            </Row>

            <Dialog
                header="Edit Leave Balance"
                visible={visible}
                style={{ width: '340px' }}
                onHide={() => setVisible(false)}
            >
                <div>
                    <label>Arrear Days:</label>
                    <input
                        type="text"
                        value={newArrears}
                        onChange={(e) => {
                            // Only allow numeric input
                            const value = e.target.value;
                            if (/^-?\d*$/.test(value)) {
                                setNewArrears(value);
                            }
                        }}
                        className="form-control"
                    />
                    <div className="mt-3">
                        {newArrears >= 0 && newArrears <= 99 ? (
                            <Button
                                label="Save"
                                severity="success"
                                icon="pi pi-check"
                                onClick={handleUpdateArrears}
                            />
                        ) : null}
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            severity="danger"
                            className="p-button-text ml-2"
                            onClick={() => setVisible(false)}
                        />
                    </div>
                    {newArrears < 0 && <p className="text-danger mt-2">Arrear days cannot be negative.</p>}
                    {newArrears > 99 && <p className="text-danger mt-2">Arrear days cannot exceed 99.</p>}
                </div>
            </Dialog>
        </>
    );
};


export default Add_leavebalance;