import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Products from "./pages/Products/Products";
import Shipment from "./pages/Shipments/Shipments";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/shipments" element={<Shipment />} />
          <Route path="/contacts/employes" element={<h1>Employees Page</h1>} />
          <Route path="/contacts/clients" element={<h1>Clients Page</h1>} />
          <Route path="/contacts/fourniseur" element={<h1>Fourniseur Page</h1>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
