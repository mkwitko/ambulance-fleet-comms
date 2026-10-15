import * as Ably from "ably";
import { useCallback, useEffect, useRef } from "react";
import { useGetAuthenticatedCommsUser } from "../http/generated/comms/comms";
import { createAblyToken } from "../http/generated/radio/radio";

export default function useAbly({
  events,
  handleMessageReceived,
}: {
  events?: string[];
  handleMessageReceived?: (message: Ably.InboundMessage) => void;
}) {
  const { data: user } = useGetAuthenticatedCommsUser();
  const clientRef = useRef<Ably.Realtime | null>(null);

  // 1️⃣ Create client ONLY when user exists
  useEffect(() => {
    if (!user || clientRef.current || !user.data.companyGroupId) return;

    clientRef.current = new Ably.Realtime({
      autoConnect: true,
      authCallback: async (_, callback) => {
        const tokenRequest = await createAblyToken({
          channel: `connect-${user.data.companyGroupId}`,
        });
        callback(null, tokenRequest.tokenRequest as string);
      },
      disconnectedRetryTimeout: 4000,
      suspendedRetryTimeout: 10000,
    });

    return () => {
      clientRef.current?.close();
      clientRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !clientRef.current || !events || !handleMessageReceived)
      return;

    const client = clientRef.current;
    const channelName = `connect-${user.data.companyGroupId}`;
    const channel = client.channels.get(channelName);

    const subscribe = () => {
      channel.subscribe(events, handleMessageReceived);
    };

    if (client.connection.state === "connected") {
      subscribe();
    } else {
      client.connection.once("connected", subscribe);
    }

    return () => {
      channel.unsubscribe(events, handleMessageReceived);
    };
  }, [user, events, handleMessageReceived]);

  // 3️⃣ SAFE publish helper
  const publish = useCallback(
    async (event: string, payload: unknown) => {
      if (!clientRef.current || !user) {
        throw new Error("Ably not ready");
      }

      const channelName = `connect-${user.data.companyGroupId}`;
      const channel = clientRef.current.channels.get(channelName);

      // Ensure connection
      if (clientRef.current.connection.state !== "connected") {
        await new Promise<void>((resolve) => {
          clientRef.current!.connection.once("connected", () => resolve());
        });
      }

      channel.publish(event, payload);
    },
    [user],
  );

  return {
    user,
    publish,
  };
}
