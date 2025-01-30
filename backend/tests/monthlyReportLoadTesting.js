import http from 'k6/http';
import { check, group } from 'k6';

const baseUrl = 'http://localhost:5000/monthly-report';  // Replace with the correct base URL for your API
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM2OTIwODE0LCJleHAiOjE3MzY5NTY4MTR9.p38QuuZJ8LOS7bAjfhjrln0sapyp6zLW_VU3eBrA2IM'; // Bearer token
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

export default function () {
  group('Fetch Monthly Report', () => {
    const params = {
        brandId : '677f8a46cfa75137f2baa4e9',
        projectId : '6780f662e3bff1be9cc3e66e', 
        month : '1'
    }
    const url = `${baseUrl}/fetch-monthly-report?brandId=${params.brandId}&projectId=${params.projectId}&month=${params.month}`;
    // Send the GET request to the API
    const res = http.get(url, { headers });
    check(res, {
      'Status is 200': (r) => r.status === 200,  
      'Response contains brand data': (r) => r.body.includes('brand'),  
      'Response contains project data': (r) => r.body.includes('project'),  
      'Response contains task statistics': (r) => r.body.includes('taskStatistics'),  
    });
  });
}
