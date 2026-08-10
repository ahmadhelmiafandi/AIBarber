<?php

namespace App\Helpers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class QueryHelper
{
    /**
     * Apply pagination or return all based on request parameters.
     */
    public static function paginateOrAll(Builder $query, Request $request, int $defaultPerPage = 10, int $maxAllLimit = 250): mixed
    {
        if ($request->boolean('all')) {
            return $query->limit($maxAllLimit)->get();
        }

        $perPage = (int) $request->input('per_page', $defaultPerPage);
        // Hard limit perPage to 100 to safeguard memory and performance under heavy load
        $perPage = max(1, min(100, $perPage));

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Extract pagination meta from a LengthAwarePaginator.
     */
    public static function getPaginationMeta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ];
    }
}
