<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderPhoto;
use Illuminate\Http\Request;

class PhotoboothController extends Controller
{
    /**
     * Landing page → redirect ke pilih frame
     */
    public function index()
    {
        return view('home');
    }

    /**
     * Halaman pilih frame template
     */
    public function selectFrame()
    {
        $frames = \App\Models\Frame::all();
        return view('frame-select', compact('frames'));
    }

    /**
     * Form upload foto ke slot frame + data diri
     */
    public function uploadForm($id)
    {
        $frame = \App\Models\Frame::findOrFail($id);
        $frameConfig = is_string($frame->layout_config) ? json_decode($frame->layout_config, true) : ($frame->layout_config ?? []);
        $frameType = $frame->id;

        return view('upload', compact('frame', 'frameConfig', 'frameType'));
    }

    /**
     * Simpan foto & data → generate kode order
     */
    public function store(Request $request)
    {
        $frameType = $request->input('frame_type');
        $frame = \App\Models\Frame::findOrFail($frameType);

        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'frame_type' => 'required|exists:frames,id',
            'final_photo' => 'required|string', // base64 encoded merged photo
        ], [
            'customer_name.required' => 'Nama harus diisi',
            'customer_email.required' => 'Email harus diisi',
            'customer_phone.required' => 'No. HP harus diisi',
            'final_photo.required' => 'Foto harus diupload',
        ]);

        // Create order
        $order = Order::create([
            'order_code' => Order::generateCode(),
            'customer_name' => $request->customer_name,
            'customer_email' => $request->customer_email,
            'customer_phone' => $request->customer_phone,
            'frame_type' => $frameType,
            'status' => 'waiting',
        ]);

        // Handle high-performance binary upload or base64 fallback
        $directory = 'photos/' . $order->order_code;
        $fileNameOnly = uniqid() . '.jpg';
        $fullPath = $directory . '/' . $fileNameOnly;
        
        if ($request->hasFile('final_photo_file')) {
            $request->file('final_photo_file')->storeAs($directory, $fileNameOnly, 'public');
        } elseif ($request->filled('final_photo') && $request->final_photo !== 'binary_mode') {
            // Base64 Fallback
            $image_parts = explode(";base64,", $request->final_photo);
            if (isset($image_parts[1])) {
                $image_base64 = base64_decode($image_parts[1]);
                \Illuminate\Support\Facades\Storage::disk('public')->put($fullPath, $image_base64);
            }
        }

        OrderPhoto::create([
            'order_id' => $order->id,
            'photo_path' => $fullPath,
            'original_name' => 'merged_photo.jpg',
        ]);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'redirect_url' => route('order.code', $order->order_code)
            ]);
        }

        return redirect()->route('order.code', $order->order_code);
    }

    /**
     * Tampilkan kode order
     */
    public function showCode($code)
    {
        $order = Order::where('order_code', $code)->firstOrFail();
        return view('order-code', compact('order'));
    }
}
