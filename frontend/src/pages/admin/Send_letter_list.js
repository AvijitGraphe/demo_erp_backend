import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Card, Breadcrumb } from 'react-bootstrap';
import { Button } from 'primereact/button';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import logoImage from '../../assets/images/logo.png';
import successVideo from '../../assets/video/paperplane.mp4';
import crossVideo from '../../assets/video/cross.mp4';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Paginator } from 'primereact/paginator';
import { Dialog } from 'primereact/dialog';
import Download_Letter from '../../modalPopup/Download_Letter';
import { Skeleton } from 'primereact/skeleton';
const Send_letter_list = () => {
    const [visible, setVisible] = useState(false);
    const { accessToken } = useAuth();
    const [selectedLetter, setSelectedLetter] = useState(null); // State for selected letter
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [videoDialogVisible, setVideoDialogVisible] = useState(false); // New state for video dialog
    const [videocrossDialogVisible, setVideocrossDialogVisible] = useState(false); // New state for video dialog
    const [loading, setLoading] = useState(false);
    const fetchData = async () => {
        setLoading(true); // Set loading to true before fetching
        try {
            const response = await axios.get(`${config.apiBASEURL}/letterRoutes/fetch-send-letters`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setData(response.data);
            setFilteredData(response.data);
        } catch (error) {
            console.error('Error fetching send letters:', error);
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };
    useEffect(() => {
        fetchData();
    }, [accessToken]);


    // Function to delete a SendLetter
    const deleteLetter = async (id) => {
        setLoading(true); // Set loading to true before fetching
        try {
            await axios.delete(`${config.apiBASEURL}/letterRoutes/send-letter/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            setVideoDialogVisible(true); // Show video dialog

            setTimeout(() => {
                setVideoDialogVisible(false); // Hide video dialog after 5 seconds           
                fetchData();
            }, 5000);


        } catch (error) {
            console.error('Error deleting letter:', error);
            setVideocrossDialogVisible(true); // Show video dialog

            setTimeout(() => {
                setVideocrossDialogVisible(false); // Hide video dialog after 5 seconds           

            }, 5000);
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };




    const sendLetter = async (letterId) => {
        setLoading(true); // Set loading to true before fetching
        try {
            const response = await axios.post(
                `${config.apiBASEURL}/letterRoutes/sendletters/${letterId}/confirm`,
                {}, // Empty body
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
    
            // Show success message
            if (response.status === 200) {
                setVideoDialogVisible(true); // Show video dialog
    
                setTimeout(() => {
                    setVideoDialogVisible(false); // Hide video dialog after 5 seconds
                    fetchData();
                }, 5000);
            }
        } catch (error) {
            // Handle errors and show an error message
            console.error('Error sending letter:', error);
    
            // Check if the error is due to an expired or invalid token
            if (error.response?.status === 401) {
                console.error('Unauthorized: Invalid or expired token.');
                // Optional: Add token refresh logic here if applicable
            }
    
            setVideocrossDialogVisible(true); // Show error dialog
    
            setTimeout(() => {
                setVideocrossDialogVisible(false); // Hide error dialog after 5 seconds
            }, 5000);
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };
    
    const resendLetter = async (letterId) => {
        setLoading(true); // Set loading to true before fetching
        try {
            const response = await axios.post(
                `${config.apiBASEURL}/letterRoutes/resendletters/${letterId}/resend`,
                {}, // Empty body
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
    
            // Show success message
            if (response.status === 200) {
                setVideoDialogVisible(true); // Show video dialog
    
                setTimeout(() => {
                    setVideoDialogVisible(false); // Hide video dialog after 5 seconds
                    fetchData();
                }, 5000);
            }
        } catch (error) {
            // Handle errors and show an error message
            console.error('Error resending letter:', error);
    
            // Check if the error is due to an expired or invalid token
            if (error.response?.status === 401) {
                console.error('Unauthorized: Invalid or expired token.');
                // Optional: Add token refresh logic here if applicable
            }
    
            setVideocrossDialogVisible(true); // Show error dialog
    
            setTimeout(() => {
                setVideocrossDialogVisible(false); // Hide error dialog after 5 seconds
            }, 5000);
        } finally {
            setLoading(false); // Set loading to false after fetching
        }
    };
    






    const onSearchChange = (e) => {
        setSearchQuery(e.target.value);
        filterData(e.target.value);
    };

    const filterData = (query) => {
        if (!query) {
            setFilteredData(data);
        } else {
            setFilteredData(
                data.filter((group) =>
                    group.employee_name.toLowerCase().includes(query.toLowerCase())
                )
            );
        }
    };

    const statusStyle = (status) => {
        switch (status) {
            case 'Generated':
                return { color: '#4caf50' };
            case 'Confirmed':
                return { color: '#ff9800' };
            case 'Edited':
                return { color: '#ff5722' };
            default:
                return { color: '#000' };
        }
    };

    const actionTemplate = (rowData) => {
        return (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* View/Download Button */}
                <Button
                    title="View/Download"
                    outlined
                    icon="pi pi-eye"
                    severity="primary"
                    className="p-button-sm border-0"
                    onClick={() => {
                        setSelectedLetter(rowData); // Set selected letter data
                        setVisible(true); // Show modal or component
                    }}
                />

                {/* Send Button */}
                {rowData.status === 'Confirmed' ? (
                    <Button
                        title="Resend"
                        outlined
                        icon="pi pi-refresh"
                        severity="warning"
                        className="p-button-sm border-0"
                        onClick={() => resendLetter(rowData.send_letter_id)}
                    />
                ) : (
                    <Button
                        title="Send"
                        outlined
                        icon="pi pi-send"
                        severity="success"
                        className="p-button-sm border-0"
                        onClick={() => sendLetter(rowData.send_letter_id)}
                    />
                )}

                {/* Delete Button */}
                <Button
                    title="Delete"
                    outlined
                    icon="pi pi-trash"
                    severity="danger"
                    className="p-button-sm border-0"
                    onClick={() => {
                        deleteLetter(rowData.send_letter_id); // Delete the letter by ID
                    }}
                />
            </div>
        );
    };


    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col sm={12} className="mb-4 d-flex justify-content-between align-items-center">
                        <Breadcrumb>
                            <Breadcrumb.Item active>Send Letter List</Breadcrumb.Item>
                        </Breadcrumb>
                        <Link to="/dashboard/send_letter">
                            <Button
                                label="Compose Letter"
                                icon="pi pi-pencil"
                                className="py-2"
                                severity="help"
                            />
                        </Link>
                    </Col>
                    <Card>
                        <Card.Body>
                            {loading ? (
                                // Skeleton loader when loading
                                <div>
                                    <Skeleton width="100%" height="2rem" className="mb-2" />
                                    <Skeleton width="100%" height="2rem" className="mb-2" />
                                    <Skeleton width="100%" height="2rem" className="mb-2" />
                                    <Skeleton width="100%" height="2rem" className="mb-2" />
                                </div>
                            ) : (
                                <>
                                    <div className="d-flex justify-content-end">
                                        <InputText
                                            value={searchQuery}
                                            onChange={onSearchChange}
                                            placeholder="Search by employee name..."
                                            className="mb-3"
                                            style={{ width: '200px' }}
                                        />
                                    </div>
                                    <Accordion>
                                        {filteredData.slice(first, first + rows).map((group, index) => (
                                            <AccordionTab
                                                key={`${group.employee_name}-${index}`}
                                                header={
                                                    <div className="d-flex align-items-center">
                                                        <img
                                                            src={group.user?.profileImage?.image_url || logoImage}
                                                            alt={group.employee_name}
                                                            style={{
                                                                width: '36px',
                                                                height: '36px',
                                                                borderRadius: '50%',
                                                                marginRight: '10px',
                                                            }}
                                                        />
                                                        <span>{group.employee_name}</span>
                                                    </div>
                                                }
                                            >
                                                <DataTable value={group.letters}>

                                                    <Column field="employee_name" header="Employee" />
                                                    <Column
                                                        field="status"
                                                        header="Status"
                                                        body={(rowData) => (
                                                            <span style={statusStyle(rowData.status)}>
                                                                {rowData.status}
                                                            </span>
                                                        )}
                                                    />
                                                    <Column
                                                        field="createdAt"
                                                        header="Creation Date"
                                                        body={(rowData) => {
                                                            const creationDate = new Date(rowData.createdAt);
                                                            return creationDate.toLocaleDateString('en-GB'); // Format: dd-mm-yyyy
                                                        }}
                                                    />

                                                    <Column
                                                        header="Actions"
                                                        body={actionTemplate}
                                                        style={{ width: '150px' }}
                                                    />
                                                </DataTable>
                                            </AccordionTab>
                                        ))}
                                    </Accordion>
                                    <Paginator
                                        first={first}
                                        rows={rows}
                                        totalRecords={filteredData.length}
                                        onPageChange={(e) => {
                                            setFirst(e.first);
                                            setRows(e.rows);
                                        }}
                                    />
                                </>
                            )}
                        </Card.Body>
                    </Card>

                    <Dialog
                        visible={visible}
                        maximizable
                        style={{ width: '50vw' }}
                        onHide={() => {
                            if (!visible) return;
                            setVisible(false);
                        }}
                        className='letterDw_scroll'
                    >
                        <Download_Letter letter={selectedLetter} /> {/* Pass selected letter as a prop */}
                    </Dialog>

                    <Dialog visible={videoDialogVisible} className='fadeInUp_dilog'
                        onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                        <video src={successVideo} autoPlay loop muted style={{ width: '100%' }} />
                        <h6 className="text-center mt-0 fadeInUp">Process Completed <span className='text-success'>Successfully</span></h6>
                    </Dialog>


                    <Dialog visible={videocrossDialogVisible} className='fadeInUp_dilog'
                        onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                        <video src={crossVideo} autoPlay loop muted style={{ width: '100%' }} />
                        <h6 className="text-center mt-0 fadeInUp">Process <span className='text-danger'>Denied</span></h6>
                    </Dialog>

                </Row>
            </Row>
        </>
    );
};

export default Send_letter_list;
