import { check, group, sleep } from "k6";
import http from "k6/http";

const baseUrl = "http://localhost:5000/tasksheetRoutes"; // Base URL of your server
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM2OTIwODE0LCJleHAiOjE3MzY5NTY4MTR9.p38QuuZJ8LOS7bAjfhjrln0sapyp6zLW_VU3eBrA2IM"; // Your Bearer Token

// Define the headers
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

export let options = {
  stages: [
    { duration: "30s", target: 50 }, // Ramp-up to 50 virtual users
    { duration: "1m", target: 50 },  // Sustain 50 users for 1 minute
    { duration: "30s", target: 0 },  // Ramp-down to 0 users
  ],
};

export default function () {
  group("Test update-tasksheet", function () {
    const task_id = "6780f7b4ccbea45c3e73334f"; 
    const status = "Todo";
    const payload = JSON.stringify({ task_id, status });
    const res = http.post(`${baseUrl}/update-tasksheet`, payload, { headers });
    check(res, {
      "status is 200": (r) => r.status === 200,
      "response contains message": (r) => r.body.includes("Tasksheet updated successfully."),
    });
    sleep(1); 
  });

  group("Test handle-subtask-status", function () {
    const subtask_id = "6784dcf8d34ee6a396aee6eb"; 
    const task_id = "6780f7b4ccbea45c3e73334f"; 
    const payload = JSON.stringify({ subtask_id, task_id });
    const res = http.post(`${baseUrl}/handle-subtask-status`, payload, { headers });
    check(res, {
      "status is 200": (r) => r.status === 200,
      "response contains success message": (r) => r.body.includes("Subtask data added to Subtasksheet successfully."),
    });

    sleep(1);
});

  group("Test get tasksheets with date range", function () {
    // Define the date range for the query
    const start_date = "2025-01-01";
    const end_date = "2025-01-15";
    const res = http.get(`${baseUrl}/tasksheets?start_date=${start_date}&end_date=${end_date}`, { headers });
    check(res, {
      "status is 200": (r) => r.status === 200,
      "response contains 'data'": (r) => r.body.includes("data"),
      "response contains 'success'": (r) => r.body.includes('"success":true'),
    });
    sleep(1);
  });

  group("Test get tasksheets for a specific user", function () {
    const tasksheet_user_id = "677f840a50524d5a0433f43a";
    const start_date = "2025-01-01";
    const end_date = "2025-01-15";
    const res = http.get(`${baseUrl}/tasksheets/user/${tasksheet_user_id}?start_date=${start_date}&end_date=${end_date}`, { headers });
    check(res, {
      "status is 200": (r) => r.status === 200,
      "response contains message": (r) => r.body.includes("data"),
    });
    sleep(1);
  });
}
