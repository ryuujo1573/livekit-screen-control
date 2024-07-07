import {
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";

export function App() {
  const [canvasRect] = useState<{
    width: number;
    height: number;
  }>({
    width: 1920,
    height: 1080,
  });

  const remoteRef = useRef<HTMLVideoElement>();
  useEffect(() => {
    navigator.mediaDevices
      .getDisplayMedia({
        video: {
          frameRate: 120,
        },
        audio: true,
      })
      .then(async (media) => {
        const videoEl = document.createElement("video");
        videoEl.srcObject = media;
        videoEl.width = 1920;
        videoEl.height = 1080;
        videoEl.style.objectFit = "contain";

        await videoEl.play();

        const old = remoteRef.current;
        if (old) {
          if (old.srcObject instanceof MediaStream) {
            old.srcObject.getTracks().forEach((t) => t.stop());
          }
          old.srcObject = null;
          old.remove();
        }
        remoteRef.current = videoEl;
      });
  }, []);

  const ref = useCallback((canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      console.log(canvas.getBoundingClientRect());
      const ctx = canvas.getContext("2d");

      if (ctx) {
        let id: number;
        ctx.clearRect(0, 0, 1920, 1080);
        const draw = () => {
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, 1920, 1080);

          if (remoteRef.current) {
            const remote = remoteRef.current;
            // target 1080p
            const isHorizontal =
              remote.videoHeight / remote.videoWidth < 9 / 16;
            let w: number, h: number, px: number, py: number, factor: number;
            if (isHorizontal) {
              w = 1920;
              factor = w / remote.videoWidth; // 口
              h = remote.videoHeight * factor;
              (px = 0), (py = (1080 - h) / 2);
            } else {
              h = 1080;
              factor = h / remote.videoHeight;
              w = remote.videoWidth * factor;
              (px = (1920 - w) / 2), (py = 0);
            }
            ctx.drawImage(remote, px, py, w, h);
          }

          ctx.fillStyle = "red";
          const [cx, cy] = cursor.current;
          ctx.fillRect(cx, cy, 10, 10);

          return (id = requestAnimationFrame(draw));
        };

        id = draw();
      }
    }
  }, []);

  const cursor = useRef([0, 0]);
  const [[x, y], setPos] = useState([0, 0]);

  return (
    <LiveKitRoom
      data-lk-theme="default"
      token={import.meta.env.LIVEKIT_TOKEN}
      serverUrl={
        import.meta.env.LIVEKIT_SERVER ?? "https://webrtc.msuncloud.com"
      }
    >
      <div className="absolute opacity-80 w-full h-full z-50 p-2 overflow-hidden pointer-events-none">
        <canvas
          className="w-full box-border border translate-x-[var(--x)] translate-y-[var(--y)] pointer-events-auto"
          ref={ref}
          width={canvasRect.width}
          height={canvasRect.height}
          onContextMenu={(e) => {
            e.preventDefault();
          }}
          onPointerMove={(e) => {
            if (e.buttons % 4 == 3) {
              startTransition(() => {
                setPos(([x, y]) => [x + e.movementX, y + e.movementY]);
              });
            } else {
              const canvas = e.currentTarget;
              const canvasX = x + canvas.offsetLeft + canvas.clientLeft;
              const canvasY = y + canvas.offsetTop + canvas.clientTop;

              cursor.current = [e.clientX - canvasX, e.clientY - canvasY].map(
                (x) => (x * canvasRect.width) / canvas.offsetWidth,
              );
            }
          }}
          style={
            {
              "--x": x + "px",
              "--y": y + "px",
            } as unknown as any
          }
        ></canvas>
      </div>
      <VideoConference />
    </LiveKitRoom>
  );
}
