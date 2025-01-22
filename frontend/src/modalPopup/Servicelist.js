
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker.css";
import React, { useState } from "react";
import { Link } from 'react-router-dom';
import '../assets/css/client.css'; 
import { Dialog } from 'primereact/dialog'; 

import GWformClient from '../modalPopup/GWformClient';
import MarketOnbord from '../modalPopup/MarketOnbord';
import WebmobileOnbord from '../modalPopup/WebmobileOnbord';

// Importing the image file
import qtImage from '../assets/images/wedding.svg'; // Update the path
import webicon from '../assets/images/website.svg'; // Update the path
import market from '../assets/images/marketing.svg'; // Update the path

function Servicelist() {
    const [imageError, setImageError] = useState(false);
    const [visible, setVisible] = useState(false);
    const [visible2, setMrkvisible] = useState(false);
    const [visible3, setWebmobile] = useState(false);
    return (
        <>
            <ul className='servList'>
                <li>
                    <Link to="" onClick={() => setVisible(true)}>
                        {!imageError ? (
                            <span>
                                <img src={qtImage} alt="" onError={() => setImageError(true)} />
                            </span>
                        ) : (
                            <span>Image failed to load.</span>
                        )}
                        <h3>Graphē Wedding</h3>
                        <i className="pi pi-arrow-right fade-out-right"></i>
                    </Link>
                </li>
                <li>
                    <Link to="" onClick={() => setWebmobile(true)}>
                        {!imageError ? (
                            <span>
                                <img src={webicon} alt="" onError={() => setImageError(true)} />
                            </span>
                        ) : (
                            <span>Image failed to load.</span>
                        )}
                        <h3>Website / Mobile App</h3>
                        <i className="pi pi-arrow-right fade-out-right"></i>
                    </Link>
                </li>
                <li>
                    <Link to="" onClick={() => setMrkvisible(true)}>
                        {!imageError ? (
                            <span>
                                <img src={market} alt="" onError={() => setImageError(true)} />
                            </span>
                        ) : (
                            <span>Image failed to load.</span>
                        )}
                        <h3>Marketing</h3>
                        <i className="pi pi-arrow-right fade-out-right"></i>
                    </Link>
                </li>
            </ul>
            <Dialog className='proj_dig' header="Wedding Onboarding Form" visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}>
                <GWformClient />
            </Dialog>

            <Dialog className='proj_dig' header="Marketing Onboarding Form" visible={visible2} style={{ width: '50vw' }} onHide={() => setMrkvisible(false)}>
                <MarketOnbord />
            </Dialog>
            <Dialog className='proj_dig' header="Website / Mobile Form" visible={visible3} style={{ width: '50vw' }} onHide={() => setWebmobile(false)}>
                <WebmobileOnbord />
            </Dialog>
        </>
    );
}

export default Servicelist;
