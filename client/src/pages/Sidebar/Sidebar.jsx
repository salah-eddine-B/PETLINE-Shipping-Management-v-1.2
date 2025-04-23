import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '../../assets/icons/Dashboard.svg';
import ProductIcon from '../../assets/icons/Products.svg';
import ShipmentIcon from '../../assets/icons/Panier.svg';
import ContactIcon from '../../assets/icons/Contacts.svg';
import Logo from '../../assets/icons/PETLINELOGO.svg';
import './Sidebar.css';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
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
                    path: "/employees",
                    name: "Employés"
                },
                {
                    path: "/clients",
                    name: "Clients",
                },
                {
                    path: "/suppliers",
                    name: "Fournisseurs"
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

    // Set active states based on current path when component mounts
    React.useEffect(() => {
        const currentPath = location.pathname;
        const menuIndex = menuItems.findIndex(item => {
            if (item.submenu) {
                return item.submenu.some(subItem => currentPath === subItem.path);
            }
            return currentPath === item.path;
        });
        
        if (menuIndex !== -1) {
            setActiveIndex(menuIndex);
            if (menuItems[menuIndex].submenu) {
                const subItem = menuItems[menuIndex].submenu.find(item => item.path === currentPath);
                if (subItem) {
                    setActiveSubMenu(subItem.name);
                }
            }
        }
    }, [location.pathname]);

    const handleActiveMenu = (index, path, hasSubmenu) => {
        setActiveIndex(prevIndex => prevIndex === index ? null : index);
        if (!hasSubmenu) {
            navigate(path);
            setActiveSubMenu('');
        }
    };

    const handleSubMenu = (subItem) => {
        setActiveSubMenu(prev => prev === subItem.name ? '' : subItem.name);
        navigate(subItem.path);
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
                                onClick={() => handleActiveMenu(index, item.path, false)}
                            >
                                <img src={item.icon} alt={item.name} />
                                <span>{item.name}</span>
                            </div>
                        ) : (
                            <div className={`submenu ${activeIndex === index ? 'active' : ''}`}>
                                <div 
                                    className="menu-item-content"
                                    onClick={() => handleActiveMenu(index, item.path, true)}
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
                                                onClick={() => handleSubMenu(subItem)}
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
