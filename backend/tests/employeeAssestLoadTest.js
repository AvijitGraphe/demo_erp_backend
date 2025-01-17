import http from 'k6/http';
import { check, group, sleep } from 'k6';

// Base URL of your API
const BASE_URL = 'http://localhost:5000/assestRoutes';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODYwZjBiNzE1N2I4Mjg3MWI4NWUwNCIsImVtYWlsIjoid2l4QGdtYWlsLmNvbSIsImlhdCI6MTczNjg1ODU3OSwiZXhwIjoxNzM2ODk0NTc5fQ.biOP9b94mnpo63DSfGk8gTavsUeBKSZZXpEIFM3euIQ';  // Replace with your actual auth token

// Test setup
export const options = {
  stages: [
    { duration: '30s', target: 10 }, 
    { duration: '1m', target: 10 },  
    { duration: '30s', target: 0 },  
  ],
};

//Add the assest data
export default function () {
  group('POST /add-multiple-assets', () => {
    const payload = JSON.stringify({
      user_id: '677f840a50524d5a0433f43a',
      assets: [
        { Asset_Serial_No: 'GRAPHE003', Asset_name: 'Laptop', Asset_Status: 'Provided', Asset_icon: 'laptop-icon.png' },
        { Asset_Serial_No: 'GRAPHE004', Asset_name: 'Desktop', Asset_Status: 'Provided', Asset_icon: 'phone-icon.png' },
      ],
    });
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    };
    const response = http.post(`${BASE_URL}/add-multiple-assets`, payload, { headers });
    check(response, {
      'is status 201': (r) => r.status === 201,
      'contains success message': (r) => r.body.includes('Assets added successfully.'),
    });
    sleep(1);
  });
}
