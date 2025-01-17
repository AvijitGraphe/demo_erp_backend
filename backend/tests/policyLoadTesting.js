import { check, group, sleep } from 'k6';
import http from 'k6/http';

const baseUrl = 'http://localhost:5000/policyRoutes';  
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM2OTIwODE0LCJleHAiOjE3MzY5NTY4MTR9.p38QuuZJ8LOS7bAjfhjrln0sapyp6zLW_VU3eBrA2IM';  // Bearer token
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

// Created by ID
const createdById = '677fd944a2e0cb7c7b387f4c';  
// Policy ID for PUT request
const policyId = '6784b89f487414ab07a492d2'; 

export default function () {
  group('Create Policy (POST /api/policies)', function () {
    const payload = JSON.stringify({
      policy_name: 'Health and Safety Policy',
      policy_subject: 'Employee Well-being',
      policy_desc: 'Description of the health and safety policy.',
      created_by: createdById,
      policy_type: ['HumanResource'],
    });

    const res = http.post(`${baseUrl}/policies`, payload, { headers });
    check(res, {
      'is status 201': (r) => r.status === 201,
      'response message': (r) => r.json().message === 'Policies created successfully',
    });
    sleep(1);  
  });

  group('Update Policy (PUT /api/policies/:id)', function () {
    const payload = JSON.stringify({
      policy_name: 'Updated Health and Safety Policy',
      policy_subject: 'Employee Safety & Well-being',
      policy_desc: 'Updated description of the health and safety policy.',
      updated_by: createdById,
    });

    const res = http.put(`${baseUrl}/policies/${policyId}`, payload, { headers });
    check(res, {
      'is status 200': (r) => r.status === 200,
      'response message': (r) => r.json().message === 'Policy updated successfully',
    });
    sleep(1);  
  });

  group('Get All Policies (GET /api/policies)', function () {
    const res = http.get(`${baseUrl}/allpolicies`, { headers });
    check(res, {
      'is status 200': (r) => r.status === 200,
      'has policy data': (r) => r.json().length > 0,
    });
    sleep(1); 
  });

  group('Get Policies by Type (GET /api/policies)', function () {
    const policyType = 'Employee';  
    const res = http.get(`${baseUrl}/alldistpolicies?policy_type=${policyType}`, { headers });
    check(res, {
      'is status 200': (r) => r.status === 200,
      'has policy data': (r) => r.json().length > 0,
    });
    sleep(1);
  });
}
