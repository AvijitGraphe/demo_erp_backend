import React, { useState, useEffect } from "react";
import { Row, Col, Card, Breadcrumb, Table } from 'react-bootstrap';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { Paginator } from 'primereact/paginator';
import { Link } from "react-router-dom";
import '../../assets/css/client.css';


const Client_list = () => {

    const [activeIndex, setActiveIndex] = useState(null);
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [first, setFirst] = useState(0); // Starting index of pagination
    const [rows, setRows] = useState(10); // Rows per page
    const [totalRecords, setTotalRecords] = useState(0); // Total number of records


    useEffect(() => {
        const fetchClients = async () => {
            try {
                const page = first / rows + 1; // Calculate the page number based on 'first' and 'rows'
                const response = await axios.get(`${config.apiBASEURL}/clientside/clients`, {
                    params: { page, limit: rows }
                });
                const activeClients = response.data.activeClients;

                if (Array.isArray(activeClients)) {
                    setClients(activeClients);
                    const totalCount = response.data.totalCount || 0;
                    setTotalRecords(totalCount); // Set total records for Paginator
                } else {
                    console.error("Expected an array for activeClients but got:", activeClients);
                }
            } catch (error) {
                console.error("Error fetching clients:", error);
            }
        };

        fetchClients();
    }, [first, rows]); // Re-fetch clients when 'first' or 'rows' changes

    const filteredClients = Array.isArray(clients) ? clients.filter(client =>
        client.comp_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.poc && client.poc.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.bill_name && client.bill_name.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    const onPageChange = (event) => {
        setFirst(event.first);
        setRows(event.rows);
    };
    const handleTabChange = (e, clientIndex) => {
        if (activeIndex === clientIndex) {
            setActiveIndex(null); // Close the tab if it's already open
        } else {
            setActiveIndex(clientIndex); // Open the clicked tab
        }
    };

     return (
        <>
            <Row className='body_content'>
                <Row className='mx-0'>
                    <Col md={6} lg={9} className='mb-4'>
                        <Breadcrumb>
                            <Breadcrumb.Item active>Clients</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={6} lg={3} className='mb-4'>
                        <IconField iconPosition="left">
                            <InputIcon className="pi pi-search"> </InputIcon>
                            <InputText
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search company, POC, or bill name"
                                className="ps-5"
                            />
                        </IconField>
                    </Col>
                    <Row>
                        <Col lg='12' md='12' className="p-0 sticky-top" style={{ top: '-35px' }}>
                            <Card className="bg-info">
                                <ul className="listclient">
                                    <li>Company</li>
                                    <li>POC</li>
                                    <li>Bill Name</li>
                                    <li>Date</li>
                                    <li>Action</li>
                                </ul>
                            </Card>
                        </Col>

                        {filteredClients.map((client, index) => (
                            <Col lg='12' md='12' className="p-0 mt-2" key={client.client_id}>
                                <Card className="clientListdet">
                                    <ul className="listclient">
                                        <li>
                                            <div className='d-flex align-items-center'>
                                                <img src={require("../../assets/images/no_user.png")} alt='' style={{ width: '40px', height: '40px' }} className='rounded-circle me-2' />
                                                <div>
                                                    <b>{client.comp_name}</b>
                                                    <span className="d-block">
                                                        <Button icon="pi pi-envelope" rounded text aria-label="Filter" severity="warning" />
                                                        <Button icon="pi pi-phone" rounded text severity="help" aria-label="Bookmark" />
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                        <li>{client.poc}</li>
                                        <li>{client.bill_name}</li>
                                        <li>{new Date(client.created_at).toLocaleDateString()}</li>
                                        <li>
                                            <Link to={``}>
                                                <Button icon="pi pi-eye" rounded text severity="info" aria-label="Bookmark" />
                                            </Link>
                                        </li>
                                    </ul>
                                    <Card.Footer className="p-0 border-0 shadow-none">
                                        <Accordion activeIndex={activeIndex === index ? 0 : null} onTabChange={(e) => handleTabChange(e, index)}>
                                            <AccordionTab header="More...">
                                                <Table size="sm" striped bordered>
                                                    <thead>
                                                        <tr>
                                                            <th>Brand Name</th>
                                                            <th>POC</th>
                                                            <th>Bill Name</th>
                                                            <th>Date</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <div className='d-flex align-items-center'>
                                                                    <img src={require("../../assets/images/no_user.png")} alt='' style={{ width: '30px', height: '30px' }} className='rounded-circle me-2' />
                                                                    <div>
                                                                        Test Company
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>John Dow</td>
                                                            <td>John Dow</td>
                                                            <td>15 Aug, 2024</td>
                                                            <td>
                                                                <Button icon="pi pi-eye" rounded text severity="help" aria-label="Bookmark" />
                                                                <Button icon="pi pi-pencil" rounded text severity="info" aria-label="Bookmark" />
                                                                <Button icon="pi pi-envelope" rounded text aria-label="Filter" severity="warning" />
                                                                <Button icon="pi pi-phone" rounded text severity="success" aria-label="Bookmark" />
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            </AccordionTab>
                                        </Accordion>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}

                        {/* Pagination */}
                        <Col lg='12' className="mt-2 p-0">
                            <Card>
                                <Paginator
                                    first={first}
                                    rows={rows}
                                    totalRecords={totalRecords}
                                    rowsPerPageOptions={[10, 20, 30]}
                                    onPageChange={onPageChange}
                                    className="justify-content-end"
                                />
                            </Card>
                        </Col>
                    </Row>
                </Row>
            </Row>
        </>
    );
};

export default Client_list;

