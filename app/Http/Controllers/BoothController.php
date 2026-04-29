<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Midtrans\Config;
use Midtrans\CoreApi;
use Midtrans\Transaction;

class BoothController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * Halaman awal booth: input kode order
     */
    public function index()
    {
        return view('booth.index');
    }

    /**
     * Validasi kode order
     */
    public function lookup(Request $request)
    {
        $request->validate([
            'order_code' => 'required|string',
        ]);

        $code = strtoupper(trim($request->order_code));
        $order = Order::where('order_code', $code)->first();

        if (!$order) {
            return back()->withErrors(['order_code' => 'Kode order tidak ditemukan.'])->withInput();
        }

        if ($order->status === 'printed') {
            return back()->withErrors(['order_code' => 'Order ini sudah dicetak.'])->withInput();
        }

        if (!in_array($order->status, ['waiting', 'pending_payment', 'paid', 'expired'])) {
            return back()->withErrors(['order_code' => 'Status order tidak valid.'])->withInput();
        }

        // If already paid, go straight to print
        if ($order->status === 'paid') {
            return redirect()->route('booth.print', $code);
        }

        return redirect()->route('booth.settings', $code);
    }

    /**
     * Preview foto
     */
    public function preview($code)
    {
        $order = Order::where('order_code', $code)
            ->whereIn('status', ['waiting', 'pending_payment', 'expired', 'paid'])
            ->with('photos')
            ->firstOrFail();

        if ($order->status === 'paid') {
            return redirect()->route('booth.print', $code);
        }

        return view('booth.preview', compact('order'));
    }

    /**
     * Halaman pilih setting cetak (warna/BW + jumlah)
     */
    public function settings($code)
    {
        $order = Order::where('order_code', $code)
            ->whereIn('status', ['waiting', 'pending_payment', 'expired', 'paid'])
            ->with('photos')
            ->firstOrFail();

        $priceColor = config('midtrans.price_color');
        $priceBw = config('midtrans.price_bw');

        return view('booth.settings', compact('order', 'priceColor', 'priceBw'));
    }

    public function payment(Request $request, $code)
    {
        $request->validate([
            'print_mode' => 'required|in:color,bw',
            'print_qty' => 'required|integer|min:1|max:10',
        ]);

        $order = Order::where('order_code', $code)
            ->whereIn('status', ['waiting', 'pending_payment', 'expired'])
            ->firstOrFail();

        $totalPrice = Order::calculatePrice($request->print_mode, $request->print_qty);
        $midtransOrderId = 'PB-' . time() . '-' . $order->id;

        try {
            $params = [
                'payment_type' => 'qris',
                'transaction_details' => [
                    'order_id' => $midtransOrderId,
                    'gross_amount' => $totalPrice,
                ],
                'customer_details' => [
                    'first_name' => $order->customer_name,
                    'email' => $order->customer_email,
                    'phone' => $order->customer_phone,
                ],
                'qris' => [
                    'acquirer' => 'gopay',
                ],
            ];

            $response = CoreApi::charge($params);

            // Get QR code URL from response
            $qrCodeUrl = null;
            if (isset($response->actions)) {
                foreach ($response->actions as $action) {
                    if ($action->name === 'generate-qr-code') {
                        $qrCodeUrl = $action->url;
                        break;
                    }
                }
            }

            // Fallback: check qr_string
            if (!$qrCodeUrl && isset($response->qr_string)) {
                $qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=' . urlencode($response->qr_string);
            }

            $order->update([
                'print_mode' => $request->print_mode,
                'print_qty' => $request->print_qty,
                'total_price' => $totalPrice,
                'midtrans_order_id' => $midtransOrderId,
                'qr_code_url' => $qrCodeUrl,
                'status' => 'pending_payment',
                'expired_at' => now()->addMinutes(15),
            ]);

            return redirect()->route('booth.payment.page', $code);

        } catch (\Exception $e) {
            // For sandbox/testing: if Midtrans fails, show a demo mode
            $order->update([
                'print_mode' => $request->print_mode,
                'print_qty' => $request->print_qty,
                'total_price' => $totalPrice,
                'midtrans_order_id' => $midtransOrderId ?? 'DEMO-' . time(),
                'status' => 'pending_payment',
                'expired_at' => now()->addMinutes(15),
            ]);

            return redirect()->route('booth.payment.page', $code)
                ->with('midtrans_error', 'Midtrans sandbox error: ' . $e->getMessage());
        }
    }

    /**
     * Halaman QR code pembayaran
     */
    public function paymentPage($code)
    {
        $order = Order::where('order_code', $code)
            ->whereIn('status', ['pending_payment', 'paid'])
            ->firstOrFail();

        if ($order->status === 'paid') {
            return redirect()->route('booth.print', $code);
        }

        return view('booth.payment', compact('order'));
    }

    /**
     * API: cek status pembayaran (polling)
     */
    public function checkStatus($code)
    {
        $order = Order::where('order_code', $code)->firstOrFail();

        // Also try checking with Midtrans API directly
        if ($order->status === 'pending_payment' && $order->midtrans_order_id) {
            try {
                $status = Transaction::status($order->midtrans_order_id);
                if (in_array($status->transaction_status, ['settlement', 'capture'])) {
                    $order->update([
                        'status' => 'paid',
                        'payment_type' => $status->payment_type ?? 'qris',
                        'paid_at' => now(),
                    ]);
                } elseif (in_array($status->transaction_status, ['expire', 'cancel'])) {
                    $order->update(['status' => 'expired']);
                }
            } catch (\Exception $e) {
                // Ignore errors during polling
            }
        }

        $order = $order->fresh();
        return response()->json([
            'status' => $order->status,
            'redirect' => in_array($order->status, ['paid', 'printed'])
                ? route('booth.print', $code)
                : ($order->status === 'expired' ? route('booth.index') : null),
        ]);
    }

    /**
     * Halaman cetak (auto print)
     */
    public function printPage($code)
    {
        $order = Order::where('order_code', $code)
            ->where('status', 'paid')
            ->with('photos')
            ->firstOrFail();

        return view('booth.print', compact('order'));
    }

    /**
     * Mark order as printed
     */
    public function markPrinted($code)
    {
        $order = Order::where('order_code', $code)
            ->where('status', 'paid')
            ->firstOrFail();

        $order->update([
            'status' => 'printed',
            'printed_at' => now(),
        ]);

        return response()->json(['success' => true]);
    }
}
