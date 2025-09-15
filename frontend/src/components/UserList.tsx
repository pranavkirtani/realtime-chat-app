import React from 'react';
import { User } from '../types';

interface UserListProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (userId: string | null) => void;
  currentUserId: string;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  selectedUserId,
  onSelectUser,
  currentUserId
}) => {
  const onlineUsers = users.filter(u => u.isOnline);
  const offlineUsers = users.filter(u => !u.isOnline);

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Conversations</h3>
      </div>
      
      <div
        className={`user-item ${selectedUserId === null ? 'selected' : ''}`}
        onClick={() => onSelectUser(null)}
      >
        <div className="user-avatar">🌍</div>
        <div className="user-info">
          <span className="user-name">Public Chat</span>
          <span className="user-status">Everyone</span>
        </div>
      </div>

      {onlineUsers.length > 0 && (
        <>
          <div className="user-section-header">Online ({onlineUsers.length})</div>
          {onlineUsers.map(user => (
            <div
              key={user.id}
              className={`user-item ${selectedUserId === user.id ? 'selected' : ''}`}
              onClick={() => onSelectUser(user.id)}
            >
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-status online">● Online</span>
              </div>
            </div>
          ))}
        </>
      )}

      {offlineUsers.length > 0 && (
        <>
          <div className="user-section-header">Offline ({offlineUsers.length})</div>
          {offlineUsers.map(user => (
            <div
              key={user.id}
              className={`user-item ${selectedUserId === user.id ? 'selected' : ''}`}
              onClick={() => onSelectUser(user.id)}
            >
              <div className="user-avatar offline">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.username}</span>
                <span className="user-status offline">Offline</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};