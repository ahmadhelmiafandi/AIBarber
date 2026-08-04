<?php

$defaultAppKey = 'base64:G7TcTcA2PwSeF7ejDFc3+yOhJux5mxRVTur5sUFxR8=';
if (empty($_ENV['APP_KEY']) || $_ENV['APP_KEY'] === 'base64:' || strlen((string)$_ENV['APP_KEY']) < 10) {
    $_ENV['APP_KEY'] = $defaultAppKey;
    $_SERVER['APP_KEY'] = $defaultAppKey;
    putenv("APP_KEY={$defaultAppKey}");
}

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                if ($e instanceof ValidationException) {
                    return response()->json([
                        'message' => $e->getMessage(),
                        'errors' => $e->errors(),
                    ], 422);
                }

                if ($e instanceof AuthenticationException) {
                    return response()->json([
                        'message' => 'Unauthenticated.',
                    ], 401);
                }

                if ($e instanceof HttpExceptionInterface) {
                    return response()->json([
                        'message' => $e->getMessage() ?: 'HTTP Error',
                    ], $e->getStatusCode());
                }
            }
        });
    })->create();
