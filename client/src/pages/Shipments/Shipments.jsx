import React, { useState, useEffect } from 'react';
import SearchBar from '../../components/SearchBar/SearchBar';
import './Shipments.css';
import AddShipment from '../../components/AddShipment/AddShipment';
import EditShipment from '../../components/EditShipment/EditShipment';
import Message from '../../components/Message/Message';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import { useSelector, useDispatch } from 'react-redux';
import { triggerRefresh } from '../../store/refreshSlice.js';

export default function Shipments() {
    const [loading, setLoading] = useState(true);
    const [shipments, setShipments] = useState([]);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedShipments, setSelectedShipments] = useState([]);

    const mustRefresh = useSelector((state) => state.refresh.mustRefresh);
    const dispatch = useDispatch();

    const fetchShipments = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/shipments');
            if (!response.ok) {
                throw new Error('Failed to fetch shipments');
            }
            const dataShipments = await response.json();
            setShipments(dataShipments);
            setError(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShipments();
    }, [mustRefresh]);

    const handleCheckboxChange = (shipment) => {
        const isSelected = selectedShipments.some(item => item.shipmentId === shipment.shipmentId);
        let newSelectedShipments;
        
        if (isSelected) {
            newSelectedShipments = selectedShipments.filter(item => item.shipmentId !== shipment.shipmentId);
        } else {
            newSelectedShipments = [...selectedShipments, shipment];
        }
        
        setSelectedShipments(newSelectedShipments);
    };

    const handleEditClick = () => {
        if (selectedShipments.length === 1) {
            setIsEditModalOpen(true);
        } else if (selectedShipments.length === 0) {
            setMessage({ type: 'warning', text: 'Veuillez sélectionner une vente à modifier' });
        } else {
            setMessage({ type: 'warning', text: 'Veuillez sélectionner une seule vente à modifier' });
        }
    };

    const handleDeleteClick = () => {
        if (selectedShipments.length === 0) {
            setMessage({ type: 'warning', text: 'Veuillez sélectionner au moins une vente à supprimer' });
            return;
        }
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const deletePromises = selectedShipments.map(shipment => 
                fetch(`http://localhost:3001/shipments/${shipment.shipmentId}`, {
                    method: 'DELETE'
                })
            );

            const results = await Promise.all(deletePromises);
            const failedDeletes = results.filter(response => !response.ok);

            if (failedDeletes.length > 0) {
                throw new Error('Certaines ventes n\'ont pas pu être supprimées');
            }

            setMessage({ type: 'success', text: 'Vente(s) supprimée(s) avec succès' });
            setSelectedShipments([]);
            dispatch(triggerRefresh());
        } catch (error) {
            console.error('Error deleting shipments:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la suppression des ventes' });
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    const clearMessage = () => {
        setMessage({ type: '', text: '' });
    };

    const calculateTotalQuantity = (products) => {
        return products.reduce((total, product) => total + Number(product.qte), 0);
    };

    const formatProductsList = (products) => {
        return products.map(product => 
            `${product.product_name} (${product.qte} × ${product.price}€)`
        ).join(', ');
    };

    return (
        <div className="shipments-container">
            <SearchBar title="Ventes" />
            <Message 
                type={message.type} 
                text={message.text} 
                onClose={clearMessage}
            />
            <div className='buttons-group'>
                <button className='add-button' onClick={() => setIsModalOpen(true)}>Ventes des produits</button>
                <button className='update-button' onClick={handleEditClick}>Modifier</button>
                <button className='delete-button' onClick={handleDeleteClick}>Supprimer</button>
            </div>

            <AddShipment 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={(message) => {
                    setMessage({ type: 'success', text: message });
                    setIsModalOpen(false);
                }}
            />
            
            {selectedShipments.length === 1 && (
                <EditShipment 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    shipment={selectedShipments[0]} 
                />
            )}

            <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer ${selectedShipments.length} vente(s) ?`}
            />

            {loading ? (
                <div className='loading-div'><p>Loading...</p></div>
            ) : error ? (
                <div className='error-div'><p>{error}</p></div>
            ) : (
                <div className='table-container'>
                    <div className="table-wrapper">
                        <table className='shipment-table'>
                            <thead>
                                <tr>
                                    <th className='checkbox-cell_line'>
                                        <input type="checkbox" className="checkbox-cell" />
                                    </th>
                                    <th>ID Vente</th>
                                    <th>Date</th>
                                    <th>Produits Vente</th>
                                    <th>Total Quantité</th>
                                    <th>Expéditeur</th>
                                    <th>Destination</th>
                                    <th>Total Prix</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipments.map((shipment) => (
                                    <tr key={shipment.shipmentId}>
                                        <td className='checkbox-cell_line'>
                                            <input 
                                                type="checkbox" 
                                                className="checkbox-cell" 
                                                onChange={() => handleCheckboxChange(shipment)}
                                                checked={selectedShipments.some(selected => selected.shipmentId === shipment.shipmentId)}
                                            />
                                        </td>
                                        <td>{shipment.shipmentId}</td>
                                        <td>{shipment["shipment date"]}</td>
                                        <td>{formatProductsList(shipment.product || [])}</td>
                                        <td>{calculateTotalQuantity(shipment.product || [])}</td>
                                        <td>{shipment.expiditeur}</td>
                                        <td>{shipment.destination}</td>
                                        <td>{shipment["totale price"]}€</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
} 