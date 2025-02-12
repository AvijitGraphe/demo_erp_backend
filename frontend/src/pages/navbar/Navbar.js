import React, { useState, useEffect, useRef } from 'react';
import config from '../../config';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { LuClock } from "react-icons/lu";
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import '../../assets/css/Navbar.css'
import axios from 'axios';
import { Badge, Dropdown, DropdownButton } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext'
import {
    FiHome,
    FiLogOut,
    FiUsers,
    FiFolder,
    FiCalendar,
    FiTrello
} from 'react-icons/fi';
import { GrDocumentUser } from "react-icons/gr";
import { BiCog, BiUserMinus } from 'react-icons/bi';
import {
    IoToggleOutline,
    IoToggleSharp,
    IoPersonOutline,
    IoTicketOutline
} from 'react-icons/io5';

import {
    RiFolderDownloadLine,
    RiFolderAddLine,
    RiCalendarEventLine,
    RiDownloadCloud2Fill,
    RiMailSendLine,
    RiSecurePaymentLine
} from "react-icons/ri";
import {
    TbLayoutBoardSplit,
    TbPlus,
    TbMinus,
    TbReportSearch,
    TbListNumbers,
    TbSubtask,
    TbReceiptRupee
} from "react-icons/tb";
import moment from 'moment';
import { Button } from 'primereact/button';
import { PiNyTimesLogo, PiInvoice } from "react-icons/pi";
import { TfiPrinter } from "react-icons/tfi";
import { LuBell, LuReceiptIndianRupee } from "react-icons/lu";
import { VscBellDot } from "react-icons/vsc";
import { HiOutlineUsers, HiOutlineWallet } from "react-icons/hi2";
import graphelogo from '../../assets/images/logogf.png';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { FaHandsHelping } from "react-icons/fa";
import { LiaFileInvoiceDollarSolid } from "react-icons/lia";

