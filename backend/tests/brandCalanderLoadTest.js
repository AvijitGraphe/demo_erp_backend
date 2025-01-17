import http from 'k6/http';
import { check, group, sleep } from 'k6';

// url and auth token
const BASE_URL = 'http://localhost:5000/brandingRoutes';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ODYwZjBiNzE1N2I4Mjg3MWI4NWUwNCIsImVtYWlsIjoid2l4QGdtYWlsLmNvbSIsImlhdCI6MTczNjg1ODU3OSwiZXhwIjoxNzM2ODk0NTc5fQ.biOP9b94mnpo63DSfGk8gTavsUeBKSZZXpEIFM3euIQ';  // Replace with your actual auth token

// Test setup
export const options = {
  stages: [
    { duration: '30s', target: 10 }, 
    { duration: '1m', target: 10 }, 
    { duration: '30s', target: 0 },  
  ],
};

export default function () {
  // Add event to the calendar (POST /brand-calendar)
  group('POST /brand-calendar', () => {
    const postPayload = JSON.stringify({
      brand_calander_id: '',
      brand_id: '677f8a46cfa75137f2baa4e9',
      event_name: 'New Event',
      event_date: '2025-02-25',
      event_status: 'Pending',
      event_color: '#FF5733',
    });
    const postParams = {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };
    const postRes = http.post(`${BASE_URL}/brand-calendar`, postPayload, postParams);
    check(postRes, {
      'POST request was successful': (res) => res.status === 200,
      'Event saved successfully': (res) => res.json('message') === 'Event saved successfully.',
    });
  });

  // Get brand calendar events (GET /brand-calendar)
  group('GET /brand-calendar', () => {
    const getParams = {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    };
    const startDate = '2025-01-01';
    const endDate = '2025-12-31';
    const getRes = http.get(`${BASE_URL}/brand-calendar?start_date=${startDate}&end_date=${endDate}`, getParams);
    check(getRes, {
      'GET request was successful': (res) => res.status === 200,
      'Response contains events': (res) => res.json().length > 0,
    });
  });

  // Get brand calendar events
  group('GET /brand-calendar/events', () => {
    const getParams = {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    };
    const startDate = '2025-01-01';
    const endDate = '2025-12-31';
    const getRes = http.get(`${BASE_URL}/brand-calendar/events?startDate=${startDate}&endDate=${endDate}`, getParams);
    check(getRes, {
      'GET events request was successful': (res) => res.status === 200,
      'Response contains events': (res) => res.json('events').length > 0,
    });
  });

  sleep(1);
}
