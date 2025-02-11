import { Card } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config';

const Brand_postcal = () => {
    const { accessToken } = useAuth();
    const [dateRange, setDateRange] = useState({
        startDate: moment().startOf('week'),
        endDate: moment().endOf('week'),
    });
    const [events, setEvents] = useState([]);

    const fetchEvents = async () => {
        try {
            const { startDate, endDate } = dateRange;
            const response = await axios.get(`${config.apiBASEURL}/brandingRoutes/brand-calendar/events`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    startDate: startDate.format('YYYY-MM-DD'),
                    endDate: endDate.format('YYYY-MM-DD'),
                },
            });

            // Map API response to FullCalendar event format
            const eventList = response.data.events.map(event => ({
                id: event.brand_calander_id.toString(),
                title: event.event_name,
                start: event.event_date,
                color: event.event_color || "#3788d8",
                status: event.event_status,
                brand: event.brand_id, // Store brand_id
                brandName: event.brand?.brand_name || "", // Store brand name for reference
            }));

            setEvents(eventList);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [dateRange]);

    return (
        <>
            <Card className='dashboard_week p-0 shadow-none'>
                <Card.Body className='p-0'>
                    <div className='dash_calender' style={{ top: '0' }}>
                        <Link to={'/dashboard/brand_calendar'}>
                            <Button
                                label='Full View'
                                icon="pi pi-calendar"
                                className="p-0 border-0"
                                severity='danger'
                                outlined
                            />
                        </Link>
                    </div>
                    <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        headerToolbar={{
                            right: ''
                        }}
                        initialView="dayGridWeek"
                        dayMaxEventRows={4}
                        contentHeight="auto"
                        editable={false}
                        selectable={true}
                        events={events}
                        eventContent={(eventInfo) => {
                            const statusColor = {
                                Pending: "#ff9800",
                                Posted: "#48eb4e",
                                Cancelled: "#ff0000",
                            }[eventInfo.event.extendedProps.status] || "#3788d8";

                            return (
                                <p className='d-flex align-items-center mb-0 cal_elp'>
                                    <small
                                        style={{
                                            width: "7px",
                                            height: "7px",
                                            backgroundColor: statusColor,
                                            borderRadius: "50%",
                                            marginRight: "5px",
                                            position: "absolute",
                                            top: "3px",
                                            right: "-3px",
                                            border: "2px solid transparent",
                                        }}
                                    ></small>
                                    {eventInfo.event.extendedProps.brandName && (
                                        <em>
                                            {eventInfo.event.extendedProps.brandName}
                                        </em>
                                    )}
                                    &nbsp; - &nbsp;
                                    <span>{eventInfo.event.title}</span>
                                </p>
                            );
                        }}
                        dayHeaderFormat={{ weekday: 'short', day: '2-digit' }} // DD/MM/YY for header
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            meridiem: false // 24-hour format
                        }}
                    />
                </Card.Body>
            </Card>
        </>
    );
};

export default Brand_postcal;
