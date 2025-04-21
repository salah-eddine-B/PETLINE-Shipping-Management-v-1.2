const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors');
require("dotenv").config();
const fs = require('fs');

const port = process.env.PORT || 3001;
const server = http.createServer(app);

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow all necessary HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allow common headers
}));
app.use(express.json()); // Middleware to parse JSON bodies

let productsData = require('./Products.json');

let shipmentsData = require('./Shipments.json');

//Get Product data from json file
app.get("/products", (req, res) => {
    res.json(productsData);
});

// Add new products to the database

app.post('/products',(req,res) => {
    const newProduct = req.body ;
    productsData.push(newProduct);

    fs.writeFile("Products.json", JSON.stringify(productsData, null, 2), (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ error: 'Server error', message: 'Erreur lors de l\'enregistrement' });
        }
        res.status(201).json({ 
            message:'Matériel ajouté avec succès',
            item: newProduct 
        });
    });
});

// Update existing product
app.put('/products/:id', (req, res) => {
    const productId = req.params.id;
    const updatedProduct = req.body;
    
    // Find the index of the product in the array
    const productIndex = productsData.findIndex(product => product.id === productId);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Not found', message: 'Produit non trouvé' });
    }
    
    // Update the product
    productsData[productIndex] = updatedProduct;
    
    // Write updated data back to file
    fs.writeFile("./Products.json", JSON.stringify(productsData, null, 2), (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ error: 'Server error', message: 'Erreur lors de la mise à jour' });
        }
        res.status(200).json({ 
            message: 'Produit mis à jour avec succès',
            item: updatedProduct 
        });
    });
});

// Delete product
app.delete('/products/:id', (req, res) => {
    const productId = req.params.id;
    
    // Find the index of the product in the array
    const productIndex = productsData.findIndex(product => product.id === productId);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Not found', message: 'Produit non trouvé' });
    }
    
    // Remove the product from the array
    productsData.splice(productIndex, 1);
    
    // Write updated data back to file
    fs.writeFile("./Products.json", JSON.stringify(productsData, null, 2), (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ error: 'Server error', message: 'Erreur lors de la suppression' });
        }
        res.status(200).json({ 
            message: 'Produit supprimé avec succès'
        });
    });
});

// Get all shipments
app.get('/shipments', (req, res) => {
    res.json(shipmentsData);
});

// Add new shipment
app.post('/shipments', (req, res) => {
    const newShipment = req.body;
    
    // Generate a new ID for the shipment
    const lastId = shipmentsData.length > 0 ? parseInt(shipmentsData[shipmentsData.length - 1].shipmentId.split('-')[0]) : 0;
    const newId = `${String(lastId + 1).padStart(4, '0')}-24`;
    
    // Calculate total price if not provided
    let totalePrice = newShipment["totale price"] || 0;
    if (!totalePrice && newShipment.product && newShipment.product.length > 0) {
        totalePrice = newShipment.product.reduce((total, item) => {
            return total + (parseFloat(item.price) * parseFloat(item.qte) || 0);
        }, 0);
    }
    
    // Add the new shipment with the generated ID
    const shipmentWithId = {
        ...newShipment,
        shipmentId: newId,
        "totale price": totalePrice
    };
    
    shipmentsData.push(shipmentWithId);
    
    // Write updated data back to file
    fs.writeFile("./Shipments.json", JSON.stringify(shipmentsData, null, 2), (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ error: 'Server error', message: 'Erreur lors de l\'enregistrement' });
        }
        res.status(201).json({ 
            message: 'Vente ajoutée avec succès',
            shipment: shipmentWithId 
        });
    });
});

// Update existing shipment
app.put('/shipments/:id', (req, res) => {
    const shipmentId = req.params.id;
    const updatedShipment = req.body;
    
    // Find the index of the shipment in the array
    const shipmentIndex = shipmentsData.findIndex(shipment => shipment.shipmentId === shipmentId);
    
    if (shipmentIndex === -1) {
        return res.status(404).json({ error: 'Not found', message: 'Vente non trouvée' });
    }
    
    // Calculate total price if not provided
    let totalePrice = updatedShipment["totale price"] || 0;
    if (!totalePrice && updatedShipment.product && updatedShipment.product.length > 0) {
        totalePrice = updatedShipment.product.reduce((total, item) => {
            return total + (parseFloat(item.price) * parseFloat(item.qte) || 0);
        }, 0);
    }
    
    // Ensure shipmentId remains the same
    updatedShipment.shipmentId = shipmentId;
    updatedShipment["totale price"] = totalePrice;
    
    // Update the shipment
    shipmentsData[shipmentIndex] = updatedShipment;
    
    // Write updated data back to file
    fs.writeFile("./Shipments.json", JSON.stringify(shipmentsData, null, 2), (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ error: 'Server error', message: 'Erreur lors de la mise à jour' });
        }
        res.status(200).json({ 
            message: 'Vente mise à jour avec succès',
            shipment: updatedShipment 
        });
    });
});

// Delete shipment
app.delete('/shipments/:id', (req, res) => {
    const shipmentId = req.params.id;
    
    // Find the index of the shipment in the array
    const shipmentIndex = shipmentsData.findIndex(shipment => shipment.shipmentId === shipmentId);
    
    if (shipmentIndex === -1) {
        return res.status(404).json({ error: 'Not found', message: 'Vente non trouvée' });
    }
    
    // Remove the shipment from the array
    shipmentsData.splice(shipmentIndex, 1);
    
    // Write updated data back to file
    fs.writeFile("./Shipments.json", JSON.stringify(shipmentsData, null, 2), (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ error: 'Server error', message: 'Erreur lors de la suppression' });
        }
        res.status(200).json({ 
            message: 'Vente supprimée avec succès'
        });
    });
});

server.listen(port, () => console.log("listening on port " + port));
