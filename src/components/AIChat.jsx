import { useState, useRef, useEffect } from 'react';
import { XIcon } from '../components/icons';

const AIChat = ({ isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  if (!isOpen) {
    return (
      <button
        className="ai-chat-fab"
        onClick={toggleChat}
        aria-label="Asistente IA (requiere API key)"
        title="Asistente IA - Configura VITE_GEMINI_API_KEY en .env"
      >
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
          <path d="M12 6a6 6 0 0 1 6 6c0 1.53-.48 2.96-1.3 4.14a6 6 0 0 1-9.4 0A6.002 6.002 0 0 1 12 6z"/>
        </svg>
        <span className="ai-badge">IA</span>
      </button>
    );
  }

  return (
    <div className="ai-chat-window" ref={messagesEndRef}>
      <div className="ai-chat-header">
        <div className="ai-header-left">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="18" rx="2" ry="2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
            <path d="M12 15h.01M7 19h10"/>
          </svg>
          <span>Asistente IA</span>
        </div>
        <button className="ai-btn" onClick={toggleChat} title="Cerrar" aria-label="Cerrar chat">
          <XIcon size={18} />
        </button>
      </div>
      
      <div className="ai-chat-messages">
        <div className="ai-message assistant">
          <div className="ai-message-avatar">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="18" rx="2" ry="2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
              <path d="M12 15h.01M7 19h10"/>
            </svg>
          </div>
          <div className="ai-message-content">
            <div className="ai-message-text">
              <p>⚠️ El asistente IA requiere una API key de Gemini.</p>
              <p>1. Crea un archivo <code>.env</code> en la raíz del proyecto</p>
              <p>2. Agrega: <code>VITE_GEMINI_API_KEY=tu_key_aqui</code></p>
              <p>3. Obtén tu key gratis en <a href="https://aistudio.google.com/" target="_blank" rel="noopener">Google AI Studio</a></p>
              <p>4. Reinicia el servidor de desarrollo</p>
            </div>
          </div>
        </div>
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-chat-disabled">
        <p>Configura tu API key para activar el chat</p>
      </div>
    </div>
  );
};

export default AIChat;