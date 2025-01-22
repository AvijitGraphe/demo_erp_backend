import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Breadcrumb, Table, CardHeader , Form, FormGroup, InputGroup} from 'react-bootstrap';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom'; // Assuming React Router is used
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";
import { Badge } from 'primereact/badge';
import { Image } from 'primereact/image';
import { Sidebar } from 'primereact/sidebar';
import { InputNumber } from 'primereact/inputnumber';
import '../../assets/css/invoice.css'


const Add_invoice = () => {
    const [date, setDate] = useState(null);
    
        const [rows, setRows] = useState([
          { description: '', sacCode: '', quantity: '', price: '' }
        ]);
      
        const handleAddRow = () => {
          const newRow = { description: '', sacCode: '', quantity: '', price: '' };
          setRows([...rows, newRow]);
        };
      
        const handleRemoveRow = (indexToRemove) => {
          const updatedRows = rows.filter((_, index) => index !== indexToRemove);
          setRows(updatedRows);
        };
      
        const handleInputChange = (index, fieldName, value) => {
          const updatedRows = [...rows];
          updatedRows[index][fieldName] = value;
          setRows(updatedRows);
        };
      
        const calculateTotalAmount = () => {
          let totalAmount = 0;
          let igstAmount = 0;
          rows.forEach((row) => {
            const price = parseFloat(row.price);
            if (!isNaN(price)) {
              totalAmount += price;
              igstAmount += (price * 0.18); // Assuming IGST is 18% of the price
            }
          });
          return { totalAmount, igstAmount };
        };
      
        const { totalAmount, igstAmount } = calculateTotalAmount();
    
     return (
            <>
                <Row className="body_content">
                    <Row className="mx-0">
                        <Col sm={6} className="mb-4 d-flex justify-content-between align-items-center">
                            <Breadcrumb>
                                <Breadcrumb.Item active>Add Invoice</Breadcrumb.Item>
                            </Breadcrumb>
                        </Col>
                        <Col md={6} lg={6} className='mb-4 d-flex justify-content-end'>
                            <Button label="Reset" className="btn btn-secondary me-2"/>
                            <Button label="Save Invoice" className="btn btn-success" />
                        </Col>
                        <Row className='mx-0 adInv'>
                        <Col md={12} lg={7} className="p-0">
                            <Card className='h-auto p-4 sticky-top'>
                                <Row className='justify-content-start mb-4'>
                                    {/* <Col md={6} lg={3}>
                                        <FormGroup>
                                            <Form.Label htmlFor="inputPassword5">Tamplate</Form.Label>
                                            <Form.Select>
                                                <option selected>Proforma Invoice</option>
                                                <option>Cradit note Invoice</option>
                                                <option>Tax Invoice</option>
                                            </Form.Select>
                                        </FormGroup>
                                    </Col> */}
                                    <Col md={6} lg={4}>
                                        <FormGroup>
                                            <Form.Label htmlFor="inputPassword5">Issue Date</Form.Label>
                                            <Calendar value={date} onChange={(e) => setDate(e.value)} placeholder="MM/DD/YYYY" />
                                        </FormGroup>
                                    </Col> 
                                    <Col md={6} lg={4}>
                                        <FormGroup>
                                            <Form.Label htmlFor="inputPassword5">Supply Attract Reveres</Form.Label>
                                            <Form.Select>
                                                <option>Yes</option>
                                                <option selected>No</option>
                                            </Form.Select>
                                        </FormGroup>
                                    </Col>
                                    <Col md={6} lg={4}>
                                        <FormGroup>
                                            <Form.Label>LUT ARN</Form.Label>
                                            <Form.Control
                                                readOnly
                                                value={'AD190424001573B'}
                                            />
                                        </FormGroup>
                                    </Col> 
                                </Row>
                                
                                <Row className="mb-4 pb-4 border-bottom">
                                    <Col md={6} lg={4}>
                                        <FormGroup>
                                            <Form.Label htmlFor="inputPassword5">Client By Company</Form.Label>
                                            <Form.Select>
                                                <option>Default select</option>
                                            </Form.Select>
                                        </FormGroup>
                                    </Col>
                                    <Col md={6} lg={4}>
                                        <FormGroup>
                                            <Form.Label htmlFor="inputPassword5">Client By Billing Name</Form.Label>
                                            <Form.Select>
                                                <option>Default select</option>
                                            </Form.Select>
                                        </FormGroup>
                                    </Col>
                                    <Col md={6} lg={4}>
                                        <FormGroup>
                                            <Form.Label htmlFor="inputPassword5">Client By Email</Form.Label>
                                            <Form.Select>
                                                <option>Default select</option>
                                            </Form.Select>
                                        </FormGroup>
                                    </Col>
                                    <Col md={6} lg={4}>
                                        <FormGroup>
                                            <Form.Label htmlFor="inputPassword5">Client By Phone</Form.Label>
                                            <Form.Select>
                                                <option>Default select</option>
                                            </Form.Select>
                                        </FormGroup>
                                    </Col>
                                    <Col md={6} lg={8}>
                                        <FormGroup>
                                            <Form.Label htmlFor="inputPassword5">Client By Address</Form.Label>
                                            <Form.Select>
                                                <option>Default select</option>
                                            </Form.Select>
                                        </FormGroup>
                                    </Col>
                                    <Col md={6} lg={4}>
                                        <FormGroup>
                                            <Form.Label htmlFor="inputPassword5">Currency</Form.Label>
                                            <Form.Select>
                                                <option>Default select</option>
                                            </Form.Select>
                                        </FormGroup>
                                    </Col>
                                    <Col md={6} lg={4}>
                                        <FormGroup>
                                            <Form.Label htmlFor="inputPassword5">Tax</Form.Label>
                                            <Form.Select>
                                                <option>Default select</option>
                                            </Form.Select>
                                        </FormGroup>
                                    </Col>
                                    <Col md={6} lg={4}>
                                        <FormGroup>
                                            <Form.Label htmlFor="inputPassword5">Show LUT</Form.Label>
                                            <Form.Select>
                                                <option>Default select</option>
                                            </Form.Select>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Card.Title className='mb-5 d-flex justify-content-between align-items-center'>
                                    Services
                                    <Button onClick={handleAddRow} className="btn btn-info">Add +</Button>
                                </Card.Title>
                                <div className="service_form">
                                    {rows.map((row, index) => (
                                        <Row key={index} className="mb-4 pb-4 border-bottom">
                                        <Col md={12} lg={12}>
                                            <InputGroup className="mb-3 addSER">
                                            <Form.Control
                                                placeholder="Description"
                                                value={row.description}
                                                onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                                                type="text"
                                            />
                                            <Form.Control
                                                placeholder="SAC/MSN Code"
                                                value={row.sacCode}
                                                onChange={(e) => handleInputChange(index, 'sacCode', e.target.value)}
                                            />
                                            <Form.Control
                                                placeholder="QTY"
                                                value={row.quantity}
                                                onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                                                type="number"
                                            />
                                            <Form.Control
                                                placeholder="Price"
                                                value={row.price}
                                                onChange={(e) => handleInputChange(index, 'price', e.target.value)}
                                                type="number"
                                            />
                                            <InputGroup.Text className="border-0">
                                                <Button onClick={() => handleRemoveRow(index)} icon="pi pi-times" rounded text severity="danger" aria-label="Cancel" />
                                            </InputGroup.Text>
                                            </InputGroup>
                                        </Col>
                                        </Row>
                                    ))}

                                    <Row className="justify-content-between invtable">
                                        <Col md={6} lg={4}>
                                        <FormGroup>
                                            <Form.Label htmlFor="inputPassword5">Note : </Form.Label>
                                            <Form.Control
                                            as="textarea"
                                            placeholder="Leave a comment here"
                                            className="h-auto"
                                            rows={4}
                                            />
                                        </FormGroup>
                                        </Col>
                                        <Col md={6} lg={4}>
                                        <Table striped size="sm">
                                            <thead>
                                            <tr>
                                                <td>Amount : </td>
                                                <th><span>₹</span>{totalAmount.toFixed(2)}</th>
                                            </tr>
                                            <tr>
                                                <td>IGST(18%) : </td>
                                                <th><span>₹</span>{igstAmount.toFixed(2)}</th>
                                            </tr>
                                            <tr>
                                                <td><b>Total Amount : </b></td>
                                                <th><span>₹</span>{(totalAmount + igstAmount).toFixed(2)}</th>
                                            </tr>
                                            </thead>
                                        </Table>
                                        </Col>
                                        <Col md={12} lg={12} className="text-end mt-4">
                                            <Button label="Reset" className="btn btn-secondary me-2"/>
                                            <Button label="Save Invoice" className="btn btn-success" />
                                        </Col>
                                    </Row>
                                </div>
                            </Card>
                        </Col>
                        <Col md={6} lg={5} className="ps-4 pe-0">
                            <div className="template_sec">
                                <Card className="p-0">
                                    <div className="inv-Div">
                                        <div className="inv_header">
                                            <div className="logo_part">
                                                <img
                                                    src={require("../../assets/images/logo.png")}
                                                    alt=''
                                                />
                                            </div>
                                            <span>
                                                <Form.Control
                                                    placeholder="+ Add Tamplate Name"
                                                />
                                            </span>
                                        </div>
                                        <div className="inv_address">
                                            <div>
                                                <p><span>BILLED TO :</span> Niti Modi</p>
                                                <p><span>Address :</span> Bluewater island Dubai</p>
                                                <p><span>GSTIN / UIN :</span> NA</p>
                                                <p><span>PAN / IT NO :</span> NA</p>
                                            </div>
                                            <div>
                                                <p><span>PROFORMA NO:</span>PI9/24-25</p>
                                                <p><span>ISSUE DATE:</span> 23/04/2024</p>
                                                <p><span>GSTIN :</span> 19CRHPM0854N1Z7</p>
                                                <p><span>PAN : </span> CRHPM0854N</p>
                                                <p><span>MSME TYPE : </span>  MICRO</p>
                                                <p><span>MSME NO : </span>  UDYAM-WB-10-0098033</p>
                                                <p><span>LUT ARN : </span> AD190424001573B</p>
                                            </div>
                                        </div>
                                        <div className="inv_cost">
                                            <Table bordered hover size="sm">
                                                <thead>
                                                    <tr>
                                                        <th>Description</th>
                                                        <th>SAC/HSN</th>
                                                        <th>QTY</th>
                                                        <th className="text-end">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>Social Media Marketing</td>
                                                        <td>9983</td>
                                                        <td>1</td>
                                                        <td className="text-end"><span>₹</span>1543</td>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan={3} className="text-end">GSTN (12%) </th>
                                                        <td className="text-end"><span>₹</span>185</td>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan={3} className="text-end">TOTAL VALUE (IN FIGURE) </th>
                                                        <td className="text-end"><span>₹</span>1728</td>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan={3}>TOTAL VALUE (IN WORDS) </th>
                                                        <td>ONE THOUSAND FIVE HUNDRED FORTY THREE EMIRATI DIRHAM ONLY</td>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan={3}>SUPPLY ATTRACT REVERSE CHARGE (YES/NO)</th>
                                                        <td>No</td>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan={3}>PAYMENT DUE DATE:</th>
                                                        <td>30/04/2024</td>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan={3}>Without Payment of Tax under LUT No.</th>
                                                        <td>AD190424001573B</td>
                                                    </tr>
                                                </tbody>
                                            </Table>
                                            <div className="noteText mb-4">
                                                
                                            </div>
                                            <div className="sign_sec mb-4">
                                                <div className="note_de">
                                                    <p><b>Note:</b></p>
                                                    <p>THE AFRA WORLD DUBAI. Initiation at 50%.</p>
                                                    <p className="mt-3"><b>Declaration:</b></p>
                                                    <p>
                                                        We declare that this document shows the actual price of the good/services described and that all particulars are true and correct.
                                                    </p>
                                                </div>
                                                <div className="sig">
                                                    <p><b>E. & O.E</b></p>
                                                    <img
                                                        src={require("../../assets/images/sign_n.png")}
                                                        alt=''
                                                        style={{ width: '80px', height: '80px' }}
                                                    />
                                                    <p><small>For THE GRAPHE</small></p>
                                                </div>
                                            </div>
                                            <div className="bankDet">
                                                <p><span className="d-block">PAYMENT INFORMATION :</span>PAY BY CHEQUE/DD/RTGS/NEFT IN FAVOUR OF THE GRAPHE - A DESIGN STUDIO </p>
                                                <p><span className="d-block">BRANCH : </span> HDFC BANK LTD - SALT LAKE SECTOR 5</p>
                                                <p><span>BANK :</span> HDFC BANK</p>
                                                <p><span>A/C NO  :</span> 50200036412180</p>
                                                
                                                <p><span>IFSC CODE : </span> HDFC0000718</p>
                                                <p><span>MSME NO : </span>  UDYAM-WB-10-0098033</p>
                                                <p><span>LUT ARN : </span> HDFCINBB</p>
                                            </div>
                                        </div>
                                        <div className="pdf-footer mt-4">
                                            <p><small>193/1, 2nd Floor, MG Road, Kolkata 700007, WB, India</small></p>
                                            <p><small>Call: +91 7727827092 | Email: <a href="mailto:accounts@thegraphe.com">accounts@thegraphe.com</a></small></p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                    </Row>
                </Row>
            </>
        );
    };
    
    export default Add_invoice;