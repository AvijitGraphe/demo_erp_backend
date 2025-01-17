import { check, group, sleep } from 'k6';
import http from 'k6/http';

const baseUrl = 'http://localhost:5000/profile-image';  
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM2OTIwODE0LCJleHAiOjE3MzY5NTY4MTR9.p38QuuZJ8LOS7bAjfhjrln0sapyp6zLW_VU3eBrA2IM';  // Bearer token
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

const userId = '677f840a50524d5a0433f43a';  

export default function () {
  group('Fetch Profile Image URL (GET /api/profile-image/:userId)', function () {
    const res = http.get(`${baseUrl}/profile-image/${userId}`, { headers });
    check(res, {
      'is status 200': (r) => r.status === 200,
      'has image URL': (r) => r.json().imageUrl !== undefined,
    });
    if (res.status === 204) {
      console.log('No profile image found for the user.');
    }
    sleep(1);
  });
}
