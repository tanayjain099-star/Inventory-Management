import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChat, HiOutlineX, HiOutlinePaperAirplane } from 'react-icons/hi';
import { getChatbotResponse } from '../store/aiEngine';

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: '👋 Hi! I\'m **StockFlow AI**.\n\nI can help you with inventory queries, stock levels, forecasting, and more.\n\nType **"help"** to see what I can do!' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = getChatbotResponse(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
      setTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    'Low stock items',
    'Health score',
    'Warehouse overview',
    'Forecast demand',
  ];

  // Simple markdown-like rendering
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/• /g, '&bull; ');
      return <div key={i} dangerouslySetInnerHTML={{ __html: formatted }} style={{ marginBottom: line ? 4 : 8 }} />;
    });
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24,
          boxShadow: '0 8px 25px rgba(99,102,241,0.4)', zIndex: 1001,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: open ? 90 : 0 }}
      >
        {open ? <HiOutlineX /> : <HiOutlineChat />}
      </motion.button>

      {/* Pulse ring */}
      {!open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: '50%',
          border: '2px solid rgba(99,102,241,0.4)', zIndex: 1000,
          animation: 'pulse-glow 2s ease-in-out infinite',
        }} />
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', bottom: 90, right: 24, width: 400, height: 520,
              background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
              borderRadius: 20, boxShadow: '0 16px 48px rgba(0,0,0,0.5)', zIndex: 1001,
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border-glass)',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>StockFlow AI</div>
                <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></div>
                  Online
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'rgba(255,255,255,0.05)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-glass)',
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  }}
                >
                  {renderText(msg.text)}
                </motion.div>
              ))}
              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: '10px 14px', borderRadius: '14px 14px 14px 4px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)',
                    display: 'flex', gap: 4, alignSelf: 'flex-start',
                  }}
                >
                  {[0, 1, 2].map(d => (
                    <motion.div key={d} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-secondary)' }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }} />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div style={{ padding: '0 16px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {quickActions.map((qa, i) => (
                  <button key={i} onClick={() => { setInput(qa); }}
                    style={{
                      padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500,
                      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                      color: 'var(--accent-secondary)', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}>
                    {qa}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: 12, borderTop: '1px solid var(--border-glass)',
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your inventory..."
                style={{
                  flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)', borderRadius: 12, color: 'var(--text-primary)',
                  fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none',
                }}
                id="chatbot-input"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  width: 38, height: 38, borderRadius: 10, border: 'none',
                  background: input.trim() ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.05)',
                  color: input.trim() ? 'white' : 'var(--text-muted)',
                  cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                id="chatbot-send"
              >
                <HiOutlinePaperAirplane style={{ transform: 'rotate(90deg)' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
