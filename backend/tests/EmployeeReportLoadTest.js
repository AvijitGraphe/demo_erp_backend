import http from 'k6/http';
import { check, group, sleep } from 'k6';


// Define the URL for the endpoint
const url = 'http://localhost:5000/employee-report';
// Define the user details and token for authentication
const headers = {
  Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM2OTIwODE0LCJleHAiOjE3MzY5NTY4MTR9.p38QuuZJ8LOS7bAjfhjrln0sapyp6zLW_VU3eBrA2IM', // Token
};

export let options = {
  stages: [
    { duration: '10s', target: 20 }, 
    { duration: '20s', target: 20 }, 
    { duration: '10s', target: 0 }, 
  ],
};

export default function () {
  // Define the query parameters
  const params = {
    userId: '677f840a50524d5a0433f43a',
    month: '01', 
    year: '2025', 
    search:"John"
  };
  const paramsTask = {
    user_id: '677f840a50524d5a0433f43a',
    month: '01', 
    year: '2025', 
  };

    // Construct the full URL with query parameters for the attendance report
    const attendanceUrl = `${url}/Employee-report-attendance?userId=${params.userId}&month=${params.month}&year=${params.year}`;
    // Construct the URL for fetching user leave balances
    const leaveBalancesUrl = `${url}/fetch-user-leave-balances/${params.userId}?month=${params.month}&year=${params.year}`;
    // Construct the URL for fetching task statistics
    const taskStatsUrl = `${url}/fetch-task-stats/${paramsTask.user_id}?month=${paramsTask.month}&year=${paramsTask.year}`;
    // Construct the URL for fetching users based on search
    const fetchReportUsersUrl = `${url}/fetch-report-users?search=${params.search}`;
    // Construct the URL for fetching task stats by month
    const taskStatsByMonthUrl = `${url}/task-stats/monthly/${params.userId}`;
    // Construct the URL for fetching employee report attendance
    const dashboardEmployeeReportAttendanceUrl = `${url}/dashboard-Employee-report-attendance?userId=${params.userId}`;


// Group 1: Employee Attendance Report API
group('Employee Attendance Report API', function () {
group('Making the request', function () {
    const res = http.get(attendanceUrl, { headers });

    // Check the response status and performance
    check(res, {
    'is status 200': (r) => r.status === 200,
    'response time is under 200ms': (r) => r.timings.duration < 200,
    });
});
sleep(1);
});

// Group 2: Fetch User Leave Balances API
group('Fetch User Leave Balances API', function () {
group('Making the request', function () {
    const res = http.get(leaveBalancesUrl, { headers });
    check(res, {
    'is status 200': (r) => r.status === 200,
    'response time is under 200ms': (r) => r.timings.duration < 200,
    });
});
sleep(1); 
});

// Group 3: Fetch Task Statistics for User
group('Fetch Task Statistics for User', function () {
group('Making the request to fetch task statistics', function () {
    const response = http.get(taskStatsUrl, { headers });
    check(response, {
    'status is 200': (r) => r.status === 200,
    'response contains success': (r) => {
        const body = r.json();
        return body.success === true;
    },
    });
});
sleep(1);
});

// Group 4: Fetch Report Users API (newly added)
group('Fetch Report Users API', function () {
group('Making the request to fetch report users', function () {
    const response = http.get(fetchReportUsersUrl, { headers });
    check(response, {
    'status is 200': (r) => r.status === 200,
    'response contains success': (r) => {
        const body = r.json();
        return body.success === true;
    },
    'response contains users data': (r) => {
        const body = r.json();
        return Array.isArray(body.data) && body.data.length > 0;
    },
    });
});
sleep(1);
});

// Group 5: Fetch Task Stats by Month API
group('Fetch Task Stats by Month API', function () {
group('Making the request to fetch task stats by month', function () {
    const response = http.get(taskStatsByMonthUrl, { headers });
    check(response, {
    'status is 200': (r) => r.status === 200,
    'response contains success': (r) => {
        const body = r.json();
        return body.success === true;
    },
    'response contains task stats data': (r) => {
        const body = r.json();
        return Array.isArray(body.data) && body.data.length === 12; // Should return data for each month
    },
    });
});
sleep(1);
});


// Group 6: Dashboard Employee Report Attendance API
group('Dashboard Employee Report Attendance API', function () {
    group('Making the request to fetch dashboard employee report attendance', function () {
    const response = http.get(dashboardEmployeeReportAttendanceUrl, { headers });
    check(response, {
        'status is 200': (r) => r.status === 200,
        'response contains success': (r) => {
        const body = r.json();
        return body.success === true;
        },
        'response contains attendance data': (r) => {
        const body = r.json();
        return body.totalOvertimeHours !== undefined; 
        },
    });
    });
    sleep(1);
});

}
