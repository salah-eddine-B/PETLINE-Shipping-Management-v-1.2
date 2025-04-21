import React, { useState, useEffect } from 'react';
import './ProductSelectionModal.css';

export default function ProductSelectionModal({ isOpen, onClose, onNext, selectedProducts: initialSelectedProducts = [] }) {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState(initialSelectedProducts);
    const [loading, setLoading] = useState(true);
    const [quantityErrors, setQuantityErrors] = useState({});

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:3001/products');
                if (!response.ok) {
                    throw new Error('Échec de la récupération des produits');
                }
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Erreur lors de la récupération des produits:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchProducts();
        }
    }, [isOpen]);

    const handleProductSelect = (product) => {
        setSelectedProducts(prev => {
            const isSelected = prev.some(p => p.id === product.id);
            if (isSelected) {
                return prev.filter(p => p.id !== product.id);
            } else {
                return [...prev, { 
                    ...product, 
                    qte: 1, 
                    price: product.price || 0
                }];
            }
        });
        // Clear any existing error for this product
        setQuantityErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[product.id];
            return newErrors;
        });
    };

    const handleQuantityChange = (productId, quantity) => {
        const product = products.find(p => p.id === productId);
        const newQuantity = parseInt(quantity);
        
        if (newQuantity > product.quantity) {
            setQuantityErrors(prev => ({
                ...prev,
                [productId]: `La quantité ne peut pas dépasser ${product.quantity}`
            }));
        } else {
            setQuantityErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[productId];
                return newErrors;
            });
        }

        setSelectedProducts(prev =>
            prev.map(product =>
                product.id === productId
                    ? { ...product, qte: newQuantity }
                    : product
            )
        );
    };

    const handlePriceChange = (productId, price) => {
        setSelectedProducts(prev =>
            prev.map(product =>
                product.id === productId
                    ? { ...product, price: parseFloat(price) || 0 }
                    : product
            )
        );
    };

    const handleNext = () => {
        // Check if there are any quantity errors
        if (Object.keys(quantityErrors).length > 0) {
            return;
        }
        onNext(selectedProducts);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-ProductSelection-content">
                <div className="modal-header">
                    <h2>Sélection des Produits</h2>
                </div>
                <div className="products-container">
                    {loading ? (
                        <div className="loading">Chargement...</div>
                    ) : (
                        <div className="products-grid">
                            {products.map(product => (
                                <div 
                                    key={product.id} 
                                    className={`product-card ${selectedProducts.some(p => p.id === product.id) ? 'selected' : ''}`}
                                    onClick={() => handleProductSelect(product)}
                                >
                                    <div className="product-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.some(p => p.id === product.id)}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleProductSelect(product);
                                            }}
                                        />
                                    </div>
                                    <div className="product-info">
                                        <h3>{product.product_name}</h3>
                                        <p><strong>Référence:</strong> {product.reference}</p>
                                        <p><strong>Description:</strong> {product.description}</p>
                                        <p><strong>Prix:</strong> {product.price}€</p>
                                        <p><strong>Quantité disponible:</strong> {product.quantity}</p>
                                    </div>
                                    {selectedProducts.some(p => p.id === product.id) && (
                                        <div className="product-inputs" onClick={(e) => e.stopPropagation()}>
                                            <div className="quantity-input">
                                                <label>Quantité:</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={product.quantity}
                                                    value={selectedProducts.find(p => p.id === product.id)?.qte || 1}
                                                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                                />
                                                {quantityErrors[product.id] && (
                                                    <div className="error-message">{quantityErrors[product.id]}</div>
                                                )}
                                            </div>
                                            <div className="price-input">
                                                <label>Prix unitaire:</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={selectedProducts.find(p => p.id === product.id)?.price || product.price || 0}
                                                    onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleNext}
                        disabled={selectedProducts.length === 0 || Object.keys(quantityErrors).length > 0}
                    >
                        Suivant
                    </button>
                </div>
            </div>
        </div>
    );
} 