import React, { useState, useEffect } from "react";
import { Row, Col, Breadcrumb, Card, Table } from 'react-bootstrap';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Button } from 'primereact/button';

const Exemployee = () => {
    const { userId, accessToken } = useAuth(); // Get userId from the context
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [mainUserDetails, setMainUserDetails] = useState(null);


    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                const response = await axios.get(
                    `${config.apiBASEURL}/profile-image/profile-image/${userId}`,
                    { headers } // Add the headers object here
                );
                setProfileImageUrl(response.data.imageUrl);
            } catch (error) {
                console.error('Error fetching profile image:', error);
                // Handle error as needed
            }
        };

        fetchProfileImage();
    }, [userId, accessToken]); // Include userId and accessToken in dependency array to refetch on change


    const fetchMainUserDetails = async () => {
        try {
            const response = await axios.get(
                `${config.apiBASEURL}/user-profile/main-user-details?userId=${userId}`,
                { headers }
            );
            console.log("Main User Details:", response.data);
            setMainUserDetails(response.data);
        } catch (err) {
            console.error("Error fetching main user details:", err.message);
        }
    };

    useEffect(() => {
        if (!userId || !accessToken) return;
        fetchMainUserDetails();
    }, [userId, accessToken]);




    return (
        <>
            <Row className='body_content'>
                <Row className="justify-content-center">
                    <Col md={12} lg={10} className='mb-4'>
                        <Row className="align-items-center justify-content-center" style={{ height: '86vh' }}>
                            <Col md={12} lg={2} className='h-100 p-0'>
                                <Card className="position-relative bg-info">
                                    <img
                                        src={require("../../assets/images/logo.png")}
                                        alt="Logo"
                                        className="ps-3 pt-2"
                                        style={{ width: '100px' }}
                                    />
                                    <img src={profileImageUrl ? profileImageUrl : require("../../assets/images/no_user.png")} alt="Logo" className="ex_empimg" />
                                </Card>
                            </Col>
                            <Col md={12} lg={10} className='bg-white h-100 p-0'>
                                <Card>
                                    <Card.Body>
                                        <ul className="ex_empbody">
                                            <li>
                                                <span>Name : </span>
                                                {mainUserDetails?.first_name} {mainUserDetails?.last_name}
                                            </li>
                                            <li>
                                                <span>Designation : </span>
                                                {mainUserDetails?.role?.role_name || 'Not Specified'}
                                            </li>
                                            <li>
                                                <span>Joining Date : </span>
                                                {mainUserDetails?.joiningDates?.[0]?.joining_date
                                                    ? new Date(mainUserDetails.joiningDates[0].joining_date).toLocaleDateString('en-GB')
                                                    : 'Not Available'}
                                            </li>
                                            <li>
                                                <span>Last Day : </span> 
                                            </li>

                                            <li>

                                                <p>

                                                    <span className="d-block mb-2">Dear <em>{mainUserDetails?.first_name} {mainUserDetails?.last_name},</em></span>


                                                    We extend our heartfelt gratitude for your contributions during your tenure with us. Your dedication and hard work have played an invaluable role in our success, and your efforts will always be remembered and appreciated.

                                                </p>
                                                <p className="mt-1">As you transition from our organization, we want to ensure a smooth conclusion to your association. <b>Please note that your account will remain active for the next three months,</b> allowing you to access and collect any necessary personal or professional data. After this period, your account will be deactivated in alignment with our data management policies.

                                                    We encourage you to make use of this time to gather all required information and reach out to us if you need assistance with this process.</p>
                                                <p className="mt-1">

                                                    Thank you once again for your valuable contributions. We wish you the very best in your future endeavors.

                                                </p>
                                                <p>
                                                    Warm regards,
                                                    <span className="d-block mt-3"><em>GRAPHE</em></span>
                                                </p>
                                            </li>
                                        </ul>
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

export default Exemployee;