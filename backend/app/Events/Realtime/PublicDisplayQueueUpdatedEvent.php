<?php

namespace App\Events\Realtime;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PublicDisplayQueueUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public bool $afterCommit = true;

    /**
     * @param string $branchId Target branch ID
     * @param array<string, mixed> $snapshotPayload Immutable anonymized payload snapshot (NO PII)
     */
    public function __construct(
        public readonly string $branchId,
        public readonly array $snapshotPayload
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel("branch-display.{$this->branchId}");
    }

    public function broadcastAs(): string
    {
        return 'queue.updated';
    }

    public function broadcastWith(): array
    {
        return $this->snapshotPayload;
    }
}
