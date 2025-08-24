// // app/talk/page.tsx

// "use client";

// import Navbar from "@/components/Navbar";
// import { Button } from "@/components/ui/8bit/button";
// import { Mic, StopCircle, Play } from "lucide-react";
// import Image from "next/image";
// import { useState, useRef } from "react";
// import AudioWaveform from "@/components/AudioWaveform"; // Import the waveform component

// export default function Talk() {
//     const [isRecording, setIsRecording] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const [transcription, setTranscription] = useState("");
//     const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
//     const [audioUrl, setAudioUrl] = useState<string | null>(null);
//     const [dragOffset, setDragOffset] = useState(0);
//     const [isDragging, setIsDragging] = useState(false);

//     const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//     const audioChunksRef = useRef<Blob[]>([]);
//     const sliderRef = useRef<HTMLDivElement>(null);
//     const startPositionRef = useRef({ x: 0, y: 0 });
//     const actionRef = useRef<'send' | 'cancel'>('cancel');

//     const SWIPE_THRESHOLD = 80; // pixels
//     const MAX_DRAG = 120; // maximum drag distance

//     const handleStartRecording = async () => {
//         setTranscription("");
//         setAudioUrl(null);
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             setMediaStream(stream);
//             setIsRecording(true);

//             const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
//             mediaRecorderRef.current = mediaRecorder;

//             mediaRecorder.ondataavailable = (event) => {
//                 if (event.data.size > 0) {
//                     audioChunksRef.current.push(event.data);
//                 }
//             };

//             mediaRecorder.onstop = () => {
//                 if (actionRef.current === 'send') {
//                     handleSendAudio();
//                 } else {
//                     handleCancelAudio();
//                 }
//             };

//             mediaRecorder.start();
//         } catch (error) {
//             console.error("Error accessing microphone:", error);
//         }
//     };

//     const handleCancelAudio = () => {
//         audioChunksRef.current = [];
//         setIsRecording(false);
//         setMediaStream(null);
//         setDragOffset(0);
//         setIsDragging(false);
//         mediaStream?.getTracks().forEach(track => track.stop());
//     };

//     const handleSendAudio = async () => {
//         setIsLoading(true);
//         setDragOffset(0);
//         setIsDragging(false);
        
//         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
//         const url = URL.createObjectURL(audioBlob);
//         setAudioUrl(url);

//         audioChunksRef.current = [];

//         const formData = new FormData();
//         formData.append('audio', audioBlob, 'recording.webm');

//         try {
//             const response = await fetch('/api/transcribe', {
//                 method: 'POST',
//                 body: formData,
//             });

//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }

//             const result = await response.json();
//             setTranscription(result.text);
//         } catch (error) {
//             console.error("Error sending audio:", error);
//             setTranscription("Error: Could not transcribe audio.");
//         } finally {
//             setIsLoading(false);
//             setIsRecording(false);
//             setMediaStream(null);
//             mediaStream?.getTracks().forEach(track => track.stop());
//         }
//     };

//     const handleDragStart = (clientX: number, clientY: number) => {
//         if (isLoading) return;
        
//         setIsDragging(true);
//         startPositionRef.current = { x: clientX, y: clientY };
//         handleStartRecording();
//     };

//     const handleDragMove = (clientX: number) => {
//         if (!isDragging || !isRecording) return;

//         const deltaX = clientX - startPositionRef.current.x;
//         const clampedOffset = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, deltaX));
//         setDragOffset(clampedOffset);
//     };

//     const handleDragEnd = () => {
//         if (!isDragging || !isRecording) return;

//         const action = dragOffset > SWIPE_THRESHOLD ? 'send' : 'cancel';
//         actionRef.current = action;
        
//         if (mediaRecorderRef.current) {
//             mediaRecorderRef.current.stop();
//         }
//     };

//     // Mouse events
//     const handleMouseDown = (e: React.MouseEvent) => {
//         e.preventDefault();
//         handleDragStart(e.clientX, e.clientY);
//     };

//     const handleMouseMove = (e: React.MouseEvent) => {
//         handleDragMove(e.clientX);
//     };

//     const handleMouseUp = () => {
//         handleDragEnd();
//     };

//     // Touch events
//     const handleTouchStart = (e: React.TouchEvent) => {
//         e.preventDefault();
//         const touch = e.touches[0];
//         handleDragStart(touch.clientX, touch.clientY);
//     };

//     const handleTouchMove = (e: React.TouchEvent) => {
//         e.preventDefault();
//         const touch = e.touches[0];
//         handleDragMove(touch.clientX);
//     };

//     const handleTouchEnd = (e: React.TouchEvent) => {
//         e.preventDefault();
//         handleDragEnd();
//     };

//     const getSliderStyle = () => {
//         const progress = Math.abs(dragOffset) / MAX_DRAG;
//         const isSendDirection = dragOffset > 0;
        
//         if (dragOffset === 0) {
//             return "bg-gradient-to-r from-gray-300 to-gray-300";
//         }
        
//         if (isSendDirection) {
//             return `bg-gradient-to-r from-gray-300 via-green-${Math.floor(progress * 400 + 100)} to-green-${Math.floor(progress * 500 + 200)}`;
//         } else {
//             return `bg-gradient-to-r from-red-${Math.floor(progress * 500 + 200)} via-red-${Math.floor(progress * 400 + 100)} to-gray-300`;
//         }
//     };

//     const getKnobTransform = () => {
//         return `translateX(${dragOffset}px)`;
//     };

