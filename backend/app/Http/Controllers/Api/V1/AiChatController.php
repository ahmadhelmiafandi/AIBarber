<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Services\AI\AiChatConsultantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiChatController extends Controller
{
    use ApiResponse;

    public function chat(Request $request, AiChatConsultantService $chatService): JsonResponse
    {
        $request->validate([
            'messages' => ['required', 'array', 'min:1', 'max:10'],
            'messages.*.role' => ['required', 'string', 'in:user,assistant,system'],
            'messages.*.content' => ['required', 'string', 'max:1000'],
        ]);

        $response = $chatService->chat($request->user(), $request->input('messages'));

        return $this->successResponse('Respon konsultasi AI berhasil.', [
            'reply' => $response->replyText,
            'tokens' => [
                'prompt_tokens' => $response->promptTokens,
                'completion_tokens' => $response->completionTokens,
            ],
        ]);
    }
}
