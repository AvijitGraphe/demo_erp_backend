import { check, group, sleep } from 'k6';
import http from 'k6/http';

const baseUrl = 'http://localhost:5000/overtimeRoutes';  // Update this to the correct API base URL
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM2OTIwODE0LCJleHAiOjE3MzY5NTY4MTR9.p38QuuZJ8LOS7bAjfhjrln0sapyp6zLW_VU3eBrA2IM';  // Bearer token
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

const userId = '677f840a50524d5a0433f43a';  // Example user ID
const overtimeId = '67877ea093e2dd8b0e9fec2e';  // Example overtime record ID

export default function () {
    group('Add Overtime Record', function () {
        const payload = JSON.stringify({
          user_id: userId,
          start_time: '2025-01-15T08:00:00Z',
          end_time: '2025-01-15T17:00:00Z',
          total_time: '9',
          overtime_date: '2025-01-15'
        });
    
        const res = http.post(`${baseUrl}/add-overtime`, payload, { headers });
    
        // Check if response is valid JSON
        if (res.status === 200 || res.status === 201) {
          check(res, {
            'response is JSON': (r) => r.body && r.body.length > 0,
            'is status 201': (r) => r.status === 201,
            'response message': (r) => r.json().message === 'Overtime record created successfully.',
          });
        } else {
          console.log('Error: Non-JSON response received', res.body);
        }
    
        sleep(1);
    });

  group('Edit Overtime Record', function () {
    const payload = JSON.stringify({
      start_time: '2025-01-15T08:30:00Z',
      end_time: '2025-01-15T17:30:00Z',
      total_time: '9.5',
      overtime_date: '2025-01-15'
    });

    const res = http.put(`${baseUrl}/edit-overtime/${overtimeId}`, payload, { headers });
    check(res, {
      'is status 200': (r) => r.status === 200,
      'response message': (r) => r.json().message === 'Overtime record updated successfully.',
    });
    sleep(1); // Sleep after the request
  });

  group('Update Overtime Status', function () {
    const payload = JSON.stringify({
      approved_by: '677fd944a2e0cb7c7b387f4c',
      reason: 'Worked extra hours',
      status: 'Approved'
    });

    const res = http.put(`${baseUrl}/update-overtime-status/${overtimeId}`, payload, { headers });
    check(res, {
      'is status 200': (r) => r.status === 200,
      'response message': (r) => r.json().message === 'Overtime status updated successfully.',
    });
    sleep(1); // Sleep after the request
  });

  group('Get All Overtime Records', function () {
    const res = http.get(`${baseUrl}/allovertime?requesterName=John&monthYear=2025-01`, { headers });
    check(res, {
      'is status 200': (r) => r.status === 200,
      'has overtime data': (r) => r.json().Pending !== undefined,
    });
    sleep(1); // Sleep after the request
  });

  group('Get User Overtime Records', function () {
    const res = http.get(`${baseUrl}/overtime/user/${userId}?monthYear=2025-01`, { headers });
    check(res, {
      'is status 200': (r) => r.status === 200,
      'has user overtime records': (r) => r.json().Pending !== undefined,
    });
    sleep(1);
  });

  group('Get Specific Overtime Record', function () {
    const res = http.get(`${baseUrl}/overtime/${overtimeId}`, { headers });
    check(res, {
      'is status 200': (r) => r.status === 200,
      'has overtime record': (r) => r.json()._id === overtimeId,
    });
    sleep(1); 
  });

  group('Get Dashboard Overtime Records for Current Week', function () {
    const res = http.get(`${baseUrl}/dashboardovertime`, { headers });
    check(res, {
      'is status 200': (r) => r.status === 200,
      'has pending overtime records': (r) => r.json().Pending !== undefined,
    });
    sleep(1); 
  });

}
