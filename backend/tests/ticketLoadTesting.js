import http from 'k6/http';
import { check, group } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = 'http://localhost:5000/ticketRoutes'; 
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM2OTIwODE0LCJleHAiOjE3MzY5NTY4MTR9.p38QuuZJ8LOS7bAjfhjrln0sapyp6zLW_VU3eBrA2IM"; // Your Bearer Token

// Create custom metrics
let ticketResponseTime = new Trend('ticket_response_time');
let updateTicketResponseTime = new Trend('update_ticket_response_time'); // Defined for update ticket
let deleteTicketResponseTime = new Trend('delete_ticket_response_time');

export default function () {

  group('Add Ticket', () => {
    const addTicketData = {
      Raiser_id: '677f840a50524d5a0433f43a', 
      subject: 'Sample Issue',
      issue: 'Description of the issue',
      category: 'Software_issue',
    };

    const addTicketHeaders = {
      Authorization: `Bearer ${token}`,
    };

    const addTicketResponse = http.post(`${BASE_URL}/addtickets`, JSON.stringify(addTicketData), {
      headers: { ...addTicketHeaders, 'Content-Type': 'application/json' },
    });

    ticketResponseTime.add(addTicketResponse.timings.duration);

    check(addTicketResponse, {
      'Ticket added successfully': (r) => r.status === 201,
    });
  });

  group('Update Ticket', () => {
    const ticketId = '6784e8e0c0ffa380569e94b3'; // The ticket ID to update
    const requestBody = {
      status: 'Solved',
      remarks: 'Ticket resolved successfully',
      user_id: '677fd944a2e0cb7c7b387f4c', // Resolver ID
    };

    const updateTicketHeaders = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const updateTicketResponse = http.put(
      `${BASE_URL}/tickets/${ticketId}`,
      JSON.stringify(requestBody),
      { headers: updateTicketHeaders }
    );

    updateTicketResponseTime.add(updateTicketResponse.timings.duration); // Tracking response time for update

    check(updateTicketResponse, {
      'Ticket updated successfully': (r) => r.status === 200,
    });
  });

  group('Fetch All Tickets', () => {
    const fetchAllTicketsHeaders = {
      Authorization: `Bearer ${token}`,
    };

    const fetchAllTicketsResponse = http.get(`${BASE_URL}/fetchalltickets`, {
      headers: fetchAllTicketsHeaders,
    });

    check(fetchAllTicketsResponse, {
      'Fetched all tickets': (r) => r.status === 200,
    });
  });

  group('Fetch Tickets by Raiser ID', () => {
    const raiserId = '677f840a50524d5a0433f43a'; // Replace with actual user ID
    const fetchTicketsByRaiserIdHeaders = {
      Authorization: `Bearer ${token}`,
    };

    const fetchTicketsByRaiserIdResponse = http.get(
      `${BASE_URL}/tickets/raiser/${raiserId}`,
      { headers: fetchTicketsByRaiserIdHeaders }
    );

    check(fetchTicketsByRaiserIdResponse, {
      'Fetched tickets for raiser': (r) => r.status === 200,
    });
  });

  group('Fetch Specific Ticket', () => {
    const ticketId = '6784e8e0c0ffa380569e94b3'; // Replace with an actual ticket ID
    const fetchSpecificTicketHeaders = {
      Authorization: `Bearer ${token}`,
    };

    const fetchSpecificTicketResponse = http.get(
      `${BASE_URL}/specificticket/${ticketId}`,
      { headers: fetchSpecificTicketHeaders }
    );

    check(fetchSpecificTicketResponse, {
      'Fetched specific ticket': (r) => r.status === 200,
    });
  });

  group('Delete Ticket', () => {
    const ticketIdToDelete = '6784e8e0c0ffa380569e94b3';  // Use the ticket ID you want to delete

    const deleteTicketHeaders = {
      Authorization: `Bearer ${token}`,
    };

    // Send DELETE request
    const deleteTicketResponse = http.del(`${BASE_URL}/tickets/${ticketIdToDelete}`, null, {
      headers: deleteTicketHeaders,
    });

    // Check the response for success and handle errors
    check(deleteTicketResponse, {
      'Ticket deleted successfully': (r) => r.status === 200,
    });

    if (deleteTicketResponse.status !== 200) {
      console.log('Delete Ticket Failed:', deleteTicketResponse.status, deleteTicketResponse.body);
    }
  });
}
