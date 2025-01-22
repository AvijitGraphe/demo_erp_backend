import React, { useEffect, useState } from 'react';
import { Card, Table } from 'react-bootstrap';
import logoImage from '../assets/images/logo.png';
import { Button } from 'primereact/button';
import axios from 'axios';
import config from '../config';
import { useAuth } from '../context/AuthContext';

const Download_Letter = ({ letter }) => {
    const [visible, setVisible] = useState(false);
    console.log(letter);
    return (
        <>
            <div className='letterTable'>
                <Table border={0}>
                    <thead>
                        <tr className="border-0">
                            <td colSpan={5} className="slslip_card border-0">
                                <span className="d-block">
                                    <img
                                        src={logoImage}
                                        alt="brand-logo"
                                        style={{ width: '120px' }}
                                    />
                                </span>
                                <h5>
                                    <small className="mb-4">THE GRAPHE - A DESIGN STUDIO</small>

                                </h5>
                                <span className="mt-4 d-block text-muted">
                                    Update by: {letter.creator_name || 'N/A'} &nbsp; | &nbsp; Last Updated: {new Date(letter.updatedAt).toLocaleDateString('en-GB')}
                                </span>
                            </td>
                        </tr>
                    </thead>
                    <tbody>

                        <tr className="border-0">
                            <td lassName="text-start border-0">
                                <b className="ps-0 mb-2">To,</b>
                                <span className="d-block p-0"><b>{letter.employee_name || 'N/A'}</b></span>
                                <span className="d-block p-0">Email : {letter.user_email || 'N/A'}</span>
                            </td>
                            <td className="text-end border-0">Date: {new Date(letter.updatedAt).toLocaleDateString('en-GB')}</td>
                        </tr>
                        {/* <tr className="border-0">
                            <td colSpan={4} className="text-start border-0">
                                <p>
                                    <b>Subject : </b>
                                    <span className="p-0">
                                        <b>{letter.subject || 'N/A'}</b>
                                    </span>
                                </p>
                            </td>
                        </tr> */}


                        {letter.send_letter_sections && letter.send_letter_sections.length > 0 ? (
                            letter.send_letter_sections
                                .sort((a, b) => a.section_order - b.section_order) // Ensure sections are rendered in order
                                .map((section) => (
                                    <tr key={section.section_id}>
                                        <td colSpan={2}>
                                            <h6>{section.section_heading}</h6>
                                            <div dangerouslySetInnerHTML={{ __html: section.section_body }} />
                                        </td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan={2}>
                                    <p>No sections available.</p>
                                </td>
                            </tr>
                        )}


                        <tr>
                            <td colSpan={2} className="pt-2">
                                <div>
                                    <p>Thanking you</p>
                                        <span className="mt-2 mb-2 text-end w-100 d-flex justify-content-end align-items-end flex-column">
                                            {letter.signature_url ? (
                                                <img
                                                    src={letter.signature_url}
                                                    alt="Signature"
                                                    className='d-block'
                                                    style={{ width: '110px', height: 'auto' }}
                                                />
                                            ) : (
                                                <p>No signature available</p>
                                            )}
                                            <small>{letter.creator_name || 'N/A'} <br/>{letter.creator_designation || 'N/A'}</small>
                                        </span>
                                        {/* <p className="d-block w-100 text-end">{letter.creator_name || 'N/A'} <span className="d-block">{letter.creator_designation || 'N/A'}</span></p> */}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                    
                        <tr className="border-0">
                            <td colSpan={4} className="text-center border-0">
                                <small className="d-block">193/1 MAHATAMA GANDI ROAD, KOLKATA - 700007</small>
                                <small>Email: <a href="mailto:Saurabh@thegraphe.com" className="text-primary">Saurabh@thegraphe.com</a></small>
                            </td>
                        </tr>
                    </tfoot>
                </Table>
            </div>
        </>
    );
};

export default Download_Letter;