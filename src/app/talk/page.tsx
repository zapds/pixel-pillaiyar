// app/talk/page.tsx

"use client";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/8bit/button";
import { Mic, StopCircle } from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Script from "next/script";
import AudioWaveform from "@/components/AudioWaveform";

// Define the RecordRTC type for TypeScript
declare var RecordRTC: any;

export default function Talk() {
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState("");
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);

    const recorderRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const handleScriptLoad = () => {
        setIsScriptLoaded(true);
    };

    const startRecording = async () => {
        if (!isScriptLoaded) {
            console.error("RecordRTC script not loaded yet.");
            return;
        }

        // Clear previous results
        setTranscription("");
        setAudioUrl(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    noiseSuppression: true,
                    echoCancellation: true,
                },
            });
            
            streamRef.current = stream;
            setPreviewStream(stream); // For the waveform visualizer

            const recorder = new RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/webm',
                sampleRate: 44100,
                desiredSampRate: 16000,
                recorderType: RecordRTC.StereoAudioRecorder,
                numberOfAudioChannels: 1,
                bitsPerSecond: 128000,
                disableLogs: true,
            });

            recorder.startRecording();
            recorderRef.current = recorder;
            setIsRecording(true);
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    };

    const stopRecording = () => {
        if (recorderRef.current) {
            recorderRef.current.stopRecording(() => {
                const blob = recorderRef.current.getBlob();
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                handleAudioUpload(blob);

                // Clean up
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
                recorderRef.current.destroy();
                recorderRef.current = null;
                streamRef.current = null;
                setPreviewStream(null);
            });
            setIsRecording(false);
        }
    };

    const handleAudioUpload = async (blob: Blob) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        try {
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Network response was not ok');
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
        <>
            <Script
                src="https://www.WebRTC-Experiment.com/RecordRTC.js"
                strategy="lazyOnload"
                onLoad={handleScriptLoad}
            />
            <div className="h-screen overflow-hidden">
                <Navbar />
                <div className="flex flex-col gap-8 items-center justify-center mt-10">
                    <div className="w-[750px] h-[400px] flex items-center justify-center relative">
                        {isRecording && previewStream ? (
                            <AudioWaveform mediaStream={previewStream} />
                        ) : (
                            // <Image src="/background.jpg" width={750} height={750} alt="background" className="rounded-lg"/
                            <></>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <p className="text-sm text-gray-500 capitalize">
                            {isRecording ? "Recording..." : (isScriptLoaded ? "Ready to Record" : "Loading Recorder...")}
                        </p>
                        <Button
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={!isScriptLoaded}
                            className="p-6 rounded-full shadow-lg transform active:scale-95 transition-transform disabled:opacity-50"
                        >
                            {isRecording ? <StopCircle size={28} /> : <Mic size={28} />}
                        </Button>
                    </div>

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
        </>
    );
}
