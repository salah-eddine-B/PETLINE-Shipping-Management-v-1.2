import React,{useState,useEffect} from "react";
import "./AddProduct.css"; // Add styles for the modal
// import Toast from "../Toast/Toast";
import { useDispatch,useSelector } from 'react-redux';
import { triggerRefresh } from '../../store/refreshSlice.js';

export default function AddProduct({ isOpen, onClose  }) {
    
    const [productId,setProductId] = useState('');
    const [product, setProduct] = useState({
        id: "", // Generate ID automatically
        product_name: "",
        reference: "",
        description: "",
        unit: "",
        brand: "",
        entry_date: new Date().toISOString().split("T")[0], // Default to today
        quantity: "",
        price: ""
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [mustRefreshId,setMustRefreshId] = useState(false);
    const dispatch = useDispatch();
    const mustRefresh = useSelector((state) => state.refresh.mustRefresh); // Get mustRefresh from Redux

    // const [showToast, setShowToast] = useState(false);
    // const [toastMessage, setToastMessage] = useState('');
    // const [toastType, setToastType] = useState('success');

    useEffect(()=> {
        fetch('http://localhost:3001/products')
        .then(response => response.json())
        .then(materials => {
            const currentYear = new Date().getFullYear().toString().slice(-2);
            const nextNumber = (materials.length + 1).toString().padStart(4, '0');
            setProductId(`${nextNumber}-${currentYear}`);
            setMustRefreshId(false);
            
        })
        .catch(error => {
            console.error('Error fetching materials:', error);
            setProduct(Math.floor(Math.random() * 1000000)); // Generate ID automatically
        });
        
    },[mustRefreshId]);

    const handleChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    // const handleSubmit = (e) => {
    //     e.preventDefault();
    //     // onAdd(product);
    //     onClose(); // Close modal after adding
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Assign the generated productId to the product before sending
        const newProduct = { ...product, id: productId };
    
        try {
            const response = await fetch("http://localhost:3001/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newProduct),
            });
    
            if (!response.ok) {
                throw new Error("Failed to add product");
            }
            setMessage({ type: 'success', text: 'Product added successfully' });
            setTimeout(() => {
                setMessage({ type: '', text: '' });
                // onClose();
            }, 2000);
            // setToastMessage('message');
            // setToastType('success');
            // setShowToast(true);
    
            // Clear the form after submission
            setProduct({
                id: "", 
                product_name: "",
                reference: "",
                description: "",
                unit: "",
                brand: "",
                entry_date: new Date().toISOString().split("T")[0], 
                quantity: "",
                price: ""
            });
            setMustRefreshId(true);
            setTimeout(() => {
                dispatch(triggerRefresh());
                // onClose();
            }, 3000);
    
            // onClose(); 
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };
    

    
    

    if (!isOpen) return null;// Don't render if modal is closed

    return (
        <div className="add-product-modal-overlay">
            <div className="add-product-modal-content">
                <h2>Ajouter un Produit</h2>
                {message.text && (
                    <div className={`add-product-message ${message.type}`}>
                        {message.text}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="add-product-form-container">
                    <div className="add-product-row">
                        <div className="add-product-form-group">
                            <label>ID</label>
                            <input type="text" value={productId} disabled />
                        </div>
                        <div className="add-product-form-group">
                            <label>Nom du produit</label>
                            <input type="text" name="product_name" value={product.product_name} onChange={handleChange} required />
                        </div>
                    </div>
                    
                    <div className="add-product-row">
                        <div className="add-product-form-group">
                            <label>Référence</label>
                            <input type="text" name="reference" value={product.reference} onChange={handleChange} required />
                        </div>
                        <div className="add-product-form-group">
                            <label>Unité</label>
                            <input type="text" name="unit" value={product.unit} onChange={handleChange} required />
                        </div>
                    </div>
                    
                    <div className="add-product-row">
                        <div className="add-product-form-group">
                            <label>Description</label>
                            <textarea name="description" value={product.description} onChange={handleChange} />
                        </div>
                        <div className="add-product-form-group">
                            <label>Marque</label>
                            <input type="text" name="brand" value={product.brand} onChange={handleChange} required />
                        </div>
                    </div>
                    
                    <div className="add-product-row">
                        <div className="add-product-form-group">
                            <label>Date d'entrée</label>
                            <input type="date" name="entry_date" value={product.entry_date} onChange={handleChange} required />
                        </div>
                        <div className="add-product-form-group">
                            <label>Quantité</label>
                            <input type="number" name="quantity" value={product.quantity} onChange={handleChange} required />
                        </div>
                    </div>
                    
                    <div className="add-product-row">
                        <div className="add-product-form-group">
                            <label>Prix</label>
                            <input type="number" name="price" value={product.price} onChange={handleChange} required />
                        </div>
                        <div className="add-product-form-group">
                            {/* Espace vide pour maintenir la mise en page */}
                        </div>
                    </div>
                </form>
                <div className="add-product-modal-actions">
                    <button type="submit" className="add-product-btn add-product-btn-primary" onClick={handleSubmit}>Ajouter</button>
                    <button type="button" className="add-product-btn add-product-btn-secondary" onClick={onClose}>Annuler</button>
                </div>
            </div>
        </div>    
    );
}
