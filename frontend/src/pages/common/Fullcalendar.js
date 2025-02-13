import React, { useState, useEffect } from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog } from 'primereact/dialog';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import '../../assets/css/calender.css';
import Addholiday from '../../modalPopup/Addholiday';
import { Button } from 'primereact/button';
import { Avatar } from "primereact/avatar";
import moment from 'moment';
import nouserimg from '../../assets/images/no_user.png';

const Fullcalendar = () => {
    const { accessToken, role, userId } = useAuth();
    const [visible, setVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);


    const allowedRoles = ['Admin', 'SuperAdmin', 'HumanResource'];

    // Fetch all holidays
    // Fetch holidays
    const fetchHolidays = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/HolidayRoutes/holidays`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            return response.data.map(holiday => ({
                id: `holiday-${holiday.holiday_id}`,
                title: `Holiday - ${holiday.holiday_name}`,
                start: holiday.holiday_date,
                description: '🎄 Happy Holiday! 🎄',
                image_url: holiday.image_url,
                backgroundColor: '#F55F53',
                borderColor: '#F55F53',
                textColor: '#fff',
            }));
        } catch (error) {
            console.error('Error fetching holidays:', error);
            return [];
        }
    };

    // Fetch birthdays
    const fetchBirthdays = async (startDate, endDate) => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/HolidayRoutes/birthdays-in-range`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { start_date: startDate, end_date: endDate },
            });

            return response.data.map(birthday => ({
                id: `birthday-${birthday.user_id}`,
                title: `🎉${birthday.name}🎉`,
                start: birthday.date_of_birth,
                description: 'Birthday',
                image_url: birthday.profile_image,
                backgroundColor: '#8634E3',
                borderColor: '#8634E3',
                textColor: '#fff',
            }));
        } catch (error) {
            console.error('Error fetching birthdays:', error);
            return [];
        }
    };

    const fetchApprovedLeaveRequests = async (startDate, endDate) => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/HolidayRoutes/approved-leave-requests`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { start_date: startDate, end_date: endDate },
            });

            return response.data.leaveRequests.map(request => {
                const { requestor, dates } = request;
                const fullName = `${requestor.first_name} ${requestor.last_name}`;
                const imageUrl = requestor.profileImage?.image_url || null;

                // Parse the dates array
                const parsedDates = typeof dates === 'string' ? JSON.parse(dates) : dates;

                // Map over parsedDates to create events
                return parsedDates.map(date => ({
                    id: `leave-${request.Leave_request_id}`,
                    title: ` Leave - ${fullName}`,
                    start: date,
                    description: 'Leave',
                    image_url: imageUrl,
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    textColor: '#fff',
                }));
            }).flat();
        } catch (error) {
            console.error('Error fetching approved leave requests:', error);
            return [];
        }
    };


    // Fetch meetings
    const fetchMeetings = async (startDate, endDate, accessToken) => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/meetingRoutes/meetings`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { start_date: startDate, end_date: endDate },
            });
            return response.data.data.map(meeting => {
                const startTime = moment(`${meeting.date}T${meeting.start_time}`).format('hh:mm A');
                const endTime = moment(`${meeting.date}T${meeting.end_time}`).format('hh:mm A');
                return {
                    id: `meeting-${meeting.meeting_id}`,
                    title: `${meeting.purpose} - Meeting`,
                    start: `${meeting.date}T${meeting.start_time}`,
                    end: `${meeting.date}T${meeting.end_time}`,
                    description: `Meeting from ${startTime} to ${endTime}`,
                    members: meeting.members,
                    backgroundColor: '#337AB7',
                    borderColor: '#337AB7',
                    textColor: '#fff',
                };
            });
        } catch (error) {
            console.error('Error fetching meetings:', error);
            return [];
        }
    };


    const fetchWorkAnniversaries = async (startDate, endDate) => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/HolidayRoutes/work-anniversaries`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { start_date: startDate, end_date: endDate },
            });
    
            // Map response data to calendar event structure
            return response.data.map(anniversary => ({
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
        } catch (error) {
            console.error('Error fetching work anniversaries:', error);
            return [];
        }
    };
    
    
    


    // Modify fetchEvents to include work anniversaries
    const fetchEvents = async (startDate, endDate) => {
        const [holidays, birthdays, leaveRequests, meetings, anniversaries] = await Promise.all([
            fetchHolidays(),
            fetchBirthdays(startDate, endDate),
            fetchApprovedLeaveRequests(startDate, endDate),
            fetchMeetings(startDate, endDate),
            fetchWorkAnniversaries(startDate, endDate),
        ]);

        setEvents([...holidays, ...birthdays, ...leaveRequests, ...meetings, ...anniversaries]);
    };

    // Adjust handleDatesSet to trigger fetchEvents
    const handleDatesSet = (info) => {
        const startDate = moment(info.view.currentStart).startOf('month').format('YYYY-MM-DD');
        const endDate = moment(info.view.currentEnd).subtract(1, 'day').endOf('month').format('YYYY-MM-DD');
    
        // Fetch events only for the selected month
        fetchEvents(startDate, endDate);
    };

    // Handle event click
    const handleEventClick = (info) => {
        const { title, start, extendedProps } = info.event;

        setSelectedEvent({
            title,
            start: start ? new Date(start).toLocaleDateString('en-GB') : 'Unknown Date',
            description: extendedProps.description || 'No description available',
            image_url: extendedProps.image_url || nouserimg,
            members: extendedProps.members || null, // Include members if available
        });
    };

    // Handle dialog hide
    const handleDialogHide = () => setSelectedEvent(null);



    return (
        <>
            <Row className="body_content w-100">
                <Row className="justify-content-between align-items-center">
                    <Col md={12} className="mb-4 d-flex justify-content-end align-items-center">
                        {allowedRoles.includes(role) && (
                            <Button
                                severity="help"
                                label="Add Holiday"
                                icon="pi pi-calendar-plus"
                                className="p-2 px-4 border-0"
                                onClick={() => setVisible(true)}
                            />
                        )}

                    </Col>
                    <Col md={12}>
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={events}
                            eventClick={handleEventClick}

                            datesSet={handleDatesSet} // Fetch events when the date range changes
                            dayMaxEventRows={4}
                            contentHeight="auto"
                        />
                    </Col>
                </Row>
            </Row>

            {selectedEvent && (
                <Dialog
                    visible={!!selectedEvent}
                    onHide={handleDialogHide}
                    className="calendar-dialog"
                    style={{ width: '420px', overflow: 'hidden' }}
                >
                    <div>

                        <div className="d-flex align-items-center">
                            {selectedEvent.image_url && (
                                <Avatar
                                    image={selectedEvent.image_url || nouserimg}
                                    shape="circle"
                                    className="me-3"
                                    style={{ borderRadius: '5px', width: '50px', height: '50px' }}
                                />
                            )}
                            <div className='user_anvname'>
                                <h6 className="mb-0">{selectedEvent.title}</h6>
                                <p className="mb-0 text-dark mt-2">
                                    <small>{selectedEvent.start}</small>
                                    <small>&nbsp; | &nbsp; {selectedEvent.description}</small>
                                </p>
                            </div>
                        </div>
                        {selectedEvent.members && (
                            <div className="mt-3">
                                <h6 className='border-bottom pb-2 mb-2 text-secondary'><small><em>Members</em></small>:</h6>
                                <ul className="list-unstyled">
                                    {selectedEvent.members.map((member, index) => (
                                        <li key={index} className="d-flex align-items-center mb-2">
                                            <Avatar
                                                image={member.profile_image || nouserimg}
                                                shape="circle"
                                                className="me-2"
                                                style={{ borderRadius: '5px', width: '30px', height: '30px' }}
                                            />
                                            <div>
                                                <p className="mb-0">
                                                    {member.first_name} {member.last_name}
                                                </p>
                                                {/* <small className="text-secondary">{member.email}</small> */}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </Dialog>
            )}

            {/* Add Event Dialog */}
            <Dialog
                header="Add Holiday"
                visible={visible}
                style={{ width: '340px' }}
                onHide={() => setVisible(false)}
            >
                {visible && (
                    <Addholiday
                        setVisible={setVisible}
                        onSuccess={() => setVisible(false)}
                        fetchHolidays={fetchHolidays}
                    />
                )}
            </Dialog>


        </>
    );
};

export default Fullcalendar;
