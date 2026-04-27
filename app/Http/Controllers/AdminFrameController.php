<?php

namespace App\Http\Controllers;

use App\Models\Frame;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminFrameController extends Controller
{
    public function index()
    {
        $frames = Frame::latest()->paginate(10);
        return view('admin.frames.index', compact('frames'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:png,jpg,jpeg|max:5120',
            'layout_config' => 'required|string',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('frames', 'public');
            
            Frame::create([
                'name' => $request->name,
                'image' => $path,
                'layout_config' => json_decode($request->layout_config, true),
            ]);

            return redirect()->route('admin.frames.index')->with('success', 'Frame berhasil disimpan!');
        }

        return back()->with('error', 'Gagal mengupload gambar.');
    }

    public function destroy(Frame $frame)
    {
        if ($frame->image && Storage::disk('public')->exists($frame->image)) {
            Storage::disk('public')->delete($frame->image);
        }
        
        $frame->delete();
        
        return back()->with('success', 'Frame berhasil dihapus.');
    }
}
