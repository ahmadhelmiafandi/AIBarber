<?php

namespace App\Events\Realtime;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CustomerQueueUpdatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public bool $afterCommit = true;

    /**
     * @param string $customerId Target customer User ID
     * @param array<string, mixed> $snapshotPayload Immutable committed payload snapshot
     */
    public function __construct(
        public readonly string $customerId,
        public readonly array $snapshotPayload
    ) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel("customer.{$this->customerId}");
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
