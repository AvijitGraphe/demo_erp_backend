import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import { Col, Row, Card, Badge, Breadcrumb } from 'react-bootstrap';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';


const ExpireUser = () => {
    const { accessToken } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [editableRow, setEditableRow] = useState(null);
    const [editedExpireDate, setEditedExpireDate] = useState(null);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        });
    };

    const actionTemplate = (rowData) => {
        return (
            <div className="d-flex justify-content-center">
                {editableRow === rowData.user_id ? (
                    <>
                        <Button
                            icon="pi pi-check"
                            tooltip='Save'
                            outlined
                            severity='success'
                            className="p-button-sm p-mr-2  border-0 p-0"
                            onClick={() => handleSave(rowData)}
                        />
                        <Button
                            icon="pi pi-times"
                            tooltip='Cancel'
                            className="p-button-sm border-0 p-0"
                            severity='danger'
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

    const handleEdit = (rowData) => {
        setEditableRow(rowData.user_id);
        setEditedExpireDate(rowData.expireDate);
    };

    const handleSave = async (rowData) => {
      try {
          const updatedEmployees = employees.map((employee) =>
              employee.user_id === rowData.user_id ? { ...employee, expireDate: editedExpireDate } : employee
          );
          setEmployees(updatedEmployees);
          const response = await axios.post(
              `${config.apiBASEURL}/authentication/updateExpiredate`, 
              { 
                  user_id: rowData.user_id, 
                  expire_date: editedExpireDate 
              },
              {
                  headers: {
                      Authorization: `Bearer ${accessToken}`, 
                  }
              }
          );
          if (response.status === 200) {
              console.log('Expire date updated successfully');
          }
          setEditableRow(null);
          setEditedExpireDate(null);
          fetchApplication();
      } catch (error) {
          console.error('Error saving the expire date:', error);
      }
    };
  

    const handleCancel = () => {
        setEditableRow(null);
        setEditedExpireDate(null);
    };

    const filterEmployees = () => {
        return employees.filter((employee) => {
            const matchesSearch = globalFilter
                ? Object.values(employee).some((value) =>
                      String(value).toLowerCase().includes(globalFilter.toLowerCase())
                  )
                : true;
            return matchesSearch;
        });
    };

    const fetchApplication = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/authentication/getallEmplooyee`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });            
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
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
                                    <Column field="first_name" header="First Name" sortable></Column>
                                    <Column field="last_name" header="Last Name" sortable></Column>
                                    <Column field="email" header="Email"></Column>
                                    <Column field="user_type" header="Designation" sortable></Column>
                                    <Column
                                        field="createdAt"
                                        header="Start Date"
                                        body={(rowData) => formatDate(rowData.joiningDate)}
                                        sortable
                                    ></Column>
                                   <Column
                                    // field="expireDate"
                                    header="Expire Date"
                                    body={(rowData) =>
                                        editableRow === rowData.user_id ? (
                                            <Calendar 
                                                value={editedExpireDate} 
                                                onChange={(e) => setEditedExpireDate(e.value)} 
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
