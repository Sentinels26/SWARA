import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Home,
  ClipboardCheck,
  MessageCircle,
  HeartPulse,
  User,
  Paperclip,
  Mic,
  Send,
  ArrowLeft,
  Bot,
  ShieldCheck,
  MoreHorizontal,
  AlertTriangle,
  Phone,
  Users,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SurvivorSidebar } from '../../components/SurvivorSidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface Message {
  id: number;
  sender_role: string;
  message: string;
  timestamp: string;
}

interface ChatState {
  conversationId: number | null;
  messages: Message[];
  isInitializing: boolean;
  initError: string | null;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const WELCOME_MESSAGE: Message = {
  id: -1,
  sender_role: 'assistant',
  message:
    "Hi there! 👋\nI'm SWARA, your mental wellness companion.\nHow are you feeling today? You can share anything on your mind — I'm here to listen, without judgment.",
  timestamp: new Date().toISOString(),
};

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chatState, setChatState] = useState<ChatState>({
    conversationId: null,
    messages: [],
    isInitializing: true,
    initError: null,
  });

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [sosStatus, setSosStatus] = useState('');
  const [hasCheckedInToday] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─────────────────────────────────────────────
  // Speech recognition setup
  // ─────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const recognition = new SpeechRecognition();

    // IMPORTANT:
    // Continuous recognition can frequently produce Chrome's
    // "network" speech recognition error. A single utterance is
    // much more reliable for a chat input.
    recognition.continuous = false;
    recognition.interimResults = true;

    // Better recognition for the user's likely language/environment.
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError('');
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let transcript = '';

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }

      if (transcript.trim()) {
        setInput((prev) => {
          const newText = transcript.trim();

          if (!prev.trim()) {
            return newText;
          }

          return `${prev.trim()} ${newText}`;
        });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      console.error('Speech recognition error:', event.error);

      setIsListening(false);

      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }

      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          setSpeechError(
            'Microphone permission was blocked. Please allow microphone access for SWARA and try again.'
          );
          break;

        case 'no-speech':
          setSpeechError('No speech was detected. Please try speaking again.');
          break;

        case 'audio-capture':
          setSpeechError(
            'No microphone was detected. Please check your microphone and try again.'
          );
          break;

        case 'network':
          setSpeechError(
            'Browser speech recognition is temporarily unavailable. Please check your internet connection and try again.'
          );
          break;

        case 'aborted':
          // Aborted is normally caused by the user stopping recognition.
          break;

        default:
          setSpeechError(
            'Voice input could not start. Please try again.'
          );
          break;
      }

      setTimeout(() => {
        setSpeechError('');
      }, 5000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = null;
      }

      try {
        recognition.abort();
      } catch {
        // Recognition may already be stopped.
      }

      recognitionRef.current = null;
    };
  }, []);

  // ─────────────────────────────────────────────
  // Chat initialization
  // ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const initChat = async () => {
      setChatState({
        conversationId: null,
        messages: [],
        isInitializing: true,
        initError: null,
      });

      try {
        const convRes = await api.post('/api/chat/conversation');

        if (cancelled) return;

        const conversationId: number = convRes.data.id;

        const historyRes = await api.get(
          `/api/chat/conversation/${conversationId}/messages`
        );

        if (cancelled) return;

        const messages: Message[] =
          historyRes.data.length === 0
            ? [WELCOME_MESSAGE]
            : historyRes.data;

        setChatState({
          conversationId,
          messages,
          isInitializing: false,
          initError: null,
        });
      } catch (err: any) {
        if (cancelled) return;

        console.error('Failed to init chat', err);

        setChatState((prev) => ({
          ...prev,
          isInitializing: false,
          initError: 'Could not start chat session. Please refresh.',
        }));
      }
    };

    initChat();

    return () => {
      cancelled = true;
    };
  }, []);

  // ─────────────────────────────────────────────
  // Auto-scroll
  // ─────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [chatState.messages]);

  // ─────────────────────────────────────────────
  // SOS trigger
  // ─────────────────────────────────────────────
  const triggerSOS = async (type: string) => {
    try {
      await api.post('/api/alerts/trigger_sos/');

      setSosStatus(`Alerting ${type}...`);

      setTimeout(() => {
        setIsSosOpen(false);
        setSosStatus('');
      }, 4000);
    } catch (err) {
      console.error(err);
      setSosStatus('Failed to send SOS.');
    }
  };

  // ─────────────────────────────────────────────
  // Send message
  // ─────────────────────────────────────────────
  const sendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const { conversationId } = chatState;

      if (!input.trim() || !conversationId || isSending) {
        return;
      }

      const userText = input.trim();

      setInput('');
      setIsSending(true);

      const clientRequestId = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

      const tempId = -Date.now();

      const tempUserMsg: Message = {
        id: tempId,
        sender_role: 'user',
        message: userText,
        timestamp: new Date().toISOString(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, tempUserMsg],
      }));

      try {
        const res = await api.post('/api/chat/message', {
          conversation_id: conversationId,
          message: userText,
          client_request_id: clientRequestId,
        });

        const aiMsg: Message = res.data;

        setChatState((prev) => ({
          ...prev,
          messages: [...prev.messages, aiMsg],
        }));
      } catch (err: any) {
        console.error('Failed to send message', err);

        const errorMsg: Message = {
          id: -(Date.now() + 1),
          sender_role: 'assistant',
          message:
            "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date().toISOString(),
        };

        setChatState((prev) => ({
          ...prev,
          messages: [...prev.messages, errorMsg],
        }));
      } finally {
        setIsSending(false);
      }
    },
    [chatState, input, isSending]
  );

  // ─────────────────────────────────────────────
  // Voice input
  // ─────────────────────────────────────────────
  const toggleListening = () => {
    setSpeechError('');

    const recognition = recognitionRef.current;

    if (!recognition) {
      setSpeechError(
        'Voice input is not supported by this browser. Please use Google Chrome or Microsoft Edge.'
      );

      setTimeout(() => {
        setSpeechError('');
      }, 5000);

      return;
    }

    // Stop current recognition
    if (isListening) {
      try {
        recognition.stop();
      } catch (err) {
        console.error('Could not stop speech recognition:', err);
      }

      setIsListening(false);
      return;
    }

    // Start recognition
    try {
      recognition.start();

      // Safety timeout.
      // If the browser never fires onend/onerror, don't leave the
      // microphone button permanently stuck in listening mode.
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }

      speechTimeoutRef.current = setTimeout(() => {
        try {
          recognition.stop();
        } catch {
          // Already stopped.
        }

        setIsListening(false);
      }, 30000);
    } catch (err: any) {
      console.error('Could not start speech recognition:', err);

      setIsListening(false);

      if (err?.name === 'InvalidStateError') {
        setSpeechError(
          'Voice input is already active. Please wait a moment and try again.'
        );
      } else {
        setSpeechError(
          'Could not start voice input. Please check microphone permission and try again.'
        );
      }

      setTimeout(() => {
        setSpeechError('');
      }, 5000);
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);

    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ─────────────────────────────────────────────
  // Derived state
  // ─────────────────────────────────────────────
  const {
    conversationId,
    messages,
    isInitializing,
    initError,
  } = chatState;

  const canSend =
    Boolean(input.trim()) &&
    Boolean(conversationId) &&
    !isSending &&
    !isInitializing;

  return (
    <div className="h-[100dvh] md:h-screen w-full flex flex-col md:flex-row overflow-hidden font-sans relative bg-slate-50">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/bgall.png')" }}
      ></div>

      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-0"></div>

      {/* Sidebar */}
      <SurvivorSidebar
        onOpenSos={() => setIsSosOpen(true)}
        hasCheckedInToday={hasCheckedInToday}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative z-10 pt-[calc(76px+env(safe-area-inset-top))] p-0 md:p-6 lg:p-8 justify-center">

        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 left-0 w-full flex items-center justify-between px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] bg-white/40 backdrop-blur-xl border-b border-white/60 shrink-0 z-20">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/survivor/dashboard')}
              className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-white/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <img
              src="/logo.png"
              alt="SWARA"
              className="w-7 h-7 rounded-md shadow-sm ml-1"
            />

            <span className="font-bold text-[#1f2937] tracking-wider text-sm">
              SWARA
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#2c757c]">
            <ShieldCheck className="w-5 h-5" />
            <MoreHorizontal className="w-5 h-5" />
          </div>
        </header>

        {/* Chat Window Container */}
        <div className="flex-1 bg-white/40 backdrop-blur-xl md:rounded-[2.5rem] md:border md:border-white/60 flex flex-col overflow-hidden relative w-full max-w-5xl mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.05)] h-full">

          {/* Chat Header */}
          <div className="px-4 py-3 md:px-8 md:py-5 border-b border-white/60 flex items-center justify-between shrink-0 bg-white/60 backdrop-blur-md relative z-10">
            <div className="flex items-center gap-4">

              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-teal-50 to-blue-100 rounded-full border-2 border-white shadow-inner flex items-center justify-center shrink-0 overflow-hidden p-2 relative">
                <div className="absolute inset-0 bg-white/20"></div>

                <img
                  src="/logo.png"
                  alt="Assistant"
                  className="w-full h-full object-contain relative z-10"
                />
              </div>

              <div>
                <h2 className="text-lg md:text-xl font-bold text-[#1f2937] flex items-center gap-2">
                  SWARA Assistant
                </h2>

                <div className="text-[11px] md:text-xs font-semibold text-[#4b5563] flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {isInitializing ? 'Connecting...' : 'Online'}
                  </div>

                  <span className="hidden md:inline text-slate-300">
                    •
                  </span>

                  <span className="text-slate-500 font-medium">
                    Here to listen, support and guide you.
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 border border-white rounded-full text-xs font-semibold text-[#2c757c]">
                <ShieldCheck className="w-4 h-4" />
                Safe &amp; Private
              </div>

              <button
                type="button"
                className="w-8 h-8 rounded-full bg-white/60 border border-white flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Init Error Banner */}
          {initError && (
            <div className="px-6 py-3 bg-red-50 border-b border-red-100 text-red-600 text-sm font-medium text-center">
              {initError}
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 relative z-10">

            {/* Initializing skeleton */}
            {isInitializing && (
              <div className="flex max-w-[70%] gap-3 mr-auto justify-start">

                <div className="w-10 h-10 bg-white/80 border border-white/60 rounded-full flex items-center justify-center text-[#2c757c] shrink-0 shadow-sm mt-auto mb-5">
                  <Bot className="w-5 h-5" />
                </div>

                <div className="p-5 bg-white/70 backdrop-blur-md border border-white/80 rounded-[1.5rem] rounded-bl-sm flex gap-1.5 items-center h-[52px]">
                  <span className="w-2 h-2 bg-[#2c757c]/60 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-[#2c757c]/60 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-[#2c757c]/60 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isUser = msg.sender_role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${
                    isUser
                      ? 'ml-auto justify-end'
                      : 'mr-auto justify-start'
                  }`}
                >

                  {/* Bot Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/80 border border-white/60 rounded-full flex items-center justify-center text-[#2c757c] shrink-0 shadow-sm mt-auto mb-5">
                      <Bot className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  )}

                  <div className="flex flex-col gap-1 w-full">
                    <div
                      className={`p-4 md:p-5 text-sm md:text-[15px] leading-relaxed shadow-sm border ${
                        isUser
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-[1.5rem] rounded-br-sm border-blue-400/30'
                          : 'bg-white/70 backdrop-blur-md text-[#374151] rounded-[1.5rem] rounded-bl-sm border-white/80'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>

                    <div
                      className={`text-[10px] md:text-[11px] font-semibold text-[#6b7280] ${
                        isUser ? 'text-right pr-2' : 'pl-2'
                      } flex items-center gap-1 ${
                        isUser ? 'justify-end' : ''
                      }`}
                    >
                      {formatTime(msg.timestamp)}

                      {isUser && (
                        <span className="text-blue-500">
                          ✓✓
                        </span>
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/80 border border-white/60 rounded-full flex items-center justify-center text-slate-600 font-bold shrink-0 shadow-sm mt-auto mb-5 text-sm">
                      {user?.full_name
                        ? user.full_name[0].toUpperCase()
                        : 'U'}
                    </div>
                  )}
                </div>
              );
            })}

            {/* AI typing indicator */}
            {isSending && (
              <div className="flex max-w-[70%] gap-3 mr-auto justify-start">

                <div className="w-8 h-8 md:w-10 md:h-10 bg-white/80 border border-white/60 rounded-full flex items-center justify-center text-[#2c757c] shrink-0 shadow-sm mt-auto mb-5">
                  <Bot className="w-4 h-4 md:w-5 md:h-5" />
                </div>

                <div className="p-5 bg-white/70 backdrop-blur-md border border-white/80 rounded-[1.5rem] rounded-bl-sm flex gap-1.5 items-center h-[52px]">
                  <span className="w-2 h-2 bg-[#2c757c]/60 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-[#2c757c]/60 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-[#2c757c]/60 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="p-3 md:p-6 shrink-0 relative z-10 w-full pb-[80px] md:pb-6 bg-white/40 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-t border-white/40 md:border-t-0">

            {speechError && (
              <div className="text-red-500 text-xs font-semibold mb-2 text-center px-4">
                {speechError}
              </div>
            )}

            <form
              onSubmit={sendMessage}
              className="relative flex items-center w-full max-w-4xl mx-auto"
            >

              <div className="flex items-center w-full bg-white/80 backdrop-blur-xl border border-white/80 rounded-full py-2 pl-4 pr-2 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">

                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 shrink-0"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  id="chat-message-input"
                  name="chat-message"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isInitializing
                      ? 'Starting session...'
                      : 'Type a message...'
                  }
                  className="flex-1 bg-transparent border-none text-slate-700 text-sm md:text-[15px] px-2 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-0 w-full placeholder-slate-400 font-medium"
                  disabled={isSending || isInitializing}
                  autoComplete="off"
                />

                <div className="flex items-center gap-1 md:gap-2 shrink-0 pr-1">

                  {/* Voice Input */}
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2 transition-colors rounded-full ${
                      isListening
                        ? 'bg-red-50 text-red-500 animate-pulse'
                        : 'text-slate-400 hover:text-[#2c757c] hover:bg-white/50'
                    }`}
                    title={
                      isListening
                        ? 'Stop listening'
                        : 'Start voice input'
                    }
                    aria-label={
                      isListening
                        ? 'Stop voice input'
                        : 'Start voice input'
                    }
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!canSend}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${
                      !canSend
                        ? 'bg-[#d4eae8] text-[#90c4bf]'
                        : 'bg-gradient-to-r from-[#2c757c] to-[#1e585f] hover:from-[#235e63] hover:to-[#17484d] text-white shadow-teal-900/20'
                    }`}
                  >
                    <Send className="w-4 h-4 md:w-5 md:h-5 ml-0.5 md:ml-1" />
                  </button>

                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-white/60 flex justify-around p-3 z-50 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">

        <Link
          to="/survivor/dashboard"
          className="flex flex-col items-center gap-1.5 text-slate-400"
        >
          <Home className="w-5 h-5" />
        </Link>

        <Link
          to="/survivor/check-in"
          className="flex flex-col items-center gap-1.5 text-slate-400"
        >
          <ClipboardCheck className="w-5 h-5" />
        </Link>

        <Link
          to="/survivor/dashboard"
          className="flex flex-col items-center gap-1.5 text-slate-400"
        >
          <HeartPulse className="w-5 h-5" />
        </Link>

        <Link
          to="/survivor/chat"
          className="flex flex-col items-center gap-1.5 text-[#2c757c]"
        >
          <MessageCircle className="w-5 h-5" />
        </Link>

        <Link
          to="/survivor/profile"
          className="flex flex-col items-center gap-1.5 text-slate-400"
        >
          <User className="w-5 h-5" />
        </Link>

      </nav>

      {/* SOS Modal */}
      <Modal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        title="Emergency Support"
      >
        <div className="space-y-6">

          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-2 drop-shadow-md" />

            <h3 className="text-xl font-bold text-slate-900">
              Do you need immediate help?
            </h3>

            <p className="text-slate-600 text-sm mt-2">
              Bypass routine monitoring and connect with immediate support networks.
            </p>
          </div>

          <div className="space-y-3">

            <button
              type="button"
              onClick={() =>
                triggerSOS('Emergency Services (112)')
              }
              className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors text-left group"
            >
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-200">
                  <Phone className="w-5 h-5" />
                </div>

                <div>
                  <div className="font-bold text-red-700">
                    Call Emergency Services
                  </div>

                  <div className="text-xs text-red-600">
                    Dial 112 directly
                  </div>
                </div>

              </div>
            </button>

            <button
              type="button"
              onClick={() => triggerSOS('Care Team')}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors text-left group"
            >
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>

                <div>
                  <div className="font-bold text-slate-900">
                    Alert My Care Team
                  </div>

                  <div className="text-xs text-slate-500">
                    Dr. Priya Sharma &amp; staff
                  </div>
                </div>

              </div>
            </button>

          </div>

          {sosStatus && (
            <div className="bg-slate-800 text-white p-3 rounded-lg text-sm text-center animate-in fade-in zoom-in font-medium">
              {sosStatus}
            </div>
          )}

          <Button
            variant="outline"
            className="w-full border-slate-300"
            onClick={() => setIsSosOpen(false)}
          >
            Cancel / Go Back
          </Button>

        </div>
      </Modal>

    </div>
  );
}
