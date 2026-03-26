'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  User,
  Stethoscope,
  MessageSquare,
  Dumbbell,
  MapPin,
  LogOut,
  Shield,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      const picKey = `profilePicture_${parsedUser.email}`;
      const savedPic = localStorage.getItem(picKey);
      if (savedPic) setProfilePicture(savedPic);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Stethoscope, label: 'Symptoms', path: '/symptoms' },
    { icon: FileText, label: 'Analysis', path: '/analysis' },
    { icon: MessageSquare, label: 'AI Chat', path: '/chat' },
    { icon: Stethoscope, label: 'Doctor Consult', path: '/consult-doctor' },
    { icon: Dumbbell, label: 'Exercises', path: '/exercises' },
    { icon: MapPin, label: 'Hospitals', path: '/hospitals' }

    // ✅ Added Doctor Consult Option
  ];

  if (user?.role === 'admin') {
    menuItems.unshift({ icon: Shield, label: 'Admin', path: '/admin' });
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-7 w-7 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">MEDEXA</span>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(false)}>
          <X className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-semibold overflow-hidden flex-shrink-0">
              {profilePicture ? (
                <img src={profilePicture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <li key={item.path}>
                <button
                  onClick={() => {
                    router.push(item.path);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => setMobileOpen(true)}>
          <Menu className="h-6 w-6 text-gray-700" />
        </button>
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-gray-900">MEDEXA</span>
        </div>
        <div className="w-6" />
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white transform transition-transform duration-300 md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}