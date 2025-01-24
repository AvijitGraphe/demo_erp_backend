import React, { useEffect, useState } from "react";
import { Col, Row, Breadcrumb, Card, Badge } from "react-bootstrap";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import axios from "axios";
import config from "../../config";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { AutoComplete } from "primereact/autocomplete";
import moment from "moment";
import { DateRangePicker } from "react-bootstrap-daterangepicker";
import "bootstrap-daterangepicker/daterangepicker.css";
import '../../assets/css/taskboard.css';
import { useNavigate } from 'react-router-dom';
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Tooltip } from 'primereact/tooltip';
import { VscFlame } from "react-icons/vsc";
import CustomConfirmPopup from "../../components/CustomConfirmPopup";
import { Skeleton } from "primereact/skeleton";
import noUserImg from '../../assets/images/no_user.png'; // Placeholder for missing profile images
import successVideo from '../../assets/video/paperplane.mp4';
import crossVideo from '../../assets/video/cross.mp4';
const initialColumns = {
    Todo: [],
    InProgress: [],
    InReview: [],
    InChanges: [],
    Completed: [],
};

const Taskboard_admin = () => {
    const { accessToken, userId, role } = useAuth();
    const [columns, setColumns] = useState(initialColumns);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    const [brands, setBrands] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: moment().startOf("month"),
        endDate: moment().endOf("month"),
    });
    const [videoDialogVisible, setVideoDialogVisible] = useState(false); // New state for video dialog
    const [videocrossDialogVisible, setVideocrossDialogVisible] = useState(false); // New state for video dialog
    const allowedRoles = [
        'Founder',
        'Admin',
        'SuperAdmin',
        'HumanResource',
        'Accounts',
        'Department_Head',
        'Task_manager'
    ];

    const [isDialogVisible, setDialogVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [formData, setFormData] = useState({
        startDate: null,
        endDate: null,
        userId: null,
    });

    const [isDeadlineDialogVisible, setDeadlineDialogVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [newDeadline, setNewDeadline] = useState(null);
    // Add a state for task type
    const [taskType, setTaskType] = useState(""); // Default is empty
    // Fetch tasks from the API
    const fetchTasks = async () => {
        console.log("log the data selectedBrand", selectedBrand)
        try {
            setIsLoading(true); // Set loading state
            setColumns({}); // Reset columns

            const response = await axios.get(`${config.apiBASEURL}/projectRoutes/tasks/kanban`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                params: {
                    user_id: userId,
                    brand_id: selectedBrand?.brand_id || null,
                    start_date: dateRange.startDate.format("YYYY-MM-DD"),
                    end_date: dateRange.endDate.format("YYYY-MM-DD"),
                    task_type: taskType || null, // Only include task_type if selected
                },
            });

            const data = response.data?.data || initialColumns;
            setColumns(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        } finally {
            setIsLoading(false); // Stop loading
        }
    };


    // Fetch users from the API
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/projectRoutes/fetch-all-users`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            console.log("log thr data", response.data)
            setUsers(response.data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Fetch brands from the API
    const fetchBrands = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/projectRoutes/fetchallbrands`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log("log the data", response.data)
            setBrands(response.data || []);
        } catch (error) {
            console.error("Error fetching brands:", error);
        }
    };
    useEffect(() => {
        fetchBrands();
        fetchTasks();
        fetchUsers();
    }, [accessToken, userId]);

    // Filter brands for autocomplete
    const searchBrands = (event) => {
        const query = event.query.toLowerCase();
        setFilteredBrands(
            brands.filter((brand) =>
                brand.brand_name.toLowerCase().includes(query)
            )
        );
    };


    // Handle drag end
    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        // If no destination or no change in position, return early
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        const updatedColumns = { ...columns };
        const sourceColumn = [...updatedColumns[source.droppableId]];
        const destinationColumn = [...updatedColumns[destination.droppableId]];

        // Move the task within the columns
        const [movedTask] = sourceColumn.splice(source.index, 1);
        movedTask.status = destination.droppableId;
        destinationColumn.splice(destination.index, 0, movedTask);

        // Optimistically update UI
        updatedColumns[source.droppableId] = sourceColumn;
        updatedColumns[destination.droppableId] = destinationColumn;
        setColumns(updatedColumns);

        let updateSuccess = false;

        try {
            setIsLoading(true); // Set loading state
            const response = await axios.put(
                `${config.apiBASEURL}/projectRoutes/update-task-status`,
                {
                    user_id: userId,
                    task_id: draggableId,
                    new_column: destination.droppableId,
                    new_position: destination.index + 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (response.status === 200) {
                updateSuccess = true;

                // Call the API to add the task to the tasksheet
                await axios.post(
                    `${config.apiBASEURL}/tasksheetRoutes/update-tasksheet`,
                    {
                        task_id: draggableId,
                        status: destination.droppableId,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                // Fetch updated taskboard data

                setIsLoading(false); // Stop loading
                setVideoDialogVisible(true); // Show video dialog
                setTimeout(() => {
                    setVideoDialogVisible(false); // Hide video dialog after 6 seconds
                 fetchTasks();
                }, 5000);

            } else {
                console.error("Failed to update task position on the server");
                setIsLoading(false); // Stop loading
                setVideocrossDialogVisible(true); // Show video dialog
               
                setTimeout(() => {
                    setVideocrossDialogVisible(false); // Hide video dialog after 6 seconds
                    fetchTasks();
                  
                }, 5000);

            }
        } catch (error) {
            console.error("Error updating task position:", error);
            setIsLoading(false); // Stop loading
            setVideocrossDialogVisible(true); // Show video dialog
            setTimeout(() => {
                setVideocrossDialogVisible(false); // Hide video dialog after 6 seconds
                fetchTasks();
              
            }, 5000);

        } finally {
            // Handle specific dialog logic in finally
            setIsLoading(false); // Stop loading
            if (updateSuccess && destination.droppableId === 'InChanges') {
                const movedTaskDetails = { task_id: draggableId };
                setSelectedTask(movedTaskDetails);
                setDeadlineDialogVisible(true);
            }
        }
    };






    // Handle date range change
    const handleDateRangeChange = (start, end) => {
        setDateRange({
            startDate: moment(start),
            endDate: moment(end),
        });
    };

    const handleView = (taskId) => {
        console.log("log the data", taskId);
        navigate(`/dashboard/view_task/${taskId}`);
    };

    const handleNavigate = () => {
        navigate('/dashboard/addtask');
    };


    // Open the dialog and set the task ID
    const handleDuplicate = (taskId) => {
        setSelectedTaskId(taskId);
        setDialogVisible(true);
    };

    // Close the dialog
    const closeDialog = () => {
        setDialogVisible(false);
        setFormData({ startDate: null, endDate: null, userId: null });
    };

    // Handle form input changes
    const handleInputChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };


    const resetDialogState = () => {
        setSelectedTask(null);
        setNewDeadline(null);
        setDeadlineDialogVisible(false);
    };



    // Submit duplication
    const handleSubmit = async () => {
        try {
            const payload = {
                task_id: selectedTaskId,
                task_startdate: formData.startDate,
                task_deadline: formData.endDate,
                task_user_id: formData.userId,
            };

            const response = await axios.post(
                `${config.apiBASEURL}/projectRoutes/duplicate-task`,
                payload,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            if (response.status === 201 && response.data.message) {
                closeDialog(); // Close the dialog
                setVideoDialogVisible(true); // Show video dialog
               
                setTimeout(() => {
                    setVideoDialogVisible(false); // Hide video dialog after 6 seconds
                    fetchTasks();
                  
                }, 5000);
            } else {
                console.error("Failed to duplicate task:", response.data.error || response.data.message);

            }
        } catch (error) {
            console.error("Error duplicating task:", error.response?.data || error.message);

        }
    };


    const handleDeadlineUpdate = async () => {
        if (!selectedTask || !newDeadline) return;

        try {
            const response = await axios.put(
                `${config.apiBASEURL}/projectRoutes/update-task-deadline`,
                {
                    task_id: selectedTask.task_id,
                    new_deadline: newDeadline,
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (response.status === 200) {
                console.log("Deadline updated successfully:", response.data);
                fetchTasks(); // Refresh tasks to reflect changes
                setDeadlineDialogVisible(false);
                resetDialogState();
            } else {
                console.error("Failed to update deadline");
            }
        } catch (error) {
            console.error("Error updating deadline:", error);
        }
    };



    const renderSkeletonLoader = () => {
        return Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="board-task skeleton-task">
                <Skeleton width="80%" height="1.5rem" className="mb-2" />
                <Skeleton width="60%" height="1rem" className="mb-2" />
                <Skeleton width="70%" height="1rem" className="mb-2" />
                <Skeleton width="90%" height="1rem" className="mb-2" />
                <Skeleton width="50%" height="1rem" />
            </div>
        ));
    };




    return (
        <Row className="body_content">
            <Row className="mx-0">
                <Col md={6} lg={5} className="mb-4">
                    <Breadcrumb>
                        <Breadcrumb.Item active>Taskboard</Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
                <Col md={6} lg={7} className="mb-4 d-flex justify-content-end align-items-center">
                    {allowedRoles.includes(role) && (
                        <select
                            value={taskType}
                            onChange={(e) => setTaskType(e.target.value)}
                            className="form-select mx-2"
                            style={{ width: "150px" }}
                        >
                            <option value="">Select Task Type</option>
                            <option value="Graphe">Graphe</option>
                            <option value="Weddings">Weddings</option>
                        </select>
                    )}

                    <AutoComplete
                        value={selectedBrand}
                        suggestions={filteredBrands}
                        completeMethod={searchBrands}
                        field="brand_name"
                        onChange={(e) => setSelectedBrand(e.value)}
                        placeholder="Select Brand"
                    />

                    <DateRangePicker
                        initialSettings={{
                            startDate: dateRange.startDate,
                            endDate: dateRange.endDate,
                            locale: { format: "DD/MM/YYYY" },
                            ranges: {
                                Today: [moment(), moment()],
                                Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
                                "Last 7 Days": [moment().subtract(6, "days"), moment()],
                                "Last 30 Days": [moment().subtract(29, "days"), moment()],
                                "This Month": [moment().startOf("month"), moment().endOf("month")],
                                "Last Month": [
                                    moment().subtract(1, "month").startOf("month"),
                                    moment().subtract(1, "month").endOf("month"),
                                ],
                            },
                        }}
                        onCallback={handleDateRangeChange}
                    >
                        <input
                            type="text"
                            className="form-control mx-2"
                            style={{ width: "200px" }}
                            placeholder="Select Date Range"
                        />
                    </DateRangePicker>
                    <Button
                        label="Apply"
                        className="border-0"
                        onClick={fetchTasks}
                        severity="secondary"
                    />
                    {allowedRoles.includes(role) && (
                        <Button
                            label="Task"
                            className="border-0 ms-1"
                            icon="pi pi-plus"
                            severity="help"
                            onClick={handleNavigate}
                        />
                    )}
                </Col>

                <Col className="mb-4 bordmain">
                    <DragDropContext onDragEnd={onDragEnd}>
                        {Object.keys(columns).map((columnId) => (
                            <div key={columnId} className="subboard">
                                <div className="bordHeader">
                                    <h5 className="mb-0">{columnId}</h5>
                                </div>
                                <Droppable droppableId={columnId}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="childboard scroll-card"
                                        >
                                            {isLoading
                                                ? renderSkeletonLoader() // Render skeletons while loading
                                                : columns[columnId].map((task, index) => (
                                                    <Draggable
                                                        key={task.task_id}
                                                        draggableId={task.task_id.toString()}
                                                        index={index}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                className={`board-task 
                                                    ${task.missed_deadline ? "task-red" : "task-green"} 
                                                    ${task.priority_flag === 'Priority' ? "example-1" : ""}`}
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                }}
                                                            >
                                                                <div>
                                                                    <p>
                                                                        <em>Brand :</em> <span>{task.brand_name}</span>
                                                                    </p>
                                                                    <p>
                                                                        <em>Project :</em> <span>{task.project_name}</span>
                                                                    </p>
                                                                    <p><em>Task : </em>{task.task_name}</p>
                                                                    <p>
                                                                        <em>Description: </em>
                                                                        <span>{task.task_description}</span>
                                                                    </p>
                                                                    <p>
                                                                        <em>End Date : </em>
                                                                        <span>
                                                                            {new Date(task.end_date).toLocaleDateString("en-GB")}
                                                                        </span>
                                                                    </p>
                                                                    <p>
                                                                        <em>Priority : </em>
                                                                        <Badge
                                                                            className={`badge ${task.priority === "High"
                                                                                ? "bg-danger" // Bootstrap class for red
                                                                                : task.priority === "Medium"
                                                                                    ? "bg-warning" // Bootstrap class for orange
                                                                                    : task.priority === "Low"
                                                                                        ? "bg-info" // Bootstrap class for green
                                                                                        : "bg-secondary" // Default Bootstrap gray
                                                                                }`}
                                                                        >
                                                                            {task.priority}
                                                                        </Badge>
                                                                    </p>
                                                                    <p className="d-flex w-100">
                                                                        <span className="d-flex align-items-center">
                                                                            <Avatar
                                                                                image={task.profile_image || noUserImg}
                                                                                shape="circle"
                                                                                className="mt-2 userName"
                                                                                data-pr-tooltip={`Assigned to : ${task.assignee_name}`}
                                                                                style={{ width: '26px', height: '26px' }}
                                                                            />
                                                                            <Tooltip target=".userName" mouseTrack mouseTrackLeft={10} />
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                                <hr className="mt-2" />
                                                                <div
                                                                    style={{
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "center",
                                                                    }}
                                                                    className="taskBTN"
                                                                >
                                                                    <div style={{ display: "flex", gap: "10px" }}>
                                                                        {task.missed_deadline && (
                                                                            <div style={{ position: "relative" }}>
                                                                                <VscFlame
                                                                                    data-pr-tooltip="Deadline Missed"
                                                                                    data-pr-position="top"
                                                                                    className="missed-deadline-icon"
                                                                                    style={{
                                                                                        fontSize: "1.5rem",
                                                                                        color: "red",
                                                                                        marginRight: "auto",
                                                                                    }}
                                                                                />
                                                                                <Tooltip target=".missed-deadline-icon" />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div style={{ display: "flex" }}>
                                                                        <Button
                                                                            title="View"
                                                                            outlined
                                                                            severity="info"
                                                                            icon="pi pi-eye"
                                                                            className="border-0 p-0"
                                                                            onClick={() => handleView(task.task_id)} // Pass the task ID
                                                                        />

                                                                        {allowedRoles.includes(role) && (
                                                                            <CustomConfirmPopup
                                                                                message="Are you sure you want to duplicate this Task?"
                                                                                icon="pi pi-exclamation-triangle"
                                                                                defaultFocus="accept"
                                                                                acceptClassName="p-button-success"
                                                                                buttonLabel="Duplicate"
                                                                                title="Duplicate Task"
                                                                                buttonClass="p-button-secondary p-button-text"
                                                                                className="border-0 p-0"
                                                                                buttonIcon="pi pi-clone"
                                                                                onConfirm={() => handleDuplicate(task.task_id)}
                                                                                onReject={() => console.log('Duplicate action canceled')}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </DragDropContext>
                </Col>


            </Row>
            <Dialog
                header="Duplicate Task"
                visible={isDialogVisible}
                style={{ width: "450px" }}
                onHide={closeDialog}
                footer={
                    <div>
                        <Button severity="danger" label="Cancel" icon="pi pi-times" onClick={closeDialog} className="p-button-text" />
                        <Button severity="success" className="p-button-text" label="Duplicate" icon="pi pi-check" onClick={handleSubmit} autoFocus />
                    </div>
                }
            >
                <div className="field">
                    <label htmlFor="startDate">Start Date</label>
                    <Calendar
                        id="startDate"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.value)}
                        showTime // Enables time selection
                        dateFormat="dd/mm/yy" // Formats the date
                        hourFormat="24" // Sets 24-hour format

                    />
                </div>
                <div className="field">
                    <label htmlFor="endDate">End Date</label>
                    <Calendar
                        id="endDate"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange("endDate", e.value)}
                        showTime // Enables time selection
                        dateFormat="dd/mm/yy" // Formats the date
                        hourFormat="24" // Sets 24-hour format

                    />
                </div>

                <div className="field">
                    <label htmlFor="userId">Assign To</label>
                    <Dropdown
                        id="userId"
                        value={formData.userId}
                        options={users.map((user) => ({ label: user.first_name + " " + user.last_name, value: user.user_id }))}
                        onChange={(e) => handleInputChange("userId", e.value)}
                        placeholder="Select a User"
                    />
                </div>
            </Dialog>


            <Dialog

                visible={isDeadlineDialogVisible}
                style={{ width: '320px' }}
                onHide={() => setDeadlineDialogVisible(false)}
            >
                <div>
                    <label>Update Task Deadline</label>
                    <Calendar
                        value={newDeadline}
                        onChange={(e) => setNewDeadline(e.value)}
                        showTime
                        dateFormat="yy-mm-dd"
                    />
                    <div style={{ marginTop: '1em' }}>
                        <Button
                            outlined
                            icon="pi pi-check"
                            label="Update "
                            onClick={handleDeadlineUpdate}
                            className="py-2"
                            severity="info"
                        />
                    </div>
                </div>
            </Dialog>

            <Dialog visible={videoDialogVisible} className='fadeInUp_dilog'
                onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                <video src={successVideo} autoPlay loop muted style={{ width: '100%' }} />
                <h6 className="text-center mt-0 fadeInUp">Process Completed <span className='text-success'>Successfully</span></h6>
            </Dialog>


            <Dialog visible={videocrossDialogVisible} className='fadeInUp_dilog'
                onHide={() => setVideoDialogVisible(false)} style={{ width: '320px' }} closable={false}>
                <video src={crossVideo} autoPlay loop muted style={{ width: '100%' }} />
                <h6 className="text-center mt-0 fadeInUp">Process <span className='text-danger'>Denied</span></h6>
            </Dialog>



        </Row>

    );
};

export default Taskboard_admin;