//     return (
//         <div className="h-screen overflow-hidden">
//             <Navbar />
//             <div className="flex flex-col gap-8 items-center justify-center mt-10">
//                 <div className="w-[750px] h-[400px] flex items-center justify-center relative">
//                     {isRecording ? (
//                         <div className="flex flex-col items-center gap-4">
//                             <AudioWaveform mediaStream={mediaStream} />
//                             <p className="text-sm text-gray-600">
//                                 {dragOffset > SWIPE_THRESHOLD ? "Release to Send ➡️" :
//                                  dragOffset < -SWIPE_THRESHOLD ? "Release to Cancel ❌" :
//                                  "Slide right to send, left to cancel"}
//                             </p>
//                         </div>
//                     ) : (
//                         <></>
//                     )}
//                 </div>

//                 {/* Horizontal Slider */}
//                 <div className="relative">
//                     <div 
//                         ref={sliderRef}
//                         className={`
//                             relative w-80 h-16 rounded-full border-2 border-gray-400 
//                             transition-all duration-200 ease-out overflow-hidden
//                             ${getSliderStyle()}
//                             ${isRecording ? 'scale-105' : 'scale-100'}
//                         `}
//                         onMouseMove={handleMouseMove}
//                         onMouseUp={handleMouseUp}
//                         onMouseLeave={handleMouseUp}
//                     >
//                         {/* Cancel side hint */}
//                         <div className={`
//                             absolute left-4 top-1/2 transform -translate-y-1/2 
//                             transition-opacity duration-200 pointer-events-none
//                             ${dragOffset < -20 ? 'opacity-100' : 'opacity-40'}
//                         `}>
//                             <span className="text-red-600 font-semibold text-sm">❌ Cancel</span>
//                         </div>

//                         {/* Send side hint */}
//                         <div className={`
//                             absolute right-4 top-1/2 transform -translate-y-1/2 
//                             transition-opacity duration-200 pointer-events-none
//                             ${dragOffset > 20 ? 'opacity-100' : 'opacity-40'}
//                         `}>
//                             <span className="text-green-600 font-semibold text-sm">Send ✅</span>
//                         </div>

//                         {/* Draggable Knob */}
//                         <div 
//                             className={`
//                                 absolute left-2 top-2 w-12 h-12 bg-white rounded-full 
//                                 shadow-lg cursor-pointer select-none
//                                 transition-transform duration-100 ease-out
//                                 flex items-center justify-center
//                                 ${isDragging ? 'scale-110' : 'scale-100'}
//                                 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}
//                             `}
//                             style={{ transform: getKnobTransform() }}
//                             onMouseDown={handleMouseDown}
//                             onTouchStart={handleTouchStart}
//                             onTouchMove={handleTouchMove}
//                             onTouchEnd={handleTouchEnd}
//                         >
//                             {isRecording ? <StopCircle size={24} className="text-red-500" /> : <Mic size={24} className="text-gray-600" />}
//                         </div>
//                     </div>

//                     {/* Instructions */}
//                     {!isRecording && !isLoading && (
//                         <p className="text-center text-sm text-gray-500 mt-3">
//                             Hold and slide to record voice message
//                         </p>
//                     )}
//                 </div>

//                 <div className="w-full max-w-2xl p-4 text-center">
//                     {isLoading && <p>Transcribing your masterpiece... 🎙️</p>}
                    
//                     {!isLoading && (transcription || audioUrl) && (
//                         <div className="mt-4 p-4 border rounded-lg bg-gray-50 flex flex-col items-center gap-4 shadow-sm">
//                             {transcription && (
//                                 <p className="text-lg text-gray-800 leading-relaxed">{transcription}</p>
//                             )}
//                             {audioUrl && (
//                                 <div className="w-full max-w-md">
//                                     <audio controls src={audioUrl} className="w-full"></audio>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }
// app/talk/page.tsx

// app/talk/page.tsx

"use client";

import Navbar from "@/components/Navbar";
import { useState, useRef } from "react";
import { Mic } from "lucide-react";
import AudioWaveform from "@/components/AudioWaveform";

export default function Talk() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [helperText, setHelperText] = useState("Press and hold to talk");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startX = useRef<number | null>(null);

  const handleStartRecording = async (clientX: number) => {
    setTranscription("");
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
    <div className="h-screen overflow-hidden">
      <Navbar />
      <div className="flex flex-col gap-8 items-center justify-center mt-10">
        <div className="w-[750px] h-[400px] flex items-center justify-center relative">
          {isRecording ? (
            <AudioWaveform mediaStream={mediaStream} />
          ) : (
            <></>
          )}
        </div>

        {/* Slider-style button */}
        <div
          className={`relative w-80 h-16 rounded-full flex items-center justify-center shadow-lg select-none transition-colors duration-200
          ${isRecording && dragOffset > 50 ? "bg-green-300" : ""}
          ${isRecording && dragOffset < -50 ? "bg-red-300" : "bg-gray-100"}`}

          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <span className="absolute left-4 text-sm text-gray-500">Cancel ❌</span>
          <span className="absolute right-4 text-sm text-gray-500">Send ✅</span>

          {/* Knob */}
          <div
            className="absolute w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `translateX(${isRecording ? dragOffset : 0}px)` }}
          >
            <Mic size={24} />
          </div>
        </div>

        {/* Helper text */}
        <p className="text-gray-600 mt-2">{helperText}</p>

        {/* Result area */}
        <div className="w-full max-w-2xl p-4 text-center">
          {isLoading && <p>Transcribing your masterpiece... 🎙️</p>}
          {!isLoading && (transcription || audioUrl) && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 flex flex-col items-center gap-4 shadow-sm">
              {transcription && (
                <p className="text-lg text-gray-800 leading-relaxed">{transcription}</p>
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
