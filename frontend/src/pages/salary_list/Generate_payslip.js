import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import { Col, Row, Card, Badge, Breadcrumb, Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { Calendar } from "primereact/calendar";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../../assets/css/table.css'
// Importing the image file
import logoImage from '../../assets/images/logo.png';
import stampImage from '../../assets/images/stamp.jpg';
import { InputNumber } from 'primereact/inputnumber';


const Generate_payslip = () => {

    const [formVisible, setFormVisible] = useState(false);
    const [value4, setValue4] = useState('');

    const [date, setDate] = useState(null);

    useEffect(() => {
        // Set the date to current date on mount
        setDate(new Date());
    }, []);

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
    const toggleFormVisibility = () => {
        setFormVisible((prev) => !prev);
    };

    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col md={12} lg={12} className="mb-4">
                        <Breadcrumb>
                            <Breadcrumb.Item>
                                <i className='pi pi-arrow-left me-2'></i>
                               Back
                            </Breadcrumb.Item>
                            <Breadcrumb.Item active>
                                Generate Slip
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col lg={8}>
                        <Card>
                            <Card.Body className='pb-0'>
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
                                                        NAME : <span> Asiya Jayavant</span>
                                                    </li>
                                                    <li>
                                                        DESIGNATION : <span>Software Engineer</span>
                                                    </li>
                                                    <li>
                                                        DATE OF JOINING : <span> 10-12-2024</span>
                                                    </li>
                                                    <li>
                                                        EARNINGS FOR THE MONTH  : <span>November 2024</span>
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
                            </Card.Body>
                        </Card>
                        
                    </Col>
                    <Col lg={4}>
                        <div className='sticky-top'>
                            <Card className='h-auto mb-3'>
                                <Card.Body className='py-2 text-end'>
                                {formVisible ? (
                                        <Button
                                            icon="pi pi-times"
                                            label="Close"
                                            className="shadow-none py-2 me-2"
                                            severity="danger"
                                            onClick={toggleFormVisibility}
                                        />
                                    ) : (
                                        <Button
                                            icon="pi pi-pencil"
                                            label="Edit"
                                            className="shadow-none py-2 me-2"
                                            severity="help"
                                            onClick={toggleFormVisibility}
                                        />
                                    )}
                                    <Button 
                                        icon="pi pi-file-pdf" 
                                        label="Generate Payslip" 
                                        className='shadow-none py-2'
                                        severity="warning" 
                                        raised onClick={downloadPDF} 
                                    />
                                    
                                </Card.Body>
                            </Card>
                            <Card className='h-auto'>
                                <Card.Body className='pb-0'>
                                    <div className='d-flex'>
                                        <Avatar 
                                            image="https://primefaces.org/cdn/primereact/images/avatar/asiyajavayant.png" 
                                            className="me-3" 
                                            size="large" 
                                            shape="circle" 
                                        />
                                        <p className='pb-0'>
                                            <span className='d-block mb-1'><b>Asiya Jayavant</b></span>
                                            <small className='d-block mb-1'>Employee</small> 
                                            <small className='d-block mb-1'>Software Engineer</small>
                                            <small className='d-block mb-1'><small><em>Joining Date : </em></small><b>10-12-2024</b></small>
                                        </p>
                                    </div>
                                </Card.Body>
                                <Card.Footer className='d-flex justify-content-end align-items-center bg-info'>
                                    <label className='me-3 text-white'>Select Month</label>
                                    <Calendar 
                                        value={date} 
                                        onChange={(e) => setDate(e.value)} 
                                        view="month" 
                                        dateFormat="mm/yy" 
                                        style={{ width: '200px' }}
                                        className='border-0'
                                    />
                                </Card.Footer>
                            </Card>
                            {formVisible && (
                                <Card className="h-auto mt-3 formCard">
                                    <Card.Body className='pb-2'>
                                        <Form>
                                            <Row>
                                                <Col md={6} lg={6} className='px-1'>
                                                    <label htmlFor="minmax" className="block mb-2 mt-2">Absents</label>
                                                    <div className='d-flex align-items-center'>
                                                        <InputNumber className='me-1' placeholder='Days' inputId="minmax" value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                        <InputNumber inputId="minmax" placeholder='AMT (Rs.)' value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                    </div>
                                                </Col>
                                                <Col md={6} lg={6} className='px-1'>
                                                    <label htmlFor="minmax" className="block mb-2 mt-2">Half Days</label>
                                                    <div className='d-flex align-items-center'>
                                                        <InputNumber className='me-1' placeholder='Days' inputId="minmax" value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                        <InputNumber inputId="minmax" placeholder='AMT (Rs.)' value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                    </div>
                                                </Col>
                                                <Col md={6} lg={6} className='px-1'>
                                                    <label htmlFor="minmax" className="block mb-2 mt-2"><sup>Total</sup> Leaves</label>
                                                    <div className='d-flex align-items-center'>
                                                        <InputNumber className='me-1' placeholder='Days' inputId="minmax" value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                        <InputNumber inputId="minmax" placeholder='AMT (Rs.)' value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                    </div>
                                                </Col>
                                                <Col md={6} lg={6} className='px-1'>
                                                    <label htmlFor="minmax" className="block mb-2 mt-2">Paid Leave</label>
                                                    <div className='d-flex align-items-center'>
                                                        <InputNumber className='me-1' placeholder='Days' inputId="minmax" value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                        <InputNumber inputId="minmax" placeholder='AMT (Rs.)' value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                    </div>
                                                </Col>
                                                <Col md={6} lg={6} className='px-1'>
                                                    <label htmlFor="minmax" className="block mb-2 mt-2">Deduction </label>
                                                    <div className='d-flex align-items-center'>
                                                        <InputNumber className='me-1' placeholder='Days' inputId="minmax" value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                        <InputNumber inputId="minmax" placeholder='AMT (Rs.)' value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                    </div>
                                                </Col>
                                                <Col md={6} lg={3} className='px-1'>
                                                    <label htmlFor="minmax" className="block mb-2 mt-2">PF </label>
                                                    <InputNumber className='me-1' placeholder='AMT. (Rs.)' inputId="minmax" value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                </Col>
                                                <Col md={6} lg={3} className='px-1'>
                                                    <label htmlFor="minmax" className="block mb-2 mt-2">ESI </label>
                                                    <InputNumber className='me-1' placeholder='AMT. (Rs.)' inputId="minmax" value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                </Col>
                                                <Col md={6} lg={4} className='px-1'>
                                                    <label htmlFor="minmax" className="block mb-2 mt-2">P TAX </label>
                                                    <InputNumber className='me-1' placeholder='AMT. (Rs.)' inputId="minmax" value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                </Col>
                                                <Col md={6} lg={4} className='px-1'>
                                                    <label htmlFor="minmax" className="block mb-2 mt-2">TDS </label>
                                                    <InputNumber className='me-1' placeholder='AMT. (Rs.)' inputId="minmax" value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                </Col>
                                                <Col md={6} lg={4} className='px-1'>
                                                    <label htmlFor="minmax" className="block mb-2 mt-2">Advance </label>
                                                    <InputNumber className='me-1' placeholder='AMT. (Rs.)' inputId="minmax" value={value4} onValueChange={(e) => setValue4(e.value)} min={0} max={100} />
                                                </Col>
                                                <Col md={12} lg={12} className='px-1 py-4 text-end'>
                                                    <p className='mb-0'><small>SALARY PAID : <b className='text-dark'>Rs. 30,000/-</b></small></p>
                                                    <p className='mb-0'><small>P TAX : <b className='text-dark'>Rs. 150/-</b></small></p>
                                                    <hr/>
                                                    <p><small>Pay - in - Hand : <b>Rs. 29,850/-</b></small></p>
                                                    <hr/>
                                                    <Button 
                                                        icon="pi pi-save" 
                                                        label="Save" 
                                                        className='shadow-none py-2 mt-3'
                                                        severity="help" 
                                                    />
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            )}
                        </div>
                    </Col>
                </Row>
            </Row>
        </>
    );
};

export default Generate_payslip;