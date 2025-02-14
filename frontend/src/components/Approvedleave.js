import React from 'react';
import { Badge, Card, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Approvedleave = ({ approvedLeaves }) => {
    return (
        <>
            <Card className="shadow-0">
                <Table hover bordered size="sm" className="table-responsive">
                    <thead>
                        <tr>
                            <th style={{ width: '250px' }}>Name</th>
                            <th>Dates</th>
                            {/* <th style={{ width: '100px' }}>Duration</th> */}
                            <th style={{ width: '200px' }}>Reason</th>
                            <th style={{ width: '100px' }}>Issued On</th>
                            <th style={{ width: '100px' }}>Status</th>
                            <th style={{ width: '200px' }}>Comment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(approvedLeaves) && approvedLeaves.length > 0 ? (
                            approvedLeaves.map((request) => {
                                const { requestor, leaveType, dates } = request;
                                const parsedDates = Array.isArray(dates)
                                    ? dates
                                    : JSON.parse(dates || '[]');

                                return (
                                    <tr key={request.Leave_request_id}>
                                        <td>
                                           
                                                <div className="d-flex align-items-center justify-content-start">
                                                    <img
                                                        src={requestor.profileImage?.image_url ||
                                                            'https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png'}
                                                        alt=""
                                                        style={{ width: '30px', height: '30px' }}
                                                        className="rounded-circle"
                                                    />
                                                    <div className="ms-3">
                                                        <p className="mb-0 text-dark">
                                                            <b>
                                                                {requestor[0].first_name} {requestor[0].last_name}
                                                            </b>
                                                        </p>
                                                        <p className="text-muted mb-0">
                                                            <b className="text-info">{request.Total_days} Days</b>
                                                        </p>
                                                    </div>
                                                </div>
                                            
                                        </td>
                                        <td>
                                            <div>
                                                <p className="mb-2 text-primary fw-bold">
                                                    {leaveType[0]?.name || 'N/A'}
                                                </p>
                                                <span className='d-block'>
                                                    {parsedDates.map((date, index) => (
                                                        <small key={index} className='alldateSpan'>
                                                        {new Date(date).toLocaleDateString("en-GB")}
                                                        </small>
                                                    ))}
                                                </span>
                                            </div>
                                        </td>
                                        {/* <td>{request.Total_days}</td> */}
                                        <td>
                                            <p className="mb-0">{request.reason || 'Not Provided'}</p>
                                        </td>
                                        <td>
                                            {new Date(request.createdAt).toLocaleDateString("en-GB")}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    request.Status === "Approved"
                                                    ? "bg-success"
                                                    : request.Status === "Pending"
                                                    ? "bg-warning"
                                                    : request.Status === "Rejected"
                                                    ? "bg-danger"
                                                    : "bg-secondary"
                                                }`}
                                            >
                                            {request.Status}
                                            </span>
                                        </td>
                                        <td>
                                            <p className="mb-0">{request.Comment || 'Not Mentioned'}</p>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center">
                                    No approved leave requests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>
        </>
    );
};

export default Approvedleave;
