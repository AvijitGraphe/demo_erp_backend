import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Define custom metrics to track
let attendanceResponseTime = new Trend('attendance_response_time');
let successRate = new Rate('success_rate');

// Define the base URL of the API
const BASE_URL = 'http://localhost:5000/attendance';  

// Default options for the load test
export let options = {
  stages: [
    { duration: '30s', target: 20 },  
    { duration: '1m', target: 20 },  
    { duration: '10s', target: 0 },  
  ],
};

export default function () {
  //Add the check-in  
  group('Add Check-in Attendance', function () {
    const user_id = '677f840a50524d5a0433f43a'; 
    const date = new Date().toISOString().split('T')[0];  
    const start_time = '10:30';  

    const payload = JSON.stringify({
      user_id,
      date,
      start_time,
    });

    const params = {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODYwZjBiNzE1N2I4Mjg3MWI4NWUwNCIsImVtYWlsIjoid2l4QGdtYWlsLmNvbSIsImlhdCI6MTczNjg1ODU3OSwiZXhwIjoxNzM2ODk0NTc5fQ.biOP9b94mnpo63DSfGk8gTavsUeBKSZZXpEIFM3euIQ`,
          'Content-Type': 'application/json',
        },
      };
      
    let res = http.post(`${BASE_URL}/add-checkin`, payload, params);
    // Check the response status and log it
    check(res, {
      'status is 201': (r) => r.status === 201,
      'message is check-in added successfully': (r) => r.json('message') === 'Check-in added successfully',
    });

    // Track response time and success rate
    attendanceResponseTime.add(res.timings.duration);
    successRate.add(res.status === 201);
    sleep(1);  
  });

  //update the check-out
  group('Update Checkout Attendance', function () {
    const user_id = '677f840a50524d5a0433f43a'; 
    const date = new Date().toISOString().split('T')[0];  
    const end_time = '17:30';  
    const payload = JSON.stringify({
      date,
      end_time,
    });
    const params = {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODYwZjBiNzE1N2I4Mjg3MWI4NWUwNCIsImVtYWlsIjoid2l4QGdtYWlsLmNvbSIsImlhdCI6MTczNjg1ODU3OSwiZXhwIjoxNzM2ODk0NTc5fQ.biOP9b94mnpo63DSfGk8gTavsUeBKSZZXpEIFM3euIQ`,
          'Content-Type': 'application/json',
        },
      };

    // Make a PUT request to update checkout attendance
    let res = http.put(`${BASE_URL}/update-checkout/${user_id}`, payload, params);
    // Check the response status and log it
    check(res, {
      'status is 200': (r) => r.status === 200,
      'message is checkout updated successfully': (r) => r.json('message') === 'Checkout updated successfully.',
    });
    // Track response time and success rate
    attendanceResponseTime.add(res.timings.duration);
    successRate.add(res.status === 200);
    sleep(1);
  });
  

  //get all attendanc
  group('Fetch Attendance for Today', function () {
    const user_id = '677f840a50524d5a0433f43a';
    const params = {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODYwZjBiNzE1N2I4Mjg3MWI4NWUwNCIsImVtYWlsIjoid2l4QGdtYWlsLmNvbSIsImlhdCI6MTczNjg1ODU3OSwiZXhwIjoxNzM2ODk0NTc5fQ.biOP9b94mnpo63DSfGk8gTavsUeBKSZZXpEIFM3euIQ`,
          'Content-Type': 'application/json',
        },
      };;
    let res = http.get(`${BASE_URL}/fetch-attendance?user_id=${user_id}`, params);
    check(res, {
      'status is 200': (r) => r.status === 200,
    });
    attendanceResponseTime.add(res.timings.duration);
    successRate.add(res.status === 200);
    sleep(1);
  });


 // Fetch monthly attendance
 group('Fetch Monthly Attendance', function () {
    const user_id = '677f840a50524d5a0433f43a';  // Replace with an actual user ID
    const params = {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODYwZjBiNzE1N2I4Mjg3MWI4NWUwNCIsImVtYWlsIjoid2l4QGdtYWlsLmNvbSIsImlhdCI6MTczNjg1ODU3OSwiZXhwIjoxNzM2ODk0NTc5fQ.biOP9b94mnpo63DSfGk8gTavsUeBKSZZXpEIFM3euIQ`,
          'Content-Type': 'application/json',
        },
      };
    let res = http.get(`${BASE_URL}/fetch-monthly-attendance?user_id=${user_id}`, params);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'message contains attendance data': (r) => r.json('totalPresent') !== undefined,
    });
    attendanceResponseTime.add(res.timings.duration);
    successRate.add(res.status === 200);
    sleep(1);
  });

  // Fetch monthly attendance
  group('Fetch Monthly Attendance', function () {
    const user_id = '677f840a50524d5a0433f43a';  // Replace with an actual user ID
    const params = {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODYwZjBiNzE1N2I4Mjg3MWI4NWUwNCIsImVtYWlsIjoid2l4QGdtYWlsLmNvbSIsImlhdCI6MTczNjg1ODU3OSwiZXhwIjoxNzM2ODk0NTc5fQ.biOP9b94mnpo63DSfGk8gTavsUeBKSZZXpEIFM3euIQ`,
          'Content-Type': 'application/json',
        },
      };
    let res = http.get(`${BASE_URL}/fetch-monthly-attendance?user_id=${user_id}`, params);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'message contains attendance data': (r) => r.json('totalPresent') !== undefined,
    });
    attendanceResponseTime.add(res.timings.duration);
    successRate.add(res.status === 200);
    sleep(1);
  });

  //Fetch dashboard-attendance-summary
  group('Fetch Dashboard Attendance Summary', function () {
    const url = `${BASE_URL}/fetch-dashboard-attendance-summary`;
    const headers = {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODYwZjBiNzE1N2I4Mjg3MWI4NWUwNCIsImVtYWlsIjoid2l4QGdtYWlsLmNvbSIsImlhdCI6MTczNjg1ODU3OSwiZXhwIjoxNzM2ODk0NTc5fQ.biOP9b94mnpo63DSfGk8gTavsUeBKSZZXpEIFM3euIQ`,
        'Content-Type': 'application/json',
    };
    // Send a GET request to the API
    const response = http.get(url, { headers });
    // Check the response status and body
    check(response, {
        'status is 200': (r) => r.status === 200,
        'response body contains totalUsers': (r) => r.json('totalUsers') !== undefined,
        'response body contains presentCount': (r) => r.json('presentCount') !== undefined,
        'response body contains leaveCount': (r) => r.json('leaveCount') !== undefined,
    });
    sleep(1);
  });

  //Add attendance API
  group('Add Attendance', function () {
    const url = `${BASE_URL}/add-attendance`;
    const payload = JSON.stringify({
        user_id: '677f840a50524d5a0433f43a',  
        date: '2025-01-02', 
        start_time: '09:00', 
        end_time: '17:00', 
    });
    const headers = {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODYwZjBiNzE1N2I4Mjg3MWI4NWUwNCIsImVtYWlsIjoid2l4QGdtYWlsLmNvbSIsImlhdCI6MTczNjg1ODU3OSwiZXhwIjoxNzM2ODk0NTc5fQ.biOP9b94mnpo63DSfGk8gTavsUeBKSZZXpEIFM3euIQ`,  // Replace with a valid token
        'Content-Type': 'application/json',
    };
    const response = http.post(url, payload, { headers });
    check(response, {
        'status is 201': (r) => r.status === 201,
        'response body contains message': (r) => r.json('message') === 'Attendance record created successfully.',
    });
    sleep(1);
  });

  group('Edit Attendance', function () {
    const attendance_id = '67866469c706fe1e13b8d321';  // Replace with an actual attendance_id
    const url = `${BASE_URL}/edit-attendance/${attendance_id}`;
    const payload = JSON.stringify({
        start_time: '09:00',
        end_time: '17:00',   
    });
    const headers = {
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODYwZjBiNzE1N2I4Mjg3MWI4NWUwNCIsImVtYWlsIjoid2l4QGdtYWlsLmNvbSIsImlhdCI6MTczNjg1ODU3OSwiZXhwIjoxNzM2ODk0NTc5fQ.biOP9b94mnpo63DSfGk8gTavsUeBKSZZXpEIFM3euIQ`,  // Replace with a valid token
        'Content-Type': 'application/json',
    };

    // Send a PUT request to the API to update attendance
    const response = http.put(url, payload, { headers });
    // Check the response status and body
    check(response, {
        'status is 200': (r) => r.status === 200,
        'response body contains message': (r) => r.json('message') === 'Attendance updated successfully.',
    });
    sleep(1); // Simulate a delay between requests
  });

}
