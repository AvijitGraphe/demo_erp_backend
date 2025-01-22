import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Breadcrumb, Table, CardHeader } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom'; // Assuming React Router is used
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Tooltip } from 'primereact/tooltip';
import { TabView, TabPanel } from 'primereact/tabview';
import { ProgressBar } from 'primereact/progressbar';
import { Calendar } from 'primereact/calendar';
import moment from 'moment';
import { Chart } from 'primereact/chart';


const View_client = () => {

    const [buttonTooltip, setButtonTooltip] = useState('+91-1234567890');
    const [buttonTooltip2, setButtonTooltip2] = useState('asiyajavayant@gmail.com');
    const [dates, setDates] = useState(null);
    

    /*------------Chart-------------*/

    const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue("--text-color");
    const textColorSecondary = documentStyle.getPropertyValue(
      "--text-color-secondary"
    );
    const surfaceBorder = documentStyle.getPropertyValue("--surface-border");

    // Example revenue data for full year (current and previous year)
    const revenueData = {
      2024: {
        "Project A": [
          6500, 5900, 8000, 8100, 5600, 5500, 4000, 4500, 4800, 5200, 6100, 6300,
        ],
      },
      2025: {
        "Project A": [
          6200, 5700, 7800, 7900, 5400, 5300, 3900, 4400, 4600, 5000, 5900, 6000,
        ],
      },
    };

    const currentYear = 2025;
    const previousYear = currentYear - 1;
    const project = "Project A";

    const data = {
      labels: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      datasets: [
        {
          label: `Revenue (${currentYear})`,
          backgroundColor: documentStyle.getPropertyValue("--pink-400"),
          borderColor: documentStyle.getPropertyValue("--pink-800"),
          data: revenueData[currentYear]?.[project] || [],
        },
        {
          label: `Revenue (${previousYear})`,
          backgroundColor: documentStyle.getPropertyValue("--cyan-400"),
          borderColor: documentStyle.getPropertyValue("--cyan-800"),
          data: revenueData[previousYear]?.[project] || [],
        },
      ],
    };

    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500,
            },
          },
          grid: {
            display: false,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
            callback: (value) => `₹${value}`, // Format y-axis as currency
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };

    setChartData(data);
    setChartOptions(options);
  }, []);

  const [isExpanded, setIsExpanded] = useState(false);

    const toggleView = () => {
        setIsExpanded(!isExpanded);
    };

     return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col sm={4} className="mb-4 d-flex justify-content-between align-items-center">
                        <Breadcrumb>
                            <Breadcrumb.Item><i className='pi pi-angle-left'></i>Clients</Breadcrumb.Item>
                            <Breadcrumb.Item active>View Client</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                     <Col sm={8} className="p-0 text-end mb-4">
                        <Calendar 
                            value={dates} 
                            onChange={(e) => setDates(e.value)} 
                            selectionMode="range" 
                            readOnlyInput 
                            hideOnRangeSelection
                            dateFormat="dd/mm/yy"
                            placeholder="Filter by Date Range"
                            style={{ width: '200px' }}
                        />
                     </Col>
                    <Col sm={12} className="p-0">
                        <Row className='mx-0'>
                            <Col xl={4}>
                                <Card className='h-auto'>
                                    <Card.Header>
                                        <div className='d-flex justify-content-start align-items-center'>
                                            <Avatar className="p-overlay-badge" image="https://primefaces.org/cdn/primereact/images/avatar/asiyajavayant.png" size="xlarge"></Avatar>
                                            <div className='ms-3'>
                                                <h6 className='mb-1'>Asiya Jayavant</h6>
                                                <small className='d-block text-secondary'>Added on : <span className='text-black'>10/01/2025</span></small>
                                                <small className='d-block text-secondary'>Client ID : <span className='ms-1 text-black'>CLT-0024</span></small>
                                                
                                            </div>
                                        </div>
                                    </Card.Header>
                                    <Card.Body className='pb-0'>
                                        <ul className='clit_det'>
                                            <li><small><i className='pi pi-building'></i> Company :</small>  <span>ABC Company</span></li>
                                            <li><small><i className='pi pi-phone'></i>POC :</small>  <span>Asiya Jayavant</span></li>
                                            <li><small><i className='pi pi-envelope'></i>Email :</small>  <span>asiyajavayant@gmail.com</span></li>
                                            <li><small><i className='pi pi-receipt'></i>Bill Name :</small>  <span>Asiya Jayavant</span></li>
                                            <li><small><i className='pi pi-ticket'></i>GST No. :</small>  <span>123456</span></li>
                                            <li><small><i className='pi pi-map-marker'></i>Address :</small>  <span>1861 Bayonne Ave, Manchester, NJ, 08759</span></li>
                                            <li className='d-flex justify-content-end align-items-center'>
                                                <Button
                                                    label={isExpanded ? 'Less...' : 'More...'}
                                                    severity='primary'
                                                    text
                                                    className='border-0 p-0'
                                                    onClick={toggleView}
                                                />
                                            </li>
                                        </ul>
                                        <div>
                                            {isExpanded && (
                                                <ul className='clit_det py-3'>
                                                    <li>
                                                        <small><i className='pi pi-info-circle'></i> Additional Info :</small>
                                                        <span>This is some extra content visible when expanded.</span>
                                                    </li>
                                                </ul>
                                            )}
                                        </div>
                                    </Card.Body>
                                    <Card.Footer className='d-flex justify-content-between align-items-center bg-light'>
                                        <Button
                                            title='Edit'
                                            label='Edit'
                                            icon='pi pi-pencil'
                                            severity='info'
                                            outlined
                                            className='border-0 p-0'
                                        />
                                        <Button
                                            icon='pi pi-phone'
                                            label='Call'
                                            severity='success'
                                            outlined
                                            className='me-2 border-0 p-0'
                                            tooltip={buttonTooltip}
                                        />
                                        <Button
                                            icon='pi pi-envelope'
                                            label='Email'
                                            severity='help'
                                            outlined
                                            className='border-0 p-0'
                                            tooltip={buttonTooltip2} 
                                        />
                                    </Card.Footer>
                                </Card>
                                <Card className='mt-4 h-auto'>
                                    <Card.Body>
                                        <Chart type="bar" data={chartData} options={chartOptions} />
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xl={8}>
                                <Card className="shadow-0">
                                    <Card.Body className='pt-0 px-0'>
                                        <TabView>
                                            <TabPanel header="Projects" leftIcon="pi pi-folder-open me-2">
                                                <ul className='ct_prolist'>
                                                    <li>
                                                        <Link to={``}>
                                                            <Card>
                                                                <Card.Header className='px-3'>
                                                                    <div className='d-flex justify-content-start align-items-start'>
                                                                        <Avatar label="P" style={{ backgroundColor: '#2196F3', color: '#ffffff' }} shape="circle" />
                                                                        <div className='ms-3'>
                                                                            <h6 className='mb-1 d-block'>Project Name</h6>
                                                                            <small className='d-block text-danger'>
                                                                                <em >Deadline</em> :  4/01/2025 
                                                                            </small>
                                                                            <small className='d-block text-black'>
                                                                                <em >Lead</em> :  Asiya Jayavant
                                                                            </small>
                                                                        </div>
                                                                    </div>
                                                                </Card.Header>
                                                                <Card.Body className='py-2'>
                                                                    <ul className='clitpro_det'>
                                                                        <li>
                                                                            <small>Start Date</small>
                                                                            <small className='text-black'>2/01/2025</small>
                                                                        </li>
                                                                        <li>
                                                                            <small>Value</small>
                                                                            <small className='text-black'>₹1000</small>
                                                                        </li>
                                                                        <li>
                                                                            <small>Total Hrs</small>
                                                                            <small className='text-black'>24 hrs.</small>
                                                                        </li>
                                                                        
                                                                    </ul>
                                                                </Card.Body>
                                                                <Card.Footer>
                                                                    <span className='d-flex justify-content-between align-items-center'>
                                                                        <small><em className='d-block'>Changes</em> <b className='text-primary'>8 </b></small>
                                                                        <small><em className='d-block'>Pending</em> <b className='text-warning'>5 </b></small> 
                                                                        <small><em className='d-block'>Missed</em> <b className='text-danger'>3 </b></small> 
                                                                        <small><em className='d-block'>Completed</em> <b className='text-success'>10 </b></small> 
                                                                    </span>
                                                                </Card.Footer>
                                                            </Card>
                                                        </Link>
                                                    </li>
                                                </ul>
                                                
                                            </TabPanel>
                                            <TabPanel header="Documents" leftIcon="pi pi-file-pdf me-2">
                                                <p className="m-0">
                                                    No documents attached
                                                </p>
                                            </TabPanel>
                                            <TabPanel header="Invoices" leftIcon="pi pi-receipt me-2">
                                                <Card className='shadow-0'>
                                                    <Card.Header className='d-flex justify-content-between align-items-center'>
                                                        <small>Total Invoice : <b>40</b></small>
                                                    </Card.Header>
                                                    <Card.Body>
                                                        <Table className='clpro_invtable'>
                                                            <tbody>
                                                                <tr>
                                                                    <td style={{width: '60px'}}><Avatar icon="pi pi-receipt" size="large" /></td>
                                                                    <td>
                                                                        <h6>Phase 2 Completion</h6>
                                                                        <p><Link to={``} className='text-info'>#INV-123 </Link> &nbsp; | &nbsp; 9/01/2025</p>
                                                                    </td>
                                                                    <td>
                                                                        <small className='d-block'>GST</small>
                                                                        12.5%
                                                                    </td>
                                                                    <td>
                                                                        <small className='d-block'>Amount</small>
                                                                        ₹1000
                                                                    </td>
                                                                    <td><Badge value="Paid" severity="success" /></td>
                                                                    <td>
                                                                        <Button
                                                                            title='View'
                                                                            icon='pi pi-eye'
                                                                            severity='help'
                                                                            outlined
                                                                            className='border-0 p-0'
                                                                        />
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{width: '60px'}}><Avatar icon="pi pi-receipt" size="large" /></td>
                                                                    <td>
                                                                        <h6>Phase 2 Completion</h6>
                                                                        <p><Link to={``} className='text-info'>#INV-123 </Link> &nbsp; | &nbsp; 9/01/2025</p>
                                                                    </td>
                                                                    <td>
                                                                        <small className='d-block'>GST</small>
                                                                        12.5%
                                                                    </td>
                                                                    <td>
                                                                        <small className='d-block'>Amount</small>
                                                                        ₹1000
                                                                    </td>
                                                                    <td><Badge value="Paid" severity="success" /></td>
                                                                    <td>
                                                                        <Button
                                                                            title='View'
                                                                            icon='pi pi-eye'
                                                                            severity='help'
                                                                            outlined
                                                                            className='border-0 p-0'
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </Table>
                                                    </Card.Body>
                                                </Card>
                                            </TabPanel>
                                        </TabView>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Row>
        </>
    );
};

export default View_client;