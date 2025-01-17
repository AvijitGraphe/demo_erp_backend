import { check, group, sleep } from 'k6';
import http from 'k6/http';

const baseUrl = 'http://localhost:5000/resignationRoutes';  
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM2OTIwODE0LCJleHAiOjE3MzY5NTY4MTR9.p38QuuZJ8LOS7bAjfhjrln0sapyp6zLW_VU3eBrA2IM';  // Your Bearer Token

// Define the headers including the Authorization token
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

export let options = {
  stages: [
    { duration: '30s', target: 50 }, 
    { duration: '1m', target: 50 }, 
    { duration: '30s', target: 0 },  
  ],
};

export default function () {
  // Grouping the requests to simulate multiple actions
  group('Resignation API Testing', function () {
    // POST Request to Add Resignation
    group('Add Resignation', function () {
        const payload = JSON.stringify({
          user_id: '677f840a50524d5a0433f43a',
          resignation_reason: 'Personal reasons testing',
          notice_period_served: 30,
        });
        const res = http.post(`${baseUrl}/add-resignation`, payload, { headers });
        // Check if the response status is 201 (created)
        check(res, {
          'Resignation added successfully': (r) => r.status === 201,
        });
        sleep(1);
    });

   // PUT Request to Update Resignation Status
    group('Update Resignation Status', function () {
        const payload = JSON.stringify({
            status: 'Approved',
            last_working_day: '2025-01-25',
            notice_duration: 30
        });
        const res = http.put(`${baseUrl}/update-resignation-status/67878d0e30e80a0ffadb7e7e`, payload, { headers });
        check(res, {
            'Resignation status updated successfully': (r) => r.status === 200,
        });
        sleep(1);
    });

    //GET Request to Fetch All Resignations
    group('Fetch All Resignations', function () {
      const res = http.get(`${baseUrl}/fetch-all-resignations`, { headers });
      check(res, {
        'Resignations fetched successfully': (r) => r.status === 200,
      });
      sleep(1);
    });


    //resigantion
    group('Fetch Specific Resignation', function () {
        let resignationId= '67878d0d30e80a0ffadb7e7a'
        const res = http.get(`${baseUrl}/fetch-specific-resignation/${resignationId}`, { headers });
        check(res, {
          'Resignation fetched successfully': (r) => r.status === 200,
        });
        sleep(1);
    });
    
    //DELETE Request to Delete Resignation
    group('Delete Resignation API - Status Check', function () {
        const res = http.del(`${baseUrl}/delete-resignation/67878d0f30e80a0ffadb7e82`, null, { headers });
        check(res, {
            'Resignation cannot be deleted due to status': (r) => r.status === 400,
            'Correct error message returned': (r) => r.body.includes('Only resignations with status "Pending" can be deleted.')
        });
        sleep(1); 
    });

});
}
