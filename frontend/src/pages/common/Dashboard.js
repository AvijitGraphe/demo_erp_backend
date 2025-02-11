import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/PrivateRoute';
import Navbar from '../navbar/Navbar'; // Adjust this to the correct Navbar component path
import { useAuth } from '../../context/AuthContext';
import { Container } from 'react-bootstrap';
import Admin_dash from '../../pages/admin/Admin_dash';
import Employee_dash from '../../pages/employee/Employee_dash';
import Hr_dash from '../../pages/hr/Hr_dash';
//import Taskm_dash from '../../pages/task_manager/Taskm_dash';
import Letter_template from '../../pages/admin/Letter_template';
import Employee_report from '../../pages/admin/Employee_report';
import Verify_employee from '../../pages/admin/Verify_employee';
import Update_designation from '../../pages/admin/Update_designation';
import Fullcalendar from '../../pages/common/Fullcalendar';
// import Add_holiday from '../../pages/common/Add_holiday';
import Employee_list from '../../pages/common/Employee_list';
import All_leaves from '../../pages/common/All_leaves';
import Overtime from '../../pages/common/Overtime';

import ProfileDetails from './Profiledetails';

import Add_projects from '../../pages/common/Add_projects';
import All_projects from '../../pages/common/All_projects';
import Project_details from '../../pages/common/Project_details';
import Taskboard_admin from '../../pages/taskboard/Taskboard_admin';
import Add_task_role from '../../pages/taskboard/Add_task_role';
import Task_log from '../../pages/taskboard/Task_log';
import Daily_task from '../../pages/taskboard/Daily_task';
import Dailytask_employee from '../../pages/employee/Dailytask_employee';
import EmployeeEdit from './EmployeeEdit';
import EditProject from './EditProject';
import Addtask from './Addtask';
import ViewTask from '../taskboard/ViewTask';
import Employmentletter from '../admin/Employmentletter';
import EditEmploymentletter from '../admin/EditEmploymentletter';
import EmployeeOvertime from '../employee/EmployeeOvertime';
import Leave_apply from '../../pages/employee/Leave_apply';
import Download_doc from '../employee/Download_doc';
import Notification from '../../pages/common/Notification';
import Add_leavetype from '../admin/Add_leavetype';
import Add_policy from '../../pages/hr/Add_policy';
import Employee_rep from '../employee/Employee_rep';
import Add_leavebalance from '../admin/Add_leavebalance';
import Brand_calender from '../admin/Brand_calender';
import Employee_salary_list from '../salary_list/Employee_salary_list';
import Generate_payslip from '../salary_list/Generate_payslip';
import Exemployee from '../employee/Exemployee';
import Send_letter from '../admin/Send_letter';
import Ticket_list_admin from '../tickets/Ticket_list_admin';
import Ticket_details from '../tickets/Ticket_details';
import Ticket_list_employee from '../tickets/Ticket_list_employee';
import Send_letter_list from '../admin/Send_letter_list';
import Reg_template_view from '../admin/Reg_template_view';
import ResignationTable from '../admin/Resignation_list';
import ResignationEmployee from '../employee/ResignationEmployee';
import Client_list from '../clients/Client_list';
import Edit_client from '../clients/Edit_client';
import View_client from '../clients/View_client';
import Expenses from '../accounts/Expenses';
import Add_invoice from '../accounts/Add_invoice';
import Invoice_list from '../accounts/Invoice_list';

import ExpireUser from '../admin/ExpireUser';

