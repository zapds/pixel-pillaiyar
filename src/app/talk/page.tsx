"use client";

import Navbar from "@/components/Navbar";
import { useState, useRef } from "react";
import { Cross, Delete, Mic, Send, StopCircle, Trash, X } from "lucide-react";
import Image from "next/image";
import AudioWaveform from "@/components/AudioWaveform";

export default function Talk() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState("Hello There!");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [helperText, setHelperText] = useState("Press and hold to talk");

  console.log(dragOffset);
  const [previousResponseId, setPreviousResponseId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<string>("Namaste. I am Lord Ganesha, here to remove your obstacles. If you’re feeling stuck like a knot, take one small, patient step today, and trust that the path reveals itself with every gentle effort. Tell me what weighs on your mind.");
  

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startX = useRef<number | null>(null);

  const getResponse = async (message: string) => {
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, previousResponseId }),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setResponseText(result.output);
      setPreviousResponseId(result.id);
    }

    catch (err) {
      console.error("Error fetching response:", err);
      setResponseText("Error: Could not get response from Pixel Pillaiyar.");
    }
  }


  const handleStartRecording = async (clientX: number) => {
    // setTranscription("");
    setAudioUrl(null);
    startX.current = clientX;
    setDragOffset(0);
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
    }
  };

  const handleStopRecording = async (action: "send" | "cancel") => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    mediaStream?.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
    setMediaStream(null);
    setHelperText("Press and hold to talk");

    if (action === "send") {
      setIsLoading(true);
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      audioChunksRef.current = [];

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      try {
        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        setTranscription(result.text);
        await getResponse(result.text);
      } catch (err) {
        console.error("Error sending audio:", err);
        setTranscription("Error: Could not transcribe audio.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // cancel → discard audio
      audioChunksRef.current = [];
      setAudioUrl(null);

    }
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    handleStartRecording(clientX);
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isRecording || startX.current === null) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const offset = clientX - startX.current;
    setDragOffset(offset);

    if (offset > 100) setHelperText("Release to send");
    else if (offset < -100) setHelperText("Release to cancel");
    else setHelperText("Slide right to send, left to cancel");
  };

  const handlePointerUp = () => {
    if (!isRecording) return;
    const threshold = 100;
    if (dragOffset > threshold) {
      handleStopRecording("send");
    } else {
      handleStopRecording("cancel");
    }
    setDragOffset(0);
    startX.current = null;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-col gap-8 items-center justify-center mt-10">
        <div className="w-[750px] h-[400px] flex items-center justify-center relative">
          {isRecording ? (
            <AudioWaveform mediaStream={mediaStream} />
          ) : (
            <Image src="/background.jpg" alt="Ganesha Avatar" height={200} width={300} />
          )}
        </div>


        {/* Slider-style button */}
        <div
          className={`absolute bottom-8 w-80 h-16 rounded-full flex items-center justify-center shadow-lg select-none transition-colors duration-200
          ${isRecording && dragOffset > 50 ? "bg-green-500" : ""}
          ${isRecording && dragOffset < -50 ? "bg-red-500" : ""}
          ${!isRecording || (dragOffset < 50 && dragOffset > -50) ? "bg-primary" : ""}`}

          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <span className="absolute left-4 text-sm text-background">
            <Trash size={24} />
          </span>
          <span className="absolute right-4 text-sm text-background">
            <Send size={24} />
          </span>

          {/* Knob */}
          <div
            className="absolute w-14 h-14 bg-secondary rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${isRecording ? dragOffset : 0}px)` }}
          >
            
            {isRecording && dragOffset > 50 ? <Send size={24} /> 
             : isRecording && dragOffset < -50 ? <Trash size={24} />
             : isRecording ? <X size={24} />
             : <Mic size={24} />
          }
          </div>
        </div>

        {/* Helper text */}
        <p className="text-gray-600 animate-pulse mt-2">{helperText}</p>

        {/* Result area */}
        <div className="w-full max-w-2xl p-4 text-center">
          {isLoading && <p>Transcribing your masterpiece... 🎙️</p>}
          {!isLoading && (transcription || audioUrl) && (
            <div className="mt-4 p-4 border rounded-lg flex flex-col items-center gap-4 shadow-sm">
              {transcription && (
                <p className="text-lg text-primary leading-relaxed">{transcription}</p>
              )}
              {responseText && (
                <p className="text-md leading-relaxed">{responseText}</p>
              )}
              {audioUrl && (
                <div className="w-full max-w-md">
                  <audio controls src={audioUrl} className="w-full"></audio>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
