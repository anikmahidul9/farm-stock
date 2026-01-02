import React from 'react';

export function DashboardHeader() {
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="/dashboard" className="hover:text-gray-300">Home</a></li>
            <li><a href="/dashboard/profile" className="hover:text-gray-300">Profile</a></li>
            <li><a href="/dashboard/settings" className="hover:text-gray-300">Settings</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