const Dashboard = () => {
  const { role: initialRole } = useAuth(); 
  const [role, setRole] = useState(initialRole);

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  return (
    <Container fluid className="wrapper p-0">
      <Navbar role={role} /> 
      <Routes>
        <Route path="Admin" element={<ProtectedRoute element={Admin_dash} allowedRoles={['Admin', 'Founder','SuperAdmin']} />} />
        <Route path="employee" element={<ProtectedRoute element={Employee_dash} allowedRoles={['Employee', 'Social_Media_Manager','Task_manager','Department_Head']} />} />
        <Route path="hr" element={<ProtectedRoute element={Hr_dash} allowedRoles={['HumanResource']} />} />
        <Route path="exemployee" element={<ProtectedRoute element={Exemployee} allowedRoles={['Ex_employee']} />} />
        {/* <Route path="task_manager" element={<ProtectedRoute element={Taskm_dash} allowedRoles={['Task_manager']} />} /> */}
        {/*====Inner Pages Links ======*/}
        <Route path="profiledetails" element={<ProtectedRoute element={ProfileDetails} allowedRoles={['SuperAdmin','Admin', 'Employee', 'Social_Media_Manager', 'HumanResource', 'Task_manager', 'Founder','Department_Head']} />} />
        <Route path="all_notifications" element={<ProtectedRoute element={Notification} allowedRoles={['SuperAdmin','Admin', 'Employee', 'Social_Media_Manager', 'HumanResource', 'Task_manager', 'Founder','Department_Head']} />} />
        <Route path="associateedit/:user_id" element={<ProtectedRoute element={EmployeeEdit} allowedRoles={['SuperAdmin','Admin', 'HumanResource', 'Founder']} />}/>
        <Route path="add_view_policy" element={<ProtectedRoute element={Add_policy} allowedRoles={['SuperAdmin','Admin', 'HumanResource', 'Founder']} />}/>
        <Route path="employee_report" element={<ProtectedRoute element={Employee_report} allowedRoles={['SuperAdmin','Admin',  'HumanResource',  'Founder']} />} />
        <Route path="single_employee_report" element={<ProtectedRoute element={Employee_rep} allowedRoles={['Employee', 'Social_Media_Manager', 'Task_manager','Department_Head']} />} />
        <Route path="calendar" element={<ProtectedRoute element={Fullcalendar} allowedRoles={['SuperAdmin','Admin', 'Employee', 'Social_Media_Manager', 'HumanResource', 'Task_manager', 'Founder','Department_Head']} />} />
        <Route path="addleaves" element={<ProtectedRoute element={Add_leavetype} allowedRoles={['SuperAdmin','Admin', 'HumanResource', 'Founder']} />} />
        {/* <Route path="task_priority" element={<ProtectedRoute element={Task_priority} allowedRoles={['Admin']} />} /> */}
        <Route path="employee_list" element={<ProtectedRoute element={Employee_list} allowedRoles={['SuperAdmin','Admin', 'Employee', 'Social_Media_Manager', 'HumanResource', 'Task_manager', 'Founder','Department_Head', 'Ex_employee']} />} />
        <Route path="verify" element={<ProtectedRoute element={Verify_employee} allowedRoles={['SuperAdmin','Admin', 'HumanResource', 'Founder']} />} />
        <Route path="update_designation" element={<ProtectedRoute element={Update_designation} allowedRoles={['SuperAdmin','Admin', 'HumanResource', 'Founder']} />} />
        <Route path="all_leaves" element={<ProtectedRoute element={All_leaves} allowedRoles={['SuperAdmin','Admin', 'HumanResource', 'Founder']} />} />
        <Route path="overtime" element={<ProtectedRoute element={Overtime} allowedRoles={['SuperAdmin','Admin', 'Founder' ,'HumanResource']} />} />
        <Route path="employee-overtime" element={<ProtectedRoute element={EmployeeOvertime} allowedRoles={['SuperAdmin','Admin','Employee', 'Social_Media_Manager', 'HumanResource', 'Task_manager', 'Founder','Department_Head']} />} />
        <Route path="letter_template" element={<ProtectedRoute element={Letter_template} allowedRoles={['SuperAdmin','Admin', 'HumanResource', 'Founder']} />} />
        {/* <Route path="resignation_list" element={<ProtectedRoute element={Task_priority} allowedRoles={['Admin']} />} /> */}
        <Route path="add_projects" element={<ProtectedRoute element={Add_projects} allowedRoles={['SuperAdmin','Admin', 'HumanResource', 'Task_manager', 'Founder','Department_Head']} />} />
        <Route path="edit_project/:project_id" element={<ProtectedRoute element={EditProject} allowedRoles={['SuperAdmin','Admin', 'HumanResource', 'Task_manager', 'Founder','Department_Head']} />} />
        <Route path="all_projects" element={<ProtectedRoute element={All_projects} allowedRoles={['SuperAdmin','Admin', 'Employee', 'Social_Media_Manager', 'HumanResource', 'Task_manager', 'Founder','Department_Head']} />} />
        <Route path="projects_details/:project_id" element={<ProtectedRoute element={Project_details} allowedRoles={['SuperAdmin','Admin', 'Employee', 'Social_Media_Manager', 'HumanResource', 'Founder','Department_Head']} />} />
        <Route path="addtask" element={<ProtectedRoute element={Addtask} allowedRoles={['SuperAdmin','Admin', 'HumanResource', 'Task_manager', 'Founder','Department_Head']} />} />
        <Route path="task_board_admin" element={<ProtectedRoute element={Taskboard_admin} allowedRoles={['SuperAdmin','Admin', 'Employee', 'Social_Media_Manager', 'HumanResource', 'Task_manager', 'Founder','Department_Head']} />} />
        <Route path="view_task/:taskId" element={<ProtectedRoute element={ViewTask} allowedRoles={['SuperAdmin','Admin', 'Employee', 'Social_Media_Manager', 'HumanResource', 'Task_manager', 'Founder','Department_Head']} />} />
        <Route path="add_task_role" element={<ProtectedRoute element={Add_task_role} allowedRoles={['SuperAdmin','Admin', 'HumanResource', 'Task_manager', 'Founder']} />} />
        <Route path="project_track" element={<ProtectedRoute element={Task_log} allowedRoles={['SuperAdmin','Admin', 'Founder']} />} />
        <Route path="add_leavebalance" element={<ProtectedRoute element={Add_leavebalance} allowedRoles={['SuperAdmin','Admin', 'Founder']} />} />
        <Route path="daily_task" element={<ProtectedRoute element={Daily_task} allowedRoles={['SuperAdmin','Admin', 'HumanResource', 'Founder']} />} />
        <Route path="addemployeeletter" element={<ProtectedRoute element={Employmentletter} allowedRoles={['SuperAdmin','Admin', 'HumanResource', 'Founder']} />} />
        <Route path="editemployletter/:template_id" element={<ProtectedRoute element={EditEmploymentletter} allowedRoles={['SuperAdmin','Admin', 'HumanResource', 'Founder']} />} />
        <Route path="employee_dailytask" element={<ProtectedRoute element={Dailytask_employee} allowedRoles={['Employee', 'Social_Media_Manager','Task_manager','Department_Head']} />} />
        <Route path="leave_apply" element={<ProtectedRoute element={Leave_apply} allowedRoles={['Employee', 'Social_Media_Manager', 'Task_manager','Department_Head']} />} />
        <Route path="download_documenis" element={<ProtectedRoute element={Download_doc} allowedRoles={['Employee', 'Social_Media_Manager', 'Task_manager','Department_Head', 'Ex_employee']} />} />
        <Route path="brand_calendar" element={<ProtectedRoute element={Brand_calender} allowedRoles={['SuperAdmin','Admin', 'Founder', 'Social_Media_Manager', 'Task_manager']} />} />
        <Route path="employee_salary_list" element={<ProtectedRoute element={Employee_salary_list} allowedRoles={['SuperAdmin','Admin']} />} />
        <Route path="generate_payslip" element={<ProtectedRoute element={Generate_payslip} allowedRoles={['SuperAdmin','Admin']} />} />
        <Route path="send_letter_list" element={<ProtectedRoute element={Send_letter_list} allowedRoles={['SuperAdmin','Admin']} />} />
        <Route path="send_letter" element={<ProtectedRoute element={Send_letter} allowedRoles={['SuperAdmin','Admin']} />} />
        <Route path="ticket_list" element={<ProtectedRoute element={Ticket_list_admin} allowedRoles={['SuperAdmin','Admin','Founder']} />} />
        <Route path="reg_view_template/:resignation_id" element={<ProtectedRoute element={Reg_template_view} allowedRoles={['SuperAdmin','Admin', 'Employee', 'Social_Media_Manager', 'HumanResource', 'Task_manager', 'Founder','Department_Head']} />} />
        <Route path="resignation_list" element={<ProtectedRoute element={ResignationTable} allowedRoles={['SuperAdmin','Admin','Founder']} />} />
        <Route path="employee_resignation_list" element={<ProtectedRoute element={ResignationEmployee} allowedRoles={['SuperAdmin','Admin', 'Employee', 'Social_Media_Manager', 'HumanResource', 'Task_manager', 'Founder','Department_Head']} />} />
        <Route path="ticket_details/:ticket_id" element={<ProtectedRoute element={Ticket_details} allowedRoles={['SuperAdmin','Admin', 'Employee', 'Social_Media_Manager', 'HumanResource', 'Task_manager', 'Founder','Department_Head']} />} />
        {/*Project Management*/}
        <Route path="employee_ticket_list" element={<ProtectedRoute element={Ticket_list_employee} allowedRoles={['SuperAdmin','Admin', 'Employee', 'Social_Media_Manager', 'HumanResource', 'Task_manager', 'Founder','Department_Head']} />} />
        <Route path="client_list" element={<ProtectedRoute element={Client_list} allowedRoles={['SuperAdmin']} />} />
        <Route path="edit_client" element={<ProtectedRoute element={Edit_client} allowedRoles={['SuperAdmin']} />} />
        <Route path="view_client" element={<ProtectedRoute element={View_client} allowedRoles={['SuperAdmin']} />} />
        <Route path="expenses" element={<ProtectedRoute element={Expenses} allowedRoles={['SuperAdmin']} />} />
        <Route path="invoice_list" element={<ProtectedRoute element={Invoice_list} allowedRoles={['SuperAdmin']} />} />
        <Route path="add_invoice" element={<ProtectedRoute element={Add_invoice} allowedRoles={['SuperAdmin']} />} />
        <Route path="exp_demo_uri" element={<ProtectedRoute element={ExpireUser} allowedRoles={['SuperAdmin']} />} />
      </Routes>
    </Container>
  );
};

export default Dashboard;
