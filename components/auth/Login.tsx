import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAppContext } from '../../context/AppContext';

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { showToast } = useToast();
  const { setCurrentUser } = useAppContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.token;
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            const userId = payload?.user?.id;
            let user = null;
            if (userId) {
              const userRes = await fetch(`/api/users/${userId}`, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });
              if (userRes.ok) {
                const userData = await userRes.json();
                user = userData;
              } else {
                user = { id: userId, name: '', phone: '', role: payload?.user?.role || 'user' } as any;
              }
            }
            setCurrentUser(user as any, token);
          } catch (e) {
            setCurrentUser(null, token);
          }
        } else {
          setCurrentUser(null, null);
        }
        showToast('Success', 'Logged in successfully!', 'success');
      } else {
        showToast('Error', data.msg || 'Login failed.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Error', 'Server error during login.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Login
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Don't have an account? <button onClick={onSwitchToRegister} className="text-indigo-600 hover:underline">Register</button>
      </p>
    </div>
  );
};

export default Login;