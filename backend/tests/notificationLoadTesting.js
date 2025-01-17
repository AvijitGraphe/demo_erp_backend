import { check, group, sleep } from 'k6';
import http from 'k6/http';

const baseUrl = 'http://localhost:5000/notificationRoutes';  
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM2OTIwODE0LCJleHAiOjE3MzY5NTY4MTR9.p38QuuZJ8LOS7bAjfhjrln0sapyp6zLW_VU3eBrA2IM';  // Your Bearer Token
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

const userId = '677f840a50524d5a0433f43a';
const notificationId = '6781142c757130b2cf4cbae2'; 

export default function () {
  group('Fetch notifications by user_id', function () {
    const res = http.get(`${baseUrl}/notifications/${userId}`, { headers });
    check(res, {
      'is status 200': (r) => r.status === 200,
      'has notifications': (r) => r.json().notifications !== undefined,
    });
    sleep(1); // Sleep after the request
  });

  group('Mark notification as read', function () {
    const res = http.put(`${baseUrl}/notifications/${notificationId}/mark-as-read`, null, { headers });
    check(res, {
      'is status 200': (r) => r.status === 200,
      'response message': (r) => r.json().message === 'Notification marked as read successfully.',
    });
    sleep(1); 
  });

  group('Check unread notifications for today', function () {
    const res = http.get(`${baseUrl}/notifications/unread/today/${userId}`, { headers });
    check(res, {
      'is status 200': (r) => r.status === 200,
      'has unread notification status': (r) => typeof r.json().hasUnread !== 'undefined',
    });
    sleep(1);
  });

  group('Fetch unsent notifications for today', function () {
    const res = http.get(`${baseUrl}/notifications_push/${userId}`, { headers });
    check(res, {
      'is status 200': (r) => r.status === 200,
      'has notifications': (r) => r.json().notifications !== undefined,
    });
    sleep(1); 
  });
}
