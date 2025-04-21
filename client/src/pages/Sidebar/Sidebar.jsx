import React from 'react'
import DashboardIcon from '../../assets/icons/Dashboard.svg';
import ProductIcon from '../../assets/icons/Products.svg';
import ShipmentIcon from '../../assets/icons/Panier.svg';
import ContactIcon from '../../assets/icons/Contacts.svg';
import Logo from '../../assets/icons/PETLINELOGO.svg';
import './Sidebar.css';

export default function Sidebar() {
    const menuItems = [
        {
            path: "/",
            name: "Dashboard",
            icon: DashboardIcon,
        },
        {
            path: "/products",
            name: "Products",
            icon: ProductIcon,
        },
        {
            path: "/shipments",
            name: "Shipments",
            icon: ShipmentIcon,
        },
        {
            path: "/contacts",
            name: "Contacts",
            icon: ContactIcon,
        },
    ];

    return (
        <div className="sidebar-container">
            <div className="sidebar-header">
                <img src={Logo} alt="PetLine Logo" />
            </div>
            <nav className="menu-items">
                {menuItems.map((item, index) => (
                    <a
                        key={index}
                        href={item.path}
                        className="menu-item"
                    >
                        <img src={item.icon} alt={item.name} />
                        <span>{item.name}</span>
                    </a>
                ))}
            </nav>
        </div>
    );
}
