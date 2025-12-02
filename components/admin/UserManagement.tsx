import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { User } from '../../types';
import UserForm from './UserForm';
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon } from '../Icons';

const UserManagement: React.FC = () => {
  const { users, deleteUser } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const openAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };
  
  const getRoleClass = (role: 'admin' | 'user') => {
      return role === 'admin' 
        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' 
        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Manage Users</h2>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <PlusIcon /> Add User
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(user => (
            <div key={user.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg shadow-sm border dark:border-gray-700 flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <UserCircleIcon />
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</p>
                            </div>
                        </div>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleClass(user.role)}`}>{user.role}</span>
                    </div>
                </div>
                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t dark:border-gray-600">
                    <button onClick={() => openEditModal(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={`Edit ${user.name}`}>
                        <PencilIcon />
                    </button>
                    <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={`Delete ${user.name}`}>
                        <TrashIcon />
                    </button>
                </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <UserForm user={editingUser} onClose={closeModal} />
      )}
    </div>
  );
};

export default UserManagement;