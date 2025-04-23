import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Products from "./pages/Products/Products";
import Shipment from "./pages/Shipments/Shipments";
import Clients from "./pages/Clients/Clients";
import Employees from "./pages/Employees/Employees";
import Suppliers from "./pages/Suppliers/Suppliers";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/shipments" element={<Shipment />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/suppliers" element={<Suppliers />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
