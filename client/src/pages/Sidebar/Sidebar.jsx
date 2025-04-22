import React, { useState } from 'react';
import DashboardIcon from '../../assets/icons/Dashboard.svg';
import ProductIcon from '../../assets/icons/Products.svg';
import ShipmentIcon from '../../assets/icons/Panier.svg';
import ContactIcon from '../../assets/icons/Contacts.svg';
import Logo from '../../assets/icons/PETLINELOGO.svg';
import './Sidebar.css';

export default function Sidebar() {
    const [activeIndex, setActiveIndex] = useState(null);
    const [activeSubMenu, setActiveSubMenu] = useState('');

    const menuItems = [
        {
            path: "/",
            name: "Tableau de bord",
            icon: DashboardIcon,
        },
        {
            path: "/contacts",
            name: "Contacts",
            icon: ContactIcon,
            submenu: [
                {
                    path: "/contacts/employes",
                    name: "Employees"
                },
                {
                    path: "/contacts/clients",
                    name: "Clients",
                },
                {
                    path: "/contacts/fourniseur",
                    name: "Fourniseur"
                }
            ],
        },
        {
            path: "/products",
            name: "Produits",
            icon: ProductIcon,
        },
        {
            path: "/shipments",
            name: "Ventes",
            icon: ShipmentIcon,
        },
    ];

    const handleActiveMenu = (index, path) => {
        setActiveIndex(prevIndex => prevIndex === index ? null : index);
        // You can add navigation logic here when you set up routing
    };

    const handleSubMenu = (subItem) => {
        setActiveSubMenu(prev => prev === subItem ? '' : subItem);
        // You can add navigation logic here when you set up routing
    };

    return (
        <div className="sidebar-container">
            <div className="sidebar-header">
                <img src={Logo} alt="PetLine Logo" />
            </div>
            <nav className="menu-items">
                {menuItems.map((item, index) => (
                    <li
                        key={index}
                        className={`menu-item ${activeIndex === index ? 'active' : ''}`}
                    >
                        {!item.submenu ? (
                            <div 
                                className="menu-item-content"
                                onClick={() => {
                                    handleActiveMenu(index, item.path);
                                    setActiveSubMenu('');
                                }}
                            >
                                <img src={item.icon} alt={item.name} />
                                <span>{item.name}</span>
                            </div>
                        ) : (
                            <div className={`submenu ${activeIndex === index ? 'active' : ''}`}>
                                <div 
                                    className="menu-item-content"
                                    onClick={() => handleActiveMenu(index, item.path)}
                                >
                                    <img src={item.icon} alt={item.name} />
                                    <span>{item.name}</span>
                                </div>
                                
                                {activeIndex === index && (
                                    <ul className="submenu-list">
                                        {item.submenu.map((subItem, subIndex) => (
                                            <li
                                                key={subIndex}
                                                className={`submenu-item ${activeSubMenu === subItem.name ? 'active' : ''}`}
                                                onClick={() => handleSubMenu(subItem.name)}
                                            >
                                                {activeSubMenu === subItem.name && (
                                                    <span className="submenu-indicator"></span>
                                                )}
                                                {subItem.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </li>
                ))}
            </nav>
        </div>
    );
}
