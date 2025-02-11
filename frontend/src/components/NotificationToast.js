import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
import noUserImg from "../../src/assets/images/no_user.png";
// Map icon_flag to specific severity levels
const getSeverityFromIconFlag = (iconFlag) => {
    switch (iconFlag) {
        case 'check_in_icon':
            return 'success';
        case 'danger_icon':
            return 'error';
        case 'error_icon':
            return 'error';
        case 'alert_icon':
            return 'warn';
        case 'user_registration_icon':
            return 'warn';
        // Add more mappings for icon_flag to severity as needed
        default:
            return 'info'; // Default to 'info' if no match
    }
};


// Helper function to format date in dd-mm-yyyy hh:mm AM/PM format
const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(date);
};

const NotificationToast = forwardRef((props, ref) => {
    const toast = useRef(null);

    // Allow parent components to call `showNotification` on the ref
    useImperativeHandle(ref, () => ({
        showNotification(notifications) {
            notifications.forEach(({ avatarImage, senderName, messageSummary, icon_flag, date }) => {
                // Determine severity based on icon_flag
                const severityLevel = getSeverityFromIconFlag(icon_flag);

                // Format the date for display
                const formattedDate = formatDateTime(date);

                toast.current.show({
                    severity: severityLevel,
                    summary: messageSummary,
                    sticky: true, // keeps it until manually dismissed or cleared
                    content: (messageProps) => (
                        <div className="d-flex align-items-start justify-content-start">
                            <div className='me-3'>
                                <Avatar image={avatarImage || noUserImg} shape="circle" />
                            </div>
                            <div className='notifiText'>
                                <small>{senderName}</small>
                                <small>{formattedDate}</small>
                                <span>{messageProps.message.summary}</span>
                            </div>
                        </div>
                    ),
                });
            });
        },
    }));

    return <Toast className='toast_back' ref={toast} position="bottom-right" />;
});

export default NotificationToast;