const Navbar = () => {
    const { isAuthenticated, role, logout, username, userId, accessToken } = useAuth();
    const [notifications, setNotifications] = useState([]);
    // const notificationToastRef = useRef(null);
    const [menuCollapse, setMenuCollapse] = useState(false);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userDetails, setUserDetails] = useState({});
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
    const [isSubmenuOpen2, setIsSubmenuOpen2] = useState(false);
    const [isSubmenuOpen3, setIsSubmenuOpen3] = useState(false);
    const [isSubmenuOpen4, setIsSubmenuOpen4] = useState(false);
    const [isSubmenuOpen5, setIsSubmenuOpen5] = useState(false);
    const [isSubmenuOpen6, setIsSubmenuOpen6] = useState(false);
    const [isSubmenuOpen7, setIsSubmenuOpen7] = useState(false);
    const [isSubmenuOpen8, setIsSubmenuOpen8] = useState(false);
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [checkedIn, setCheckedIn] = useState(false);
    const location = useLocation(); 
    
    const isActive = (path) => location.pathname.startsWith(path);
    const menuIconClick = () => {
        setMenuCollapse(!menuCollapse);
    };

    const toggleSubmenu = () => {
        setIsSubmenuOpen(!isSubmenuOpen);
    };

    const toggleSubmenu2 = () => {
        setIsSubmenuOpen2(!isSubmenuOpen2);
    };
    const toggleSubmenu3 = () => {
        setIsSubmenuOpen3(!isSubmenuOpen3);
    };
    const toggleSubmenu4 = () => {
        setIsSubmenuOpen4(!isSubmenuOpen4);
    };
    const toggleSubmenu5 = () => {
        setIsSubmenuOpen5(!isSubmenuOpen5);
    };
    const toggleSubmenu6 = () => {
        setIsSubmenuOpen6(!isSubmenuOpen6);
    };
    const toggleSubmenu7 = () => {
        setIsSubmenuOpen7(!isSubmenuOpen7);
    };

    const toggleSubmenu8 = ()=>{
        setIsSubmenuOpen8(!isSubmenuOpen8);
    }
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const viewprofile = () => {
        navigate('/dashboard/profiledetails');
    };


    const viewticket = () => {
        navigate('/dashboard/employee_ticket_list');
    };


    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                const response = await axios.get(`${config.apiBASEURL}/profile-image/profile-image/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                // Assuming response.data is an array and you want the first item
                const imgUrl = response.data.imageUrl; // Extract img_url from the response
                setProfileImageUrl(imgUrl);
            } catch (error) {
                console.error('Error fetching profile image:', error);
                // Handle error as needed
            }
        };

        fetchProfileImage();
    }, [userId, accessToken]); // Include userId and accessToken in dependency array

    const [hasUnread, setHasUnread] = useState(false);


    // Function to fetch unread notifications status
    const fetchUnreadStatus = async () => {
        try {
            const response = await axios.get(
                `${config.apiBASEURL}/notificationRoutes/notifications/unread/today/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            setHasUnread(response.data.hasUnread);
        } catch (error) {
            console.error('Error fetching unread notification status:', error);
        }
    };

    // Fetch unread status on component mount
    useEffect(() => {
        if (userId && accessToken) {
            // Fetch immediately on mount
            fetchUnreadStatus();

            // Set up polling every 30 seconds
            const intervalId = setInterval(() => {
                fetchUnreadStatus();
            }, 30000);

            // Cleanup on component unmount
            return () => {
                clearInterval(intervalId);
            };
        }
    }, [userId, accessToken]);



    // Show a browser notification
    const showBrowserNotification = (notification) => {
        if (Notification.permission === 'granted') {
            const browserNotification = new Notification(notification.notification_type, {
                body: `${notification.message}\n ${new Intl.DateTimeFormat('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                }).format(new Date(notification.created_at))}`,
                icon: graphelogo, // Include the logo as an icon
                requireInteraction: true, // Ensures the notification persists until dismissed
            });

            browserNotification.onclick = () => {
                window.focus(); // Focus the window on click
                browserNotification.close(); // Optionally close the notification when clicked
            };
        }
    };

    // Show all notifications sequentially with a delay
    const showNotificationsWithDelay = (notifications) => {
        notifications.forEach((notification, index) => {
            setTimeout(() => {
                showBrowserNotification(notification);
            }, index * 3000); // 3-second delay between notifications
        });
    };

    // Fetch notifications from the API
    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${config.apiBASEURL}/notificationRoutes/notifications_push/${userId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();

            // Show all new notifications with a delay
            showNotificationsWithDelay(data.notifications);

            // Update state
            setNotifications((prev) => [...prev, ...data.notifications]);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Request permission and poll notifications
    useEffect(() => {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    console.log('Notification permission granted.');
                }
            });
        }

        // Poll notifications every 10 seconds
        const interval = setInterval(fetchNotifications, 10000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);


    // Fetch the current attendance status on load
    useEffect(() => {
        const fetchAttendanceStatus = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${config.apiBASEURL}/attendance/fetch-attendance`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    params: { user_id: userId },
                });
                setCheckedIn(response.data.checkin_status);
            } catch (error) {
                console.error('Error fetching attendance status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceStatus();
    }, [accessToken, userId]);

    // Check-in function
    const handleCheckIn = async () => {
        try {
            const checkInTime = moment().format('HH:mm');
            const currentDate = moment().format('YYYY-MM-DD'); // Updated format to DD/MM/YYYY

            await axios.post(`${config.apiBASEURL}/attendance/add-checkin`, {
                user_id: userId,
                start_time: checkInTime,
                date: currentDate
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}` // Send token in Authorization header
                }
            });

            setCheckedIn(true);
            // setStartTime(new Date()); // Start time is now
            // showMessage('success', 'Check-in successful!');

        } catch (error) {
            console.error('Error during check-in:', error);
            // const errorMessage = error.response?.data?.message || 'Error during check-in';
            // showMessage('error', errorMessage); // Display error message in toast
        }
    };

    // Check-out function
    const handleCheckOut = async () => {
        try {
            const checkOutTime = moment().format('HH:mm'); // Format time to HH:mm
            const currentDate = moment().format('YYYY-MM-DD'); // Format date to YYYY-MM-DD for backend compatibility

            await axios.put(`${config.apiBASEURL}/attendance/update-checkout/${userId}`, {
                date: currentDate,      // Include the date in the body in correct format
                end_time: checkOutTime  // Send the properly formatted time
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            setCheckedIn(false);
            // setElapsedTime('00:00'); // Reset the timer
            // showMessage('success', 'Check-out successful!');
        } catch (error) {
            console.error('Error during check-out:', error);
            // const errorMessage = error.response?.data?.message || 'Error during check-out';
            // showMessage('error', errorMessage); // Display error message
        }
    };

    const handleCheckInOut = () => {
        if (!checkedIn) {
            handleCheckIn();
        } else {
            setShowConfirmDialog(true); // Show confirmation dialog for checkout
        }
    };

    const confirmCheckOut = () => {
        handleCheckOut();
        setShowConfirmDialog(false);
    };



    const getCheckInClass = (checkedIn) => {
        return checkedIn ? 'bg-success' : 'bg-secondary';
    };


    /*----------------dateandtime--------------*/
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer); // Cleanup interval on unmount
    }, []);

    // Format the date as dd/mm/yyyy
    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    /*------------------------------------------------*/


    const getNavLinks = () => {
        // If user is not authenticated, only show Logout link
        if (!isAuthenticated) {
            return (
                <Menu iconShape="square">
                    <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                        Logout
                    </MenuItem>
                </Menu>
            );
        }


        // Show navigation links based on the user role
        switch (role) {
            case 'SuperAdmin':
                return (
                    <>
                        <NavLink to="/dashboard/admin" activeClassName="active">
                            <MenuItem icon={<FiHome />}>
                                Dashboard
                            </MenuItem>
                        </NavLink>

                        <div>
                            <div onClick={toggleSubmenu3} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/employee_list') ||
                                            isActive('/dashboard/verify') ||
                                            isActive('/dashboard/employ_promotion') ||
                                            isActive('/dashboard/all_leaves') ||
                                            isActive('/dashboard/overtime') ||
                                            isActive('/dashboard/employee_report') ||
                                            isActive('/dashboard/resignation_list') ||
                                            isActive('/dashboard/employee_salary_list')
                                            ? 'active' : ''}
                                    icon={<FiUsers />

                                    }>
                                    Employee
                                    <span className="subIcon">
                                        {isSubmenuOpen3 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen3 && (
                                <div className="submenu_padding">
                                    <NavLink to="/dashboard/employee_list" activeClassName="active">
                                        <MenuItem icon={<HiOutlineUsers />}>Employee List</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/update_designation" activeClassName="active">
                                        <MenuItem icon={<BiCog />}>Role Assign</MenuItem>
                                    </NavLink>

                                    <NavLink to="/dashboard/all_leaves" activeClassName="active">
                                        <MenuItem icon={<FiCalendar />}>Employee Leaves</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/overtime" activeClassName="active">
                                        <MenuItem icon={<LuClock />}>Employee Overtime</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/employee_report" activeClassName="active">
                                        <MenuItem icon={<TbReportSearch />}>Employee Report</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/employee_salary_list" activeClassName="active">
                                        <MenuItem icon={<TbReceiptRupee />}>Employee Payslip</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/resignation_list" activeClassName="active">
                                        <MenuItem icon={<GrDocumentUser />}>
                                            Resignation List
                                        </MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>


                        {/* // expire user list */}
                        
                        <div>
                            <div onClick={toggleSubmenu8} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/exp_demo_uri') 
                                            ? 'active' : ''}
                                    icon={<FiUsers />
                                    }>
                                    Exp Demo url
                                    <span className="subIcon">
                                        {isSubmenuOpen8 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen8 && (
                                <div className="submenu_padding">
                                    <NavLink to="/dashboard/exp_demo_uri" activeClassName="active">
                                        <MenuItem icon={<HiOutlineUsers />}>Exp User List</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>

                        <div>
                            <div onClick={toggleSubmenu2} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/add_projects') ||
                                            isActive('/dashboard/all_projects') ||
                                            isActive('/dashboard/task_board_admin') ||
                                            isActive('/dashboard/view_task') || // Match base path
                                            isActive('/dashboard/project_track') ||
                                            isActive('/dashboard/addtask') ||
                                            isActive('/dashboard/brand_calendar') ||
                                            isActive('/dashboard/projects_details') // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<FiFolder />}
                                >
                                    Projects
                                    <span className="subIcon">
                                        {isSubmenuOpen2 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen2 && (
                                <div className="submenu_padding">
                                    <NavLink to="/dashboard/add_projects" activeClassName="active">
                                        <MenuItem icon={<RiFolderAddLine />}>Add Project</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/all_projects" activeClassName="active">
                                        <MenuItem icon={<TbListNumbers />}>Project List</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/task_board_admin" activeClassName="active">
                                        <MenuItem icon={<TbLayoutBoardSplit />}>Taskboard</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/brand_calendar" activeClassName="active">
                                        <MenuItem icon={<FiCalendar />}>Brand calander</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/project_track" activeClassName="active">
                                        <MenuItem icon={<PiNyTimesLogo />}>Task Log</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>

                        <NavLink to="/dashboard/daily_task" activeClassName="active">
                            <MenuItem icon={<FiTrello />}>
                                Daily Tasksheet
                            </MenuItem>
                        </NavLink>

                        <div>
                            <div onClick={toggleSubmenu6} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/addleaves') ||
                                            isActive('/dashboard/add_leavebalance')  // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<RiCalendarEventLine />}
                                >
                                    Leave Type
                                    <span className="subIcon">
                                        {isSubmenuOpen6 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen6 && (
                                <div className="submenu_padding">
                                    <NavLink to="/dashboard/addleaves" activeClassName="active">
                                        <MenuItem icon={<RiCalendarEventLine />}>Add Leave Type</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/add_leavebalance" activeClassName="active">
                                        <MenuItem icon={<RiCalendarEventLine />}>Add Leave Balance</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>

                        <div>
                            <div onClick={toggleSubmenu4} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/add_view_policy') ||
                                            isActive('/dashboard/letter_template')  // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<FiFolder />}
                                >
                                    Company Documents
                                    <span className="subIcon">
                                        {isSubmenuOpen4 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen4 && (
                                <div className="submenu_padding">
                                    <NavLink to="/dashboard/add_view_policy" activeClassName="active">
                                        <MenuItem icon={<RiFolderAddLine />}>Add Policy</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/letter_template" activeClassName="active">
                                        <MenuItem icon={<TfiPrinter />}>Letter Template</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/send_letter_list" activeClassName="active">
                                        <MenuItem icon={<RiMailSendLine />}>Send Letter</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                        <NavLink to="/dashboard/ticket_list" activeClassName="active">
                            <MenuItem icon={<IoTicketOutline />}>
                                View Ticket
                            </MenuItem>
                        </NavLink>


                        <NavLink to="/dashboard/client_list" activeClassName="active">
                            <MenuItem icon={<FaHandsHelping />}>
                                Our Clients
                            </MenuItem>
                        </NavLink>

                        <div>
                            <div onClick={toggleSubmenu7} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/invoice_list') ||
                                            isActive('/dashboard/payment') ||
                                            isActive('/dashboard/expenses') // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<HiOutlineWallet />}
                                >
                                    Accounts
                                    <span className="subIcon">
                                        {isSubmenuOpen7 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen7 && (
                                <div className="submenu_padding">
                                    <NavLink to="/dashboard/invoice_list" activeClassName="active">
                                        <MenuItem icon={<PiInvoice />}>Invoices</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/payment" activeClassName="active">
                                        <MenuItem icon={<RiSecurePaymentLine />}>Payments</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/expenses" activeClassName="active">
                                        <MenuItem icon={<LiaFileInvoiceDollarSolid />}>Expenses</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>

                    </>
                );

            case 'Admin':
                return (
                    <>
                        <NavLink to="/dashboard/admin" activeClassName="active">
                            <MenuItem icon={<FiHome />}>
                                Dashboard
                            </MenuItem>
                        </NavLink>

                        <div>
                            <div onClick={toggleSubmenu3} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/employee_list') ||
                                            isActive('/dashboard/verify') ||
                                            isActive('/dashboard/employ_promotion') ||
                                            isActive('/dashboard/all_leaves') ||
                                            isActive('/dashboard/overtime') ||
                                            isActive('/dashboard/employee_report') ||
                                            isActive('/dashboard/resignation_list') ||
                                            isActive('/dashboard/employee_salary_list')
                                            ? 'active' : ''}
                                    icon={<FiUsers />

                                    }>
                                    Employee
                                    <span className="subIcon">
                                        {isSubmenuOpen3 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen3 && (
                                <div className="submenu_padding">
                                    <NavLink to="/dashboard/employee_list" activeClassName="active">
                                        <MenuItem icon={<HiOutlineUsers />}>Employee List</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/update_designation" activeClassName="active">
                                        <MenuItem icon={<BiCog />}>Role Assign</MenuItem>
                                    </NavLink>

                                    <NavLink to="/dashboard/all_leaves" activeClassName="active">
                                        <MenuItem icon={<FiCalendar />}>Employee Leaves</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/overtime" activeClassName="active">
                                        <MenuItem icon={<LuClock />}>Employee Overtime</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/employee_report" activeClassName="active">
                                        <MenuItem icon={<TbReportSearch />}>Employee Report</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/resignation_list" activeClassName="active">
                                        <MenuItem icon={<BiUserMinus />}>Resignation</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/employee_salary_list" activeClassName="active">
                                        <MenuItem icon={<TbReceiptRupee />}>Employee Payslip</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>

                        <div>
                            <div onClick={toggleSubmenu2} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/add_projects') ||
                                            isActive('/dashboard/all_projects') ||
                                            isActive('/dashboard/task_board_admin') ||
                                            isActive('/dashboard/view_task') || // Match base path
                                            isActive('/dashboard/project_track') ||
                                            isActive('/dashboard/addtask') ||
                                            isActive('/dashboard/brand_calendar') ||
                                            isActive('/dashboard/projects_details') // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<FiFolder />}
                                >
                                    Projects
                                    <span className="subIcon">
                                        {isSubmenuOpen2 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen2 && (
                                <div className="submenu_padding">
                                    <NavLink to="/dashboard/add_projects" activeClassName="active">
                                        <MenuItem icon={<RiFolderAddLine />}>Add Project</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/all_projects" activeClassName="active">
                                        <MenuItem icon={<TbListNumbers />}>Project List</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/task_board_admin" activeClassName="active">
                                        <MenuItem icon={<TbLayoutBoardSplit />}>Taskboard</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/brand_calendar" activeClassName="active">
                                        <MenuItem icon={<FiCalendar />}>Brand calander</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/project_track" activeClassName="active">
                                        <MenuItem icon={<PiNyTimesLogo />}>Task Log</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>

                        <NavLink to="/dashboard/daily_task" activeClassName="active">
                            <MenuItem icon={<FiTrello />}>
                                Daily Tasksheet
                            </MenuItem>
                        </NavLink>

                        <div>
                            <div onClick={toggleSubmenu6} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/addleaves') ||
                                            isActive('/dashboard/add_leavebalance')  // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<RiCalendarEventLine />}
                                >
                                    Leave Type
                                    <span className="subIcon">
                                        {isSubmenuOpen6 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen6 && (
                                <div className="submenu_padding">
                                    <NavLink to="/dashboard/addleaves" activeClassName="active">
                                        <MenuItem icon={<RiCalendarEventLine />}>Add Leave Type</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/add_leavebalance" activeClassName="active">
                                        <MenuItem icon={<RiCalendarEventLine />}>Add Leave Balance</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>

                        <div>
                            <div onClick={toggleSubmenu4} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/add_view_policy') ||
                                            isActive('/dashboard/letter_template')  // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<FiFolder />}
                                >
                                    Company Documents
                                    <span className="subIcon">
                                        {isSubmenuOpen4 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen4 && (
                                <div className="submenu_padding">
                                    <NavLink to="/dashboard/add_view_policy" activeClassName="active">
                                        <MenuItem icon={<RiFolderAddLine />}>Add Policy</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/letter_template" activeClassName="active">
                                        <MenuItem icon={<TfiPrinter />}>Letter Template</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/send_letter_list" activeClassName="active">
                                        <MenuItem icon={<RiMailSendLine />}>Send Letter</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </>
                );

            case 'Founder':
                return (
                    <>
                        <NavLink to="/dashboard/admin" activeClassName="active">
                            <MenuItem icon={<FiHome />}>
                                Dashboard
                            </MenuItem>
                        </NavLink>

                        <div>
                            <div onClick={toggleSubmenu3} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/employee_list') ||
                                            isActive('/dashboard/verify') ||
                                            isActive('/dashboard/employ_promotion') ||
                                            isActive('/dashboard/all_leaves') ||
                                            isActive('/dashboard/overtime') ||
                                            isActive('/dashboard/employee_report') ||
                                            isActive('/dashboard/resignation_list')
                                            ? 'active' : ''}
                                    icon={<FiUsers />

                                    }>
                                    Employee
                                    <span className="subIcon">
                                        {isSubmenuOpen3 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen3 && (
                                <div className="submenu_padding">
                                    <NavLink to="/dashboard/employee_list" activeClassName="active">
                                        <MenuItem icon={<HiOutlineUsers />}>Employee List</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/update_designation" activeClassName="active">
                                        <MenuItem icon={<BiCog />}>Update Designation</MenuItem>
                                    </NavLink>

                                    <NavLink to="/dashboard/all_leaves" activeClassName="active">
                                        <MenuItem icon={<FiCalendar />}>Employee Leaves</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/overtime" activeClassName="active">
                                        <MenuItem icon={<LuClock />}>Employee Overtime</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/employee_report" activeClassName="active">
                                        <MenuItem icon={<TbReportSearch />}>Employee Report</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/resignation_list" activeClassName="active">
                                        <MenuItem icon={<BiUserMinus />}>Resignation</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>

                        <div>
                            <div onClick={toggleSubmenu2} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/add_projects') ||
                                            isActive('/dashboard/all_projects') ||
                                            isActive('/dashboard/task_board_admin') ||
                                            isActive('/dashboard/view_task') || // Match base path
                                            isActive('/dashboard/project_track') ||
                                            isActive('/dashboard/addtask') ||
                                            isActive('/dashboard/brand_calendar') ||
                                            isActive('/dashboard/projects_details') // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<FiFolder />}
                                >
                                    Projects
                                    <span className="subIcon">
                                        {isSubmenuOpen2 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen2 && (
                                <div className="submenu_padding">
                                    <NavLink to="/dashboard/add_projects" activeClassName="active">
                                        <MenuItem icon={<RiFolderAddLine />}>Add Project</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/all_projects" activeClassName="active">
                                        <MenuItem icon={<TbListNumbers />}>Project List</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/task_board_admin" activeClassName="active">
                                        <MenuItem icon={<TbLayoutBoardSplit />}>Taskboard</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/brand_calendar" activeClassName="active">
                                        <MenuItem icon={<FiCalendar />}>Brand calander</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/project_track" activeClassName="active">
                                        <MenuItem icon={<PiNyTimesLogo />}>Task Log</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>

                        <NavLink to="/dashboard/daily_task" activeClassName="active">
                            <MenuItem icon={<FiTrello />}>
                                Daily Tasksheet
                            </MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/addleaves" activeClassName="active">
                            <MenuItem icon={<RiCalendarEventLine />}>
                                Add Leave Type
                            </MenuItem>
                        </NavLink>

                        <div>
                            <div onClick={toggleSubmenu4} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/add_view_policy') ||
                                            isActive('/dashboard/letter_template')  // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<FiFolder />}
                                >
                                    Company Documents
                                    <span className="subIcon">
                                        {isSubmenuOpen4 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen4 && (
                                <div className="submenu_padding">
                                    {/* <NavLink to="/dashboard/add_view_policy" activeClassName="active">
                                        <MenuItem icon={<RiFolderAddLine />}>Add Policy</MenuItem>
                                    </NavLink> */}
                                    <NavLink to="/dashboard/letter_template" activeClassName="active">
                                        <MenuItem icon={<TfiPrinter />}>Letter Template</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/send_letter" activeClassName="active">
                                        <MenuItem icon={<RiMailSendLine />}>Send Letter</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </>
                );

            case 'Task_manager':
                return (
                    <>
                        <NavLink to="/dashboard/employee" activeClassName="active">
                            <MenuItem icon={<FiHome />}>Dashboard</MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/brand_calendar" activeClassName="active">
                            <MenuItem icon={<FiCalendar />}>Brand calander</MenuItem>
                        </NavLink>
                        <div>
                            <div onClick={toggleSubmenu2} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/all_projects') ||
                                            isActive('/dashboard/task_board_admin') // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<FiFolder />}
                                >
                                    Projects
                                    <span className="subIcon">
                                        {isSubmenuOpen2 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen2 && (
                                <div className="submenu_padding">

                                    <NavLink to="/dashboard/all_projects" activeClassName="active">
                                        <MenuItem icon={<TbListNumbers />}>Project List</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/task_board_admin" activeClassName="active">
                                        <MenuItem icon={<TbLayoutBoardSplit />}>Taskboard</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                        <NavLink to="/dashboard/employee_list" activeClassName="active">
                            <MenuItem icon={<HiOutlineUsers />}>Employee List</MenuItem>
                        </NavLink>

                        <NavLink to="/dashboard/single_employee_report" activeClassName="active">
                            <MenuItem icon={<TbReportSearch />}>Monthly Report</MenuItem>
                        </NavLink>

                        <NavLink to="/dashboard/leave_apply" activeClassName="active">
                            <MenuItem icon={<FiCalendar />}>Leaves</MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/employee-overtime" activeClassName="active">
                            <MenuItem icon={<LuClock />}>Overtime </MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/employee_dailytask" activeClassName="active">
                            <MenuItem icon={<FiTrello />}>Daily Tasksheet </MenuItem>
                        </NavLink>
                        {/* <NavLink to="/dashboard/download_documenis" activeClassName="active">
                            <MenuItem icon={<RiDownloadCloud2Fill />}>Download Documents </MenuItem>
                        </NavLink> */}
                        <NavLink to="/dashboard/employee_resignation_list" activeClassName="active">
                            <MenuItem icon={<GrDocumentUser />}>
                                Resignation
                            </MenuItem>
                        </NavLink>
                    </>
                );

            case 'Social_Media_Manager':
                return (
                    <>
                        <NavLink to="/dashboard/employee" activeClassName="active">
                            <MenuItem icon={<FiHome />}>Dashboard</MenuItem>
                        </NavLink>
                        <div>
                            <div onClick={toggleSubmenu2} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/all_projects') ||
                                            isActive('/dashboard/task_board_admin') // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<FiFolder />}
                                >
                                    Projects
                                    <span className="subIcon">
                                        {isSubmenuOpen2 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen2 && (
                                <div className="submenu_padding">

                                    <NavLink to="/dashboard/all_projects" activeClassName="active">
                                        <MenuItem icon={<TbListNumbers />}>Project List</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/task_board_admin" activeClassName="active">
                                        <MenuItem icon={<TbLayoutBoardSplit />}>Taskboard</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                        <NavLink to="/dashboard/employee_list" activeClassName="active">
                            <MenuItem icon={<HiOutlineUsers />}>Employee List</MenuItem>
                        </NavLink>

                        <NavLink to="/dashboard/single_employee_report" activeClassName="active">
                            <MenuItem icon={<TbReportSearch />}>Monthly Report</MenuItem>
                        </NavLink>

                        <NavLink to="/dashboard/leave_apply" activeClassName="active">
                            <MenuItem icon={<FiCalendar />}>Leaves</MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/employee-overtime" activeClassName="active">
                            <MenuItem icon={<LuClock />}>Overtime </MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/employee_dailytask" activeClassName="active">
                            <MenuItem icon={<FiTrello />}>Daily Tasksheet </MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/download_documenis" activeClassName="active">
                            <MenuItem icon={<RiDownloadCloud2Fill />}>Download Documents </MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/employee_resignation_list" activeClassName="active">
                            <MenuItem icon={<GrDocumentUser />}>
                                Resignation
                            </MenuItem>
                        </NavLink>
                        {/* <NavLink to="/dashboard/brand_calendar" activeClassName="active">
                            <MenuItem icon={<FiCalendar />}>Brand calander</MenuItem>
                        </NavLink> */}
                    </>
                );

            case 'Employee':
                return (
                    <>
                        <NavLink to="/dashboard/employee" activeClassName="active">
                            <MenuItem icon={<FiHome />}>Dashboard</MenuItem>
                        </NavLink>
                        <div>
                            <div onClick={toggleSubmenu2} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/all_projects') ||
                                            isActive('/dashboard/task_board_admin') // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<FiFolder />}
                                >
                                    Projects
                                    <span className="subIcon">
                                        {isSubmenuOpen2 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen2 && (
                                <div className="submenu_padding">

                                    <NavLink to="/dashboard/all_projects" activeClassName="active">
                                        <MenuItem icon={<TbListNumbers />}>Project List</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/task_board_admin" activeClassName="active">
                                        <MenuItem icon={<TbLayoutBoardSplit />}>Taskboard</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                        <NavLink to="/dashboard/employee_list" activeClassName="active">
                            <MenuItem icon={<HiOutlineUsers />}>Employee List</MenuItem>
                        </NavLink>

                        <NavLink to="/dashboard/single_employee_report" activeClassName="active">
                            <MenuItem icon={<TbReportSearch />}>Monthly Report</MenuItem>
                        </NavLink>

                        <NavLink to="/dashboard/leave_apply" activeClassName="active">
                            <MenuItem icon={<FiCalendar />}>Leaves</MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/employee-overtime" activeClassName="active">
                            <MenuItem icon={<LuClock />}>Overtime </MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/employee_dailytask" activeClassName="active">
                            <MenuItem icon={<FiTrello />}>Daily Tasksheet </MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/employee_resignation_list" activeClassName="active">
                            <MenuItem icon={<GrDocumentUser />}>
                                Resignation
                            </MenuItem>
                        </NavLink>
                        {/* <NavLink to="/dashboard/download_documenis" activeClassName="active">
                            <MenuItem icon={<RiDownloadCloud2Fill />}>Download Documents </MenuItem>
                        </NavLink> */}

                    </>
                );
            case 'Department_Head':
                return (
                    <>
                        <NavLink to="/dashboard/employee" activeClassName="active">
                            <MenuItem icon={<FiHome />}>Dashboard</MenuItem>
                        </NavLink>
                        <div>
                            <div onClick={toggleSubmenu2} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/all_projects') ||
                                            isActive('/dashboard/task_board_admin') // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<FiFolder />}
                                >
                                    Projects
                                    <span className="subIcon">
                                        {isSubmenuOpen2 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen2 && (
                                <div className="submenu_padding">

                                    <NavLink to="/dashboard/all_projects" activeClassName="active">
                                        <MenuItem icon={<TbListNumbers />}>Project List</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/task_board_admin" activeClassName="active">
                                        <MenuItem icon={<TbLayoutBoardSplit />}>Taskboard</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                        <NavLink to="/dashboard/employee_list" activeClassName="active">
                            <MenuItem icon={<HiOutlineUsers />}>Employee List</MenuItem>
                        </NavLink>

                        <NavLink to="/dashboard/single_employee_report" activeClassName="active">
                            <MenuItem icon={<TbReportSearch />}>Monthly Report</MenuItem>
                        </NavLink>

                        <NavLink to="/dashboard/leave_apply" activeClassName="active">
                            <MenuItem icon={<FiCalendar />}>Leaves</MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/employee-overtime" activeClassName="active">
                            <MenuItem icon={<LuClock />}>Overtime </MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/employee_dailytask" activeClassName="active">
                            <MenuItem icon={<FiTrello />}>Daily Tasksheet </MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/employee_resignation_list" activeClassName="active">
                            <MenuItem icon={<GrDocumentUser />}>
                                Resignation
                            </MenuItem>
                        </NavLink>
                        {/* <NavLink to="/dashboard/download_documenis" activeClassName="active">
                            <MenuItem icon={<RiDownloadCloud2Fill />}>Download Documents </MenuItem>
                        </NavLink> */}

                    </>
                );

            case 'HumanResource':
                return (
                    <>
                        <NavLink to="/dashboard/hr" activeClassName="active">
                            <MenuItem icon={<FiHome />}>
                                Dashboard
                            </MenuItem>
                        </NavLink>

                        <div>
                            <div onClick={toggleSubmenu3} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/employee_list') ||
                                            isActive('/dashboard/verify') ||
                                            isActive('/dashboard/employ_promotion') ||
                                            isActive('/dashboard/all_leaves') ||
                                            isActive('/dashboard/overtime') ||
                                            isActive('/dashboard/employee_report') ||
                                            isActive('/dashboard/resignation_list')
                                            ? 'active' : ''}
                                    icon={<FiUsers />

                                    }>
                                    Employee
                                    <span className="subIcon">
                                        {isSubmenuOpen3 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen3 && (
                                <div className="submenu_padding">
                                    <NavLink to="/dashboard/employee_list" activeClassName="active">
                                        <MenuItem icon={<HiOutlineUsers />}>Employee List</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/update_designation" activeClassName="active">
                                        <MenuItem icon={<BiCog />}>Update Designation</MenuItem>
                                    </NavLink>

                                    <NavLink to="/dashboard/all_leaves" activeClassName="active">
                                        <MenuItem icon={<FiCalendar />}>Employee Leaves</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/overtime" activeClassName="active">
                                        <MenuItem icon={<LuClock />}>Employee Overtime</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/employee_report" activeClassName="active">
                                        <MenuItem icon={<TbReportSearch />}>Employee Report</MenuItem>
                                    </NavLink>

                                    <NavLink to="/dashboard/resignation_list" activeClassName="active">
                                        <MenuItem icon={<BiUserMinus />}>Resignation</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>

                        <div>
                            <div onClick={toggleSubmenu2} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/add_projects') ||
                                            isActive('/dashboard/all_projects') ||
                                            isActive('/dashboard/task_board_admin') ||
                                            isActive('/dashboard/view_task') ||
                                            isActive('/dashboard/addtask') ||
                                            isActive('/dashboard/projects_details') // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<FiFolder />}
                                >
                                    Projects
                                    <span className="subIcon">
                                        {isSubmenuOpen2 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen2 && (
                                <div className="submenu_padding">
                                    <NavLink to="/dashboard/add_projects" activeClassName="active">
                                        <MenuItem icon={<RiFolderAddLine />}>Add Project</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/all_projects" activeClassName="active">
                                        <MenuItem icon={<TbListNumbers />}>Project List</MenuItem>
                                    </NavLink>
                                    <NavLink to="/dashboard/task_board_admin" activeClassName="active">
                                        <MenuItem icon={<TbLayoutBoardSplit />}>Taskboard</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>

                        <NavLink to="/dashboard/daily_task" activeClassName="active">
                            <MenuItem icon={<FiTrello />}>
                                Daily Tasksheet
                            </MenuItem>
                        </NavLink>
                        <div>
                            <div onClick={toggleSubmenu4} style={{ cursor: 'pointer' }}>
                                <MenuItem
                                    className={
                                        isActive('/dashboard/add_view_policy') ||
                                            isActive('/dashboard/letter_template')  // Match base path
                                            ? 'active'
                                            : ''
                                    }
                                    icon={<FiFolder />}
                                >
                                    Company Documents
                                    <span className="subIcon">
                                        {isSubmenuOpen4 ? <TbMinus /> : <TbPlus />}
                                    </span>
                                </MenuItem>
                            </div>
                            {isSubmenuOpen4 && (
                                <div className="submenu_padding">
                                    {/* <NavLink to="/dashboard/add_view_policy" activeClassName="active">
                                        <MenuItem icon={<RiFolderAddLine />}>Add Policy</MenuItem>
                                    </NavLink> */}
                                    <NavLink to="/dashboard/letter_template" activeClassName="active">
                                        <MenuItem icon={<TfiPrinter />}>Letter Template</MenuItem>
                                    </NavLink>
                                </div>
                            )}
                        </div>

                    </>
                );

            case 'Unverified':
                return (
                    <>

                    </>
                );

            case 'Ex_employee':
                return (
                    <>
                        <NavLink to="/dashboard/exemployee" activeClassName="active">
                            <MenuItem icon={<FiHome />}>Dashboard</MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/employee_list" activeClassName="active">
                            <MenuItem icon={<HiOutlineUsers />}>Employee List</MenuItem>
                        </NavLink>
                        <NavLink to="/dashboard/download_documenis" activeClassName="active">
                            <MenuItem icon={<RiDownloadCloud2Fill />}>Download Documents </MenuItem>
                        </NavLink>
                    </>
                );

            default:
                return null;
        }
    };


    return (
        <div id="header">
            <div className='topheader'>
                <div className='position-relative'>
                    <div className="logotext">
                        {menuCollapse ? (
                            <p><img src={require("../../assets/images/logogf.png")} alt="Logo" style={{ width: '30px', height: '30px' }} /></p>
                        ) : (
                            <p><img src={require("../../assets/images/logogf.png")} alt="Logo" style={{ width: '30px', height: '30px', marginRight: '10px' }} /> BlackBox</p>
                        )}
                    </div>
                    <div className="closemenu" onClick={menuIconClick}>
                        {menuCollapse ? <IoToggleOutline /> : <IoToggleSharp />}
                    </div>
                </div>
                <div>
                    <ul>
                        {isAuthenticated && role !== 'Unverified' && role !== 'Ex_employee' && (
                            <li className='iconsize position-relative' style={{ display: 'flex', alignItems: 'center' }}>

                                <ConfirmDialog
                                    visible={showConfirmDialog}
                                    onHide={() => setShowConfirmDialog(false)}
                                    message="Are you sure you want to check out?"
                                    header="Confirm Check Out"
                                    icon="pi pi-exclamation-triangle"
                                    accept={confirmCheckOut}
                                    reject={() => setShowConfirmDialog(false)}
                                />
                                <Button
                                    label={checkedIn ? 'Check Out' : 'Check In'}
                                    icon="pi pi-clock"
                                    severity={checkedIn ? 'danger' : 'success'}
                                    onClick={handleCheckInOut}
                                    disabled={loading}
                                    className="py-2 border-0"
                                />
                            </li>
                        )}
                        <li className='iconsize position-relative'>
                            <h6 className='text-secondary me-3 pt-2'>
                                {time.toLocaleTimeString()} &nbsp; | &nbsp;
                                {` Office - ${role}`} &nbsp; | &nbsp;

                            </h6>
                        </li>
                        {isAuthenticated && role !== 'Unverified' && role !== 'Ex_employee' && (
                            <li className='iconsize position-relative'>
                                <Link to="/dashboard/calendar">
                                    <i className='pi pi-calendar-plus me-3 text-danger' style={{ fontSize: '18px' }} title='Add & View Holiday'></i>
                                </Link>
                                <Link to="/dashboard/all_notifications">
                                    {hasUnread ? (
                                        <>
                                            <VscBellDot className='text-danger' />
                                            <div className="ripple-loader red">
                                                <div></div>
                                                <div></div>
                                            </div>
                                        </>
                                    ) : (
                                        <LuBell className='text-secondary' />
                                    )}
                                </Link>
                            </li>
                        )}

                        <li>
                            <DropdownButton
                                className='userdrop'
                                id="dropdown-basic-button"
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <img
                                            src={profileImageUrl ? profileImageUrl : require("../../assets/images/no_user.png")}
                                            alt="Logo"
                                            style={{ width: '32px', height: '32px', marginRight: '10px' }}
                                        />
                                        <small className={getCheckInClass(isAuthenticated)}></small>
                                        {username}
                                    </div>
                                }
                            >
                                <Dropdown.Item tag={Link} onClick={viewprofile}>
                                    <IoPersonOutline /> My Profile
                                </Dropdown.Item>
                                <Dropdown.Item tag={Link} onClick={viewticket}>
                                    <IoTicketOutline /> Raise Ticket
                                </Dropdown.Item>
                                <Dropdown.Item tag={Link} onClick={handleLogout}>
                                    <FiLogOut /> Logout
                                </Dropdown.Item>
                            </DropdownButton>
                        </li>
                    </ul>
                </div>
            </div>
            <Sidebar collapsed={menuCollapse} className="sidebar">
                {/* <div className="logotext">
                    {menuCollapse ? (
                        <p><img src={require("../../assets/images/logogf.png")} alt="Logo" style={{ width: '30px', height: '30px' }} /></p>
                    ) : (
                        <p><img src={require("../../assets/images/logogf.png")} alt="Logo" style={{ width: '30px', height: '30px', marginRight: '10px' }} /> BlackBox</p>
                    )}
                </div>
                <div className="closemenu" onClick={menuIconClick}>
                    {menuCollapse ? <IoToggleOutline /> : <IoToggleSharp />}
                </div> */}
                <Menu iconShape="square">
                    {getNavLinks()}
                </Menu>
            </Sidebar>

            {/* <NotificationToast ref={notificationToastRef} /> */}
        </div>
    );
};

export default Navbar;
