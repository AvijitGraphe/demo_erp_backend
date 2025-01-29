import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import { Col, Row, Card, Breadcrumb } from 'react-bootstrap';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';

const ExpireUser = () => {
    const { accessToken } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [editableRow, setEditableRow] = useState(null);
    const [editedExpireDate, setEditedExpireDate] = useState(null);

    // Helper function to format the date
    const formatDate = (date) => {
        const utcDate = new Date(date);
        const localDate = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
        return localDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        });
    };

    // Action template for edit, save, and cancel buttons
    const actionTemplate = (rowData) => {
        return (
            <div className="d-flex justify-content-center">
                {editableRow === rowData.expire_id ? (
                    <>
                        <Button
                            icon="pi pi-check"
                            tooltip="Save"
                            outlined
                            severity="success"
                            className="p-button-sm p-mr-2 border-0 p-0"
                            onClick={() => handleSave(rowData)}
                        />
                        <Button
                            icon="pi pi-times"
                            tooltip="Cancel"
                            className="p-button-sm border-0 p-0"
                            severity="danger"
                            outlined
                            onClick={handleCancel}
                        />
                    </>
                ) : (
                    <Button
                        icon="pi pi-pencil"
                        className="border-0 p-0"
                        outlined
                        title="Edit"
                        severity="primary"
                        onClick={() => handleEdit(rowData)}
                    />
                )}
            </div>
        );
    };

    // Handle the row edit button click
    const handleEdit = (rowData) => {
        setEditableRow(rowData.expire_id);
        setEditedExpireDate(rowData.expire_date ? new Date(rowData.expire_date) : null);
    };

    // Handle save button click to update the expire date
    const handleSave = async (rowData) => {
        try {
            const localExpireDate = new Date(editedExpireDate)
            // Manually adjust the date string to the 'YYYY-MM-DD' format without time zone conversion
            const year = localExpireDate.getFullYear();
            const month = String(localExpireDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const day = String(localExpireDate.getDate()).padStart(2, '0');
            // Format the date as 'YYYY-MM-DD'
            const formattedExpireDate = `${year}-${month}-${day}`;
            // Send the local formatted date (ISO string without time component)
            const response = await axios.post(
                `${config.apiBASEURL}/authentication/updateExpiredate`,
                {
                    expire_id: rowData.expire_id,
                    expire_date: formattedExpireDate, // Send only the date part in 'YYYY-MM-DD' format
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            if (response.status === 200) {
                fetchApplication(); // Refresh the data after save
            }
    
            setEditableRow(null); // Reset the editable state
            setEditedExpireDate(null); // Reset the editedExpireDate
        } catch (error) {
            console.error('Error saving the expire date:', error);
        }
    };
    
    

    // Handle cancel button click
    const handleCancel = () => {
        setEditableRow(null);
        setEditedExpireDate(null);
    };

    // Filter employees based on the global search filter
    const filterEmployees = () => {
        return employees.filter((employee) => {
            const matchesSearch = globalFilter
                ? (employee.expire_id && employee.expire_id.toString().toLowerCase().includes(globalFilter.toLowerCase())) ||
                  (employee.expire_date && formatDate(employee.expire_date).toLowerCase().includes(globalFilter.toLowerCase()))
                : true;
            return matchesSearch;
        });
    };

    // Fetch all employees from the server
    const fetchApplication = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/authentication/getallExpiredate`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setEmployees(response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    useEffect(() => {
        fetchApplication(); 
    }, []);

    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col md={6} lg={6} className="mb-4">
                        <Breadcrumb>
                            <Breadcrumb.Item active>Employee List</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col lg={12} className="pe-0">
                        <Card>
                            <Card.Body>
                                <DataTable
                                    value={filterEmployees()}
                                    paginator
                                    rows={20}
                                    selection={selectedEmployees}
                                    onSelectionChange={(e) => setSelectedEmployees(e.value)}
                                    globalFilter={globalFilter}
                                >
                                    <Column
                                        header="Expire Date"
                                        body={(rowData) =>
                                            editableRow === rowData.expire_id ? (
                                                <Calendar
                                                    value={editedExpireDate}
                                                    onChange={(e) => {
                                                        // Fix the date by ensuring local timezone is respected
                                                        const selectedDate = e.value;
                                                        const localDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                                                        setEditedExpireDate(localDate);
                                                    }}
                                                    minDate={new Date()}
                                                />
                                            ) : (
                                                rowData.expire_date ? formatDate(rowData.expire_date) : ''
                                            )
                                        }
                                        sortable
                                    ></Column>
                                    <Column
                                        className="text-center"
                                        header="Action"
                                        body={actionTemplate}
                                        style={{ width: '100px' }}
                                    ></Column>
                                </DataTable>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Row>
        </>
    );
};

export default ExpireUser;
