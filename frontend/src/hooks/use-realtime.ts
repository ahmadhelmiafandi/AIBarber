import { useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { getEcho, initEcho } from '@/lib/echo';

interface RealtimeConfig {
  branchId?: string;
  customerId?: string;
  onQueueUpdate?: (payload: { event: string; queue_id: string; version: number; [key: string]: unknown }) => void;
  onVersionGap?: () => void;
  currentLocalVersion?: number;
}

export function useRealtimeQueue({
  branchId,
  customerId,
  onQueueUpdate,
  onVersionGap,
  currentLocalVersion = 0,
}: RealtimeConfig) {
  const { token } = useAuth();
  const localVersionRef = useRef(currentLocalVersion);

  useEffect(() => {
    localVersionRef.current = currentLocalVersion;
  }, [currentLocalVersion]);

  useEffect(() => {
    if (!token) return;

    const echo = getEcho() || initEcho(token);
    if (!echo) return;

    const handlePayload = (payload: { event: string; queue_id: string; version: number; [key: string]: unknown }) => {
      const incomingVersion = payload.version ?? 0;
      const localVersion = localVersionRef.current;

      if (incomingVersion <= localVersion && localVersion > 0) {
        // Ignore stale or duplicate event
        return;
      }

      if (incomingVersion > localVersion + 1 && localVersion > 0) {
        // Version gap detected -> Trigger authoritative REST refetch
        if (onVersionGap) {
          onVersionGap();
        }
        return;
      }

      // Sequential update -> Apply event
      if (onQueueUpdate) {
        onQueueUpdate(payload);
      }
    };

    // Subscriptions
    const channels: string[] = [];

    if (branchId) {
      const branchChannel = `private-branch.${branchId}`;
      channels.push(branchChannel);
      echo.private(branchChannel)
        .listen('.queue_created', handlePayload)
        .listen('.queue_recalculated', handlePayload)
        .listen('.queue_checked_in', handlePayload)
        .listen('.queue_called', handlePayload)
        .listen('.queue_started', handlePayload)
        .listen('.queue_completed', handlePayload)
        .listen('.queue_skipped', handlePayload);
    }

    if (customerId) {
      const customerChannel = `private-customer.${customerId}`;
      channels.push(customerChannel);
      echo.private(customerChannel)
        .listen('.queue_called', handlePayload)
        .listen('.queue_estimate_shifted', handlePayload);
    }

    return () => {
      channels.forEach((ch) => {
        echo.leave(ch);
      });
    };
  }, [branchId, customerId, token, onQueueUpdate, onVersionGap]);
}
