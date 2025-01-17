import http from 'k6/http';
import { check, group, sleep } from 'k6';

const baseUrl = 'http://localhost:5000/leaveRoutes';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM2OTIwODE0LCJleHAiOjE3MzY5NTY4MTR9.p38QuuZJ8LOS7bAjfhjrln0sapyp6zLW_VU3eBrA2IM'; // Bearer token
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

export default function () {

  // Group 1: Add Multiple Leave Types
  group('Add Multiple Leave Types', function () {
    const leaveTypes = [
      {
        name: 'Sick-Test Leave test',
        description: 'Leave for personal illness',
        total_days: 12,
        Role_id: '677f838869cab4be70d11c9d',
        accrual_type: 'YearlyAquired',
        salary_deduction: false
      },
    ];
    const payload = JSON.stringify({ leaveTypes });
    const response = http.post(`${baseUrl}/add-leave-types`, payload, { headers });
    check(response, {
      'status is 201': (r) => r.status === 201,
      'leave types added successfully': (r) => r.body.includes('Leave types added successfully'),
    });
    sleep(1);
  });

  // Group 2: Get All Leave Types
  group('Get All Leave Types', function () {
    const response = http.get(`${baseUrl}/get-all-leave-types`, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'leave types fetched': (r) => r.body.length > 0,
    });
    sleep(1);
  });

  // Group 3: Update a Leave Type
  group('Update Leave Type', function () {
    const leaveTypeId = '677fc623c9ebccb84c271776'; 
    const updatedLeaveType = {
      name: 'Updated Sick Leave',
      description: 'Updated description for sick leave',
      total_days: 15,
      Role_id: '678641c62da1c88b468e4cad', 
      accrual_type: 'YearlyAquired',
      salary_deduction: true
    };
    const payload = JSON.stringify(updatedLeaveType);
    const response = http.put(`${baseUrl}/update-leave-type/${leaveTypeId}`, payload, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'leave type updated successfully': (r) => r.body.includes('Leave type updated successfully'),
    });
    sleep(1);
  });

  // Group 4: Fetch Leave Balances by User ID
  group('Fetch Leave Balances by User ID', function () {
    const userId = '677f840a50524d5a0433f43a';
    const response = http.get(`${baseUrl}/fetch-leave-balances/${userId}`, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'leave balances fetched': (r) => r.body.length > 0,
    });
    sleep(1);
  });

  //add leave
  group('User Request Leave', function () {
    const payload = JSON.stringify({
      user_id: "677f840a50524d5a0433f43a",
      Leave_type_Id: "677fcb09b780b34c46c11522", 
      dates: ["2025-01-16", "2025-01-17"], 
      Total_days: 2,
      reason: "Medical leave",
    });
  
    group('Send Leave Request', function () {
      let res = http.post(`${baseUrl}/add-leave`, payload, { headers: headers });
      console.log('Response status:', res.status); 
      console.log('Response body:', res.body); 
      
      check(res, {
        'is status 200': (r) => r.status === 200,
        'response body contains success message': (r) => r.body.includes('Leave request added successfully and notifications sent'),
      });
      sleep(1);
    });
  });
  
  //update leave type
  group('Update Leave Type', function () {
    const leaveRequestId = '67876fb78d9375151be58545'; 
    const newLeaveTypeId = '677fcb09b780b34c46c11521';
    const payload = JSON.stringify({
      leave_request_id: leaveRequestId,
      new_leave_type_id: newLeaveTypeId,
    });
    const response = http.put(`${baseUrl}/update-leave-type`, payload, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'leave type updated successfully': (r) => r.body.includes('Leave type updated successfully'),
    });
    sleep(1);
  });
   

//delete leave
group('Delete Leave Request', function () {
    const Leave_request_id = '67876fb78d9375151be58545';
    const user_id = '677f840a50524d5a0433f43a'; 
    const payload = JSON.stringify({
      Leave_request_id: Leave_request_id,
      user_id: user_id,
    });
    const response = http.del(`${baseUrl}/delete-leave`, payload, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'leave request deleted successfully': (r) => r.body.includes('Leave request deleted successfully'),
    });
    sleep(1);
  });


