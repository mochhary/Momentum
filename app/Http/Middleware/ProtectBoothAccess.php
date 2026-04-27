<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ProtectBoothAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $secretToken = env('BOOTH_SECRET_TOKEN', 'KioskMomentum2K26');

        // Check if the stored session token matches the current required token
        $authorizedToken = $request->session()->get('booth_authorized_token');

        if ($authorizedToken === $secretToken) {
            return $next($request);
        }

        // Check for token in URL for new authorization
        if ($request->query('token') === $secretToken) {
            // Authorize the session with the SPECIFIC token
            $request->session()->put('booth_authorized_token', $secretToken);
            return $next($request);
        }

        // If not authorized or token has changed, abort
        abort(403, 'Akses Dibatalkan: Token tidak valid atau telah diperbarui. Silakan gunakan link akses terbaru.');
    }
}
