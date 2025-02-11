import React, { useState , useRef} from 'react';
import { Card, CardHeader, CardBody, Table } from 'react-bootstrap';
import { Calendar } from 'primereact/calendar';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from 'primereact/button';

// Importing the image file
import logoImage from '../assets/images/logo.png';
import stampImage from '../assets/images/stamp.jpg';


const Payslip = () => {
    const [date, setDate] = useState(null);
        const payslipRef = useRef();
    
        const downloadPDF = () => {
            const content = payslipRef.current;
            const margin = 10; // Define a margin in mm (you can adjust this value)
        
            html2canvas(content, { scale: 3 }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210 - 2 * margin; // A4 width in mm minus margins
                const pageHeight = 295 - 2 * margin; // A4 height in mm minus margins
                const imgHeight = canvas.height * imgWidth / canvas.width;
                let heightLeft = imgHeight;
                let position = margin;
        
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
        
                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight + margin;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
        
                pdf.save("payslip.pdf");
            }).catch(error => {
                console.error('Error generating PDF:', error);
            });
        };
    
    return (
        <>
            <Card className='shadow-0'>
                <CardHeader className='border-1 sticky-top bg-white' style={{ top: '-36px' }}>
                    <div className='d-flex justify-content-between align-items-center'>
                        <Calendar value={date} onChange={(e) => setDate(e.value)} view="month" placeholder='Select Month' dateFormat="mm/yy" style={{ width: '200px' }} />
                        <Button icon="pi pi-file-pdf" label="Download Payslip" severity="help" raised onClick={downloadPDF} />
                    </div>
                </CardHeader>
                <CardBody className='p-0'>
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
                                    <span className="d-block">
                                        <img
                                            src={require("../assets/images/sign_n.png")}
                                            alt=''
                                            style={{ width: '80px', height: '80px' }}
                                        />
                                    </span>
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
                </CardBody>
            </Card>
        </>
        );
    };
    export default Payslip;