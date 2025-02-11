import React from 'react';
import { Card, Table, CardHeader } from 'react-bootstrap';
import { Button } from 'primereact/button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Leavebalance = ({ leaveBalanceData }) => {

    // Sort leaveBalanceData by name
    const sortedData = [...leaveBalanceData].sort((a, b) => a.name.localeCompare(b.name));

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("Leave Balance Report", 20, 10);

        const tableColumn = ["Employee Name", "Department", "Bereavement Leave", "Casual Leave", "Sick Leave", "Unpaid Leave"];
        const tableRows = [];

        sortedData.forEach(report => {
            const reportData = [
                report.name,
                report.department,
                `${report.bereavement_leave_balance} Days`,
                `${report.casual_leave_balance} Days`,
                `${report.sick_leave_balance} Days`,
                `${report.unpaid_leave_balance} Days`
            ];
            tableRows.push(reportData);
        });

        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.save("leave_balance_report.pdf");
    };

    return (
        <>
            <Card className='shadow-0'>
                <CardHeader className='d-flex justify-content-end align-items-center p-0 mb-4 border-0'>
                    <Button label="Export PDF" icon="pi pi-file-pdf" size="small" onClick={exportPDF} />
                </CardHeader>
                <Table hover striped bordered className='table-responsive attandanceTable'>
                    <thead>
                        <tr>
                            <th>Employee Name</th>
                            <th>Department</th>
                            <th>Bereavement Leave</th>
                            <th>Casual Leave</th>
                            <th>Sick Leave</th>
                            <th>Unpaid Leave</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((report, index) => (
                            <tr key={index}>
                                <td>{report.name}</td>
                                <td>{report.department}</td>
                                <td><span>{report.bereavement_leave_balance}</span> Days</td>
                                <td><span>{report.casual_leave_balance}</span> Days</td>
                                <td><span>{report.sick_leave_balance}</span> Days</td>
                                <td><span>{report.unpaid_leave_balance}</span> Days</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </>
    );
};

export default Leavebalance;
