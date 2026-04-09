import React, { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { FaChevronDown, FaChevronUp, FaSignOutAlt, FaHome, FaUser, FaDiscourse } from 'react-icons/fa';
import logo from '../../assets/instalogo.png';
import DashboardHeader from '../../components/DashboardHeader';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../store/slices/authSlice';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const userType = localStorage.getItem('userID');

  const onLogoutClick = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  const menuItems = [
    { name: 'Dashboard', icon: <FaHome className="mr-2" />, path: '/dashboard' },
    {
      name: 'Manage Courses',
      icon: <FaDiscourse className="mr-2" />,
      path: '#',
      submenu: [
        { name: 'Manage Category', path: '/dashboard/categories' },
        { name: 'Manage SubCategory', path: '/dashboard/sub-category' },
        { name: 'Manage Videos', path: '/dashboard/videos' },
        { name: 'Manage Ebooks', path: '/dashboard/ebooks' },
        { name: 'Manage Tags', path: '/dashboard/tags' },
      ]
    },
    { name: 'Manage Instructor', icon: <FaUser className="mr-2" />, path: '/dashboard/instructor' },
  ].filter(Boolean);




  return (
    <div className="flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col fixed z-40 h-screen">
        {/* Logo */}
        <div className="p-4">
          <img src={logo} alt="Logo" className="w-52 mx-auto mb-4" />
        </div>

        {/* Scrollable Menu */}
        <div className="flex-1 px-2 sidebar-scroll overflow-y-auto">
          <nav className="flex flex-col space-y-1 pb-4">
            {menuItems.map((item: any) => (
              <div key={item.name}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className="flex items-center justify-between w-full p-3 text-gray-700 hover:text-blue-600 rounded hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        {item.icon}
                        <span>{item.name}</span>
                      </div>
                      {openSubmenu === item.name ? (
                        <FaChevronUp className="w-3 h-3" />
                      ) : (
                        <FaChevronDown className="w-3 h-3" />
                      )}
                    </button>
                    {openSubmenu === item.name && (
                      <div className="ml-6 mt-1 mb-2 flex flex-col space-y-1">
                        {item.submenu.map((subItem: any) => (
                          <Link
                            key={subItem.name}
                            to={subItem.path}
                            className="p-2 text-sm text-gray-600 hover:text-blue-600 rounded hover:bg-gray-50"
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className="flex items-center p-3 text-gray-700 hover:text-blue-600 rounded hover:bg-gray-100"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Admin Dropdown */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-full p-2 text-gray-700 hover:text-blue-600 rounded hover:bg-gray-100"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                <span className="text-sm font-medium">{userType?.slice(0, 2)}</span>
              </div>
              <span>{userType}</span>
            </div>
            {isDropdownOpen ? (
              <FaChevronUp className="w-4 h-4" />
            ) : (
              <FaChevronDown className="w-4 h-4" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="mt-2 py-2 bg-white rounded-md shadow-lg">
              <button
                onClick={() => navigate('/dashboard/profile')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaUser className="w-4 h-4 mr-2" />
                Profile
              </button>
              <button
                onClick={onLogoutClick}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FaSignOutAlt className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col bg-gray-100">
        <DashboardHeader />
        <div className="flex-1 p-4 overflow-x-hidden text-gray-900">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