//approve/reject leav requrest
  group('Update Leave Status', function () {
    const payload = JSON.stringify({
      Leave_request_id: '677fd9c5f4dcdc457e66528f', 
      Approved_By: '677fd944a2e0cb7c7b387f4c', 
      Status: 'Approved', 
      Comment: 'Leave request approved',
    });
    const response = http.put(`${baseUrl}/update-leave-status`, payload, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'Leave request updated successfully': (r) => r.body.includes('Leave request has been approved successfully'),
    });
    sleep(1); 
  });

  // Group 2: Get Leave Requests by Status
  group('Get Leave Requests by Status', function () {
    const response = http.get(`${baseUrl}/leave-requests-by-status?start_date=2025-01-01&end_date=2025-01-15`, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'Response contains leave requests': (r) => r.body.includes('Pending') || r.body.includes('Approved') || r.body.includes('Rejected'),
    });

    sleep(1); // Sleep for 1 second before next request
  });

  // Group 3: Get Leave Requests by User ID
  group('Get Leave Requests by User ID', function () {
    const response = http.get(`${baseUrl}/leave-requests/user/677f840a50524d5a0433f43a?start_date=2025-01-01&end_date=2025-01-15`, { headers });

    check(response, {
      'status is 200': (r) => r.status === 200,
      'Response contains leave requests': (r) => r.body.includes('Pending') || r.body.includes('Approved') || r.body.includes('Rejected'),
    });

    sleep(1); // Sleep for 1 second before next request
  });

  // Group 4: Fetch User Leave Balances
  group('Fetch User Leave Balances', function () {
    const userId = '677f840a50524d5a0433f43a'; 
    
    // Send GET request
    const response = http.get(`${baseUrl}/fetch-user-leave-balances/${userId}`, { headers });

    // Debugging: Log the actual response to check what's returned
    console.log('Response Status:', response.status);
    console.log('Response Body:', response.body);
    check(response, {
      'status is 200': (r) => r.status === 200,
      'Response contains leave balances': (r) => r.body.includes('earned_days'),  // This checks if the response contains earned_days
    });
    sleep(1);
  });

  // Group 5: Fetch All Users
  group('Fetch All Users', function () {
    const response = http.get(`${baseUrl}/fetch-all-users`, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'Response contains users': (r) => r.body.includes('first_name') && r.body.includes('last_name'),
    });
    sleep(1); // Sleep for 1 second before next request
  });

  // Group 6: Update Arrear Days
  group('Update Arrear Days', function () {
    const payload = JSON.stringify({
      leave_balance_id: '677fcb09b780b34c46c1152b',  // Example leave balance ID
      arrear_days: 5,  // Example arrear days value
    });

    const response = http.put(`${baseUrl}/update-arrear-days`, payload, { headers });
    check(response, {
      'status is 200': (r) => r.status === 200,
      'Arrear days updated successfully': (r) => r.body.includes('Arrear days updated successfully'),
    });

    sleep(1); // Sleep for 1 second before next request
  });

  // Group 7: Fetch All Leave Balances for Adjustment
  group('Fetch All Leave Balances for Adjustment', function () {
    const response = http.get(`${baseUrl}/fetch-all-leave-balances-for-adjustment`, { headers });

    // Log the response status and body for debugging
    console.log('Response Status:', response.status);
    console.log('Response Body:', response.body);

    let responseBody;
    try {
      responseBody = JSON.parse(response.body);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
    }

    // Check if the response contains the leave balance data
    check(response, {
      'status is 200': (r) => r.status === 200,
      // Adjust the check to allow empty leaveBalances object
      'Response contains leave balance data': (r) => {
        const hasLeaveBalances = responseBody &&
          responseBody.data &&
          Array.isArray(responseBody.data) &&
          responseBody.data.length > 0 &&
          responseBody.data[0].leaveBalances !== undefined;
          
        return hasLeaveBalances;
      },
    });
    sleep(1); // Sleep for 1 second before next request
  });

}
