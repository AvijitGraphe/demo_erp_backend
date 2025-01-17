import { check, group, sleep } from "k6";
import http from "k6/http";

const baseUrl = "http://localhost:5000/salaryRoutes"; // Base URL of your server
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM2OTIwODE0LCJleHAiOjE3MzY5NTY4MTR9.p38QuuZJ8LOS7bAjfhjrln0sapyp6zLW_VU3eBrA2IM"; // Your Bearer Token

// Define the headers 
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

export let options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 0 },
  ],
};

export default function () {
  group("Salary API Tests", function () {
    // Create or Update Salary API
    group("Create or Update Salary", function () {
      const payload = JSON.stringify({
        Salary_basis: "Monthly",
        Salary_Amount: 10000,
        Payment_type: "Bank_transfer",
        Ptax: 500,
        user_id: "677f840a50524d5a0433f43a",
      });

      const response = http.post(`${baseUrl}/salary`, payload, { headers });
      check(response, {
        "Status is 201 for created salary": (r) => r.status === 201,
        "Response contains message": (r) =>
          r.json("message") === "Salary created successfully",
      });
      sleep(1);
    });

    // Fetch Salary Details by User ID
    group("Fetch Salary Details", function () {
      const user_id = "677f840a50524d5a0433f43a";
      const response = http.get(`${baseUrl}/salary/${user_id}`, { headers });
      check(response, {
        "Status is 200 for salary details": (r) => r.status === 200,
        "Response contains message": (r) =>
          r.json("message") === "Salary data fetched successfully",
      });
      sleep(1);
    });

     // Generate Salaries API
    group("Generate Salaries", function () {
    const generateSalariesPayload = JSON.stringify({
        month: "01",  // Example: January
        year: "2025",  // Example: Year 2025
        total_working_days: 22,
        pf_percentage: 12,
        esi_percentage: 0.75,
        tds_percentage: 10,
    });

    const response = http.post(`${baseUrl}/generate-salaries`, generateSalariesPayload, { headers });

    // Check the response of the Generate Salaries endpoint
    check(response, {
        "Status is 201 for successful salary generation": (r) => r.status === 201,
        "Response contains message": (r) =>
        r.json("message") === "Salaries generated successfully.",
    });
    sleep(1);
    });

  });
}
