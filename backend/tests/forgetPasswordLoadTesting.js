import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { SharedArray } from 'k6/data';

// Load the list of emails from a file or generate sample data
const emails = new SharedArray('user emails', function () {
    return ['avijit.malik.graphe@gmail.com'];  
});

const baseUrl = 'http://localhost:5000'; 

export default function () {
    // Group 1: Forgot Password API
    group('Forgot Password API', function () {
        emails.forEach((email) => {
            group(`Making the request to forgot password for ${email}`, function () {
                const response = http.post(`${baseUrl}/Forgot/forgot-password`, JSON.stringify({ email }), {
                    headers: { 'Content-Type': 'application/json' },
                });
                check(response, {
                    'status is 200': (r) => r.status === 200,
                    'response contains reset link': (r) => r.body.includes('Password reset link sent to email'),
                });
                sleep(1);  
            });
        });
    });

    // Group 2: Reset Password API
    group('Reset Password API', function () {
        const tokens = ['77685c2b1752c5d519b8037c7f64b4c70b6ff25008bdb9df98011a182349661b'];  
        tokens.forEach((token) => {
            group(`Making the request to reset password with token ${token}`, function () {
                const newPassword = '123456';
    
                const response = http.post(`${baseUrl}/Forgot/reset-password/${token}`, JSON.stringify({ password: newPassword }), {
                    headers: { 'Content-Type': 'application/json' },
                });
                // Check the response as usual
                check(response, {
                    'status is 200': (r) => r.status === 200,
                    'response contains success message': (r) => r.body.includes('Password has been reset successfully'),
                });
    
                sleep(1);  
            });
        });
    });
    
}
