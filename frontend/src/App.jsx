import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import { useRef } from "react";

const socket = io("http://localhost:5000")

export default function App() {
    const typingTimeout = useRef(null);
    const messagesEndRef = useRef(null);
    const [messages, setMessages] = useState([])
    const [text, setText] = useState("")
    const [typing, setTyping] = useState(false)
    const [myId, setMyId] = useState("")
    const [name, setName] = useState("")
    const [nameSet, setNameSet] = useState(false)

    useEffect(() => {
        socket.on("connect", () => {
            setMyId(socket.id)
        })
        return () => { socket.off("connect") }
    }, [])

    useEffect(() => {
        socket.on("receive_message", (data) => {
            setMessages(prev => [...prev, data])
        })
        socket.on("show_typing", () => { setTyping(true); });
        socket.on("stop_typing", () => { setTyping(false); });
        return () => {
            socket.off("receive_message");
            socket.off("show_typing");
            socket.off("stop_typing");
        };
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                :root {
                    --bg: #0f0f11;
                    --surface: #18181c;
                    --surface2: #1f1f25;
                    --border: rgba(255,255,255,0.07);
                    --accent: #7c6af7;
                    --accent-soft: rgba(124,106,247,0.15);
                    --text: #e8e8ee;
                    --muted: #6b6b78;
                    --bubble-me: #7c6af7;
                    --bubble-other: #22222a;
                    --radius: 20px;
                    --radius-sm: 12px;
                }

                body {
                    font-family: 'DM Sans', sans-serif;
                    background: var(--bg);
                    color: var(--text);
                    height: 100dvh;
                    overflow: hidden;
                }

                .app {
                    display: flex;
                    flex-direction: column;
                    height: 100dvh;
                    max-width: 480px;
                    margin: 0 auto;
                    position: relative;
                }

                /* — Header — */
                .header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 18px 20px 14px;
                    border-bottom: 1px solid var(--border);
                    background: var(--bg);
                    flex-shrink: 0;
                }

                .header-avatar {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background: var(--accent);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 500;
                    letter-spacing: -0.3px;
                    flex-shrink: 0;
                    color: #fff;
                }

                .header-info { flex: 1; }

                .header-title {
                    font-size: 15px;
                    font-weight: 500;
                    color: var(--text);
                    letter-spacing: -0.2px;
                }

                .header-status {
                    font-size: 11px;
                    color: var(--muted);
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    margin-top: 2px;
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: #4ade80;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }

                /* — Name setup — */
                .name-bar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: var(--surface);
                    border-bottom: 1px solid var(--border);
                    flex-shrink: 0;
                }

                .name-bar input {
                    flex: 1;
                    background: var(--surface2);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-sm);
                    color: var(--text);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    padding: 8px 12px;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .name-bar input::placeholder { color: var(--muted); }
                .name-bar input:focus { border-color: var(--accent); }

                .name-bar button {
                    background: var(--accent);
                    border: none;
                    border-radius: var(--radius-sm);
                    color: #fff;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px;
                    font-weight: 500;
                    padding: 8px 16px;
                    cursor: pointer;
                    transition: opacity 0.15s;
                    white-space: nowrap;
                }

                .name-bar button:hover { opacity: 0.85; }

                /* — Messages — */
                .messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 16px 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    scrollbar-width: thin;
                    scrollbar-color: var(--surface2) transparent;
                }

                .messages::-webkit-scrollbar { width: 4px; }
                .messages::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 99px; }

                .msg-row {
                    display: flex;
                    flex-direction: column;
                    max-width: 78%;
                    animation: fadeUp 0.22s ease;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .msg-row.me { align-self: flex-end; align-items: flex-end; }
                .msg-row.other { align-self: flex-start; align-items: flex-start; }

                .msg-name {
                    font-size: 10px;
                    font-weight: 500;
                    color: var(--muted);
                    margin-bottom: 3px;
                    letter-spacing: 0.3px;
                    text-transform: uppercase;
                    font-family: 'DM Mono', monospace;
                }

                .bubble {
                    padding: 10px 14px;
                    border-radius: 18px;
                    font-size: 14px;
                    line-height: 1.5;
                    word-break: break-word;
                    max-width: 100%;
                }

                .me .bubble {
                    background: var(--bubble-me);
                    color: #fff;
                    border-bottom-right-radius: 6px;
                }

                .other .bubble {
                    background: var(--bubble-other);
                    color: var(--text);
                    border-bottom-left-radius: 6px;
                    border: 1px solid var(--border);
                }

                /* — Typing indicator — */
                .typing-indicator {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 10px 14px;
                    background: var(--bubble-other);
                    border: 1px solid var(--border);
                    border-radius: 18px;
                    border-bottom-left-radius: 6px;
                    align-self: flex-start;
                    margin-top: 4px;
                    animation: fadeUp 0.2s ease;
                    width: fit-content;
                }

                .typing-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--muted);
                    animation: typingBounce 1.2s infinite ease-in-out;
                }

                .typing-dot:nth-child(2) { animation-delay: 0.15s; }
                .typing-dot:nth-child(3) { animation-delay: 0.3s; }

                @keyframes typingBounce {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                    30% { transform: translateY(-4px); opacity: 1; }
                }

                /* — Input area — */
                .input-area {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px 20px;
                    border-top: 1px solid var(--border);
                    background: var(--bg);
                    flex-shrink: 0;
                }

                .input-area input {
                    flex: 1;
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    color: var(--text);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    padding: 12px 18px;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .input-area input::placeholder { color: var(--muted); }
                .input-area input:focus { border-color: rgba(124,106,247,0.5); }

                .send-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: var(--accent);
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: transform 0.15s, opacity 0.15s;
                }

                .send-btn:hover { transform: scale(1.06); }
                .send-btn:active { transform: scale(0.95); opacity: 0.8; }

                .send-btn svg { display: block; }

                /* — Empty state — */
                .empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    color: var(--muted);
                }

                .empty-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: var(--surface);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 4px;
                }

                .empty p { font-size: 13px; }
            `}</style>

            <div className="app">
                {/* Header */}
                <div className="header">
                    <div className="header-avatar">
                        {name ? name[0].toUpperCase() : "?"}
                    </div>
                    <div className="header-info">
                        <div className="header-title">Live Chat</div>
                        <div className="header-status">
                            <span className="status-dot" />
                            online
                        </div>
                    </div>
                </div>

                {/* Name bar */}
                <div className="name-bar">
                    <input
                        type="text"
                        placeholder="Your name…"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && name.trim()) {
                                socket.emit("set_user", name);
                                setNameSet(true);
                            }
                        }}
                    />
                    <button onClick={() => {
                        socket.emit("set_user", name);
                        setNameSet(true);
                    }}>
                        Set name
                    </button>
                </div>

                {/* Messages */}
                {messages.length === 0 && !typing ? (
                    <div className="empty">
                        <div className="empty-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b6b78" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <p>No messages yet — say hello!</p>
                    </div>
                ) : (
                    <div className="messages">
                        {messages.map((msg, id) => {
                            const isMe = msg.senderId === myId;
                            return (
                                <div className={`msg-row ${isMe ? "me" : "other"}`} key={id}>
                                    {!isMe && <div className="msg-name">{msg.usrName}</div>}
                                    <div className="bubble">{msg.msg}</div>
                                </div>
                            );
                        })}

                        {typing && (
                            <div className="typing-indicator">
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Input */}
                <div className="input-area">
                    <input
                        type="text"
                        placeholder="Message…"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            socket.emit("show_typing");
                            if (typingTimeout.current) clearTimeout(typingTimeout.current);
                            typingTimeout.current = setTimeout(() => {
                                socket.emit("stop_typing");
                            }, 1000);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && text.trim() !== "") {
                                socket.emit("send_message", text);
                                socket.emit("stop_typing");
                                setText("");
                            }
                        }}
                    />
                    <button
                        className="send-btn"
                        onClick={() => {
                            if (text.trim() !== "") {
                                socket.emit("send_message", text);
                                socket.emit("stop_typing");
                                setText("");
                            }
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    )
}