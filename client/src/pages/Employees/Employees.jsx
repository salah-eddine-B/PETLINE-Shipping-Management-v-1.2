import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { triggerRefresh } from '../../store/refreshSlice';
import SearchBar from '../../components/SearchBar/SearchBar';
// import AddEmployee from '../../components/AddEmployee/AddEmployee';
// import EditEmployee from '../../components/EditEmployee/EditEmployee';
import Message from '../../components/Message/Message';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import './Employees.css';

const Employees = () => {
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const dispatch = useDispatch();
    const mustRefresh = useSelector((state) => state.refresh.mustRefresh);

    useEffect(() => {
        fetchEmployees();
    }, [mustRefresh]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/employees');
            if (!response.ok) {
                throw new Error('Failed to fetch employees');
            }
            const data = await response.json();
            setEmployees(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const filteredEmployees = employees.filter(employee =>
        Object.values(employee).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedEmployees(filteredEmployees.map(employee => employee._id));
        } else {
            setSelectedEmployees([]);
        }
    };

    const handleSelectEmployee = (employeeId) => {
        setSelectedEmployees(prev => {
            if (prev.includes(employeeId)) {
                return prev.filter(id => id !== employeeId);
            } else {
                return [...prev, employeeId];
            }
        });
    };

    const handleEdit = (employee) => {
        setEmployeeToEdit(employee);
        setShowEditModal(true);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/employees/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedEmployees }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete employees');
            }

            setMessage({ type: 'success', text: 'Employees deleted successfully' });
            setSelectedEmployees([]);
            dispatch(triggerRefresh());
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setShowDeleteDialog(false);
        }
    };

    if (loading) {
        return <div className="loading-div">Loading...</div>;
    }

    if (error) {
        return <div className="error-div">{error}</div>;
    }

    return (
        <div className="employees-container">
            {message && (
                <Message type={message.type} onClose={() => setMessage(null)}>
                    {message.text}
                </Message>
            )}

            <div className="buttons-group">
                <button className="add-button" onClick={() => setShowAddModal(true)}>
                    Add Employee
                </button>
                {selectedEmployees.length > 0 && (
                    <>
                        <button className="update-button" onClick={() => handleEdit(employees.find(e => e._id === selectedEmployees[0]))}>
                            Edit Employee
                        </button>
                        <button className="delete-button" onClick={() => setShowDeleteDialog(true)}>
                            Delete Selected
                        </button>
                    </>
                )}
            </div>

            <SearchBar onSearch={handleSearch} />

            <div className="table-container">
                <div className="table-wrapper">
                    <table className="employee-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        className="checkbox-cell"
                                        checked={selectedEmployees.length === filteredEmployees.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Position</th>
                                <th>Department</th>
                                <th>Hire Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmployees.map((employee) => (
                                <tr key={employee._id}>
                                    <td className="checkbox-cell_line">
                                        <input
                                            type="checkbox"
                                            className="checkbox-cell"
                                            checked={selectedEmployees.includes(employee._id)}
                                            onChange={() => handleSelectEmployee(employee._id)}
                                        />
                                    </td>
                                    <td>{employee.name}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.phone}</td>
                                    <td>{employee.position}</td>
                                    <td>{employee.department}</td>
                                    <td>{new Date(employee.hireDate).toLocaleDateString()}</td>
                                    <td>{employee.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* {showAddModal && (
                <AddEmployee
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(message) => {
                        setMessage({ type: 'success', text: message });
                        setShowAddModal(false);
                    }}
                />
            )} */}

            {/* {showEditModal && (
                <EditEmployee
                    employee={employeeToEdit}
                    onClose={() => {
                        setShowEditModal(false);
                        setEmployeeToEdit(null);
                    }}
                    onSuccess={(message) => {
                        setMessage({ type: 'success', text: message });
                        setShowEditModal(false);
                        setEmployeeToEdit(null);
                    }}
                />
            )} */}

            {showDeleteDialog && (
                <ConfirmationDialog
                    message={`Are you sure you want to delete ${selectedEmployees.length} selected employee(s)?`}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteDialog(false)}
                />
            )}
        </div>
    );
};

export default Employees; 