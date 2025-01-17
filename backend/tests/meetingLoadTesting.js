import http from 'k6/http';
import { check, group, sleep } from 'k6';


const baseUrl = 'http://localhost:5000/meetingRoutes';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM2OTIwODE0LCJleHAiOjE3MzY5NTY4MTR9.p38QuuZJ8LOS7bAjfhjrln0sapyp6zLW_VU3eBrA2IM'; // Bearer token
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

export default function () {
   //fertch 
  group('Fetch All Users', () => {
    const url = `${baseUrl}/fetch-all-users`;
    const res = http.get(url, { headers });
    check(res, {
      'Status is 200': (r) => r.status === 200,
    });
  });

  //add/update
  group('Add or Edit Meeting', () => {
    const url = `${baseUrl}/add-or-edit-meeting`;
    
    // For creating a new meeting (no meeting_id)
    const payload = JSON.stringify({
      date: '2025-01-20',
      start_time: '10:00',
      end_time: '12:00',
      purpose: 'Test meeting purpose',
      meeting_member_id: ['677f840a50524d5a0433f43a', '677fd944a2e0cb7c7b387f4c'],
    });

    const res = http.post(url, payload, { headers });
    
    // Print the response status code and body for debugging
    console.log('Response Status:', res.status);
    console.log('Response Body:', res.body);
    
    check(res, {
      'Status is 201': (r) => r.status === 201,  // Check for a successful creation status (201)
      'Response contains success': (r) => JSON.parse(r.body).success === true,
    });
  });
  

  //fetch meeting
  group('Fetch Meetings', () => {
    const url = `${baseUrl}/meetings?start_date=2025-01-01&end_date=2025-01-31`;
    const res = http.get(url, { headers });
    
    check(res, {
      'Status is 200': (r) => r.status === 200,
    });
  });
}
