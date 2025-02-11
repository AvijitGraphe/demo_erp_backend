






import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';

const Brand_calender = () => {
    const { accessToken } = useAuth();
    const [events, setEvents] = useState([]);
    const [brands, setBrands] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);

    const [dialogData, setDialogData] = useState({
        id: "",
        title: "",
        start: "",
        color: "#FF0000",
        status: "Pending",
        brand: "",
    });
    const [isEditing, setIsEditing] = useState(false);

    const statusOptions = [
        { label: "Pending", value: "Pending", color: "#ff9800" },
        { label: "Posted", value: "Posted", color: "#4caf50" },
        { label: "Cancelled", value: "Cancelled", color: "#ff0000" },
    ];

    const colors = [
        { color: "#FF0000", name: "Red" },
        { color: "#0000FF", name: "Blue" },
        { color: "#FFD700", name: "Gold" },
        { color: "#50C878", name: "Emerald" },
        { color: "#7851A9", name: "Purple" },
        { color: "#40E0D0", name: "Turquoise" },
        { color: "#FF7F50", name: "Coral" },
        { color: "#FF00FF", name: "Magenta" },
        { color: "#000080", name: "Navy" },
        { color: "#DC143C", name: "Crimson" },
        { color: "#228B22", name: "Forest Green" },
        { color: "#008080", name: "Teal" },
        { color: "#87CEEB", name: "Sky Blue" },
        { color: "#FF66CC", name: "Pink" },
        { color: "#7FFF00", name: "Chartreuse" },
        { color: "#FFBF00", name: "Amber" },
        { color: "#708090", name: "Slate Gray" },
        { color: "#32CD32", name: "Lime Green" },
        { color: "#191970", name: "Midnight Blue" },
        { color: "#FF69B4", name: "Hot Pink" },
        { color: "#800000", name: "Maroon" },
        { color: "#2E8B57", name: "Sea Green" },
        { color: "#DDA0DD", name: "Plum" },
        { color: "#808000", name: "Olive" },
        { color: "#B87333", name: "Copper" },
    ];


    const fetchEvents = async (startDate, endDate) => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/brandingRoutes/brand-calendar`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: { start_date: startDate, end_date: endDate },
            });
            const eventList = response.data.map(event => ({
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
            console.error('Error fetching events:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/projectRoutes/fetchallbrands`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const brandOptions = response.data.map(brand => ({
                label: brand.brand_name,
                value: brand.brand_id,
            }));
            setBrands(brandOptions);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const saveEvent = async () => {
        try {
            const { id, title, start, color, status, brand } = dialogData;
            const payload = {
                brand_calander_id: id,
                brand_id: brand,
                event_name: title,
                event_date: start,
                event_status: status,
                event_color: color,
            };

            await axios.post(`${config.apiBASEURL}/brandingRoutes/brand-calendar`, payload, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Refresh events after save
            const today = new Date(dialogData.start);
            fetchEvents(new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
                new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString());
            setDialogVisible(false);
        } catch (error) {
            console.error('Error saving event:', error);
        }
    };

    const openDialog = (data, isEdit) => {
        setDialogData(data);
        setIsEditing(isEdit);
        setDialogVisible(true);
    };
    const handleDateSelect = (selectInfo) => {
        openDialog({ id: "", title: "", start: selectInfo.startStr, color: "#3788d8", status: "Pending", brand: "" }, false);
        selectInfo.view.calendar.unselect();
    };

    const handleEventClick = (clickInfo) => {
        const clickedEvent = events.find(event => event.id === clickInfo.event.id);
        if (clickedEvent) {
            setDialogData({
                id: clickedEvent.id,
                title: clickedEvent.title,
                start: clickedEvent.start,
                color: clickedEvent.color,
                status: clickedEvent.status || "Pending",
                brand: clickedEvent.brand, // Preselect brand ID
            });
            setIsEditing(true);
            setDialogVisible(true);
        } else {
            console.error('Event not found:', clickInfo.event.id);
        }
    };

    useEffect(() => {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();
        fetchEvents(startDate, endDate);
        fetchBrands();
    }, []);


    return (
        <>
            <Row className="body_content w-100">
                <Row className="justify-content-between align-items-center">
                    <Col md={12} className="mb-4">
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            selectable
                            editable
                            events={events}
                            dayMaxEventRows={4}
                            contentHeight="auto"
                            select={handleDateSelect}
                            eventClick={handleEventClick}
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
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "dayGridMonth,dayGridWeek,dayGridDay",
                            }}
                            datesSet={(dateInfo) => {
                                const startDate = new Date(dateInfo.start).toISOString();
                                const endDate = new Date(dateInfo.end).toISOString();
                                fetchEvents(startDate, endDate);
                            }}
                        />


                        <Dialog
                            header={isEditing ? "Edit Post" : "Add Post"}
                            visible={dialogVisible}
                            style={{ width: "400px" }}
                            footer={
                                <div>
                                    <Button label="Cancel" onClick={() => setDialogVisible(false)} className="border-0 py-2" severity="secondary" />
                                    <Button label="Save" onClick={saveEvent} className="border-0 ms-2 py-2" severity="success" />
                                </div>
                            }
                            onHide={() => setDialogVisible(false)}
                        >
                            <div className="p-field">
                                <label htmlFor="brand">Select Brand</label>
                                <Dropdown
                                    id="brand"
                                    value={dialogData.brand}
                                    options={brands}
                                    onChange={(e) => setDialogData({ ...dialogData, brand: e.value })}
                                    placeholder="Select a Brand"
                                />
                            </div>
                            <div className="p-field mt-3">
                                <label htmlFor="title">Post Type</label>
                                <InputText
                                    id="title"
                                    value={dialogData.title}
                                    onChange={(e) => setDialogData({ ...dialogData, title: e.target.value })}
                                />
                            </div>
                            <div className="p-field mt-3">
                                <label htmlFor="start">Post Date</label>
                                <InputText
                                    id="start"
                                    value={dialogData.start}
                                    onChange={(e) => setDialogData({ ...dialogData, start: e.target.value })}
                                    disabled
                                />
                            </div>
                            <div className="p-field mt-3">
                                <label htmlFor="status">Post Status</label>
                                <Dropdown
                                    id="status"
                                    value={dialogData.status}
                                    options={statusOptions}
                                    onChange={(e) => setDialogData({ ...dialogData, status: e.value })}
                                    placeholder="Select a status"
                                    disabled={!isEditing} // Disable if adding a new event
                                />

                            </div>
                            <div className="p-field d-flex flex-column justify-content-start align-items-center mt-3">
                                <label htmlFor="color" className="text-start w-100 mb-2">Select Color</label>
                                <div className="d-flex w-100 align-items-center">
                                    {/* Dropdown for selecting color */}
                                    <select
                                        id="color"
                                        className="form-select w-75 me-2"
                                        value={dialogData.color}
                                        onChange={(e) => setDialogData({ ...dialogData, color: e.target.value })}
                                    >
                                        <option value="" disabled>Select a color</option>
                                        {colors.map(({ color, name }) => (
                                            <option key={color} value={color}>
                                                {name}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Color preview box */}
                                    {dialogData.color && (
                                        <div
                                            className="color-preview-circle"
                                            style={{
                                                width: "46px",
                                                height: "46px",
                                                backgroundColor: dialogData.color,
                                                borderRadius: "5px",
                                                border: "none",
                                            }}
                                        ></div>
                                    )}
                                </div>
                            </div>


                        </Dialog>
                    </Col>
                </Row>
            </Row>
        </>
    );
};

export default Brand_calender;