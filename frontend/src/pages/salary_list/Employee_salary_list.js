import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import { Col, Row, Card, Badge, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import Generate_payslip from '../../modalPopup/Generate_payslip';

const Employee_salary_list = () => {
    const [visible, setVisible] = useState(false);
    const [employees, setEmployees] = useState([
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '123-456-7890',
            designation: 'Software Engineer',
            joiningDate: new Date('2022-01-10'),
            salary: 60000,
            payslip: true,
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '987-654-3210',
            designation: 'Project Manager',
            joiningDate: new Date('2021-07-15'),
            salary: 80000,
            payslip: false,
        },
        // Add more data as needed
    ]);

    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(null);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        });
    };

    const actionTemplate = (rowData) => {
        return (
            <div>
                <Button 
                    icon="pi pi-eye"
                    className='border-0 p-0'
                    outlined
                    title='View'
                    severity='help'
                />
                <Button 
                    icon="pi pi-pencil" 
                    className='border-0 p-0'
                    outlined
                    title='Edit'
                    severity='primary'
                />
            </div>
        );
    };

    const filterEmployees = () => {
        return employees.filter((employee) => {
            const matchesSearch = globalFilter
                ? Object.values(employee).some((value) =>
                      String(value).toLowerCase().includes(globalFilter.toLowerCase())
                  )
                : true;
            const matchesMonth = selectedMonth
                ? new Date(employee.joiningDate).getMonth() === selectedMonth.getMonth() &&
                  new Date(employee.joiningDate).getFullYear() === selectedMonth.getFullYear()
                : true;

            return matchesSearch && matchesMonth;
        });
    };

    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col md={6} lg={6} className="mb-4">
                        <Breadcrumb>
                            <Breadcrumb.Item active>
                                Employee Salary List
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col md={6} lg={6} className="text-end">
                        <Button
                            label="Generate Payslip"
                            icon="pi pi-file"
                            className="py-2 border-0 me-2"
                            severity='warning'
                            onClick={() => setVisible(true)}
                        />
                        <Link to="/dashboard/generate_payslip">
                            <Button
                                label="Add Salary"
                                icon="pi pi-plus"
                                className="py-2 border-0"
                                severity='help'
                            />
                        </Link>
                    </Col>
                    <Col lg={12} className="pe-0">
                    <Card>
                            <Card.Header>
                                <div className="d-flex justify-content-end align-items-center">
                                    <label className="me-2">Filter by:</label>
                                    <InputText
                                        value={globalFilter}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        placeholder="Search..."
                                        className="me-2"
                                        style={{ width: '200px' }}
                                    />
                                    <Calendar
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.value)}
                                        view="month"
                                        dateFormat="mm/yy"
                                        placeholder="Select Month"
                                        style={{ width: '150px' }}
                                    />
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <DataTable
                                    value={filterEmployees()}
                                    paginator
                                    rows={20}
                                    //rowsPerPageOptions={[10, 20, 50]}
                                    selection={selectedEmployees}
                                    onSelectionChange={(e) => setSelectedEmployees(e.value)}
                                    globalFilter={globalFilter}
                                >

                                    {/* Other Columns */}
                                    <Column field="name" header="Name" sortable></Column>
                                    <Column field="email" header="Email"></Column>
                                    <Column field="phone" header="Phone"></Column>
                                    <Column field="designation" header="Designation" sortable></Column>
                                    <Column
                                        field="joiningDate"
                                        header="Joining Date"
                                        body={(rowData) => formatDate(rowData.joiningDate)}
                                        sortable
                                    ></Column>
                                    <Column
                                        field="Status"
                                        header="Status"
                                        body={(rowData) => {
                                            const isPayslipAvailable = rowData.payslip; // Replace with your condition
                                            return (
                                                <Badge
                                                    value={isPayslipAvailable ? 'View' : 'Pending'}
                                                    severity={isPayslipAvailable ? 'success' : 'warning'} // Use different severities
                                                    className="p-mr-2"
                                                />
                                            );
                                        }}
                                        style={{ width: '10%' }}
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
                    <Dialog header="Generate Payslip" visible={visible} style={{ width: '360px' }} onHide={() => {if (!visible) return; setVisible(false); }}>
                        <Generate_payslip />
                    </Dialog>
                </Row>
            </Row>
        </>
    );
};

export default Employee_salary_list;