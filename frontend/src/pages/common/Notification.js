import React, { useEffect, useState } from "react";
import { Col, Row, Card, Badge, Breadcrumb } from 'react-bootstrap';
import { Button } from 'primereact/button';
import { DateRangePicker } from "react-bootstrap-daterangepicker";
import { LuView } from "react-icons/lu";
import { FaCheck } from "react-icons/fa6";
import axios from 'axios';
import moment from "moment";
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import '../../assets/css/notification.css';

const Notification = () => {
    const { accessToken, userId } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [dateRange, setDateRange] = useState({
        startDate: moment().startOf("day"),
        endDate: moment().endOf("day"),
    });
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = dateRange;
            const response = await axios.get(`${config.apiBASEURL}/notificationRoutes/notifications/${userId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                },
            });
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await axios.put(
                `${config.apiBASEURL}/notificationRoutes/notifications/${notificationId}/mark-as-read`,
                {}, // No request body needed
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (response.status === 200) {
                fetchNotifications(); // Refresh notifications after marking as read
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };


    const handleDateRangeChange = (start, end) => {
        setDateRange({
            startDate: start.startOf("day"),
            endDate: end.endOf("day"),
        });
    };

    useEffect(() => {
        fetchNotifications();
    }, [dateRange]);

    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col md={6} lg={6} className="mb-4">
                        <Breadcrumb>
                            <Breadcrumb.Item active>
                                Notification <Badge className="bg-danger ms-2">{unreadCount}</Badge>
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col lg={6} className="mb-4 d-flex justify-content-end">
                        <DateRangePicker
                            initialSettings={{
                                startDate: dateRange.startDate.toDate(),
                                endDate: dateRange.endDate.toDate(),
                                locale: { format: "DD/MM/YYYY" },
                                ranges: {
                                    Today: [moment(), moment()],
                                    Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
                                    "Last 7 Days": [moment().subtract(6, "days"), moment()],
                                    "Last 30 Days": [moment().subtract(29, "days"), moment()],
                                    "This Month": [moment().startOf("month"), moment().endOf("month")],
                                    "Last Month": [
                                        moment().subtract(1, "month").startOf("month"),
                                        moment().subtract(1, "month").endOf("month"),
                                    ],
                                },
                            }}
                            onCallback={(start, end) => handleDateRangeChange(moment(start), moment(end))}
                        >
                            <input
                                type="text"
                                className="form-control mx-2"
                                style={{ width: "200px" }}
                                placeholder="Select Date Range"
                                value={`${dateRange.startDate.format("DD/MM/YYYY")} - ${dateRange.endDate.format("DD/MM/YYYY")}`}
                                readOnly
                            />
                        </DateRangePicker>
                    </Col>
                    <Col lg={12}>
                        <Card>
                            <Card.Body>
                                <ul className="notification_list">
                                    {loading ? (
                                        <p>Loading notifications...</p>
                                    ) : (
                                        notifications.map((notification) => (
                                            <li
                                                key={notification.notification_id}
                                                className={notification.is_read ? "" : "active"}
                                            >
                                                <div
                                                    className={`readDiv ${notification.is_read ? "text-success" : "unreaded"}`}
                                                >
                                                    {notification.is_read ? <FaCheck /> : <LuView />}
                                                </div>
                                                <div>
                                                    <Badge
                                                        className={
                                                            notification.is_read ? "bg-info" : "bg-success"
                                                        }
                                                    >
                                                        {notification.notification_type}
                                                    </Badge>
                                                    <h6>{notification.message}</h6>
                                                    <p>{notification.description}</p>
                                                    <p>
                                                        <small>
                                                            <i className="pi pi-clock"></i>{" "}
                                                            {new Intl.DateTimeFormat('en-GB', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric',
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                
                                                                hour12: true,
                                                            }).format(new Date(notification.created_at))}
                                                        </small>
                                                    </p>

                                                    {!notification.is_read && (
                                                        <Button
                                                            title="Mark as Read"
                                                            icon="pi pi-check"
                                                            severity="info"
                                                            className="p-0 view-btn2"
                                                            onClick={() => markAsRead(notification.notification_id)}
                                                        />
                                                    )}

                                                </div>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Row>
        </>
    );
};

export default Notification;
