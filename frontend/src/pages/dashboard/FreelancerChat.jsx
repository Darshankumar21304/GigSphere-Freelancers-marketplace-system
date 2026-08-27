import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { 
  Search, MoreVertical, Paperclip, Send, 
  File as FileIcon, ChevronLeft, Info, X, 
  Smile, Check, CheckCheck 
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import './FreelancerChat.css';

// Connect to backend Socket.IO (Preserving exact logic from original)
const socket = io('http://localhost:5001');

export default function FreelancerChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);

  // UI State
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
  
  // Real-time Mock users for the chat (Preserving exact logic from original)
  const currentUser = { id: 1, name: 'Sarah Jenkins (Freelancer)' };
  const clientUser = { id: 2, name: 'Alice Smith (Client)' };
  const roomId = [currentUser.id, clientUser.id].sort().join('_');

  // Mock Project Details
  const projectDetails = {
    title: 'E-commerce React Application',
    budget: 85000,
    deadline: 'Nov 15, 2023',
    status: 'In Progress',
    sharedFiles: 3
  };

  useEffect(() => {
    // Join room
    socket.emit('join_room', roomId);

    // Fetch initial chat history
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/messages/history/${currentUser.id}/${clientUser.id}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };
    fetchHistory();

    // Socket listeners
    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user_typing', (data) => {
      if (data.sender_id !== currentUser.id) {
        setIsTyping(true);
        clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
    };
  }, [roomId, currentUser.id, clientUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket.emit('typing', { room: roomId, sender_id: currentUser.id });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !file) return;

    let fileUrl = null;

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const uploadRes = await axios.post('http://localhost:5001/api/messages/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        fileUrl = uploadRes.data.fileUrl;
      } catch (error) {
        console.error('Error uploading file:', error);
        return;
      }
    }

    const messageData = {
      room: roomId,
      sender_id: currentUser.id,
      receiver_id: clientUser.id,
      message_text: newMessage,
      file_url: fileUrl,
      timestamp: new Date().toISOString()
    };

    socket.emit('send_message', messageData);
    
    // Optimistic Update
    setMessages((prev) => [...prev, messageData]);
    setNewMessage('');
    setFile(null);
  };

  const handleTextareaInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
    handleTyping(e);
  };

  const openChatOnMobile = () => {
    if (window.innerWidth <= 768) {
      setMobileView('chat');
    }
  };

  return (
    <div className="gigsphere-freelancer-messages">
      <div className="messages-container">
        
        {/* PANEL LEFT: Conversation List */}
        <div className={`panel-left ${mobileView === 'chat' ? 'hidden-on-mobile' : ''}`}>
          <div className="list-header">
            <h2 className="list-title">Messages</h2>
            <div className="search-box">
              <Search className="search-icon" size={16} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="tabs">
              <button className={`tab-btn ${activeTab === 'All' ? 'active' : ''}`} onClick={() => setActiveTab('All')}>All</button>
              <button className={`tab-btn ${activeTab === 'Unread' ? 'active' : ''}`} onClick={() => setActiveTab('Unread')}>Unread</button>
            </div>
          </div>
          
          <div className="conversation-list">
            <div className="conversation-item active" onClick={openChatOnMobile}>
              <div className="avatar-wrapper">
                <img src="https://i.pravatar.cc/150?img=5" alt="Alice" className="avatar" />
                <div className="status-dot"></div>
              </div>
              <div className="conv-info">
                <div className="conv-header">
                  <h3 className="client-name">{clientUser.name}</h3>
                  <span className="conv-time">Now</span>
                </div>
                <p className="conv-project">{projectDetails.title}</p>
                <div className="conv-preview-wrapper">
                  <p className="conv-preview">Sure, I'll send the files over.</p>
                  <span className="unread-badge">2</span>
                </div>
              </div>
            </div>

            {/* Mock Inactive Conversation */}
            <div className="conversation-item">
              <div className="avatar-wrapper">
                <img src="https://i.pravatar.cc/150?img=11" alt="Bob" className="avatar" style={{opacity: 0.6}} />
                <div className="status-dot offline"></div>
              </div>
              <div className="conv-info">
                <div className="conv-header">
                  <h3 className="client-name" style={{color: 'var(--text-muted)'}}>Bob Johnson (Client)</h3>
                  <span className="conv-time">2d</span>
                </div>
                <p className="conv-project" style={{color: 'var(--text-muted)'}}>Website Redesign</p>
                <div className="conv-preview-wrapper">
                  <p className="conv-preview">Thanks for the delivery!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL CENTER: Active Chat */}
        <div className="panel-center">
          <div className="chat-header">
            <div className="chat-header-info">
              <button className="back-btn" onClick={() => setMobileView('list')}>
                <ChevronLeft size={24} />
              </button>
              <div className="avatar-wrapper">
                <img src="https://i.pravatar.cc/150?img=5" alt="Alice" className="avatar" style={{width: '40px', height: '40px'}} />
                <div className="status-dot"></div>
              </div>
              <div className="chat-title-group">
                <h2>{clientUser.name}</h2>
                <p className="chat-subtitle">{projectDetails.title}</p>
              </div>
            </div>
            <div className="chat-actions">
              <button className="icon-btn" title="Search Messages"><Search size={20} /></button>
              <button className="icon-btn drawer-toggle-btn" onClick={() => setShowDrawer(true)} title="Project Details"><Info size={20} /></button>
              <button className="icon-btn" title="More"><MoreVertical size={20} /></button>
            </div>
          </div>

          <div className="chat-area">
            <div className="date-separator"><span>Today</span></div>
            
            {messages.map((msg, idx) => {
              const isMe = msg.sender_id === currentUser.id;
              const timeString = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
              return (
                <div key={idx} className={`message-row ${isMe ? 'outgoing' : 'incoming'}`}>
                  <div className="message-bubble">
                    {msg.file_url && (
                      <div className="attachment-preview">
                        {msg.file_url.match(/\.(jpeg|jpg|gif|png)$/i) != null ? (
                          <img src={msg.file_url} alt="attachment" className="attachment-image" />
                        ) : (
                          <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="attachment-file">
                            <FileIcon size={16} /> <span>View Attachment</span>
                          </a>
                        )}
                      </div>
                    )}
                    {msg.message_text && <p className="message-text">{msg.message_text}</p>}
                    <div className="message-meta">
                      {timeString}
                      {isMe && <CheckCheck size={14} color="#a7f3d0" />}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="message-row incoming">
                <div className="message-bubble">
                  <div className="typing-indicator">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="composer">
            {file && (
              <div className="file-preview">
                <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <FileIcon size={14} /> {file.name}
                </span>
                <button type="button" className="remove-file" onClick={() => setFile(null)}>Remove</button>
              </div>
            )}
            <form className="composer-inner" onSubmit={sendMessage}>
              <div className="composer-actions">
                <label className="attach-label" title="Attach file">
                  <Paperclip size={20} />
                  <input type="file" style={{display: 'none'}} onChange={handleFileChange} />
                </label>
              </div>
              
              <textarea 
                className="composer-input"
                placeholder="Write a message..."
                rows="1"
                value={newMessage}
                onChange={handleTextareaInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
              
              <div className="composer-actions">
                <button type="button" className="icon-btn" style={{width: '32px', height: '32px'}}>
                  <Smile size={20} />
                </button>
                <button 
                  type="submit" 
                  className="send-btn" 
                  disabled={!newMessage.trim() && !file}
                >
                  <Send size={16} style={{marginLeft: '2px'}} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* PANEL RIGHT: Client / Project Details */}
        <div className={`panel-right ${showDrawer ? 'drawer-open' : ''}`}>
          <div className="details-header">
            <h3 className="details-title">Details</h3>
            <button className="icon-btn close-drawer-btn" onClick={() => setShowDrawer(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="details-body">
            <div className="details-section">
              <h4 className="section-title">Client Information</h4>
              <div className="info-card" style={{alignItems: 'center', textAlign: 'center'}}>
                <img src="https://i.pravatar.cc/150?img=5" alt="Alice" style={{width: '64px', height: '64px', borderRadius: '50%'}} />
                <div className="info-row">
                  <span className="info-value" style={{fontSize: '16px'}}>{clientUser.name}</span>
                  <span className="info-label">New York, USA • 8:20 AM</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h4 className="section-title">Project Information</h4>
              <div className="info-card">
                <div className="info-row">
                  <span className="info-label">Project</span>
                  <span className="info-value">{projectDetails.title}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Budget</span>
                  <span className="info-value amount">{formatINR(projectDetails.budget)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Deadline</span>
                  <span className="info-value">{projectDetails.deadline}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status</span>
                  <span className="info-value" style={{color: 'var(--primary)'}}>{projectDetails.status}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h4 className="section-title">Shared Files</h4>
              <div className="info-card">
                <div className="info-row" style={{flexDirection: 'row', alignItems: 'center', gap: '8px'}}>
                  <div style={{padding: '8px', backgroundColor: 'rgba(37,99,235,0.1)', borderRadius: '8px', color: 'var(--primary)'}}>
                    <FileIcon size={16} />
                  </div>
                  <div style={{flex: 1}}>
                    <div className="info-value">requirements_v2.pdf</div>
                    <div className="info-label">1.2 MB</div>
                  </div>
                </div>
                <div className="info-row" style={{flexDirection: 'row', alignItems: 'center', gap: '8px'}}>
                  <div style={{padding: '8px', backgroundColor: 'rgba(37,99,235,0.1)', borderRadius: '8px', color: 'var(--primary)'}}>
                    <FileIcon size={16} />
                  </div>
                  <div style={{flex: 1}}>
                    <div className="info-value">assets_bundle.zip</div>
                    <div className="info-label">4.5 MB</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
