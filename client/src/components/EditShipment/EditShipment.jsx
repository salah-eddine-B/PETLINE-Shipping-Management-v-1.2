import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { triggerRefresh } from '../../store/refreshSlice.js';
import Message from '../Message/Message';
import './EditShipment.css';

export default function EditShipment({ isOpen, onClose, shipment }) {
    const [editedShipment, setEditedShipment] = useState({});
    const [availableProducts, setAvailableProducts] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:3001/products');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setAvailableProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        if (isOpen) {
            fetchProducts();
            if (shipment) {
                setEditedShipment({...shipment});
            }
        }
    }, [isOpen, shipment]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedShipment(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...(editedShipment.product || [])];
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]: field === 'qte' || field === 'price' ? Number(value) : value
        };

        // Calculate the new total price
        const totalPrice = updatedProducts.reduce((total, prod) => {
            return total + (parseFloat(prod.price) * parseFloat(prod.qte) || 0);
        }, 0);
        
        setEditedShipment(prev => ({
            ...prev,
            product: updatedProducts,
            "totale price": totalPrice.toFixed(2)
        }));
    };

    const addProductField = () => {
        setEditedShipment(prev => ({
            ...prev,
            product: [...(prev.product || []), { 
                productid: '', 
                product_name: '', 
                qte: 1, 
                price: 0 
            }]
        }));
    };

    const removeProductField = (index) => {
        const updatedProducts = editedShipment.product.filter((_, i) => i !== index);
        
        // Recalculate the total price
        const totalPrice = updatedProducts.reduce((total, prod) => {
            return total + (parseFloat(prod.price) * parseFloat(prod.qte) || 0);
        }, 0);
        
        setEditedShipment(prev => ({
            ...prev,
            product: updatedProducts,
            "totale price": totalPrice.toFixed(2)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch(`http://localhost:3001/shipments/${editedShipment.shipmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedShipment),
            });
    
            if (!response.ok) {
                throw new Error('Failed to update shipment');
            }
    
            setMessage({ type: 'success', text: 'Vente mise à jour avec succès' });
            dispatch(triggerRefresh());
            
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                onClose();
            }, 2000);
    
        } catch (error) {
            console.error('Error updating shipment:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour de la vente' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Modifier la Vente</h2>
                </div>
                <div className="modal-body">
                    <Message 
                        type={message.type} 
                        text={message.text} 
                    />
                    <form onSubmit={handleSubmit} className="form-container">
                        <div className="form-section">
                            <h3>Informations de la Vente</h3>
                            <div className="form-group">
                                <label>ID Vente</label>
                                <input
                                    type="text"
                                    value={editedShipment.shipmentId || ''}
                                    disabled
                                />
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="shipment date"
                                    value={editedShipment["shipment date"] || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Expéditeur</label>
                                <input
                                    type="text"
                                    name="expiditeur"
                                    value={editedShipment.expiditeur || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Destination</label>
                                <input
                                    type="text"
                                    name="destination"
                                    value={editedShipment.destination || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Prix Total</label>
                                <input
                                    type="text"
                                    value={`${editedShipment["totale price"] || 0}€`}
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="products-section">
                            <h3>Produits</h3>
                            {editedShipment.product?.map((product, index) => (
                                <div key={index} className="product-group">
                                    <div className="form-group">
                                        <label>Produit</label>
                                        <select
                                            value={product.productid || ''}
                                            onChange={(e) => handleProductChange(index, 'productid', e.target.value)}
                                            required
                                        >
                                            <option value="">Sélectionner un produit</option>
                                            {availableProducts.map(prod => (
                                                <option key={prod.id} value={prod.id}>
                                                    {prod.product_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Quantité</label>
                                        <input
                                            type="number"
                                            value={product.qte || ''}
                                            onChange={(e) => handleProductChange(index, 'qte', e.target.value)}
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Prix</label>
                                        <input
                                            type="number"
                                            value={product.price || ''}
                                            onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div className="form-group subtotal">
                                        <label>Sous-total</label>
                                        <span>{((product.qte || 0) * (product.price || 0)).toFixed(2)}€</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => removeProductField(index)}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={addProductField}
                            >
                                Ajouter un produit
                            </button>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>
                                Annuler
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 