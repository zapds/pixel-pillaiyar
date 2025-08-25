"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Mic, Send, Trash, MessageSquare } from "lucide-react";
import Image from "next/image";
import { motion, PanInfo } from "framer-motion";

// Shadcn UI Components
import Navbar from "@/components/Navbar";
import AudioWaveform from "@/components/AudioWaveform";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define the structure for a single conversation turn
interface Message {
  id: string;
  user?: {
    text: string;
    audioUrl?: string;
  };
  bot: {
    text: string;
    audioUrl?: string;
  };
}

export default function Talk() {
  // --- STATE MANAGEMENT ---
  const [mode, setMode] = useState<'voice' | 'chat'>('voice');
  const [isRecording, setIsRecording] = useState(false);
  const [loadState, setLoadState] = useState<"ready" | "transcribing" | "asking" | "voicing">("ready");
  const [chatInput, setChatInput] = useState("");
  const [helperText, setHelperText] = useState("Press and hold to talk");
  const [previousResponseId, setPreviousResponseId] = useState<string | null>(null);

  // Central state for all messages
  const [messageHistory, setMessageHistory] = useState<Message[]>([
    {
      id: "initial-greetings",
      bot: {
        text: "Namaste. I am Lord Ganesha, here to remove your obstacles. If you’re feeling stuck like a knot, take one small, patient step today, and trust that the path reveals itself with every gentle effort. Tell me what weighs on your mind.",
        // You could pre-generate and link the initial audio here
        // audioUrl: "/audio/initial_greeting.mp3",
      },
    },
  ]);

  // Refs for media recording and UI elements
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const micContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  // --- AUTO-SCROLLING ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageHistory]);


  // --- CORE API LOGIC ---
  const getLLMResponse = async (message: string) => {
    setLoadState("asking");
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, previousResponseId }),
      });
      if (!response.ok) throw new Error("LLM API response was not ok");
      const result = await response.json();
      setPreviousResponseId(result.id);
      return result.output;
    } catch (err) {
      console.error("Error fetching LLM response:", err);
      return "Error: Could not get a response.";
    }
  };

  const getSynthesizedVoice = async (text: string) => {
    setLoadState("voicing");
    try {
        const voiceResponse = await fetch("/api/speak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });
        if (!voiceResponse.ok) throw new Error("Speech synthesis API response was not ok");
        const blob = await voiceResponse.blob();
        return URL.createObjectURL(blob);
    } catch (err) {
        console.error("Error synthesizing voice:", err);
        return null;
    }
  }


  // --- VOICE MODE HANDLERS ---
  const handleStartRecording = async () => {
    setHelperText("Slide right to send, left to cancel");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      setIsRecording(true);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setHelperText("Microphone access denied.");
    }
  };

  const handleStopRecording = async (action: "send" | "cancel") => {
    if (!mediaRecorderRef.current) return;

    const recorder = mediaRecorderRef.current;
    
    recorder.onstop = async () => {
      mediaStream?.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      setMediaStream(null);
      setHelperText("Press and hold to talk");
    
      if (action === "cancel" || audioChunksRef.current.length === 0) {
        audioChunksRef.current = [];
        return;
      }
    
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      audioChunksRef.current = [];
      const userAudioUrl = URL.createObjectURL(audioBlob);
    
      // 🔥 keep your transcription + LLM pipeline here unchanged
      const messageId = Date.now().toString();
      setMessageHistory(prev => [
          ...prev,
          {
              id: messageId,
              user: { text: "Transcribing...", audioUrl: userAudioUrl },
              bot: { text: "..." }
          }
      ]);
    
      try {
          setLoadState("transcribing");
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");
          const transcribeResponse = await fetch("/api/transcribe", { method: "POST", body: formData });
          if (!transcribeResponse.ok) throw new Error("Transcription failed");
          const { text: transcribedText } = await transcribeResponse.json();
    
          setMessageHistory(prev => prev.map(msg =>
              msg.id === messageId ? { ...msg, user: { ...msg.user!, text: transcribedText } } : msg
          ));
          
          const botResponseText = await getLLMResponse(transcribedText);
          const botAudioUrl = await getSynthesizedVoice(botResponseText);
    
          setMessageHistory(prev => prev.map(msg =>
              msg.id === messageId ? { ...msg, bot: { text: botResponseText, audioUrl: botAudioUrl ?? undefined } } : msg
          ));
    
          if (botAudioUrl) new Audio(botAudioUrl).play();
    
      } catch (err) {
          console.error("Error in voice processing pipeline:", err);
          setMessageHistory(prev => prev.map(msg =>
              msg.id === messageId ? { ...msg, bot: { text: "Sorry, an error occurred." } } : msg
          ));
      } finally {
          setLoadState("ready");
      }
    };
    
    recorder.stop(); // <-- triggers onstop after final dataavailable
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (!isRecording) return;
    const offset = info.offset.x;
    const threshold = 100;

    if (offset > threshold) handleStopRecording("send");
    else handleStopRecording("cancel");
  };

  const handleDrag = (_: any, info: PanInfo) => {
    if (!isRecording) return;
    const offset = info.offset.x;
    if (offset > 100) setHelperText("Release to send");
    else if (offset < -100) setHelperText("Release to cancel");
    else setHelperText("Slide right to send, left to cancel");
  };


  // --- CHAT MODE HANDLER ---
  const handleSendTextMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || loadState !== 'ready') return;

    const userMessageText = chatInput;
    setChatInput('');

    const messageId = Date.now().toString();
    setMessageHistory(prev => [
        ...prev,
        {
            id: messageId,
            user: { text: userMessageText },
            bot: { text: "Thinking..." }
        }
    ]);

    const botResponseText = await getLLMResponse(userMessageText);
    const botAudioUrl = await getSynthesizedVoice(botResponseText);

    setMessageHistory(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, bot: { text: botResponseText, audioUrl: botAudioUrl ?? undefined } } : msg
    ));

    if (botAudioUrl) {
        new Audio(botAudioUrl).play();
    }
    setLoadState("ready");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      {/* Main Content: Scrollable message history */}
      <ScrollArea className="flex-1 p-4 pb-48"> {/* Padding bottom to clear sticky footer */}
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-center relative h-64 md:h-96">
                {isRecording ? (
                    <AudioWaveform mediaStream={mediaStream} />
                ) : (
                    <Image src="/bg_clean.png" alt="Ganesha Avatar" width={300} height={300} priority />
                )}
            </div>

            {/* Message History */}
            <div className="space-y-6">
                {messageHistory.map((msg) => (
                    <div key={msg.id}>
                        {msg.user && (
                            <div className="flex justify-end mb-2">
                                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
                                    <p className="text-sm">{msg.user.text}</p>
                                    {msg.user.audioUrl && <audio controls src={msg.user.audioUrl} className="w-full h-10 mt-2" />}
                                </div>
                            </div>
                        )}
                        <div className="flex justify-start">
                            <div className="bg-muted text-muted-foreground p-3 rounded-lg max-w-[80%]">
                                <p className="text-sm">{msg.bot.text}</p>
                                {msg.bot.audioUrl && <audio controls src={msg.bot.audioUrl} className="w-full h-10 mt-2" />}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
      </ScrollArea>

      {/* Sticky Footer: Input section */}
      <footer className="sticky bottom-0 z-50 w-full bg-background/80 backdrop-blur-sm border-t">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-3 p-4">
          <div className="flex items-center space-x-2">
            <Mic size={16} className={`transition-colors ${mode === 'voice' ? 'text-primary' : 'text-muted-foreground'}`} />
            <Switch checked={mode === 'chat'} onCheckedChange={(checked) => setMode(checked ? 'chat' : 'voice')} aria-label="Toggle input mode" />
            <MessageSquare size={16} className={`transition-colors ${mode === 'chat' ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>

          {mode === 'voice' ? (
            // --- VOICE INPUT SLIDER ---
            <div className="w-full flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground h-5">{helperText}</p>
                <div ref={micContainerRef} className="w-80 h-16 rounded-full flex items-center justify-center bg-muted relative overflow-hidden select-none">
                    <div className="absolute left-0 top-0 h-full w-1/2 bg-red-500/20 flex items-center justify-start pl-6 text-red-500"><Trash /></div>
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-green-500/20 flex items-center justify-end pr-6 text-green-500"><Send /></div>
                    
                    <motion.div
                        className="w-16 h-16 rounded-full bg-primary flex items-center justify-center cursor-pointer touch-none z-10"
                        onPointerDown={handleStartRecording}
                        drag="x"
                        dragConstraints={micContainerRef}
                        dragSnapToOrigin
                        onDragEnd={handleDragEnd}
                        onDrag={handleDrag}
                        whileTap={{ scale: 1.1 }}
                        dragElastic={0.2}
                    >
                        <Mic className="text-primary-foreground" />
                    </motion.div>
                </div>
            </div>
          ) : (
            // --- TEXT INPUT FORM ---
            <form onSubmit={handleSendTextMessage} className="w-full max-w-md flex items-center gap-2">
                <Input
                    type="text"
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1"
                    disabled={loadState !== 'ready'}
                />
                <Button type="submit" size="icon" disabled={!chatInput || loadState !== 'ready'}>
                    <Send size={20} />
                </Button>
            </form>
          )}
        </div>
      </footer>
    </div>
  );
}