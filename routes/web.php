<?php

use App\Http\Controllers\PhotoboothController;
use App\Http\Controllers\BoothController;
use App\Http\Controllers\PaymentCallbackController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\Auth\AdminLoginController;
use Illuminate\Support\Facades\Route;

// ==========================================
// Customer Flow — /upload
// ==========================================
Route::get('/', function () {
    return view('home');
})->name('home');
Route::get('/upload', [PhotoboothController::class, 'selectFrame'])->name('frame.select');
Route::get('/upload/{frame}', [PhotoboothController::class, 'uploadForm'])->name('upload.form');
Route::post('/upload', [PhotoboothController::class, 'store'])->name('upload.store');
Route::get('/order/{code}', [PhotoboothController::class, 'showCode'])->name('order.code');

// ==========================================
// Booth Cetak — /booth (Protected)
// ==========================================
Route::middleware('booth.protect')->group(function () {
    Route::get('/booth', [BoothController::class, 'index'])->name('booth.index');
    Route::post('/booth/lookup', [BoothController::class, 'lookup'])->name('booth.lookup');
    Route::get('/booth/{code}/preview', [BoothController::class, 'preview'])->name('booth.preview');
    Route::get('/booth/{code}/settings', [BoothController::class, 'settings'])->name('booth.settings');
    Route::post('/booth/{code}/payment', [BoothController::class, 'payment'])->name('booth.payment');
    Route::get('/booth/{code}/payment', [BoothController::class, 'paymentPage'])->name('booth.payment.page');
    Route::get('/booth/{code}/status', [BoothController::class, 'checkStatus'])->name('booth.status');
    Route::get('/booth/{code}/print', [BoothController::class, 'printPage'])->name('booth.print');
    Route::post('/booth/{code}/printed', [BoothController::class, 'markPrinted'])->name('booth.printed');
});

// ==========================================
// Admin/Operator — /login-operator-booth & /dashboard
// ==========================================
Route::get('/login-operator-booth', [AdminLoginController::class, 'showLoginForm'])->name('admin.login');
Route::post('/login-operator-booth', [AdminLoginController::class, 'login'])->name('admin.login.submit');
Route::post('/logout-operator', [AdminLoginController::class, 'logout'])->name('admin.logout');

Route::middleware('admin.auth')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'index'])->name('admin.index');
    
    // Manage Frames
    Route::get('/dashboard/frames', [App\Http\Controllers\AdminFrameController::class, 'index'])->name('admin.frames.index');
    Route::post('/dashboard/frames', [App\Http\Controllers\AdminFrameController::class, 'store'])->name('admin.frames.store');
    Route::put('/dashboard/frames/{frame}', [App\Http\Controllers\AdminFrameController::class, 'update'])->name('admin.frames.update');
    Route::delete('/dashboard/frames/{frame}', [App\Http\Controllers\AdminFrameController::class, 'destroy'])->name('admin.frames.destroy');
});

// ==========================================
// Midtrans Webhook (exclude CSRF)
// ==========================================
Route::post('/midtrans/notification', [PaymentCallbackController::class, 'handle'])->name('midtrans.notification');
