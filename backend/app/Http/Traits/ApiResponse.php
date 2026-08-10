<?php
namespace App\Http\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    protected function successResponse(string $message, mixed $data = null, array $meta = [], int $status = 200): JsonResponse
    {
        $responseData = $data;

        if (empty($meta) && $data instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $meta = \App\Helpers\QueryHelper::getPaginationMeta($data);
            $responseData = $data->items();
        } elseif (empty($meta) && $data instanceof \Illuminate\Http\Resources\Json\AnonymousResourceCollection && $data->resource instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $meta = \App\Helpers\QueryHelper::getPaginationMeta($data->resource);
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $responseData,
            'meta' => empty($meta) ? null : $meta,
        ], $status);
    }

    protected function errorResponse(string $message, mixed $errors = null, int $status = 400, array $meta = []): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => null,
            'errors' => $errors,
            'meta' => empty($meta) ? null : $meta,
        ], $status);
    }
}
