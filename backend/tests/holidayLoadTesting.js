import http from 'k6/http';
import { check, group, sleep } from 'k6';

const baseUrl = 'http://localhost:5000/HolidayRoutes';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM2OTIwODE0LCJleHAiOjE3MzY5NTY4MTR9.p38QuuZJ8LOS7bAjfhjrln0sapyp6zLW_VU3eBrA2IM'; // Bearer token
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

export default function () {

  // Group 1: Fetch All Holidays
  group('Fetch All Holidays', function () {
    const response = http.get(`${baseUrl}/holidays`, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response contains holidays data': (r) => r.body.length > 0,
    });
    sleep(1);
  });

  // Group 2: Fetch Holidays for the Current Month
  group('Fetch Holidays for Current Month', function () {
    const response = http.get(`${baseUrl}/holidays/current-month`, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response contains holidays data': (r) => r.body.length > 0,
    });
    sleep(1);
  });

  // Group 3: Fetch Holidays for a Specific Week
  group('Fetch Holidays for Week', function () {
    const startDate = '2025-01-01';  // Example start date
    const endDate = '2025-01-07';    // Example end date
    const response = http.get(`${baseUrl}/holidays/week?startDate=${startDate}&endDate=${endDate}`, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response contains holidays data': (r) => r.body.length > 0,
    });
    sleep(1);
  });

  // Group 4: Fetch Birthdays in Range
  group('Fetch Birthdays in Range', function () {
    const startDate = '2025-01-01';  // Example start date
    const endDate = '2025-01-07';    // Example end date
    const response = http.get(`${baseUrl}/birthdays-in-range?start_date=${startDate}&end_date=${endDate}`, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response contains birthdays data': (r) => r.body.length > 0,
    });
    sleep(1);
  });

  // Group 5: Fetch Approved Leave Requests
  group('Fetch Approved Leave Requests', function () {
    const startDate = '2025-01-01';  // Example start date
    const endDate = '2025-01-07';    // Example end date
    const response = http.get(`${baseUrl}/approved-leave-requests?start_date=${startDate}&end_date=${endDate}`, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response contains leave requests data': (r) => r.body.length > 0,
    });
    sleep(1);
  });

  // Group 6: Fetch Work Anniversaries
  group('Fetch Work Anniversaries', function () {
    const startDate = '2025-01-01';  // Example start date
    const endDate = '2025-01-07';    // Example end date
    const response = http.get(`${baseUrl}/work-anniversaries?start_date=${startDate}&end_date=${endDate}`, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response contains work anniversaries data': (r) => r.body.length > 0,
    });
    sleep(1);
  });
}
