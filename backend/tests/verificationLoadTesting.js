import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

// Define custom metrics for tracking response times
let responseTimeTrend = new Trend('response_time');

// Base URL for the server
const BASE_URL = 'http://localhost:5000/promotion';

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM2OTIwODE0LCJleHAiOjE3MzY5NTY4MTR9.p38QuuZJ8LOS7bAjfhjrln0sapyp6zLW_VU3eBrA2IM"; // Your Bearer Token

export let options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  group('Update User Role and Location', function () {
    const userId = '677f840a50524d5a0433f43a'; // Example of an existing user ID in your database
    const userType = 'Employee';
    const joiningDate = '2025-01-01';
    const startTime = '2025-01-01T09:00:00Z';

    const updateUserRoleLocationResponse = http.post(
      `${BASE_URL}/update-user-role-location`,
      JSON.stringify({ user_id: userId, user_type: userType, joining_date: joiningDate, start_time: startTime }),
      { headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } }
    );

    check(updateUserRoleLocationResponse, {
      'User role and location updated successfully': (r) => r.status === 200,
    });

    responseTimeTrend.add(updateUserRoleLocationResponse.timings.duration);
    sleep(1);
  });

  group('Fetch Unverified Users Count', function () {
    const unverifiedCountResponse = http.get(
      `${BASE_URL}/unverified_count`,
      { headers: { 'Authorization': `Bearer ${TOKEN}` } }
    );

    check(unverifiedCountResponse, {
      'Successfully fetched unverified users count': (r) => r.status === 200,
    });

    responseTimeTrend.add(unverifiedCountResponse.timings.duration);
    sleep(1);
  });

  group('Fetch Unverified Users with Data', function () {
    const unverifiedUsersResponse = http.get(
      `${BASE_URL}/users_unverified`,
      { headers: { 'Authorization': `Bearer ${TOKEN}` } }
    );

    check(unverifiedUsersResponse, {
      'Successfully fetched unverified users with data': (r) => r.status === 200,
    });

    responseTimeTrend.add(unverifiedUsersResponse.timings.duration);
    sleep(1);
  });

  group('Fetch All Roles', function () {
    const allRolesResponse = http.get(
      `${BASE_URL}/allroles`,
      { headers: { 'Authorization': `Bearer ${TOKEN}` } }
    );

    check(allRolesResponse, {
      'Successfully fetched all roles': (r) => r.status === 200,
    });

    responseTimeTrend.add(allRolesResponse.timings.duration);
    sleep(1);
  });

  group('Fetch Verified Users', function () {
    const verifiedUsersResponse = http.get(
      `${BASE_URL}/users_verified`,
      { headers: { 'Authorization': `Bearer ${TOKEN}` } }
    );

    check(verifiedUsersResponse, {
      'Successfully fetched verified users': (r) => r.status === 200,
    });

    responseTimeTrend.add(verifiedUsersResponse.timings.duration);
    sleep(1);
  });

  group('Promote User', function () {
    const userId = '677f840a50524d5a0433f43a'; // Example of an existing user ID
    const newUserType = 'Manager';

    const promoteUserResponse = http.post(
      `${BASE_URL}/promotion-users`,
      JSON.stringify({ user_id: userId, user_type: newUserType }),
      { headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } }
    );

    check(promoteUserResponse, {
      'Successfully promoted user': (r) => r.status === 200,
    });

    responseTimeTrend.add(promoteUserResponse.timings.duration);
    sleep(1);
  });
}
