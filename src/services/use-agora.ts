import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
} from "react-native-agora";
import { env } from "../env";

export function useAgora() {
  const engineRef = useRef<IRtcEngine | null>(null);

  const [remoteUsers, setRemoteUsers] = useState<number[]>([]);
  const [connectionState, setConnectionState] = useState("1");
  const [isJoined, setIsJoined] = useState(false);

  // -------------------------
  // INIT
  // -------------------------
  useEffect(() => {
    const engine = createAgoraRtcEngine();

    engine.initialize({
      appId: env.EXPO_PUBLIC_AGORA_APP_ID,
    });

    engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
    engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
    engine.setAudioScenario(3); // AUDIO_SCENARIO_COMMUNICATION = 3
    engine.enableAudio();
    engine.enableLocalAudio(true);

    // 👇 KEEP AUDIO RUNNING IN BACKGROUND (IMPORTANT)
    engine.setParameters(
      JSON.stringify({
        "che.audio.keep.audiosession": true,
      })
    );

    engine.setParameters(
      JSON.stringify({
        "che.audio.force_bluetooth_communication": true,
      })
    );

    engine.setParameters(
      JSON.stringify({
        "che.audio.keep.audiomode": true,
      })
    );

    // Optional: improves reliability on Android
    engine.setParameters(
      JSON.stringify({
        "rtc.enable_audio_device_in_background": 1,
      })
    );

    // Listeners
    engine.registerEventHandler({
      onUserJoined: (_connection, uid) => {
        console.log("User joined:", uid);
        setRemoteUsers((prev) => {
          if (prev.includes(uid)) return prev;
          if (prev.length >= 1) {
            return prev;
          }
          return [...prev, uid];
        });
      },
      onJoinChannelSuccess(connection, elapsed) {
        console.log(
          `Successfully joined channel: ${connection.channelId} with uid: ${connection.localUid}`
        );
      },

      onUserOffline: (_connection, uid) => {
        setRemoteUsers((prev) => prev.filter((u) => u !== uid));
      },

      onConnectionStateChanged: (_connection, state, reason) => {
        setConnectionState(String(state));
      },
    });

    engineRef.current = engine;

    return () => {
      engineRef.current?.release();
    };
  }, []);

  // -------------------------
  // JOIN
  // -------------------------
  const join = useCallback(
    async ({
      token,
      channel,
      uid,
    }: {
      token: string;
      channel: string;
      uid: string;
    }) => {
      try {
        const engine = engineRef.current;
        if (!engine) return;
        engine.joinChannelWithUserAccount(token, channel, uid, {
          clientRoleType: ClientRoleType.ClientRoleAudience,
        });

        setIsJoined(true);
      } catch (error) {
        console.error("Error joining Agora channel:", error);
      }
    },
    []
  );

  // -------------------------
  // LEAVE
  // -------------------------
  const leave = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.leaveChannel();
    setRemoteUsers([]);
    setIsJoined(false);
  }, []);

  return {
    join,
    leave,
    isJoined,
    remoteUsers,
    connectionState,
    engine: engineRef.current,
  };
}
