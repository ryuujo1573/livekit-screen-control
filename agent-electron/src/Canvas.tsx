import {
  ControlBar,
  useDataChannel,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import {
  useCallback,
  useRef,
  startTransition,
  useEffect,
  useState,
  useMemo,
  useReducer,
} from "react";
import { decodePointer, encodePointer } from "./codec";
import { Track } from "livekit-client";

export interface CanvasProps {
  width: number;
  height: number;
}

function createVideoEl(media: MediaStream) {
  const videoEl = document.createElement("video");
  videoEl.muted = true;
  videoEl.srcObject = media;
  videoEl.width = 1920;
  videoEl.height = 1080;
  videoEl.style.objectFit = "contain";
  videoEl.onloadedmetadata = () => videoEl.play();
  return videoEl;
}

export function Canvas(props: CanvasProps) {
  const [first] = useTracks([Track.Source.ScreenShare]);
  const remoteRef = useRef<HTMLVideoElement>();
  const cursor = useRef<[x: number, y: number]>([0, 0]);

  useEffect(() => {
    if (first) {
      const { publication } = first;
      const videoEl = createVideoEl(publication.videoTrack!.mediaStream!);

      remoteRef.current = videoEl;

      return () => {
        if (videoEl instanceof HTMLVideoElement) {
          if (videoEl.srcObject instanceof MediaStream) {
            videoEl.srcObject.getTracks().forEach((t) => t.stop());
          }
          videoEl.srcObject = null;
          videoEl.remove();
        }
      };
    }
  }, [first]);

  const ref = useCallback((canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      console.log(canvas.getBoundingClientRect());
      const ctx = canvas.getContext("2d");

      if (ctx) {
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

          ctx.strokeStyle = "2px solid green";
          ctx.beginPath();
          for (const [x, y] of fakeLayerRef.current) ctx.lineTo(x, y);
          ctx.closePath();
          ctx.stroke();

          ctx.fillStyle = "red";
          const [cx, cy] = cursor.current;
          ctx.fillRect(cx, cy, 10, 10);

          return requestAnimationFrame(draw);
        };

        draw();
      }
    }
  }, []);
  const fakeLayerRef = useRef<[number, number][]>([]);
  const { send: $send } = useDataChannel((msg) => {
    const { x, y } = decodePointer(msg.payload);
    fakeLayerRef.current.push([x, y]);
  });

  const _queue = useRef<Uint8Array[]>([]);
  const cooldown = 50;
  const send = useMemo(() => {
    let id: number | undefined;
    return (data: Uint8Array) => {
      if (!id) {
        _queue.current.push(data);
        id = window.setTimeout(() => {
          id = undefined;
        }, cooldown);
      }
    };
  }, [$send, cooldown]);

  const [[x, y], setPos] = useState([0, 0]);
  //   const room = useRoomContext();

  //   const [i, $refresh] = useReducer((i) => i + 1, 0);

  //   useEffect(() => {
  //     room.on("connected", () => {
  //       console.log("connected");
  //       $refresh();
  //     });
  //   }, []);

  return (
    <>
      <ControlBar />
      <div className="absolute opacity-80 left-0 right-0 top-0 bottom-0 z-50 p-2 overflow-hidden pointer-events-none">
        <canvas
          className="w-full box-border border translate-x-[var(--x)] translate-y-[var(--y)] pointer-events-auto"
          ref={ref}
          width={props.width}
          height={props.height}
          onContextMenu={(e) => {
            e.preventDefault();
          }}
          onPointerDown={(e) => {
            $send(encodePointer(e.buttons, ...cursor.current), {
              reliable: true,
            });
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
                (x) => (x * props.width) / canvas.offsetWidth,
              ) as [number, number];

              send(encodePointer(e.buttons, ...cursor.current));
            }
          }}
          onPointerUp={(e) => {
            $send(encodePointer(e.buttons, ...cursor.current), {
              reliable: true,
            });
          }}
          style={
            {
              "--x": x + "px",
              "--y": y + "px",
            } as unknown as any
          }
        ></canvas>
      </div>
    </>
  );
}
