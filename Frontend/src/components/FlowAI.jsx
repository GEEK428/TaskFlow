import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Sparkles } from 'lucide-react';
import api from '../services/api';

/**
 * FlowAI Component
 * A persistent AI productivity coach with real-time streaming capabilities.
 */
const FlowAI = () => {
    // --- State Management ---
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionCount, setSessionCount] = useState(0);
    const [streamingContent, setStreamingContent] = useState('');
    const scrollRef = useRef(null);


    useEffect(() => {

        const sessions = parseInt(localStorage.getItem('flow_sessions') || '0');
        const tooltipSeen = localStorage.getItem('flow_tooltip_seen');

        if (sessions < 3) {
            setSessionCount(sessions + 1);
            localStorage.setItem('flow_sessions', (sessions + 1).toString());
        } else {
            setSessionCount(4);
        }

        if (!tooltipSeen) {
            setTimeout(() => setShowTooltip(true), 2000);
        }


        const fetchHistory = async () => {
            try {
                const res = await api.get('/chat');
                setMessages(res.data);
            } catch (err) {
                console.error('Chat history fetch error:', err);
            }
        };
        fetchHistory();
    }, []);


    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, streamingContent]);

    /**
     * Sends a message to the AI and handles the SSE stream response
     */
    const handleSend = async (e, forcedMessage = null) => {
        if (e) e.preventDefault();
        const msgToSend = forcedMessage || input;
        if (!msgToSend.trim() || loading) return;


        const userMsg = { role: 'user', content: msgToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setStreamingContent('');

        try {
            const token = localStorage.getItem('token');
            const apiUrl = (api.defaults.baseURL || 'http://localhost:5000/api') + '/chat';


            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: msgToSend,
                    history: messages.slice(-10)
                })
            });

            if (!response.ok) throw new Error('API failed');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiContent = '';
            let buffer = '';


            while (true) {
                const { done, value } = await reader.read();
                if (done) break;


                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop();

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('data: ')) {
                        const data = trimmedLine.replace('data: ', '');
                        if (data === '[DONE]') continue;
                        try {
                            const parsedData = JSON.parse(data);
                            if (parsedData.text) {
                                aiContent += parsedData.text;
                                setStreamingContent(aiContent);
                            }
                        } catch (e) { }
                    }
                }
            }


            if (aiContent) {
                setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
            }
        } catch (err) {
            console.error('AI Error:', err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Coach is offline. Try again later!' }]);
        } finally {
            setLoading(false);
            setStreamingContent('');
        }
    };

    const closeTooltip = () => {
        setShowTooltip(false);
        localStorage.setItem('flow_tooltip_seen', 'true');
    };


    useEffect(() => {
        const handleNudge = (e) => {
            setIsOpen(true);
            handleSend(null, "Help me get started with TaskFlow!");
        };
        window.addEventListener('flowAiNudge', handleNudge);
        return () => window.removeEventListener('flowAiNudge', handleNudge);
    }, []);

    return (
        <>
            {/* Floating Action Button */}
            <div className="flow-ai-fab" onClick={() => { setIsOpen(!isOpen); if (showTooltip) closeTooltip(); }}>
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
                {sessionCount <= 3 && !isOpen && <div className="fab-pulse"></div>}
            </div>

            {/* Introductory Tooltip */}
            {showTooltip && (
                <div className="chat-tooltip animate-fade">
                    <Sparkles size={16} style={{ color: '#FFD700' }} />
                    <span>Meet Flow AI, your productivity coach</span>
                    <button onClick={closeTooltip} className="tooltip-btn">GOT IT</button>
                    <div className="tooltip-arrow"></div>
                </div>
            )}

            {/* Main Chat Panel */}
            {isOpen && (
                <div className="flow-ai-panel animate-fade">
                    <header className="chat-header">
                        <div className="header-info">
                            <div className="ai-icon-wrap">
                                <Sparkles size={14} />
                            </div>
                            <div>
                                <h4 className="ai-name">Flow AI</h4>
                                <span className="status-badge">● Online</span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="header-close-btn">
                            <X size={18} />
                        </button>
                    </header>

                    <div className="chat-messages" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <Sparkles size={24} color="var(--accent)" />
                                </div>
                                <h5>Welcome to FlowAI</h5>
                                <p>Ask me anything about prioritizing your work or managing your session time.</p>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`message ${m.role}`}>
                                {m.content}
                            </div>
                        ))}
                        {/* Live Streaming Content Bubble */}
                        {streamingContent && (
                            <div className="message assistant">
                                {streamingContent}
                            </div>
                        )}
                        {/* Loading Indicator */}
                        {loading && !streamingContent && (
                            <div className="message assistant loading-dots">
                                <span></span><span></span><span></span>
                            </div>
                        )}
                    </div>

                    <form className="chat-input-area" onSubmit={handleSend}>
                        <div className="chat-input-wrapper">
                            <input
                                type="text"
                                placeholder="Ask Flow AI for tips..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

export default FlowAI;

