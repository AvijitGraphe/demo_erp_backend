import React, { useEffect, useState } from "react";
import { Row, Col, Breadcrumb, Card, Badge } from "react-bootstrap";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import config from "../../config";
import { useAuth } from "../../context/AuthContext";
import { Button } from "primereact/button";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import { Avatar } from 'primereact/avatar';
import { AvatarGroup } from 'primereact/avatargroup';
import { Tooltip } from "primereact/tooltip";
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import noUserImg from '../../assets/images/no_user.png'; // Placeholder for missing profile images

const All_projects = () => {
    const { accessToken, userId, role } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ brand_name: "", start_date: null, end_date: null });
    // Define allowed roles
    const allowedRoles = [
        'Founder',
        'Admin',
        'SuperAdmin',
        'HumanResource',
        'Accounts',
        'Department_Head',
        'Task_manager'
    ];

    // Fetch projects without pagination
    const fetchProjects = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${config.apiBASEURL}/projectRoutes/projects/user/${userId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {
                    brand_name: filters.brand_name,
                    start_date: filters.start_date
                        ? filters.start_date.toISOString().split("T")[0]
                        : undefined,
                    end_date: filters.end_date
                        ? filters.end_date.toISOString().split("T")[0]
                        : undefined,
                },
            });

            setProjects(data.projects);
        } catch (error) {
            console.error("Error fetching projects:", error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [filters]);

    // Handle filter change
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    // Handle Date Range Change
    const handleDateRangeChange = (start, end) => {
        handleFilterChange("start_date", start);
        handleFilterChange("end_date", end);
    };

    // Render columns
    const memberTemplate = (rowData) => (
        <AvatarGroup>
            {rowData.members.map((member) => (
                <Avatar
                    key={member.user_id}
                    image={member.profileImage?.image_url || noUserImg}
                    size="small"
                    shape="circle"
                    data-pr-tooltip={`${member.first_name} ${member.last_name}`}
                />
            ))}
            <Tooltip target=".p-avatar" />
        </AvatarGroup>
    );

    const leaderTemplate = (rowData) => (
        <div style={{ display: "flex", alignItems: "center" }}>
            <img
                src={rowData.lead.profileImage?.image_url || noUserImg}
                alt={`${rowData.lead.first_name} ${rowData.lead.last_name}`}
                style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "50%",
                    marginRight: "8px",
                }}
            />
            <span>{`${rowData.lead.first_name} ${rowData.lead.last_name}`}</span>
        </div>
    );

    const actionTemplate = (rowData) => (
        <div>
            <Button
                onClick={() => navigate(`/dashboard/projects_details/${rowData.project_id}`)}
                icon="pi pi-eye"
                className="border-0"
                outlined
                severity="help"
            />
            {allowedRoles.includes(role) && (
                <Button
                    icon="pi pi-pencil"
                    className="border-0"
                    outlined
                    severity="info"
                    onClick={() => navigate(`/dashboard/edit_project/${rowData.project_id}`)}
                />
            )}
        </div>
    );

    const getPrioritySeverity = (priority) => {
        switch (priority) {
            case 'High':
                return 'badge-danger'; // Red
            case 'Medium':
                return 'badge-warning'; // Yellow
            case 'Low':
                return 'badge-primary'; // Green
            case 'Completed':
                return 'badge-success'; // Green
            default:
                return 'badge-secondary'; // Gray
        }
    };

    return (
        <>
            <Row className="body_content">
                <Row className="mx-0">
                    <Col md={12} lg={6} className="mb-4">
                        <Breadcrumb>
                            <Breadcrumb.Item active>All Projects</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>

                    <Col md={12} lg={6} className="d-flex justify-content-end align-items-center mb-4">
                        <InputText
                            value={filters.brand_name}
                            onChange={(e) => handleFilterChange("brand_name", e.target.value)}
                            placeholder="Search by Brand Name"
                            style={{ width: "200px" }}
                        />
                        <DateRangePicker
                            initialSettings={{
                                startDate: filters.start_date ? moment(filters.start_date) : moment(),
                                endDate: filters.end_date ? moment(filters.end_date) : moment(),
                                locale: { format: "DD/MM/YYYY" },
                                ranges: {
                                    Today: [moment(), moment()],
                                    Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
                                    "Last 7 Days": [moment().subtract(6, "days"), moment()],
                                    "Last 30 Days": [moment().subtract(29, "days"), moment()],
                                    "This Month": [moment().startOf("month"), moment().endOf("month")],
                                    "Last Month": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")],
                                },
                            }}
                            onCallback={(start, end) => handleDateRangeChange(start.toDate(), end.toDate())}
                        >
                            <input
                                type="text"
                                className="form-control mx-2"
                                placeholder="Select Date Range"
                                style={{ width: "200px" }}
                            />
                        </DateRangePicker>
                        {allowedRoles.includes(role) && (
                            <Button
                                label="Project"
                                className="border-0 ms-1"
                                icon="pi pi-plus"
                                severity="help"
                                onClick={() => navigate("/dashboard/add_projects")}
                            />
                        )}
                    </Col>

                    <Col lg={12} className="mb-4">
                        <Card>
                            <Card.Body>
                                <DataTable
                                    value={projects}
                                    loading={loading}
                                    dataKey="project_id"
                                    className="p-datatable-gridlines"
                                    scrollable
                                    scrollHeight="524px" // Set the table body height
                                >
                                    <Column field="brand.brand_name" header="Brand" sortable></Column>
                                    <Column field="project_name" header="Project Name" sortable></Column>
                                    <Column
                                        field="priority"
                                        header="Priority"
                                        sortable
                                        body={(rowData) => (
                                            <span className={`badge ${getPrioritySeverity(rowData.priority)}`}>
                                                {rowData.priority}
                                            </span>
                                        )}
                                        style={{ width: "130px" }}
                                    />
                                    <Column header="Leader" body={leaderTemplate}></Column>
                                    <Column field="members" header="Members" body={memberTemplate}></Column>
                                    <Column
                                        field="end_date"
                                        header="End Date"
                                        body={(rowData) =>
                                            new Date(rowData.end_date).toLocaleDateString("en-GB")
                                        }
                                        sortable
                                    ></Column>
                                    <Column header="Actions" style={{ width: "100px" }} body={actionTemplate}></Column>
                                </DataTable>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Row>
        </>
    );
};

export default All_projects;
