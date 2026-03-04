import React, { useState, useRef, useEffect } from "react";
import { Send, Loader, Brain, Bot, User, FileText, AlertCircle } from "lucide-react";
import api, { getChatHistory, saveMessage, clearChat } from "../api/apiClient";

const sessionId = "opsmind-default-session";

const ChatUI = ({ stats, setStats, systemMessage, setSystemMessage }) => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getChatHistory(sessionId);
        const data = res.data;
        if (Array.isArray(data)) {
          setMessages(data);
        } else if (data && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
      } catch {
        setMessages([]);
      }
    })();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (systemMessage) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "system",
          type: systemMessage.type,
          content: systemMessage.content,
          timestamp: new Date(),
        },
      ]);
      setSystemMessage(null);
    }
  }, [systemMessage, setSystemMessage]);

  // helper for simulated typing delay
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleAsk = async () => {
    if (!query.trim()) return;
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsAnswering(true);

    // Temporary "thinking..." message
    const tempAssistant = {
      id: `thinking-${Date.now()}`,
      role: "assistant",
      content: "Thinking...",
      thinking: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tempAssistant]);

    try {
      const res = await api.post("/ask", { query });
      const { answer, sources } = res.data;

      const normalizeSource = (src, idx) => {
        if (!src) return { id: idx + 1, source: `Source ${idx + 1}` };
        if (typeof src === "string") return { id: idx + 1, source: src };

        if (typeof src === "object") {
          const sourceLabel = [src.source, src.name, src.fileName, src.title]
            .find((val) => typeof val === "string" && val.trim());

          return {
            id: idx + 1,
            source: sourceLabel || `Source ${idx + 1}`,
            page: src.page ?? src.pageNumber ?? src.lineStartPage ?? src.lineStart,
            chunk: src.chunk ?? src.chunkIndex ?? src.section ?? src.lineEndPage,
            text: typeof src.text === "string"
              ? src.text
              : typeof src.chunk === "string"
                ? src.chunk
                : "",
          };
        }

        return { id: idx + 1, source: String(src) };
      };

      const fullAnswer = answer || "No response generated.";
      const citations = (Array.isArray(sources) ? sources : []).map(normalizeSource);

      // Replace temp with empty assistant message
      setMessages((prev) => {
        const updated = [...prev];
        updated.pop();
        return [...updated, { role: "assistant", content: "", citations: [], showCitations: false, timestamp: new Date() }];
      });

      // Typing animation (word-by-word)
      const words = fullAnswer.split(" ");
      for (let i = 0; i < words.length; i++) {
        await sleep(30);
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          lastMsg.content = words.slice(0, i + 1).join(" ");
          return [...updated];
        });
      }

      // Show citations with animation after typing completes
      await sleep(200);
      setMessages((prev) => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        lastMsg.citations = citations;
        lastMsg.showCitations = true;
        return [...updated];
      });

      await saveMessage({
        sessionId,
        role: "assistant",
        content: fullAnswer,
        citations,
      });

      setStats((prev) => ({ ...prev, queries: prev.queries + 1 }));
    } catch (err) {
      console.error("❌ Chat error:", err.message);
      setMessages((prev) => {
        const updated = [...prev];
        updated.pop();
        return [
          ...updated,
          {
            role: "assistant",
            content: "⚠️ Error: Could not get a response.",
            timestamp: new Date(),
          },
        ];
      });
    }

    setIsAnswering(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const toText = (val) => {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val;
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  };

  const formatTime = (val) => {
    const date = val instanceof Date ? val : new Date(val);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const safeMessages = Array.isArray(messages)
    ? messages
    : Array.isArray(messages?.messages)
      ? messages.messages
      : [];

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-100 dark:bg-gray-900 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">OpsMind AI — Chat Assistant</h2>
        </div>
        <button
          onClick={() => clearChat(sessionId) && setMessages([])}
          className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
        >
          Clear Chat
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scroll">
        {safeMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-full mb-4">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Welcome to OpsMind AI</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
              Upload your document and ask questions. OpsMind will analyze, summarize, and answer contextually.
            </p>
            <div className="mt-4 space-y-2 w-full max-w-md">
              {["What is this document about?", "Summarize the main points", "Explain key concepts"].map(
                (example, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(example)}
                    className="w-full text-left px-4 py-2 bg-gray-200 dark:bg-gray-800/50 hover:bg-gray-300 dark:hover:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 transition-all"
                  >
                    {example}
                  </button>
                )
              )}
            </div>
          </div>
        ) : (
          <>
            {safeMessages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : msg.role === "system" ? "justify-center" : "flex-row"}`}>
                {msg.role !== "system" && (
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-purple-600 to-blue-600"
                        : "bg-gradient-to-br from-blue-500 to-purple-600"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                )}
                <div
                  className={`flex-1 max-w-2xl ${
                    msg.role === "user" ? "items-end" : msg.role === "system" ? "items-center" : "items-start"
                  } flex flex-col`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl shadow ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : msg.role === "system" && msg.type === "error"
                          ? "bg-red-100 dark:bg-red-900/80 border border-red-300 dark:border-red-700 text-red-900 dark:text-red-100"
                          : "bg-white dark:bg-gray-800 text-black dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {msg.thinking ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Loader className="w-4 h-4 animate-spin" /> Thinking...
                      </div>
                    ) : msg.role === "system" && msg.type === "error" ? (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p className="whitespace-pre-wrap">{toText(msg.content)}</p>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{toText(msg.content)}</p>
                    )}
                  </div>

                  {Array.isArray(msg.citations) && msg.citations.length > 0 && msg.showCitations && (
                    <div className="mt-3 border-t border-gray-300 dark:border-gray-700 pt-2 space-y-2 sources-dropdown">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2">Sources</p>
                      {msg.citations.map((c, i) => {
                        const sourceLabel = typeof c.source === "string" && c.source.trim()
                          ? c.source
                          : typeof c.name === "string" && c.name.trim()
                            ? c.name
                            : `Source ${i + 1}`;
                        const pageLabel = c.page ?? c.pageNumber ?? "-";
                        const chunkLabel = c.chunk ?? c.chunkIndex ?? "-";
                        const preview = typeof c.text === "string" ? c.text : "";
                        return (
                          <div key={i} className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-2 text-xs text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700/60">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                              <span className="font-semibold text-gray-900 dark:text-white">{sourceLabel}</span>
                            </div>
                            {preview && (
                              <p className="text-gray-600 dark:text-gray-400 italic">{preview.length > 160 ? `${preview.slice(0, 160)}…` : preview}</p>
                            )}
                            <div className="text-[11px] text-gray-500 dark:text-gray-500 mt-1">
                              Page {pageLabel} • Chunk {chunkLabel}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {msg.role !== "system" && (
                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatTime(msg.timestamp)}</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 flex-shrink-0">
        {!stats.totalDocs && (
          <div className="mb-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Please upload a document before asking questions</span>
          </div>
        )}
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              stats.totalDocs ? "Ask a question about your document..." : "Upload a document first..."
            }
            disabled={!stats.totalDocs || isAnswering}
            className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 border border-gray-300 dark:border-gray-700"
          />
          <button
            onClick={handleAsk}
            disabled={!query.trim() || isAnswering || !stats.totalDocs}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
          >
            {isAnswering ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;
