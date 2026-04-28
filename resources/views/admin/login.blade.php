@extends('layouts.booth')
@section('title', 'Login Operator')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/admin-login.css') }}">
@endsection

@section('content')
@if(session('captcha_error'))
    <span id="session-captcha-error" style="display: none;">{{ session('captcha_error') }}</span>
@endif
<div class="login-container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-vh: 100vh;">
    <div class="login-logo-wrapper" style="margin-bottom: 20px; text-align: center;">
        <img src="{{ asset('images/logo.png') }}" alt="Momentum" 
             width="500" height="220"
             style="height: 220px; width: auto; object-fit: contain;" 
             fetchpriority="high" loading="eager" decoding="async">
    </div>
    
    <div class="booth-card card animate-in" style="max-width: 480px; width: 100%;">
        <form action="{{ route('admin.login.submit') }}" method="POST" style="text-align: left;">
            @csrf
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" name="email" class="form-input" placeholder="Masukkan Email" value="{{ old('email') }}" required autofocus>
            </div>
            <div class="form-group">
                <label class="form-label">Password</label>
                <div class="password-wrapper">
                    <input type="password" name="password" id="password" class="form-input" placeholder="Masukkan Password" required>
                    <button type="button" class="toggle-password" id="togglePassword">
                        <i class="ph ph-eye"></i>
                    </button>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Keamanan (Captcha)</label>
                <div class="captcha-row">
                    <div id="captcha-container" class="captcha-img-wrapper">
                        {!! captcha_img('flat') !!}
                    </div>
                    <input type="text" name="captcha" class="form-input captcha-input" placeholder="Kode" required>
                </div>
                
                @error('captcha')
                    <!-- Hidden element to trigger SweetAlert2 from admin-login.js -->
                    <span id="captcha-error-msg" style="display: none;">{{ $message }}</span>
                    <div class="badge badge-error" style="margin-top: 8px; width: 100%; justify-content: center;">{{ $message }}</div>
                @enderror
            </div>

            <div style="margin-top: 32px;">
                <button type="submit" class="btn btn-primary btn-block" style="padding: 20px; font-size: 1.1rem;">
                    <i class="ph ph-sign-in"></i> Masuk Sekarang
                </button>
            </div>
        </form>
    </div>
    <div data-island="AdminLogin" style="display:none"></div>
</div>
@endsection
