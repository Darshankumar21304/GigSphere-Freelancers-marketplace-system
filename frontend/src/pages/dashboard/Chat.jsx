import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { 
  Search, MoreVertical, Paperclip, Send, 
  File as FileIcon, ChevronLeft, Info, X, 
  Smile, Check, CheckCheck, MessageSquare, Plus, Briefcase
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { Link } from 'react-router-dom';
import { uploadFileToCloudinary } from '../../utils/fileUpload';
import MediaPreviewModal from '../../components/MediaPreviewModal';
import './Chat.css';

const socket = io('http://localhost:5001');

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  // Media Preview State
  const [previewFile, setPreviewFile] = useState(null);
  const [isMediaPreviewOpen, setIsMediaPreviewOpen] = useState(false);

  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDrawer, setShowDrawer] = useState(false);
  const [mobileView, setMobileView] = useState('list');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/messages/conversations');
        setConversations(response.data || []);
        if (response.data && response.data.length > 0) {
          setActiveConversation(response.data[0]);
        }
      } catch (error) {
        setConversations([]);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!activeConversation) return;

    const roomId = [currentUser._id || currentUser.id || 'client', activeConversation.partnerId].sort().join('_');
    socket.emit('join_room', roomId);

    const fetchHistory = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/messages/history/${currentUser._id || currentUser.id || 'client'}/${activeConversation.partnerId}`);
        setMessages(response.data || []);
      } catch (error) {
        setMessages([]);
      }
    };
    fetchHistory();

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user_typing', (data) => {
      if (data.sender_id !== (currentUser._id || currentUser.id)) {
        setIsTyping(true);
        clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
    };
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (activeConversation) {
      const roomId = [currentUser._id || currentUser.id || 'client', activeConversation.partnerId].sort().join('_');
      socket.emit('typing', { room: roomId, sender_id: currentUser._id || currentUser.id });
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const res = await uploadFileToCloudinary(selectedFile, 'gigsphere/chat_attachments');
      setFile({
        name: selectedFile.name,
        url: res.secure_url,
        type: selectedFile.type
      });
    } catch (err) {
      alert('Failed to upload file to Cloudinary.');
    } finally {
      setIsUploading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !file) || !activeConversation) return;

    const roomId = [currentUser._id || currentUser.id || 'client', activeConversation.partnerId].sort().join('_');
    const msgData = {
      room: roomId,
      sender_id: currentUser._id || currentUser.id || 'client',
      receiver_id: activeConversation.partnerId,
      message_text: newMessage,
      file_url: file ? file.url : null,
      timestamp: new Date()
    };

    socket.emit('send_message', msgData);
    setMessages((prev) => [...prev, msgData]);
    setNewMessage('');
    setFile(null);
  };

  const filteredConversations = conversations.filter(c => 
    c.partnerName && c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="gigsphere-client-messages">
      <div className="messages-container">
        
        {/* PANEL LEFT: Conversations */}
        <div className={`panel-left ${mobileView === 'list' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <div className="list-header">
            <h2 className="list-title">Messages</h2>
            <div className="search-box">
              <Search className="search-icon" size={16} />
              <input 
                type="text" 
                className="search-input"
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="tabs">
              <button className={`tab-btn ${activeTab === 'All' ? 'active' : ''}`} onClick={() => setActiveTab('All')}>All</button>
            </div>
          </div>
          
          <div className="conversation-list">
            {filteredConversations.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>0 Active Conversations</span>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <div 
                  key={conv.id || conv.partnerId} 
                  className={`conversation-item ${activeConversation?.partnerId === conv.partnerId ? 'active' : ''}`} 
                  onClick={() => { setActiveConversation(conv); setMobileView('chat'); }}
                >
                  <div className="avatar-wrapper">
                    <img src={conv.avatar || "https://i.pravatar.cc/150?img=12"} alt={conv.partnerName} className="avatar" />
                    <div className="status-dot"></div>
                  </div>
                  <div className="conv-info">
                    <div className="conv-header">
                      <h3 className="client-name">{conv.partnerName}</h3>
                      <span className="conv-time">{conv.time || 'Now'}</span>
                    </div>
                    <p className="conv-project">{conv.projectTitle || 'Project Requirement'}</p>
                    <div className="conv-preview-wrapper">
                      <p className="conv-preview">{conv.lastMessage || 'Click to open conversation'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PANEL CENTER: Active Chat */}
        <div className={`panel-center ${mobileView === 'chat' ? 'mobile-visible' : 'mobile-hidden'}`}>
          {!activeConversation ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', textAlign: 'center', background: '#f8fafc' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <MessageSquare size={32} color="#1a73e8" />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>No Conversations Yet</h3>
              <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: '0.9rem', maxWidth: '380px', lineHeight: 1.5 }}>
                Direct messages with freelancers will appear here when you post project requirements or receive proposals.
              </p>
              <Link to="/client/dashboard/create-project" style={{ padding: '12px 26px', background: '#1a73e8', color: '#ffffff', borderRadius: '30px', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(26,115,232,0.25)' }}>
                + Post a Project Requirement
              </Link>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-header-info">
                  <button className="back-btn" onClick={() => setMobileView('list')}>
                    <ChevronLeft size={24} />
                  </button>
                  <div className="avatar-wrapper">
                    <img src={activeConversation.avatar || "https://i.pravatar.cc/150?img=12"} alt={activeConversation.partnerName} className="avatar" style={{width: '40px', height: '40px'}} />
                    <div className="status-dot"></div>
                  </div>
                  <div className="chat-title-group">
                    <h2>{activeConversation.partnerName}</h2>
                    <p className="chat-subtitle">{activeConversation.projectTitle || 'GigSphere Requirement'}</p>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="icon-btn" title="Search Messages"><Search size={20} /></button>
                  <button className="icon-btn drawer-toggle-btn" onClick={() => setShowDrawer(true)} title="Details"><Info size={20} /></button>
                </div>
              </div>

              <div className="chat-area">
                <div className="date-separator"><span>Today</span></div>
                
                {messages.map((msg, idx) => {
                  const isMe = msg.sender_id === (currentUser._id || currentUser.id || 'client');
                  const timeString = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={idx} className={`message-row ${isMe ? 'outgoing' : 'incoming'}`}>
                      <div className="message-bubble">
                        {msg.file_url && (
                          <div className="attachment-preview" onClick={() => { setPreviewFile({ url: msg.file_url, name: 'Chat Attachment' }); setIsMediaPreviewOpen(true); }} style={{ cursor: 'pointer' }}>
                            {msg.file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null ? (
                              <img src={msg.file_url} alt="attachment" className="attachment-image" style={{ borderRadius: '8px', maxHeight: '200px', cursor: 'pointer' }} />
                            ) : (
                              <div className="attachment-file" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FileIcon size={16} /> <span>Preview In-App</span>
                              </div>
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
                  <label className="icon-btn attachment-btn" style={{ cursor: 'pointer' }}>
                    <Paperclip size={20} />
                    <input type="file" onChange={handleFileChange} style={{ display: 'none' }} disabled={isUploading} />
                  </label>
                  <input 
                    type="text" 
                    placeholder={isUploading ? "Uploading attachment..." : "Write a message..."} 
                    value={newMessage}
                    onChange={handleTyping}
                    className="chat-input"
                    disabled={isUploading}
                  />
                  
                  <div className="composer-actions">
                    <button 
                      type="submit" 
                      className="send-btn" 
                      disabled={(!newMessage.trim() && !file) || isUploading}
                    >
                      <Send size={16} style={{marginLeft: '2px'}} />
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        {/* PANEL RIGHT: Freelancer / Project Details */}
        {activeConversation && (
          <div className={`panel-right ${showDrawer ? 'drawer-open' : ''}`}>
            <div className="details-header">
              <h3 className="details-title">Details</h3>
              <button className="icon-btn close-drawer-btn" onClick={() => setShowDrawer(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="details-body">
              <div className="details-section">
                <h4 className="section-title">Freelancer Information</h4>
                <div className="info-card" style={{alignItems: 'center', textAlign: 'center'}}>
                  <img src={activeConversation.avatar || "https://i.pravatar.cc/150?img=12"} alt={activeConversation.partnerName} style={{width: '64px', height: '64px', borderRadius: '50%'}} />
                  <div className="info-row">
                    <span className="info-value" style={{fontSize: '16px'}}>{activeConversation.partnerName}</span>
                    <span className="info-label">GigSphere Verified Freelancer</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h4 className="section-title">Project Information</h4>
                <div className="info-card">
                  <div className="info-row">
                    <span className="info-label">Project</span>
                    <span className="info-value">{activeConversation.projectTitle || 'Requirement'}</span>
                  </div>
                  {activeConversation.budget && (
                    <div className="info-row">
                      <span className="info-label">Budget</span>
                      <span className="info-value amount">{formatINR(activeConversation.budget)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      <MediaPreviewModal 
        isOpen={isMediaPreviewOpen} 
        onClose={() => setIsMediaPreviewOpen(false)} 
        file={previewFile} 
      />
    </div>
  );
}
