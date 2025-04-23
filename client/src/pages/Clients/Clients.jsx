import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { triggerRefresh } from '../../store/refreshSlice';
import SearchBar from '../../components/SearchBar/SearchBar';
// import AddClient from '../../components/AddClient/AddClient';
// import EditClient from '../../components/EditClient/EditClient';
import Message from '../../components/Message/Message';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import './Clients.css';

const Clients = () => {
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [selectedClients, setSelectedClients] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [clientToEdit, setClientToEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const dispatch = useDispatch();
    const mustRefresh = useSelector((state) => state.refresh.mustRefresh);

    useEffect(() => {
        fetchClients();
    }, [mustRefresh]);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/clients');
            if (!response.ok) {
                throw new Error('Failed to fetch clients');
            }
            const data = await response.json();
            setClients(data);
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

    const filteredClients = clients.filter(client =>
        Object.values(client).some(value =>
            value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedClients(filteredClients.map(client => client._id));
        } else {
            setSelectedClients([]);
        }
    };

    const handleSelectClient = (clientId) => {
        setSelectedClients(prev => {
            if (prev.includes(clientId)) {
                return prev.filter(id => id !== clientId);
            } else {
                return [...prev, clientId];
            }
        });
    };

    const handleEdit = (client) => {
        setClientToEdit(client);
        setShowEditModal(true);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/clients/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedClients }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete clients');
            }

            setMessage({ type: 'success', text: 'Clients deleted successfully' });
            setSelectedClients([]);
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
        <div className="clients-container">
            {message && (
                <Message type={message.type} onClose={() => setMessage(null)}>
                    {message.text}
                </Message>
            )}

            <div className="buttons-group">
                <button className="add-button" onClick={() => setShowAddModal(true)}>
                    Add Client
                </button>
                {selectedClients.length > 0 && (
                    <>
                        <button className="update-button" onClick={() => handleEdit(clients.find(c => c._id === selectedClients[0]))}>
                            Edit Client
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
                    <table className="client-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        className="checkbox-cell"
                                        checked={selectedClients.length === filteredClients.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map((client) => (
                                <tr key={client._id}>
                                    <td className="checkbox-cell_line">
                                        <input
                                            type="checkbox"
                                            className="checkbox-cell"
                                            checked={selectedClients.includes(client._id)}
                                            onChange={() => handleSelectClient(client._id)}
                                        />
                                    </td>
                                    <td>{client._id}</td>
                                    <td>{client.name}</td>
                                    <td>{client.email}</td>
                                    <td>{client.phone}</td>
                                    <td>{client.address}</td>
                                    <td>
                                        <button className="btn-update" onClick={() => handleEdit(client)}>Edit</button>
                                        <button className="btn-delete" onClick={() => setShowDeleteDialog(true)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* {showAddModal && (
                <AddClient
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(message) => {
                        setMessage({ type: 'success', text: message });
                        setShowAddModal(false);
                    }}
                />
            )} */}

            {/* {showEditModal && (
                <EditClient
                    client={clientToEdit}
                    onClose={() => {
                        setShowEditModal(false);
                        setClientToEdit(null);
                    }}
                    onSuccess={(message) => {
                        setMessage({ type: 'success', text: message });
                        setShowEditModal(false);
                        setClientToEdit(null);
                    }}
                />
            )} */}

            {showDeleteDialog && (
                <ConfirmationDialog
                    message={`Are you sure you want to delete ${selectedClients.length} selected client(s)?`}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteDialog(false)}
                />
            )}
        </div>
    );
};

export default Clients; 