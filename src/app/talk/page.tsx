// app/talk/page.tsx

"use client";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/8bit/button";
import { Mic, StopCircle, Play } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import AudioWaveform from "@/components/AudioWaveform"; // Import the waveform component

export default function Talk() {
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [transcription, setTranscription] = useState("");
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null); // State to hold the recorded audio URL

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleStartRecording = async () => {
        setTranscription(""); // Clear previous transcription
        setAudioUrl(null); // Clear previous audio
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMediaStream(stream);
            setIsRecording(true);

            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = handleSendAudio;

            mediaRecorder.start();
        } catch (error) {
            console.error("Error accessing microphone:", error);
            // Handle permissions error gracefully
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            // Stop all tracks in the stream
            mediaStream?.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            setMediaStream(null); // Clear the stream
        }
    };

    const handleSendAudio = async () => {
        setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Create a URL for playback and set it to state
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        audioChunksRef.current = []; // Clear chunks for next recording

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            setTranscription(result.text);

        } catch (error) {
            console.error("Error sending audio:", error);
            setTranscription("Error: Could not transcribe audio.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden">
            <Navbar />
            <div className="flex flex-col gap-8 items-center justify-center mt-10">
                <div className="w-[750px] h-[400px] flex items-center justify-center relative">
                    {isRecording ? (
                        <AudioWaveform mediaStream={mediaStream} />
                    ) : (
                        // <Image src="/background.jpg" width={750} height={750} alt="background" className="rounded-lg"/>
                        <></>
                    )}
                </div>

                {/* Push-to-Talk Button */}
                <Button
                    onMouseDown={handleStartRecording}
                    onMouseUp={handleStopRecording}
                    onTouchStart={handleStartRecording} // For mobile
                    onTouchEnd={handleStopRecording}   // For mobile
                    className="p-6 rounded-full shadow-lg transform active:scale-95 transition-transform"
                >
                    {isRecording ? <StopCircle size={28} /> : <Mic size={28} />}
                </Button>

                <div className="w-full max-w-2xl p-4 text-center">
                    {isLoading && <p>Transcribing your masterpiece... 🎙️</p>}
                    
                    {/* Results container */}
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
