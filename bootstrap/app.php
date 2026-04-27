<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: [
            'midtrans/notification',
        ]);
        $middleware->trustProxies(at: '*');
        $middleware->alias([
            'admin.auth' => \App\Http\Middleware\AdminAuth::class,
            'booth.protect' => \App\Http\Middleware\ProtectBoothAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => $e->getMessage()], 500);
            }
            
            $code = $e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface ? $e->getStatusCode() : 500;
            
            $statusTexts = [
                400 => 'Bad Request',
                401 => 'Unauthorized',
                403 => 'Akses Ditolak',
                404 => 'Halaman Tidak Ditemukan',
                405 => 'Metode Tidak Diizinkan',
                419 => 'Sesi Telah Berakhir',
                429 => 'Terlalu Banyak Permintaan',
                500 => 'Kesalahan Server Internal',
                503 => 'Layanan Tidak Tersedia'
            ];
            
            $message = $statusTexts[$code] ?? 'Terjadi Kesalahan';
            
            // Tampilkan pesan error spesifik jika kita dalam mode debug atau itu adalah error 500
            $detailMessage = env('APP_DEBUG') && $code == 500 ? $e->getMessage() : $message;

            return response()->view('errors.custom', [
                'code' => $code,
                'message' => $message,
                'detailMessage' => $detailMessage
            ], $code);
        });
    })->create();
