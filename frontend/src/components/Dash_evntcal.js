import { Col, Row, Card, Breadcrumb, Badge, Table } from 'react-bootstrap';
import React, { useEffect, useState } from "react";
import moment from 'moment';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Link } from 'react-router-dom';
import { Button } from 'primereact/button';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import AddMeeting from '../modalPopup/AddMeeting';
import { Dialog } from 'primereact/dialog';

const Dash_evntcal = () => {
    const { accessToken, userId } = useAuth();
    const [visible2, setVisible2] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: moment().startOf('week'),
        endDate: moment().endOf('week'),
    });
    const [events, setEvents] = useState([]);

    // Fetch Holidays

    const fetchHolidays = async () => {
        try {
            const { startDate, endDate } = dateRange;
            const response = await axios.get(`${config.apiBASEURL}/HolidayRoutes/holidays/week`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    startDate: startDate.format('YYYY-MM-DD'),
                    endDate: endDate.format('YYYY-MM-DD'),
                },
            });
            const holidayEvents = response.data.holidays.map((holiday) => ({
                title: holiday.holiday_name,
                start: holiday.holiday_date,
                backgroundColor: '#14a8b6',
                borderColor: '#14a8b6',
                textColor: '#fff',
            }));

            setEvents((prevEvents) => [...prevEvents, ...holidayEvents]);
        } catch (error) {
            console.error("Error fetching holidays:", error);
        }
    };

    // Fetch Birthdays
    const fetchBirthdays = async () => {
        try {
            const { startDate, endDate } = dateRange;
            const response = await axios.get(`${config.apiBASEURL}/HolidayRoutes/birthdays-in-range`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    start_date: startDate.format('YYYY-MM-DD'),
                    end_date: endDate.format('YYYY-MM-DD'),
                },
            });

            console.log("response, response", response)
            const birthdayEvents = response.data.map((birthday) => ({
                title: `🎉 ${birthday.name}'s Birthday 🎉`,
                start: birthday.date_of_birth,
                backgroundColor: '#f39c12',
                borderColor: '#f39c12',
                textColor: '#fff',
            }));

            setEvents((prevEvents) => [...prevEvents, ...birthdayEvents]);
        } catch (error) {
            console.error("Error fetching birthdays:", error);
        }
    };

    // Fetch Approved Leave Requests
    const fetchApprovedLeaveRequests = async () => {
        try {
            const { startDate, endDate } = dateRange;
            const response = await axios.get(`${config.apiBASEURL}/HolidayRoutes/approved-leave-requests`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    start_date: startDate.format('YYYY-MM-DD'),
                    end_date: endDate.format('YYYY-MM-DD'),
                },
            });
            console.log("response leave ", response)
            const leaveEvents = response.data.leaveRequests.flatMap((request) => {
                const { requestor, dates } = request;
                const fullName = `${requestor.first_name} ${requestor.last_name}`;
                const imageUrl = requestor.profileImage?.image_url || null;

                const parsedDates = typeof dates === 'string' ? JSON.parse(dates) : dates;

                return parsedDates.map((date) => ({
                    title: `${fullName} - Leave`,
                    start: date,
                    description: request.reason || 'Leave Request',
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    textColor: '#fff',
                }));
            });
            setEvents((prevEvents) => [...prevEvents, ...leaveEvents]);
        } catch (error) {
            console.error("Error fetching approved leave requests:", error);
        }
    };

    // Fetch meetings
    const fetchMeetings = async () => {
        try {
            const { startDate, endDate } = dateRange;
            const response = await axios.get(`${config.apiBASEURL}/meetingRoutes/meetings`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { start_date: startDate, end_date: endDate, user_id: userId  },
            });

            const meetingEvents = response.data.data.map(meeting => ({
                id: `meeting-${meeting.meeting_id}`,
                title: `${meeting.purpose}- Meeting`,
                start: `${meeting.date}T${meeting.start_time}`, // Combine date and time
                end: `${meeting.date}T${meeting.end_time}`,
                description: 'Meeting',
                members: meeting.members,
                backgroundColor: '#03b2cb', // Custom color for meetings
                borderColor: '#03b2cb',
                textColor: '#fff',
            }));

            setEvents((prevEvents) => [...prevEvents, ...meetingEvents]);
        } catch (error) {
            console.error('Error fetching meetings:', error);
        }
    };


    const fetchWorkAnniversaries = async () => {
        try {
            const { startDate, endDate } = dateRange;
            const response = await axios.get(`${config.apiBASEURL}/HolidayRoutes/work-anniversaries`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { start_date: startDate, end_date: endDate },
            });
    
            // Map response data to calendar event structure
            const anniversaryEvents = response.data.map((anniversary) => ({
                id: `anniversary-${anniversary.user_id}`,
                title: `💼 ${anniversary.first_name} ${anniversary.last_name}`,
                start: anniversary.anniversary_date, // Use the calculated anniversary date
                allDay: true, // Mark the event as a full-day event
                description: '💼 Work Anniversary',
                image_url: anniversary.profile_image || null,
                backgroundColor: '#f06bac', // Golden color for anniversaries
                borderColor: '#FFD700',
                textColor: '#fff',
            }));
            setEvents((prevEvents) => [...prevEvents, ...anniversaryEvents]);
        } catch (error) {
            console.error('Error fetching work anniversaries:', error);
            return [];
        }
    };


    // Fetch all events when component mounts or date range changes
    useEffect(() => {
        setEvents([]); // Clear previous events before fetching new ones
        fetchHolidays();
        fetchBirthdays();
        fetchApprovedLeaveRequests();
        fetchMeetings();
        fetchWorkAnniversaries();
    }, [dateRange]);

    return (
        <>
            <Card className='dashboard_week p-0 shadow-none'>
                <Card.Body className='p-0'>
                    <div className='dash_calender' style={{ top: '0' }}>
                    <Button
                            severity="help"
                            label="Add Meeting"
                            icon="pi pi-comments"
                             className="p-0 border-0 mx-3"
                             outlined
                            onClick={() => setVisible2(true)}
                        />
                        <Link to={'/dashboard/calendar'}>
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
                        dayHeaderFormat={{ weekday: 'short', day: '2-digit' }} // DD/MM/YY for header
                        eventTimeFormat={{
                            hour: '2-digit',
                            minute: '2-digit',
                            meridiem: false // 24-hour format
                        }}
                    />
                </Card.Body>
            </Card>
            <Dialog
                header="Add Meeting"
                visible={visible2}
                style={{ width: '360px' }}
                onHide={() => setVisible2(false)}
            >
                {visible2 && (
                    <AddMeeting
                        setVisible={setVisible2}
                        onSuccess={() => {
                            setVisible2(false);  // Close the dialog
                            // Re-fetch meetings after adding new one
                            fetchMeetings();
                        }}
                    />
                )}
            </Dialog>
        </>
    );
};

export default Dash_evntcal;
