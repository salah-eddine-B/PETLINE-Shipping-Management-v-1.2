import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { triggerRefresh } from '../../store/refreshSlice.js';
import './EditProduct.css';

export default function EditProduct({ isOpen, onClose, product }) {
    const [editedProduct, setEditedProduct] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const dispatch = useDispatch();

    // Initialize editedProduct when product prop changes or modal opens
    useEffect(() => {
        if (product && isOpen) {
            setEditedProduct({...product});
        }
    }, [product, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch(`http://localhost:3001/products/${editedProduct.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedProduct),
            });
    
            if (!response.ok) {
                throw new Error("Failed to update product");
            }
            
            setMessage({ type: 'success', text: 'Produit mis à jour avec succès' });
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                dispatch(triggerRefresh());
                onClose();
            }, 2000);
    
        } catch (error) {
            console.error("Error updating product:", error);
            setMessage({ type: 'error', text: 'Échec de la mise à jour du produit' });
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                dispatch(triggerRefresh());
                onClose();
            }, 2000);
        }
    };

    if (!isOpen) return null;

  return (
        <div className="edit-product-modal-overlay">
            <div className="edit-product-modal-content">
        <h2>Modifier un Produit</h2>
        {message.text && (
                    <div className={`edit-product-message ${message.type}`}>
                {message.text}
            </div>
        )}
                <form onSubmit={handleSubmit} className="edit-product-form-container">
                    <div className="edit-product-row">
                        <div className="edit-product-form-group">
                <label>ID</label>
                            <input type="text" value={editedProduct.id || ''} disabled />
            </div>
                        <div className="edit-product-form-group">
                <label>Nom du produit</label>
                            <input type="text" name="product_name" value={editedProduct.product_name || ''} onChange={handleChange} required />
                        </div>
            </div>
                    
                    <div className="edit-product-row">
                        <div className="edit-product-form-group">
                <label>Référence</label>
                            <input type="text" name="reference" value={editedProduct.reference || ''} onChange={handleChange} required />
                        </div>
                        <div className="edit-product-form-group">
                <label>Unité</label>
                            <input type="text" name="unit" value={editedProduct.unit || ''} onChange={handleChange} required />
                        </div>
            </div>
                    
                    <div className="edit-product-row">
                        <div className="edit-product-form-group">
                <label>Description</label>
                            <textarea name="description" value={editedProduct.description || ''} onChange={handleChange} />
            </div>
                        <div className="edit-product-form-group">
                <label>Marque</label>
                            <input type="text" name="brand" value={editedProduct.brand || ''} onChange={handleChange} required />
                        </div>
            </div>
                    
                    <div className="edit-product-row">
                        <div className="edit-product-form-group">
                <label>Date d'entrée</label>
                            <input type="date" name="entry_date" value={editedProduct.entry_date || ''} onChange={handleChange} required />
            </div>
                        <div className="edit-product-form-group">
                <label>Quantité</label>
                            <input type="number" name="quantity" value={editedProduct.quantity || ''} onChange={handleChange} required />
            </div>
            </div>
            
                    <div className="edit-product-row">
                        <div className="edit-product-form-group">
                            <label>Prix</label>
                            <input type="number" name="price" value={editedProduct.price || ''} onChange={handleChange} required />
                        </div>
                        <div className="edit-product-form-group">
                            {/* Espace vide pour maintenir la mise en page */}
                        </div>
                    </div>
        </form>
                <div className="edit-product-modal-actions">
                    <button type="submit" className="edit-product-btn edit-product-btn-primary" onClick={handleSubmit}>Modifier</button>
                    <button type="button" className="edit-product-btn edit-product-btn-secondary" onClick={onClose}>Annuler</button>
                </div>
            </div>
    </div>
    );
}
