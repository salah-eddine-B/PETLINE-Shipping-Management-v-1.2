import React, { useState, useEffect } from 'react';
import SearchBar from '../../components/SearchBar/SearchBar';
import './Products.css';
import AddProduct from '../../components/AddProduct/AddProduct';
import EditProduct from '../../components/EditProduct/EditProduct';
import Message from '../../components/Message/Message';
import ConfirmationDialog from '../../components/ConfirmationDialog/ConfirmationDialog';
import { useSelector, useDispatch } from 'react-redux';
import { triggerRefresh } from '../../store/refreshSlice.js';

export default function Products({ onProductSelect }) {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const mustRefresh = useSelector((state) => state.refresh.mustRefresh);
    const dispatch = useDispatch();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const dataProducts = await response.json();
            setProducts(dataProducts);
            setError(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [mustRefresh]);

    const [selectedProducts, setSelectedProducts] = useState([]);

    const handleCheckboxChange = (products) => {
        const isSelected = selectedProducts.some(item => item.id === products.id);
        let newSelectedProducts;
        
        if (isSelected) {
            newSelectedProducts = selectedProducts.filter(item => item.id !== products.id);
            console.log(newSelectedProducts);
        } else {
            newSelectedProducts = [...selectedProducts,products];
            console.log(newSelectedProducts);
        }
        
        setSelectedProducts(newSelectedProducts);
        
        if (typeof onProductSelect === 'function') {
            if (newSelectedProducts.length === 1) {
                onProductSelect(newSelectedProducts[0]);
            } else {
                onProductSelect(newSelectedProducts);
            }
        }
    };
    
    const handleEditClick = () => {
        if (selectedProducts.length === 1) {
            setIsEditModalOpen(true);
        } else if (selectedProducts.length === 0) {
            setMessage({ type: 'warning', text: 'Veuillez sélectionner un produit à modifier' });
        } else {
            setMessage({ type: 'warning', text: 'Veuillez sélectionner un seul produit à modifier' });
        }
    };

    const handleDeleteClick = () => {
        if (selectedProducts.length === 0) {
            setMessage({ type: 'warning', text: 'Veuillez sélectionner au moins un produit à supprimer' });
            return;
        }
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const deletePromises = selectedProducts.map(product => 
                fetch(`http://localhost:3001/products/${product.id}`, {
                    method: 'DELETE'
                })
            );

            const results = await Promise.all(deletePromises);
            const failedDeletes = results.filter(response => !response.ok);

            if (failedDeletes.length > 0) {
                throw new Error('Certains produits n\'ont pas pu être supprimés');
            }

            setMessage({ type: 'success', text: 'Produit(s) supprimé(s) avec succès' });
            setSelectedProducts([]);
            dispatch(triggerRefresh());
            
            setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, 2000);

        } catch (error) {
            console.error('Error deleting products:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la suppression des produits' });
        } finally {
            setIsDeleteDialogOpen(false);
        }
    };

    const clearMessage = () => {
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="products-container">
            <SearchBar title="Products" />
            <Message 
                type={message.type} 
                text={message.text} 
                onClose={clearMessage}
            />
            <div className='buttons-group'>
                <button className='add-button' onClick={()=> setIsModalOpen(true)}>Ajouter</button>
                <button className='update-button' onClick={handleEditClick}>Modifier</button>
                <button className='delete-button' onClick={handleDeleteClick}>Supprimer</button>
            </div>

             {/* Show the modal when isModalOpen is true */}
             <AddProduct isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}  />
             
             {/* Show the edit modal when isEditModalOpen is true */}
             {selectedProducts.length === 1 && (
                <EditProduct 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    product={selectedProducts[0]} 
                />
             )}

             {/* Show the delete confirmation dialog */}
             <ConfirmationDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer ${selectedProducts.length} produit(s) ?`}
             />

            {loading ? (
                <div className='loading-div'><p>Loading...</p></div>
            ) : error ? (
                <div className='error-div'><p>{error}</p></div>
            ) : (
                <div className='table-container'>
                    <div className="table-wrapper">
                        <table className='product-table'>
                            <thead>
                                <tr>
                                    <th>
                                        <input type="checkbox" className="checkbox-cell" />
                                    </th>
                                    <th>ID</th>
                                    <th>Nom de produit</th>
                                    <th>Référence</th>
                                    <th>Description</th>
                                    <th>Unité</th>
                                    <th>Marque</th>
                                    <th>Date d'entrée</th>
                                    <th>Quantité</th>
                                    <th>Prix</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>
                                            <input type="checkbox" className="checkbox-cell" 
                                            onChange={() => handleCheckboxChange(product)}
                                            checked={selectedProducts.some(selected => selected.id === product.id)}
                                            />
                                        </td>
                                        <td>{product.id}</td>
                                        <td>{product.product_name}</td>
                                        <td>{product.reference}</td>
                                        <td>{product.description}</td>
                                        <td>{product.unit}</td>
                                        <td>{product.brand}</td>
                                        <td>{product.entry_date}</td>
                                        <td>{product.quantity}</td>
                                        <td>{product.price}</td>
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
