import React, { useEffect, useState } from "react";
import { Col, Row, Card, Table, Badge, Form, Breadcrumb } from 'react-bootstrap';


const Add_task_role = () => {
    
    return (
        <>
            <Row className='body_content'>
                <Row className='mx-0'>
                    <Col md={6} lg={6} className='mb-4'>
                        <Breadcrumb>
                            <Breadcrumb.Item active>Sub-Task Role</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                </Row>
            </Row>
        </>

    )
};

export default Add_task_role;