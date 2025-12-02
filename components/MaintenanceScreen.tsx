import React from 'react';

interface MaintenanceScreenProps {
  message?: string;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ message }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      backgroundColor: '#f8f8f8',
      color: '#333',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>{message || "We'll be back soon!"}</h1>
      <p>Sorry for the inconvenience but we&rsquo;re performing some maintenance at the moment. We&rsquo;ll be back online shortly!</p>
      <p>&mdash; The StealDeal Team</p>
    </div>
  );
};

export default MaintenanceScreen;