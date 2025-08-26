import { useEffect, useRef } from "react";

export default function Canvas({ current }: { current: "neutral" | "talking" | "thinking" }) {
  const blinkRef = useRef<HTMLVideoElement | null>(null);
  const talkRef = useRef<HTMLVideoElement | null>(null);
  const thinkRef = useRef<HTMLVideoElement | null>(null);

  // Neutral state: show blink video, pause at first frame, play every 3s
  useEffect(() => {
    let pauseTimeout: NodeJS.Timeout | null = null;

    if (current === "neutral" && blinkRef.current) {
      const video = blinkRef.current;

      // reset to first frame and pause
      video.currentTime = 0;
      video.pause();

      // after 3s, play blink
      pauseTimeout = setTimeout(() => {
        video.play();
      }, 3000);
    }

    return () => {
      if (pauseTimeout) clearTimeout(pauseTimeout);
    };
  }, [current]);

  // Talking state: restart loop on entry
  useEffect(() => {
    if (current === "talking" && talkRef.current) {
      const video = talkRef.current;
      video.currentTime = 0;
      video.play();
    }
  }, [current]);

  // Thinking state: restart loop on entry
  useEffect(() => {
    if (current === "thinking" && thinkRef.current) {
      const video = thinkRef.current;
      video.currentTime = 0;
      video.play();
    }
  }, [current]);

  return (
    <div className="relative w-[700px] h-[350px]">
      {/* Character */}
      <div className="absolute inset-0 flex items-center justify-center">
        {current === "neutral" && (
          <video
            ref={blinkRef}
            src="/animations/blink_full.mp4"
            width={700}
            height={350}
            muted
            playsInline
            onEnded={(e) => {
              const video = e.currentTarget;
              // loop back to start, pause, wait, then play again
              video.currentTime = 0;
              video.pause();
              setTimeout(() => video.play(), 3000);
            }}
          />
        )}

        {current === "talking" && (
          <video
            ref={talkRef}
            src="/animations/talk_full.mp4"
            width={700}
            height={350}
            muted
            playsInline
            loop
          />
        )}

        {current === "thinking" && (
          <video
            ref={thinkRef}
            src="/animations/think.mp4"
            width={700}
            height={350}
            muted
            playsInline
            loop
          />
        )}
      </div>
    </div>
  );
}
