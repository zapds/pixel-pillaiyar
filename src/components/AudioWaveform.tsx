// components/AudioWaveform.tsx

"use client";

import { useEffect, useRef } from "react";

interface AudioWaveformProps {
  mediaStream: MediaStream | null;
}

const AudioWaveform = ({ mediaStream }: AudioWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!mediaStream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(mediaStream);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 256; // Determines the number of bars (frequency bins)
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;
      const barGap = 4; // Gap between bars

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 1.5;
        const barColor = `rgb(107, 114, 128)`; // gray-500

        // Draw rounded bars
        canvasCtx.fillStyle = barColor;
        canvasCtx.beginPath();
        canvasCtx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, [10, 10, 0, 0]);
        canvasCtx.fill();

        x += barWidth + barGap;
      }
    };

    draw();

    return () => {
      // Cleanup on component unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      source.disconnect();
      audioContext.close();
    };
  }, [mediaStream]);

  return <canvas ref={canvasRef} width="300" height="75" />;
};

export default AudioWaveform;