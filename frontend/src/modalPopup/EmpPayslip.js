import React, { useRef } from "react";
import Table from 'react-bootstrap/Table';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from 'primereact/button';
import '../assets/css/table.css'
// Importing the image file
import logoImage from '../assets/images/logo.png';
import stampImage from '../assets/images/stamp.jpg';

function EmpPayslip() {
    const payslipRef = useRef();

    const downloadPDF = () => {
        const content = payslipRef.current;
    
        html2canvas(content, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
    
            const pageWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const margin = 10; // Set your desired margin in mm
            const imgWidth = pageWidth - 2 * margin; // Subtract margins from page width
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = margin;
    
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
    
            while (heightLeft > 0) {
                position = margin - (imgHeight - heightLeft);
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
    
            pdf.save("payslip.pdf");
        }).catch((error) => {
            console.error('Error generating PDF:', error);
        });
    };

    return(
        <>
            <div className="scroll-table">
                <Table bordered size="sm" className="sl-table" ref={payslipRef}>
                    <thead>
                        <tr className="border-0">
                            <td colSpan={5} className="slslip_card border-0">
                                <span className="d-block"><img src={logoImage} alt="brand-logo" className="" /></span>
                                <h5>
                                    THE GRAPHE - A DESIGN STUDIO
                                    <small>SALARY PAY SLIP</small>
                                </h5>
                                
                            </td>
                        </tr>
                        <tr className="border-0">
                            <td colSpan={5} className="p-0 border-0">
                                <ul className="sl_userdata">
                                    <li>
                                        NAME : <span> Jon Dow</span>
                                    </li>
                                    <li>
                                        DESIGNATION : <span>FRONTEND DEVELOPER</span>
                                    </li>
                                    <li>
                                        DATE OF JOINING : <span>05-09-2023</span>
                                    </li>
                                    <li>
                                        EARNINGS FOR THE MONTH  : <span>March 2023</span>
                                    </li>
                                    <li>
                                        No.of Days in this month : <span>30</span>
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th colSpan={3}>EARNINGS</th>
                            <th colSpan={2}>DEDUCTIONS</th>
                        </tr>
                        <tr>
                            <td>
                                <small>SALARY HEAD </small>
                                <div>
                                    <span>Absents </span>
                                    <span>Half Days</span>
                                    <span>Total Leaves </span>
                                    <span>Paid Leave </span>
                                    <span>Deduction :</span>
                                    <strong>SALARY PAID</strong>
                                </div>
                            </td>
                            <td>
                                <small>Days</small>
                                <div>
                                    <span>1 </span>
                                    <span>0</span>
                                    <span>1 </span>
                                    <span>1 </span>
                                    <span>0</span>
                                    <strong></strong>
                                </div>

                            </td>
                            <td>
                                <small>AMT. (Rs.)</small>
                                <div>
                                    <span>0 </span>
                                    <span>0</span>
                                    <span>0 </span>
                                    <span>0 </span>
                                    <span>0</span>
                                    <strong>30,000/-</strong>
                                </div>
                            </td>
                            <td>
                                <small>SALARY HEAD </small>
                                <div>
                                    <span>PF </span>
                                    <span>ESI</span>
                                    <span>P TAX </span>
                                    <span>TDS</span>
                                    <span>Advance</span>
                                </div>
                            </td>
                            <td>
                                <small>AMT. (Rs.)</small>
                                <div>
                                    <span>0 </span>
                                    <span>0</span>
                                    <span>150/- </span>
                                    <span>0 </span>
                                    <span>0</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colSpan={3}>Pay - in - Hand</th>
                            <th colSpan={2}>29,850/-</th>
                        </tr>
                        <tr>
                            <th colSpan={3} className="text-end"><span><img src={stampImage} alt="brand-logo" className="" /></span></th>
                            <td colSpan={2} className="signature">
                                <span></span>
                                <small>Authorized Signatory</small>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={5} className="text-center">
                                <small className="d-block">193/1 MAHATAMA GANDI ROAD, KOLKATA - 700007</small>
                                <small>Email: <a href="mailto:Saurabh@thegraphe.com" className="text-primary">Saurabh@thegraphe.com</a></small>
                            </td>
                        </tr>
                    </tfoot>
                </Table>
            </div>
            <div className="d-flex justify-content-end mt-4">
                <Button icon="pi pi-file-pdf" label="Generate Payslip" severity="warning" raised onClick={downloadPDF} />
            </div>
        </>
    )
}

export default EmpPayslip
