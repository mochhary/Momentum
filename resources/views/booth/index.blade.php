@extends('layouts.booth')
@section('title', 'Booth')

@section('styles')
<style>
    .booth-logo img {
        height: 250px !important;
        margin-bottom: 10px;
    }
</style>
@endsection

@section('content')
<div class="card booth-card animate-in">
    <h2><i class="ph ph-key"></i> Masukkan Kode Momentum Anda</h2>

    <form action="{{ route('booth.lookup') }}" method="POST">
        @csrf
        <div class="form-group booth-input-group">
            <input type="text"
                   name="order_code"
                   class="form-input kiosk-input"
                   placeholder="MOM-XXXX"
                   value="{{ old('order_code') }}"
                   maxlength="8"
                   autocomplete="off"
                   spellcheck="false"
                   autocapitalize="on">
            <div id="js-error-message" class="badge badge-error mt-3 text-bold d-none"></div>
            @error('order_code')
                <div class="badge badge-error mt-3 text-bold">{{ $message }}</div>
            @enderror
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-kiosk-submit">
            <i class="ph ph-magnifying-glass"></i> Cari Foto Saya
        </button>
    </form>

    <!-- Virtual Keyboard Container -->
    <div class="keyboard-wrapper-kiosk animate-in">
        <div class="simple-keyboard"></div>
    </div>

    <div data-island="BoothIndex" style="display:none"></div>
</div>
@endsection
