import React from 'react';
import { ExclamationCircleIcon } from './Icons';

const NoInternetScreen: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      backgroundColor: '#282c34', // Darker background
      color: '#e0e0e0', // Light gray text
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      animation: 'fadeIn 1s ease-out', // Fade-in animation
    }}>
      <ExclamationCircleIcon className="h-24 w-24 text-red-500 mb-6" /> {/* Prominent icon */}
      <h1 style={{ fontSize: '2.5em', marginBottom: '15px' }}>No Internet Connection</h1>
      <p style={{ fontSize: '1.2em', marginBottom: '30px' }}>
        Oops! It looks like you're offline. Please check your network connection.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '12px 25px',
          fontSize: '1.1em',
          cursor: 'pointer',
          backgroundColor: '#61dafb', // Vibrant blue
          color: '#282c34',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          transition: 'background-color 0.3s ease',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4fa3d1')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#61dafb')}
      >
        Reload Page
      </button>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NoInternetScreen;