@extends('layouts.app')
@section('title', 'Kode Order')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/order-code.css') }}">
@endsection

@section('content')
<div class="code-page container">
    <div class="code-card card animate-in">
        <div class="success-icon-box"><i class="ph ph-check-circle"></i></div>
        <h1 style="font-size: 1.8rem; margin-bottom: 8px;">Foto Siap Dicetak!</h1>
        <p style="color: var(--text-muted); font-size: 1rem;">Simpan atau screenshot kode di bawah ini.</p>

        <div class="display-order-code">{{ $order->order_code }}</div>
        <p style="color: var(--text-head); font-weight: 700;">Gunakan kode ini di mesin booth kami.</p>

        <div class="guide-box">
            <div class="guide-title"><i class="ph ph-info"></i> Panduan Cetak</div>
            <ol class="guide-list">
                <li>Kunjungi booth <strong>Momentum</strong> terdekat</li>
                <li>Masukkan kode <strong>{{ $order->order_code }}</strong> pada layar</li>
                <li>Atur posisi foto & pilih mode (Warna/Hitam Putih)</li>
                <li>Scan QRIS untuk pembayaran, foto akan langsung tercetak!</li>
            </ol>
        </div>

        <a href="{{ route('frame.select') }}" class="btn btn-primary" style="padding: 16px 40px;">
            <i class="ph ph-arrow-left"></i> Upload Foto Lagi
        </a>
    </div>
</div>
@endsection
