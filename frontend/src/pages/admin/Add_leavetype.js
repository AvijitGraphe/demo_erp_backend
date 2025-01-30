import React, { useState, useEffect } from "react";
import { Col, Row, Card, Table, Form, Breadcrumb } from "react-bootstrap";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import axios from "axios";
import "../../assets/css/notification.css";
import { useAuth } from "../../context/AuthContext";
import config from "../../config";

const AddLeaveType = () => {
  const { accessToken } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [roles, setRoles] = useState([]); // To store roles from API
  const [selectedRoles, setSelectedRoles] = useState([]); // For multi-select
  const [leaveTypes, setLeaveTypes] = useState([]); // To store leave types from API
  const [editingLeave, setEditingLeave] = useState(null); // Track leave type being edited
  const [formData, setFormData] = useState({
    name: "",
    total_days: "",
    description: "",
    accrual_type: "",
    salary_deduction: false, // New field for salary deductions
  });

  const accrualOptions = [
    { label: "Monthly Acquired", value: "MonthlyAquired" },
    { label: "Yearly Acquired", value: "YearlyAquired" },
  ];

  // Toggle form visibility
  const toggleForm = () => {
    setShowForm(!showForm);
    resetForm();
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${config.apiBASEURL}/promotion/allroles`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setRoles(response.data.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Fetch all leave types
  const fetchLeaveTypes = async () => {
    try {
      const response = await axios.get(`${config.apiBASEURL}/leaveRoutes/get-all-leave-types`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setLeaveTypes(response.data || []);
    } catch (error) {
      console.error("Error fetching leave types:", error);
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value, // Handle checkbox input
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingLeave && selectedRoles.length === 0) {
      alert("Please select at least one role.");
      return;
    }

    if (!formData.accrual_type) {
      alert("Please select an accrual type.");
      return;
    }
    try {
      if (editingLeave) {
        // Update existing leave type
        await axios.put(
          `${config.apiBASEURL}/leaveRoutes/update-leave-type/${editingLeave._id}`,
          {
            ...formData,
            Role_id: editingLeave.role._id, 
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      } else {
        // Add new leave types
        const payload = selectedRoles.map((role) => ({
          ...formData,
          Role_id: role._id,
        }));
        await axios.post(
          `${config.apiBASEURL}/leaveRoutes/add-leave-types`,
          { leaveTypes: payload },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
      fetchLeaveTypes(); 
      setShowForm(false); // Hide form
      resetForm(); // Reset form data
    } catch (error) {
      console.error("Error saving leave type:", error);
    }
  };





  // Edit leave type
  const handleEdit = (leaveType) => {    
    setEditingLeave(leaveType);
    setFormData({
      name: leaveType.name,
      total_days: leaveType.total_days,
      description: leaveType.description || "",
      accrual_type: leaveType.accrual_type, // Set accrual type
      salary_deduction: leaveType.salary_deduction || false, // Set salary deductions
    });
    setShowForm(true);
  };

  // Reset form data
  const resetForm = () => {
    setEditingLeave(null);
    setFormData({
      name: "",
      total_days: "",
      description: "",
      accrual_type: "",
      salary_deduction: false,
    });
    setSelectedRoles([]);
  };

  // Fetch data on component load
  useEffect(() => {
    fetchRoles();
    fetchLeaveTypes();
  }, []);

  return (
    <>
      <Row className="body_content">
        <Row className="mx-0">
          <Col md={6} lg={6} className="mb-4">
            <Breadcrumb>
              <Breadcrumb.Item active>Leave Types</Breadcrumb.Item>
            </Breadcrumb>
          </Col>
          <Col md={6} lg={6} className="mb-4 text-end">
            <Button
              label={showForm ? "Close" : "Leave Type"}
              icon={showForm ? "pi pi-times" : "pi pi-plus"}
              severity="help"
              className="border-0 py-2"
              onClick={toggleForm}
            />
          </Col>
          <Col lg={12} className="pe-0">
            <Row>
              {showForm && (
                <Col lg={4} className="ps-0">
                  <Card className="h-auto sticky-top">
                    <Card.Header className="h6">
                      {editingLeave ? "Edit Leave Type" : "Add Leave Type"}
                    </Card.Header>
                    <Card.Body>
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Leave Type <sup className="text-danger">*</sup>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter leave type"
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Total Days <sup className="text-danger">*</sup>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="total_days"
                            value={formData.total_days}
                            onChange={handleChange}
                            placeholder="Enter total days"
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Role <sup className="text-danger">*</sup>
                          </Form.Label>
                          <MultiSelect
                            value={editingLeave ? [editingLeave.role] : selectedRoles}
                            options={roles}
                            onChange={(e) => setSelectedRoles(e.value)}
                            optionLabel="role_name"
                            placeholder="Select roles"
                            display="chip"
                            className="w-100"
                            disabled={!!editingLeave} // Disable in edit mode
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Accrual Type <sup className="text-danger">*</sup>
                          </Form.Label>
                          <Form.Select
                            name="accrual_type"
                            value={formData.accrual_type}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Accrual Type</option>
                            {accrualOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Salary Deductions</Form.Label>
                          <Form.Check
                            type="checkbox"
                            name="salary_deduction"
                            checked={formData.salary_deduction}
                            onChange={handleChange}
                            label="Include Salary Deductions"
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Description</Form.Label>
                          <textarea
                            className="form-control h-auto"
                            rows="3"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter description"
                          ></textarea>
                        </Form.Group>
                        <Form.Group className="mt-3 text-end">
                          <Button
                            type="submit"
                            label="Save"
                            className="py-2 border-0"
                            icon="pi pi-save"
                            severity="primary"
                          />
                        </Form.Group>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
              )}

              <Col>
                <Card className="h-auto">
                  <Card.Header className="h6">Leave Types</Card.Header>
                  <Card.Body>
                    <Table responsive striped bordered size="sm" hover>
                      <thead>
                        <tr className="table-secondary">
                          <th style={{ width: "200px" }}>Leave Type</th>
                          <th className="text-center" style={{ width: "100px" }}>
                            Total Days
                          </th>
                          <th style={{ width: "150px" }}>Role</th>
                          <th style={{ width: "150px" }}>Accrual Type</th>
                          <th>Salary Deductions</th>
                          <th>Description</th>
                          <th className="text-center" style={{ width: "100px" }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveTypes.map((leave) => (
                          <tr key={leave._id}>
                            <th className="table-light">{leave.name}</th>
                            <td className="text-center">{leave.total_days}</td>
                            <td>{leave.role.role_name}</td>
                            <td>{leave.accrual_type || "N/A"}</td>
                            <td>{leave.salary_deduction ? "Yes" : "No"}</td>
                            <td>{leave.description || "N/A"}</td>
                            <td className="text-center">
                              <Button
                                outlined
                                severity="danger"
                                title="Edit"
                                className="border-0 p-0"
                                icon="pi pi-pencil"
                                onClick={() => handleEdit(leave)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Row>
    </>
  );
};

export default AddLeaveType;
