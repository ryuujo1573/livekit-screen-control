import { useEffect, useRef, useState } from "react";
import {
  LiveKitRoom,
  useDataChannel,
  useRoomContext,
  VideoConference,
} from "@livekit/components-react";
import { Room, Track } from "livekit-client";

import "@livekit/components-styles/index.css";
import { Canvas } from "./Canvas";
import { decodePointer } from "./codec";

export function App() {
  const room = useRoomContext();
  const controlMode =
    new URLSearchParams(location.search).get("control") == "true";

  useEffect(() => {
    const publishScreenShare = async () => {
      if (controlMode) return;

      // const [videoTrack] =
      //   await room.localParticipant.createScreenTracks({
      //     audio: false,
      //   });
      // const media = videoTrack.mediaStream!;

      const media = await navigator.mediaDevices.getUserMedia({
        video: {
          // @ts-expect-error
          mandatory: {
            chromeMediaSource: "desktop",
          },
        },
        audio: false,
      });

      room.localParticipant.publishTrack(media.getVideoTracks()[0], {
        name: "screen-control",
        source: Track.Source.ScreenShare,
        screenShareEncoding: {
          maxBitrate: 5 * 1024 ** 2,
          maxFramerate: 120,
        },
      });
    };
    room.on("connected", publishScreenShare);
    return () => {
      room.off("connected", publishScreenShare);
    };
  }, [controlMode]);

  useDataChannel((msg) => {
    const { x, y } = decodePointer(msg.payload);
    console.log("current pos %o", [x, y]);
    if ("inputDevices" in window) {
      // window.inputDevices.mouse.move([{ x, y }]);
    }
  });

  return (
    <>
      {controlMode ? (
        <Canvas width={1920} height={1080} />
      ) : (
        <VideoConference />
      )}
    </>
  );
}
