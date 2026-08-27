import React, { useState } from 'react';
import { Bell, CheckCircle, MessageSquare, Briefcase, FileText, X, Check, CheckCheck } from 'lucide-react';
import './Notifications.css';

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'message',
    title: 'New Message from Sarah',
    description: 'Sarah sent you a message regarding the "E-commerce React Application" project.',
    time: '2 hours ago',
    read: false,
    icon: MessageSquare,
    iconColor: '#3b82f6',
    bgColor: '#eff6ff'
  },
  {
    id: 'notif-2',
    type: 'proposal',
    title: 'New Proposal Received',
    description: 'Alex Johnson has submitted a proposal for your project "Corporate Website Redesign".',
    time: '5 hours ago',
    read: false,
    icon: FileText,
    iconColor: '#8b5cf6',
    bgColor: '#f5f3ff'
  },
  {
    id: 'notif-3',
    type: 'project',
    title: 'Project Milestone Completed',
    description: 'Milestone 1 for "Node.js Backend" has been marked as completed by the freelancer.',
    time: '1 day ago',
    read: true,
    icon: CheckCircle,
    iconColor: '#10b981',
    bgColor: '#ecfdf5'
  },
  {
    id: 'notif-4',
    type: 'system',
    title: 'Payment Successful',
    description: 'Your payment of $500 for milestone 1 has been processed successfully.',
    time: '2 days ago',
    read: true,
    icon: Briefcase,
    iconColor: '#f59e0b',
    bgColor: '#fffbeb'
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Unread'];

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'Unread') return !n.read;
    return true;
  });

  return (
    <div className="gigsphere-notifications">
      <div className="notifications-container">
        
        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">Dashboard / Notifications</div>
          <div className="title-row">
            <h1 className="page-title">Notifications</h1>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} New</span>
            )}
          </div>
          <p className="page-desc">Stay updated with your latest alerts, messages, and project activities.</p>
        </div>

        <div className="dashboard-content">
          <div className="card notifications-card">
            
            {/* Toolbar */}
            <div className="notifications-toolbar">
              <div className="filters">
                {filters.map(filter => (
                  <button 
                    key={filter}
                    className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <button className="mark-read-btn" onClick={markAllAsRead} disabled={unreadCount === 0}>
                <CheckCheck size={18} /> Mark all as read
              </button>
            </div>

            {/* List */}
            <div className="notifications-list">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notification => {
                  const Icon = notification.icon;
                  return (
                    <div key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                      <div className="notification-icon" style={{ backgroundColor: notification.bgColor, color: notification.iconColor }}>
                        <Icon size={20} />
                      </div>
                      
                      <div className="notification-content">
                        <div className="notification-header">
                          <h4 className="notification-title">{notification.title}</h4>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                        <p className="notification-desc">{notification.description}</p>
                      </div>

                      <div className="notification-actions">
                        {!notification.read && (
                          <button className="action-btn check-btn" onClick={() => markAsRead(notification.id)} title="Mark as read">
                            <Check size={18} />
                          </button>
                        )}
                        <button className="action-btn delete-btn" onClick={() => deleteNotification(notification.id)} title="Remove">
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <Bell className="empty-icon" size={48} />
                  <h3 className="empty-title">All caught up!</h3>
                  <p className="empty-desc">You don't have any {activeFilter.toLowerCase()} notifications right now.</p>
                </div>
              )}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
