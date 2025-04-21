import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { triggerRefresh } from '../../store/refreshSlice.js';
import Message from '../Message/Message';
import ProductSelectionModal from '../ProductSelectionModal/ProductSelectionModal';
import './AddShipment.css';

export default function AddShipment({ isOpen, onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [shipmentDetails, setShipmentDetails] = useState({
        "shipment date": '',
        destination: '',
        expiditeur: '',
        "totale price": 0
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const dispatch = useDispatch();

    const handleProductSelection = (products) => {
        const productsWithPrices = products.map(product => ({
            ...product,
            price: product.price || '0',
            qte: product.qte || product.quantity || 1
        }));
        setSelectedProducts(productsWithPrices);
        setStep(2);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShipmentDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateTotalPrice = () => {
        return selectedProducts.reduce((total, product) => {
            return total + (parseFloat(product.price) * parseFloat(product.qte) || 0);
        }, 0).toFixed(2);
    };

    // Update total price when products change
    useEffect(() => {
        setShipmentDetails(prev => ({
            ...prev,
            "totale price": calculateTotalPrice()
        }));
    }, [selectedProducts]);

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...selectedProducts];
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]: value
        };
        setSelectedProducts(updatedProducts);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const shipmentData = {
                ...shipmentDetails,
                product: selectedProducts.map(product => ({
                    productid: product.id,
                    product_name: product.product_name,
                    qte: parseFloat(product.qte) || 0,
                    price: parseFloat(product.price) || 0
                })),
                "totale price": calculateTotalPrice()
            };

            const response = await fetch('http://localhost:3001/shipments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(shipmentData),
            });
    
            if (!response.ok) {
                throw new Error('Échec de l\'ajout de la vente');
            }
    
            setMessage({ type: 'success', text: 'Vente ajoutée avec succès' });
            dispatch(triggerRefresh());
            
            // Reset form
            setSelectedProducts([]);
            setShipmentDetails({
                "shipment date": '',
                destination: '',
                expiditeur: '',
                "totale price": 0
            });
            setStep(1);
    
            // Pass success message to parent and close modal
            if (onSuccess) {
                onSuccess('Vente ajoutée avec succès');
            }
            onClose();
    
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la vente:', error);
            setMessage({ type: 'error', text: 'Erreur lors de l\'ajout de la vente' });
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    if (!isOpen) return null;

    return (
        <>
            {step === 1 ? (
                <ProductSelectionModal
                    isOpen={isOpen}
                    onClose={onClose}
                    onNext={handleProductSelection}
                />
            ) : (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Détails de la Vente</h2>
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
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            name="shipment date"
                                            value={shipmentDetails["shipment date"]}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Destination</label>
                                        <input
                                            type="text"
                                            name="destination"
                                            value={shipmentDetails.destination}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Expéditeur</label>
                                        <input
                                            type="text"
                                            name="expiditeur"
                                            value={shipmentDetails.expiditeur}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Prix Total</label>
                                        <input
                                            type="text"
                                            value={`${calculateTotalPrice()}€`}
                                            disabled
                                        />
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3>Produits Sélectionnés</h3>
                                    <div className="selected-products">
                                        {selectedProducts.map((product, index) => (
                                            <div key={index} className="selected-product">
                                                <div className="product-name">
                                                    {product.product_name}
                                                </div>
                                                <div className="product-details">
                                                    <div className="product-quantity">
                                                        <label>Quantité</label>
                                                        <input
                                                            type="number"
                                                            value={product.qte}
                                                            onChange={(e) => handleProductChange(index, 'qte', e.target.value)}
                                                            min="1"
                                                        />
                                                    </div>
                                                    <div className="product-price">
                                                        <label>Prix</label>
                                                        <input
                                                            type="number"
                                                            value={product.price}
                                                            onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                    <div className="product-subtotal">
                                                        <span>{(product.qte * product.price).toFixed(2)}€</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleBack}>
                                Retour
                            </button>
                            <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                                Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
} 