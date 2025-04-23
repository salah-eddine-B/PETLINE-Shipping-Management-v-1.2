import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { triggerRefresh } from '../../store/refreshSlice';
import SearchBar from '../../components/SearchBar/SearchBar';
// import AddSupplier from '../../components/AddSupplier/AddSupplier';
// import EditSupplier from '../../components/EditSupplier/EditSupplier';
import Message from '../../components/Message/Message';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import './Suppliers.css';

const Suppliers = () => {
    const [loading, setLoading] = useState(true);
    const [suppliers, setSuppliers] = useState([]);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [supplierToEdit, setSupplierToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const dispatch = useDispatch();
    const mustRefresh = useSelector((state) => state.refresh.mustRefresh);

    useEffect(() => {
        fetchSuppliers();
    }, [mustRefresh]);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/suppliers');
            if (!response.ok) {
                throw new Error('Failed to fetch suppliers');
            }
            const data = await response.json();
            setSuppliers(data);
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

    const filteredSuppliers = suppliers.filter(supplier =>
        Object.values(supplier).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedSuppliers(filteredSuppliers.map(supplier => supplier._id));
        } else {
            setSelectedSuppliers([]);
        }
    };

    const handleSelectSupplier = (supplierId) => {
        setSelectedSuppliers(prev => {
            if (prev.includes(supplierId)) {
                return prev.filter(id => id !== supplierId);
            } else {
                return [...prev, supplierId];
            }
        });
    };

    const handleEdit = (supplier) => {
        setSupplierToEdit(supplier);
        setShowEditModal(true);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/suppliers/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedSuppliers }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete suppliers');
            }

            setMessage({ type: 'success', text: 'Suppliers deleted successfully' });
            setSelectedSuppliers([]);
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
        <div className="suppliers-container">
            {message && (
                <Message type={message.type} onClose={() => setMessage(null)}>
                    {message.text}
                </Message>
            )}

            <div className="buttons-group">
                <button className="add-button" onClick={() => setShowAddModal(true)}>
                    Add Supplier
                </button>
                {selectedSuppliers.length > 0 && (
                    <>
                        <button className="update-button" onClick={() => handleEdit(suppliers.find(s => s._id === selectedSuppliers[0]))}>
                            Edit Supplier
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
                    <table className="supplier-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        className="checkbox-cell"
                                        checked={selectedSuppliers.length === filteredSuppliers.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>Company Name</th>
                                <th>Contact Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Products</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map((supplier) => (
                                <tr key={supplier._id}>
                                    <td className="checkbox-cell_line">
                                        <input
                                            type="checkbox"
                                            className="checkbox-cell"
                                            checked={selectedSuppliers.includes(supplier._id)}
                                            onChange={() => handleSelectSupplier(supplier._id)}
                                        />
                                    </td>
                                    <td>{supplier.companyName}</td>
                                    <td>{supplier.contactName}</td>
                                    <td>{supplier.email}</td>
                                    <td>{supplier.phone}</td>
                                    <td>{supplier.address}</td>
                                    <td>{supplier.products?.join(', ')}</td>
                                    <td>{supplier.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* {showAddModal && (
                <AddSupplier
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(message) => {
                        setMessage({ type: 'success', text: message });
                        setShowAddModal(false);
                    }}
                />
            )} */}

            {/* {showEditModal && (
                <EditSupplier
                    supplier={supplierToEdit}
                    onClose={() => {
                        setShowEditModal(false);
                        setSupplierToEdit(null);
                    }}
                    onSuccess={(message) => {
                        setMessage({ type: 'success', text: message });
                        setShowEditModal(false);
                        setSupplierToEdit(null);
                    }}
                />
            )} */}

            {showDeleteDialog && (
                <ConfirmationDialog
                    message={`Are you sure you want to delete ${selectedSuppliers.length} selected supplier(s)?`}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteDialog(false)}
                />
            )}
        </div>
    );
};

export default Suppliers; 