import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { analyzeQuery } from '../services/api';

const Chat = ({ onAnalysisResult }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    // Smart scroll logic
    useEffect(() => {
        if (loading || messages.length === 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        } else {
            const lastMsgObj = messages[messages.length - 1];
            // If the last message is from the bot, we want to read it from the top
            if (lastMsgObj.role === 'bot') {
                // We need to wait for the DOM to update
                setTimeout(() => {
                    const lastMessageNode = containerRef.current?.querySelector('.message-item:last-child');
                    if (lastMessageNode) {
                        lastMessageNode.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }, 100);
            } else {
                // For user messages, just scroll to bottom
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [messages, loading]);

    // Auto-focus input when loading finishes
    useEffect(() => {
        if (!loading) {
            inputRef.current?.focus();
        }
    }, [loading]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const currentInput = input;
        const userMessage = { role: 'user', content: currentInput };

        // Optimistic UI update
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const result = await analyzeQuery(currentInput);

            const botMessage = { role: 'bot', content: result.summary };
            setMessages(prev => [...prev, botMessage]);
            onAnalysisResult(result);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I couldn't process your request. Please check your connection." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex flex-column" style={{ height: '100%' }}>
            {/* Header/Title optional */}
            <div className="p-3 border-bottom bg-white d-md-none">
                <strong>Chat Analysis</strong>
            </div>

            {/* Messages Area */}
            <div ref={containerRef} className="flex-grow-1 p-3 pt-4" style={{ overflowY: 'auto', minHeight: 0 }}>
                {messages.length === 0 && (
                    <div className="text-center text-muted mt-5">
                        <p>Start a conversation to analyze real estate data.</p>
                        <small>Try "Analyze Wakad"</small>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message-item mb-2 d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div className={`p-2 rounded ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-light border'}`} style={{ maxWidth: '85%' }}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="text-start text-muted ms-2 mb-2">
                        <small>Analyzing data...</small>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="p-3 border-top bg-white">
                <div className="input-group">
                    <input
                        ref={inputRef}
                        type="text"
                        className="form-control"
                        placeholder="Type a query..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={loading}
                    />
                    <button className="btn btn-primary" onClick={handleSend} disabled={loading}>
                        {loading ? '...' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
