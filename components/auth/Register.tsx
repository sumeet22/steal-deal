import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Only allow digits for phone and limit to 10 characters
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: digitsOnly.slice(0, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // Validate phone number
    if (!validatePhoneNumber(formData.phone)) {
      showToast('Error', 'Please enter a valid 10-digit phone number.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Prepend +91 to phone number before sending
      const registrationData = {
        ...formData,
        phone: `+91${formData.phone}`
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Success', data.msg, 'success');
        onSwitchToLogin();
      } else {
        showToast('Error', data.msg || 'Registration failed.', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showToast('Error', 'Server error during registration.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
          <div className="flex gap-2">
            <select
              className="p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none w-24"
              value="+91"
              disabled
            >
              <option value="+91">🇮🇳 +91</option>
            </select>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              maxLength={10}
              className="flex-1 p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="9876543210"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">10-digit mobile number</p>
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        {/* <div>
          <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
          <select
            name="role"
            id="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="user">User</option>
            <option value="user">Admin</option>
          </select>
        </div> */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Already have an account? <button onClick={onSwitchToLogin} className="text-indigo-600 hover:underline">Login</button>
      </p>
    </div>
  );
};

export default Register;