import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

// Define custom metrics for tracking response times
let responseTimeTrend = new Trend('response_time');

// Base URL for the server
const BASE_URL = 'http://localhost:5000/user-profile';

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

  group('User Details APIs', function () {
    // 1. Add or update user details
    let payload = JSON.stringify({
      user_id: '677f840a50524d5a0433f43a',
      address: '1234 Elm Street',
      city: 'Springfield',
      pincode: '123456',
      state: 'Illinois',
      country: 'USA',
      phone: '123-456-7890',
      gender: 'Male',
      date_of_birth: '1990-01-01',
      forte: 'Software Development',
      other_skills: 'Machine Learning, Web Development',
      pan_card_no: 'ABCDE1234F',
      passport_no: 'P1234567',
      aadhar_no: '1234 5678 9876',
      nationality: 'American',
      religion: 'Christianity',
      marital_status: 'Single',
      employment_of_spouse: 'N/A',
      no_of_children: 0,
    });

    let res = http.post(`${BASE_URL}/user-details`, payload, {
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    });
    check(res, {
      'User details added/updated successfully': (r) => r.status === 200 || r.status === 201,
    });
    responseTimeTrend.add(res.timings.duration);

    // 2. Fetch UserDetails
    res = http.get(`${BASE_URL}/getUserDetails?userId=677f840a50524d5a0433f43a`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    check(res, {
      'User details fetched successfully': (r) => r.status === 200,
    });
    responseTimeTrend.add(res.timings.duration);
  });

  group('Bank Details APIs', function () {
    // 1. Add or update bank details
    let payload = JSON.stringify({
      user_id: '677f840a50524d5a0433f43a',
      bank_name: 'Sample Bank',
      bank_account_no: '123456789',
      ifsc_code: 'SBIN0001234',
      branch_name: 'Main Branch',
      accountHolder_name: 'John Doe',
    });

    let res = http.post(`${BASE_URL}/bank-details`, payload, {
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    });
    check(res, {
      'Bank details added/updated successfully': (r) => r.status === 200 || r.status === 201,
    });
    responseTimeTrend.add(res.timings.duration);

    // 2. Fetch BankDetails
    res = http.get(`${BASE_URL}/getBankDetails?userId=677f840a50524d5a0433f43a`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    check(res, {
      'Bank details fetched successfully': (r) => r.status === 200,
    });
    responseTimeTrend.add(res.timings.duration);
  });

  group('Education Info APIs', function () {
    // 1. Add or update education info
    let payload = JSON.stringify({
      user_id: '677f840a50524d5a0433f43a',
      institute: 'University Name',
      year_of_passing: '2020',
      degree_name: 'Bachelor of Science',
    });

    let res = http.post(`${BASE_URL}/education-info`, payload, {
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    });
    check(res, {
      'Education info added/updated successfully': (r) => r.status === 200 || r.status === 201,
    });
    responseTimeTrend.add(res.timings.duration);

    // 2. Fetch Education Info
    res = http.get(`${BASE_URL}/getEducationInfo?userId=677f840a50524d5a0433f43a`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    check(res, {
      'Education info fetched successfully': (r) => r.status === 200,
    });
    responseTimeTrend.add(res.timings.duration);
  });

  group('Emergency Contact APIs', function () {
    // 1. Add or update emergency contact
    let payload = JSON.stringify({
      user_id: '677f840a50524d5a0433f43a',
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '9876543210',
    });

    let res = http.post(`${BASE_URL}/emergency-contact`, payload, {
      headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    });
    check(res, {
      'Emergency contact added/updated successfully': (r) => r.status === 200 || r.status === 201,
    });
    responseTimeTrend.add(res.timings.duration);

    // 2. Fetch Emergency Contact
    res = http.get(`${BASE_URL}/getEmergencyContact?userId=677f840a50524d5a0433f43a`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    check(res, {
      'Emergency contact fetched successfully': (r) => r.status === 200,
    });
    responseTimeTrend.add(res.timings.duration);
  });

  group('Main User Details API', function () {
    const userId = '677f840a50524d5a0433f43a'; 
    const res = http.get(`${BASE_URL}/main-user-details?userId=${userId}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    check(res, {
      'Main user details fetched successfully': (r) => r.status === 200,
      'Response contains user details': (r) => JSON.parse(r.body).user_id === userId,
    });
    responseTimeTrend.add(res.timings.duration);
    sleep(1);
  });

  group('Error Handling for Main User Details API', function () {
    // Test with an invalid userId query parameter
    const invalidUserId = 'nonExistentUser';
    const resInvalid = http.get(`${BASE_URL}/main-user-details?userId=${invalidUserId}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });

    // Check if the response is the correct error code (404)
    check(resInvalid, {
      'Error message for non-existent user': (r) => r.status === 404,
    });

    responseTimeTrend.add(resInvalid.timings.duration);
    sleep(1);
  });

  group('All Users API', function () {
    // Fetch all users
    let res = http.get(`${BASE_URL}/getallusers`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    check(res, {
      'All users fetched successfully': (r) => r.status === 200,
    });
    responseTimeTrend.add(res.timings.duration);
  });

  group('Emergency Contact API Test', function () {
    // Test for fetching emergency contact with a valid user ID
    const validUserId = '677f840a50524d5a0433f43a'; // Example of an existing user ID in your database
    const res = http.get(`${BASE_URL}/getEmergencyContact?userId=${validUserId}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });

    check(res, {
      'Emergency contact fetched successfully': (r) => r.status === 200 || r.status === 204,
      'Valid response for emergency contact': (r) => r.status === 200 ? JSON.parse(r.body).length > 0 : true,
    });

    sleep(1);

    const invalidUserId = 'nonExistentUser';
    const resInvalid = http.get(`${BASE_URL}/getEmergencyContact?userId=${invalidUserId}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    check(resInvalid, {
      'No content returned for non-existent user': (r) => r.status === 204,
    });

    sleep(1);
  });

  group('Bank Details API Test', function () {
    let validUserId ="677f840a50524d5a0433f43a"
    const resBank = http.get(`${BASE_URL}/getBankDetails?userId=${validUserId}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    check(resBank, {
      'Bank details fetched successfully': (r) => r.status === 200 || r.status === 204,
      'Valid response for bank details': (r) => r.status === 200 ? JSON.parse(r.body).user_id === validUserId : true,
    });

    sleep(1);

    let  invalidUserId= "677f840a50524d5a0433f43a";
    const resBankInvalid = http.get(`${BASE_URL}/getBankDetails?userId=${invalidUserId}`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` },
    });
    check(resBankInvalid, {
      'No content returned for non-existent user': (r) => r.status === 204,
    });

    sleep(1);
  });

  sleep(1);
}
