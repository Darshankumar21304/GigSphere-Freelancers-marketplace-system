import React from 'react';
import { X, Download, FileText, Image as ImageIcon, Video, Music, ExternalLink } from 'lucide-react';
import PdfCanvasViewer from './PdfCanvasViewer';

export default function MediaPreviewModal({ isOpen, onClose, file }) {
  if (!isOpen || !file) return null;

  const url = file.url || '';
  const name = file.name || 'Deliverable Asset';
  const fileName = name.toLowerCase();
  const fileUrl = url.toLowerCase();
  const mimeType = (file.type || '').toLowerCase();

  // Precise type detection
  const isPdf = fileName.endsWith('.pdf') || 
                mimeType.includes('pdf') || 
                fileUrl.includes('.pdf') || 
                fileUrl.includes('/documents/');

  const isImage = !isPdf && (
    /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(fileUrl) || 
    /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(fileName) || 
    mimeType.startsWith('image/')
  );

  const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(fileUrl) || mimeType.startsWith('video/');
  const isAudio = /\.(mp3|wav|ogg|m4a)$/i.test(fileUrl) || mimeType.startsWith('audio/');

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        zIndex: 999999,
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          maxWidth: '960px',
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            {isImage && <ImageIcon size={20} color="#1a73e8" />}
            {isPdf && <FileText size={20} color="#dc2626" />}
            {isVideo && <Video size={20} color="#9333ea" />}
            {isAudio && <Music size={20} color="#16a34a" />}
            {!isImage && !isPdf && !isVideo && !isAudio && <FileText size={20} color="#64748b" />}
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a 
              href={url} 
              download={name}
              target="_blank" 
              rel="noopener noreferrer"
              style={{ padding: '6px 14px', background: '#e8f0fe', color: '#1a73e8', borderRadius: '30px', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} /> Download File
            </a>
            <button 
              onClick={onClose}
              style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justify: 'center', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body / Media Viewport */}
        <div style={{ padding: isPdf ? 0 : '1rem', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '460px', height: isPdf ? '76vh' : 'auto', background: '#0f172a' }}>
          {isImage && (
            <img 
              src={url} 
              alt={name} 
              style={{ maxWidth: '100%', maxHeight: '74vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} 
            />
          )}

          {isPdf && (
            <PdfCanvasViewer url={url} filename={name} />
          )}

          {isVideo && (
            <video 
              controls 
              autoPlay 
              style={{ maxWidth: '100%', maxHeight: '74vh', borderRadius: '12px' }}
            >
              <source src={url} />
              Your browser does not support the video tag.
            </video>
          )}

          {isAudio && (
            <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', textOverflow: 'ellipsis', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
              <Music size={48} color="#1a73e8" style={{ marginBottom: '16px' }} />
              <h4 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#0f172a' }}>{name}</h4>
              <audio controls src={url} style={{ width: '100%', minWidth: '300px' }} />
            </div>
          )}

          {!isImage && !isPdf && !isVideo && !isAudio && (
            <div style={{ background: '#fff', padding: '40px 30px', borderRadius: '16px', textAlign: 'center', maxWidth: '420px', width: '100%', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
              <FileText size={48} color="#64748b" style={{ marginBottom: '16px' }} />
              <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{name}</h4>
              <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '0.85rem' }}>This global deliverable is ready for preview or download.</p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ padding: '10px 24px', background: '#1a73e8', color: '#fff', borderRadius: '30px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <ExternalLink size={16} /> Open Document Link
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
