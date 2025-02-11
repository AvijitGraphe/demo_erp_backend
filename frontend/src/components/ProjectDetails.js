import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { LuFileEdit, LuSave } from "react-icons/lu";
import { Button } from 'primereact/button';

const ProjectDetails = ({ project, isEditMode, toggleEditMode }) => {
    return (
        <Row>
            <div className='d-flex justify-content-end'>
                <Button onClick={toggleEditMode} rounded className='edit_clpro'>
                    {isEditMode ? <LuSave /> : <LuFileEdit />}
                </Button>
            </div>
            {[1, 2, 3, 4].map(section => (
                <Col key={section} md={12} lg={6} className='mb-4'>
                    <ul className='client_DET'>
                        {[1, 2, 3].map(detail => (
                            <li key={detail}>
                                <label className='form-label mt-2'>Project {section} Details</label>
                                <input
                                    type='text'
                                    className={`form-control ${!isEditMode ? 'read-only-mode' : ''}`}
                                    placeholder={`Project ${section} Details`}
                                    readOnly={!isEditMode}
                                />
                            </li>
                        ))}
                    </ul>
                </Col>
            ))}
        </Row>
    );
};

export default ProjectDetails;
