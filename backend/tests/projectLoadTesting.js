import { check, group, sleep } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

// Define custom metrics for tracking response times
let responseTimeTrend = new Trend('response_time');
// Base URL for the server
const BASE_URL = 'http://localhost:5000/projectRoutes';
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2Y4NDBhNTA1MjRkNWEwNDMzZjQzYSIsImVtYWlsIjoiYWF2aWppdC5tYWxpay5ncmFwaGVAZ21haWwuY29tIiwiaWF0IjoxNzM3MDAyNTEzLCJleHAiOjE3MzcwMzg1MTN9.Qgw37dPIlxFoDCUBo8x658upyFkeFDNLN_hn533Jf00"; // Your Bearer Token

export let options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
    //Fetch All Users
    group('Fetch All Users', function () {
        const fetchAllUsersResponse = http.get(
        `${BASE_URL}/fetch-all-users`,
        { headers: { 'Authorization': `Bearer ${TOKEN}` } }
        );

        check(fetchAllUsersResponse, {
        'Successfully fetched all users': (r) => r.status === 200,
        });

        responseTimeTrend.add(fetchAllUsersResponse.timings.duration);
        sleep(1);
    });

    //Fetch All Task Users
    group('Fetch All Task Users', function () {
        const userId = '677f840a50524d5a0433f43a'; // Example of an existing user ID in your database
        const startDate = '2025-01-01';

        const fetchAllTaskUsersResponse = http.get(
        `${BASE_URL}/fetch-all-task-users?user_id=${userId}&start_date=${startDate}`,
        { headers: { 'Authorization': `Bearer ${TOKEN}` } }
        );

        check(fetchAllTaskUsersResponse, {
        'Successfully fetched all task users': (r) => r.status === 200,
        });

        responseTimeTrend.add(fetchAllTaskUsersResponse.timings.duration);
        sleep(1);
    });
    
    //Add Project
    group('Add Project', function () {
        const addProjectData = {
        "project_name": "New Marketing Campaign Test",
        "brand_id": "677f8a46cfa75137f2baa4eb",
        "start_date": "2025-02-01T00:00:00Z",
        "end_date": "2025-05-01T00:00:00Z",
        "description": "This is a new marketing campaign for the upcoming season.",
        "priority": "High",
        "lead_id": "677fd944a2e0cb7c7b387f4c",  
        "project_files": "https://example.com/files/campaign-plan.pdf",  
        "member_id": [
            "677fd97bf4dcdc457e665286", 
            "677f840a50524d5a0433f43a"
        ]
        };

        const addProjectResponse = http.post(
        `${BASE_URL}/add-project`,
        JSON.stringify(addProjectData),
        {
            headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
            }
        }
        );

        check(addProjectResponse, {
        'Successfully added project': (r) => r.status === 201,
        });

        responseTimeTrend.add(addProjectResponse.timings.duration);
        sleep(1);
    });

    //Edit Project
    group('Edit Project', function () {
        const editProjectData = {
        "project_name": "Updated Marketing Campaign test",
        "brand_id": "60b1f5e9b9e4f5c8c8e3c9c1",  
        "start_date": "2025-03-01T00:00:00Z",
        "end_date": "2025-06-01T00:00:00Z",
        "description": "This is the updated description for the marketing campaign.",
        "priority": "Medium",
        "lead_id": "60b1f5e9b9e4f5c8c8e3c9c2",
        "project_files": "https://example.com/files/updated-campaign-plan.pdf", 
        "member_id": [
            "60b1f5e9b9e4f5c8c8e3c9c4"
        ]
        };

        const projectId = '67850f35d096b36a11d2ecd3';
        const editProjectResponse = http.put(
        `${BASE_URL}/edit-project/${projectId}`,
        JSON.stringify(editProjectData),
        {
            headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
            }
        }
        );
        check(editProjectResponse, {
        'Successfully updated project': (r) => r.status === 200,
        });
        responseTimeTrend.add(editProjectResponse.timings.duration);
        sleep(1);
    });

    //Fetch Project by ID
    group('Fetch Project by ID with Aggregation', function () {
    const projectId = '6780f662e3bff1be9cc3e66e';
    // Send the HTTP GET request to fetch the project by ID
    const projectDetailsResponse = http.get(
        `${BASE_URL}/projects/${projectId}`,
        {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
            },
        }
    );
    // Check if the response status is 200 OK
    check(projectDetailsResponse, {
        'Successfully fetched project details': (r) => r.status === 200,
    });
    sleep(1);
    });

    //Search Projects by Brand Name
    group('Search Projects by Brand Name', function () {
        const brandName = 'Brand A';
        const projectSearchResponse = http.get(
            `${BASE_URL}/projects-by-brand?brand_name=${brandName}`,
            {
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                },
            }
        );
        check(projectSearchResponse, {
            'Successfully fetched projects by brand name': (r) => r.status === 200,
        });
        sleep(1);
    });


    // Fetch All Projects with Pagination and Filters
    group('Fetch All Projects with Pagination and Filters', function () {
        const page = 1;
        const limit = 10;
        const brandName = 'Brand A'; 
        const startDate = '2024-01-01';
        const endDate = '2025-01-01';

        const allProjectsResponse = http.get(
        `${BASE_URL}/all-projects?page=${page}&limit=${limit}&brand_name=${brandName}&start_date=${startDate}&end_date=${endDate}`,
        {
            headers: {
            'Authorization': `Bearer ${TOKEN}`,
            }
        }
        );

        check(allProjectsResponse, {
        'Successfully fetched all projects': (r) => r.status === 200,
        });

        responseTimeTrend.add(allProjectsResponse.timings.duration);
        sleep(1);
    });
    
    // // // Fetch Projects by User with Pagination and Filters
    group('Fetch Projects by User with Pagination and Filters', function () {
        const userId = '677f840a50524d5a0433f43a'; // Example user ID based on the project data
        const page = 1;
        const limit = 10;
        const brandName = 'Brand C'; 
        const endDate = '2025-01-31';

        const projectsByUserResponse = http.get(
        `${BASE_URL}/projects/user/${userId}?page=${page}&limit=${limit}&brand_name=${brandName}&end_date=${endDate}`,
        {
            headers: {
            'Authorization': `Bearer ${TOKEN}`,
            }
        }
        );

        check(projectsByUserResponse, {
        'Successfully fetched projects for user': (r) => r.status === 200,
        });

        responseTimeTrend.add(projectsByUserResponse.timings.duration);
        sleep(1);
    });
    
   

    //Create or Update Project User Role
    group('Create or Update Project User Role', function () {
        const requestData = {
            id: "67851915af5b1f4079e2deb3",  
            project_role_name: "Senior Project Manager test in k6",
            description: "Responsible for overseeing multiple projects."
          };
        const url = `${BASE_URL}/project-user-role`;
        // Make the POST request to create or update the role
        const response = http.post(url, JSON.stringify(requestData), {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        // Check if the response is successful
        check(response, {
          'Role created or updated successfully': (r) => r.status === 200 || r.status === 201,
        });
        // Optionally check the message in the response body
        if (response.status === 200 || response.status === 201) {
          check(response, {
            'Response contains success message': (r) => r.body.includes('Role'),
          });
        }
        sleep(1);
      });

    //View All Project User Roles
    group('View All Project User Roles', function () {
        const response = http.get(`${BASE_URL}/viewproject-user-role`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
            },
        });
        check(response, {
            'Successfully fetched project user roles': (r) => r.status === 200,
        });
        sleep(1); 
    });


    // Group for updating an existing brand
    group('Update Brand', function () {
        const requestDataUpdate = {
            brand_id: "677f8a46cfa75137f2baa4e9", 
            brand_name: "Update brand k6 load test" 
        };
        const response = http.post(`${BASE_URL}/AddeditBrands`, JSON.stringify(requestDataUpdate), {
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        }
        });
        check(response, {
        'Brand updated successfully': (r) => r.status === 200,
        });
        // Optionally check the response
        if (response.status === 200) {
        check(response, {
            'Response contains updated brand name': (r) => r.body.includes('Updated Brand Name'),
        });
        }

        // Sleep to simulate real user behavior
        sleep(1);
    });

    // //Fetch All Brands
    group('Fetch All Brands', function () {
        // Send the GET request to fetch all brands
        const response = http.get(`${BASE_URL}/fetchallbrands`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
            },
        });
        check(response, {
            'Successfully fetched all brands': (r) => r.status === 200,
        });
        sleep(1);
    });

    // Define the request payload for adding tasks
    const requestData = {
        tasks: [
        {
            user_id: "677f840a50524d5a0433f43a", 
            project_id: "6780f662e3bff1be9cc3e66e", 
            brand_id: "677f8a46cfa75137f2baa4e9", 
            task_name: "Task 1",
            task_description: "Description for Task 1",
            task_startdate: "2025-01-15T00:00:00Z", 
            task_deadline: "2025-01-20T00:00:00Z",
            task_type: "Graphe",
            priority: "High"
        }
        ]
    };

    // Group to add tasks
    group('Add Tasks', function () {
        const response = http.post(`${BASE_URL}/add-tasks`, JSON.stringify(requestData), {
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        }
        });
        check(response, {
        'Task created successfully': (r) => r.status === 201,
        });
        if (response.status === 201) {
        check(response, {
            'Response contains task name': (r) => r.body.includes('Task 1'),
        });
        }
        sleep(1);
    });


    
    // Group for updating the task status and positions
    group('Update Task Status and Position', function () {
    const data = {
        task_id: "6785219cc9bc10a4e05bc359",
        new_column: "Completed",
        new_position: 1,
        user_id: "677f840a50524d5a0433f43a"
        };
    // Send PUT request to update task status
    const response = http.put(`${BASE_URL}/update-task-status`, JSON.stringify(data), {
        headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        }
    });
    check(response, {
        'Task status and position updated successfully': (r) => r.status === 200,
    });
    if (response.status === 200) {
        check(response, {
        'Response message contains success': (r) => r.body.includes('Task status and positions updated successfully'),
        });
    }
    if (response.status === 400 || response.status === 500) {
        check(response, {
        'Error message': (r) => r.body.includes('Failed to update task status and positions'),
        });
    }
    sleep(1);
    });

      
    // Group for updating task deadline
    group('Update Task Deadline', function () {
        const updateTaskDeadlineData = {
            task_id: '6780f7b4ccbea45c3e73334f', 
            new_deadline: '2025-02-20', 
        };
        const updateTaskDeadlineResponse = http.put(`${BASE_URL}/update-task-deadline`, JSON.stringify(updateTaskDeadlineData), {
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
        },
        });

        // Check if the task deadline was updated successfully
        check(updateTaskDeadlineResponse, {
        'Task deadline updated successfully': (r) => r.status === 200,
        });
    });

    //Group for fetching tasks for the Kanban board
    group('Fetch Tasks for Kanban Board', function () {
        const data = {
          user_id: '677f840a50524d5a0433f43a', 
          brand_id: '677f8a46cfa75137f2baa4e9',
          start_date: '2025-01-01', 
          end_date: '2025-01-14',
        };
        const kanbanBoardFetchResponse = http.get(`${BASE_URL}/tasks/kanban`, {
          params: data,
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
          },
        });
        check(kanbanBoardFetchResponse, {
          'Tasks fetched for Kanban board successfully': (r) => r.status === 200,
        });
        sleep(1);
      });



    //Fetch Specific Task
    group('Fetch Specific Task', function () {
    let taskId = '6780f7b4ccbea45c3e73334f'
    const response = http.get(`${BASE_URL}/fetchspecifictask/${taskId}`, {
        headers: {
        'Authorization': `Bearer ${TOKEN}`,
        }
    });
    check(response, {
        'Task fetched successfully': (r) => r.status === 200,
    });
    if (response.status === 200) {
        check(response, {
        'Response contains task ID': (r) => r.body.includes(taskId),
        'Response contains task name': (r) => r.body.includes('task_name'),
        'Response contains assignee details': (r) => r.body.includes('assignee'),
        });
    }
    if (response.status === 404) {
        check(response, {
        'Task not found message': (r) => r.body.includes('Task not found'),
        });
    }
    sleep(1); 
    });



    // Group to fetch task for editing by its ID
    group('Fetch Task For Edit', function () {
        const taskId = '6780f7b4ccbea45c3e73334f';
        const response = http.get(`${BASE_URL}/fetchtaskforedit/${taskId}`, {
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
        }
        });
        check(response, {
        'Task fetched successfully': (r) => r.status === 200,
        });
        if (response.status === 200) {
        check(response, {
            'Response contains task ID': (r) => r.body.includes(taskId),
            'Response contains task name': (r) => r.body.includes('task_name'),
            'Response contains assignee details': (r) => r.body.includes('assignee'),
            'Response contains project details': (r) => r.body.includes('project'),
            'Response contains brand details': (r) => r.body.includes('brand'),
        });
        }
        if (response.status === 404) {
        check(response, {
            'Task not found message': (r) => r.body.includes('Task not found'),
        });
        }
        sleep(1);
    });
    

    // Group to fetch subtask for editing by its ID
    group('Fetch Subtask For Edit', function () {
        let subtaskId = '6784dcf8d34ee6a396aee6eb'; 
      const response = http.get(`${BASE_URL}/fetchsubtaskforedit/${subtaskId}`, {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
        }
      });
      check(response, {
        'Subtask fetched successfully': (r) => r.status === 200,
      });
      if (response.status === 200) {
        check(response, {
          'Response contains subtask ID': (r) => r.body.includes(subtaskId),
          'Response contains subtask name': (r) => r.body.includes('subtask_name'),
          'Response contains task details': (r) => r.body.includes('task'),
          'Response contains project details': (r) => r.body.includes('project'),
          'Response contains brand details': (r) => r.body.includes('brand'),
        });
      }
      if (response.status === 404) {
        check(response, {
          'Subtask not found message': (r) => r.body.includes('No subtask found'),
        });
      }
      sleep(1); 
    });
    

    
    // Group for duplicating the task
    group('Duplicate Task', function () {
        const data = {
            task_id: "6780f7b4ccbea45c3e73334f", 
            task_startdate: "2025-01-15T00:00:00Z", 
            task_deadline: "2025-01-20T00:00:00Z", 
            task_user_id: "677f840a50524d5a0433f43a" 
            };
        const response = http.post(`${BASE_URL}/duplicate-task`, JSON.stringify(data), {
            headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
            }
        });
        check(response, {
            'Task duplicated successfully': (r) => r.status === 201,
        });
        if (response.status === 201) {
            check(response, {
            'Response contains task ID': (r) => r.body.includes('task_id'),
            'Response contains task name': (r) => r.body.includes('task_name'),
            });
        }
        if (response.status === 500) {
            check(response, {
            'Error message': (r) => r.body.includes('Error duplicating task'),
            });
        }
        sleep(1);
    });


    //Edit Task
    group('Edit Task', function () {
        const task_id = '6780f7b4ccbea45c3e73334f';
        const payload = JSON.stringify({
        task_name: 'Updated Task Name',
        task_description: 'Updated task description',
        task_startdate: '2025-01-15T10:00:00Z',
        task_deadline: '2025-01-20T10:00:00Z',
        status: 'InProgress',
        priority: 'High',
        is_active: true,
        });
        
        const params = {
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
        },
        };
        const res = http.put(`${BASE_URL}/edit-task/${task_id}`, payload, params);
        check(res, {
        'Task updated successfully': (r) => r.status === 200,
        });
    });

    group('Add Subtask', function () {
        const payload = JSON.stringify({
          subtask_name: "Design Homepage",
          task_id: "678539a6d70fa903e2f9b2fe",  
          project_id: "678538e9d70fa903e2f9b2f6", 
          brand_id: "6785393fd70fa903e2f9b2fd", 
          project_role_id: "678539d9d70fa903e2f9b2ff",
          sub_task_description: "Create the layout and design for the homepage of the website.",
          sub_task_startdate: "2025-01-15",
          sub_task_deadline: "2025-01-20",
          sub_task_user_id: "678539e9d70fa903e2f9b2f0",
          missed_deadline: false,
          status: "Created",
          priority: "High",
          is_active: true,
          on_hold: false,
          priority_flag: "Priority"
        });
    
        const params = {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
        };
    
        // Send POST request to create a subtask
        const res = http.post(`${BASE_URL}/subtask_add`, payload, params);
    
        // Check if the response status is 201 (Created)
        check(res, {
          'Subtask created successfully': (r) => r.status === 201,
        });
    

    
        // Simulate a short delay to mimic user behavior
        sleep(1);
      });


    //Test PUT /api/subtasks/:subtask_id (Update Subtask)
    group('Update Subtask', function () {
        const subtask_id = '6784dcf8d34ee6a396aee6eb';
        const payload = JSON.stringify({
          subtask_name: "Update Design Layout",
          sub_task_description: "Refine the design layout for better UX.",
          sub_task_startdate: "2025-01-18",
          sub_task_deadline: "2025-01-25",
          sub_task_user_id: "6785393fd70fa903e2f9b2fd",
          missed_deadline: false,
          status: "InProgress",
          priority: "High",
          is_active: true,
          on_hold: false,
          priority_flag: "Priority"
        });
        const params = {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
          },
        };
        // Send PUT request to update the subtask
        const res = http.put(`${BASE_URL}/subtask_edit/${subtask_id}`, payload, params);
        check(res, {
          'Subtask updated successfully': (r) => r.status === 200,
        });
    

    
        // Simulate a short delay to mimic user behavior
        sleep(1);
      });

    //Test GET /api/task-logs/:task_id (Get Task Logs)
    group('Get Task Logs', function () {
        const task_id = '6780f7b4ccbea45c3e73334f';
        const params = {
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
        },
        };
        const res = http.get(`${BASE_URL}/task-logs/${task_id}`, params);
        check(res, {
        'Task logs retrieved successfully': (r) => r.status === 200,
        });
    });


    //Fetch all tasks for a project
    group('Fetch Project All Tasks', function () {
        const projectId = '6780f662e3bff1be9cc3e66e';
        const fetchProjectTasksResponse = http.get(
        `${BASE_URL}/fetch-project-all-tasks?project_id=${projectId}`,
        {
            headers: { Authorization: `Bearer ${TOKEN}` },
        }
        );
        check(fetchProjectTasksResponse, {
        'Successfully fetched project tasks': (r) => r.status === 200,
        });
        sleep(1);
    });
    
    //Fetch tasks for the current week with priority flag "Priority"
    group('Fetch Weekly Priority Tasks', function () {
        const fetchWeeklyPriorityResponse = http.get(
        `${BASE_URL}/tasks/weekly-priority`,
        {
            headers: { Authorization: `Bearer ${TOKEN}` },
        }
        );
        check(fetchWeeklyPriorityResponse, {
        'Successfully fetched weekly priority tasks': (r) => r.status === 200,
        });
        sleep(1);
    });
    
    //Get categorized tasks for a specific user
    group('Fetch Categorized Tasks for User', function () {
        const userId = '677f840a50524d5a0433f43a';
        const fetchCategorizedTasksResponse = http.get(
        `${BASE_URL}/tasks/categorized/${userId}`,
        {
            headers: { Authorization: `Bearer ${TOKEN}` },
        }
        );
        check(fetchCategorizedTasksResponse, {
        'Successfully fetched categorized tasks for user': (r) => r.status === 200,
        });
        sleep(1);
    });

    //Fetch brand task summary
    group('Fetch Brand Task Summary', function () {
        const fetchBrandTaskSummaryResponse = http.get(
        `${BASE_URL}/brand-task-summary`,
        {
            headers: { Authorization: `Bearer ${TOKEN}` },
        }
        );
        check(fetchBrandTaskSummaryResponse, {
        'Successfully fetched brand task summary': (r) => r.status === 200,
        });
        sleep(1);
    });
    
    //Fetch user task summary
    group('Fetch User Task Summary', function () {
        const fetchUserTaskSummaryResponse = http.get(
        `${BASE_URL}/user-task-summary`,
        {
            headers: { Authorization: `Bearer ${TOKEN}` },
        }
        );
        check(fetchUserTaskSummaryResponse, {
        'Successfully fetched user task summary': (r) => r.status === 200,
        });
        sleep(1);
    });
    
    //Fetch specific user task summary
    group('Fetch Specific User Task Summary', function () {
        const userId = '677f840a50524d5a0433f43a'; 
        const fetchSpecificUserTaskSummaryResponse = http.get(
        `${BASE_URL}/specific-user-task-summary?user_id=${userId}`,
        {
            headers: { Authorization: `Bearer ${TOKEN}` },
        }
        );
        check(fetchSpecificUserTaskSummaryResponse, {
        'Successfully fetched specific user task summary': (r) => r.status === 200,
        });
        sleep(1);
    });
}
