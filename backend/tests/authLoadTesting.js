import http from 'k6/http';
import { check, sleep, group } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },   
        { duration: '10s', target: 0 },   
    ],
};

let BASE_URL = "http://localhost:5000";

// Generate the role name only once when the test starts
const roleName = `Data Admin`;

export default function () {
    // User Login
    group('User Login', function () {
        const loginResponse = http.post(`${BASE_URL}/authentication/login`, JSON.stringify({
            email: 'thegeraphe@example.com', 
            password: '123456',
        }), {
            headers: { 'Content-Type': 'application/json' },
        });

        // Check if login was successful
        check(loginResponse, {
            'Login successful': (r) => r.status === 200,
            'Login failed (Bad credentials)': (r) => r.status === 400,
        });

        if (loginResponse.status === 200) {
            const token = loginResponse.json('accessToken');
            group('User Status', function () {
                const statusResponse = http.get(`${BASE_URL}/authentication/status`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                // Check if the status request was successful
                check(statusResponse, {
                    'Status Success': (r) => r.status === 200,
                    'Unauthorized (Token issue)': (r) => r.status === 401,
                });
            });
        } else {
            console.error('Login failed. Skipping status check.');
        }
    });

    // Create Roles
    group('Create Roles', function() {
        const roleData = {
            role_name: 'backend developer10',
        };

        const roleResponse = http.post(`${BASE_URL}/roles`, JSON.stringify(roleData), {
            headers: { 
                'Content-Type': 'application/json',
            },
        });

        // Check if the response status and messages are as expected
        check(roleResponse, {
            'Role created successfully': (r) => r.status === 201,
            'Role already exists': (r) => r.status === 400 && r.body.includes('Role already exists'),
            'Role creation failed': (r) => r.status === 400 || r.status === 500,
        });
    });

    sleep(1); 
}
