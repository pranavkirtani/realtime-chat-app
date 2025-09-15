import React from 'react';

interface ConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'connecting';
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'connecting':
        return 'Connecting...';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'connected':
        return 'status-connected';
      case 'disconnected':
        return 'status-disconnected';
      case 'connecting':
        return 'status-connecting';
    }
  };

  return (
    <div className={`connection-status ${getStatusClass()}`}>
      <span className="status-dot">●</span>
      <span className="status-text">{getStatusText()}</span>
    </div>
  );
};