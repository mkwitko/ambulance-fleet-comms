// src/hooks/useRadioCallHandler.ts
import { AblyEvents, RadioCallTypeEvents } from "@/src/@types/ably-events";
import { useCreateRadioIntercomms } from "@/src/http/generated/radio/radio";
import useAbly from "@/src/services/use-ably";
import { useAgora } from "@/src/services/use-agora";
import { useEffect } from "react";
import useNotificationAeroHook from "./use-notification-aero-hook";

export function useRadioCallHandler() {
  const { join, leave } = useAgora();
  const { mutateAsync: createRadioMeeting } = useCreateRadioIntercomms();
  const { playSound } = useNotificationAeroHook();

  const handleCall = async (channelName: string, baseId: string) => {
    const response = await createRadioMeeting({
      data: { id: channelName, baseId },
    });

    await join({
      token: response.rtcToken,
      channel: response.id,
      uid: response.uid as string,
    });
  };

  const handleLeave = () => {
    leave();
  };

  const { user, publish } = useAbly({
    events: [
      AblyEvents.interCommunicationCall,
      AblyEvents.interCommunicationPlaySound,
      AblyEvents.checkingActiveness,
    ],
    handleMessageReceived: (message) => {
      if (
        message.name === AblyEvents.interCommunicationPlaySound &&
        message.data.channelName === user?.data.id
      ) {
        playSound();
      }
      if (
        message.name === AblyEvents.interCommunicationCall &&
        message.data.channelName === user?.data.id
      ) {
        switch (message.data.type) {
          case RadioCallTypeEvents.calling:
            handleCall(message.data.channelName, message.data.baseId);
            break;

          case RadioCallTypeEvents.ended:
            handleLeave();
            break;
        }
      }
      if (
        message.name === AblyEvents.checkingActiveness &&
        message.data.userId === user?.data.id
      ) {
        publish(AblyEvents.activenessResponse, {
          userId: user?.data.id,
          active: true,
        });
      }
    },
  });

  useEffect(() => {
    if (!user) return;
    publish(AblyEvents.activenessResponse, {
      userId: user?.data.id,
      active: true,
    });

    return () => {
      publish(AblyEvents.activenessResponse, {
        userId: user?.data.id,
        active: false,
      });
    };
  }, [user]);

  return { user };
}
