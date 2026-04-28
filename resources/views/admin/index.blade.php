@extends('layouts.app')
@section('title', 'Admin Dashboard - Photobooth Studio')


@section('styles')
    <link rel="stylesheet" href="{{ asset('css/admin.css') }}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/plugins/monthSelect/style.css">
@endsection

@section('content')
<div class="admin-layout container">
    <div class="admin-header animate-in d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
            <div class="stat-icon p-0" style="width: 56px; height: 56px;"><i class="ph ph-desktop"></i></div>
            <h1 class="m-0">Dashboard Statistik</h1>
        </div>
        <div class="d-flex gap-3">
            <a href="{{ route('admin.frames.index') }}" class="btn btn-secondary">
                <i class="ph ph-image-square"></i> Kelola Frame
            </a>
            <form action="{{ route('admin.logout') }}" method="POST">
                @csrf
                <button type="submit" class="btn btn-secondary text-error-custom">
                    <i class="ph ph-sign-out"></i> Logout
                </button>
            </form>
        </div>
    </div>

    <!-- Filter Form -->
    <form method="GET" action="{{ route('admin.index') }}" class="filter-bar animate-in d-flex justify-content-between align-items-center" id="filterForm">
        <input type="hidden" name="group_by" id="groupByInput" value="{{ $groupBy }}">
        
        <div class="d-flex align-items-center gap-2">
            <span class="text-uppercase text-bold text-muted-custom">Status</span>
            <div class="pill-tabs">
                <button type="submit" name="status" value="" class="pill-tab {{ !$status ? 'active' : '' }}">Semua</button>
                <button type="submit" name="status" value="waiting" class="pill-tab {{ $status === 'waiting' ? 'active' : '' }}">Waiting</button>
                <button type="submit" name="status" value="pending_payment" class="pill-tab {{ $status === 'pending_payment' ? 'active' : '' }}">Pending</button>
                <button type="submit" name="status" value="paid" class="pill-tab {{ $status === 'paid' ? 'active' : '' }}">Paid</button>
                <button type="submit" name="status" value="printed" class="pill-tab {{ $status === 'printed' ? 'active' : '' }}">Printed</button>
                <button type="submit" name="status" value="expired" class="pill-tab {{ $status === 'expired' ? 'active' : '' }}">Expired</button>
            </div>
        </div>

        <div class="filter-group-inline">
            <span class="text-uppercase text-bold text-muted-custom">Pilih Periode</span>
            <div class="input-with-icon" style="width: 220px;">
                <i class="ph ph-calendar-blank"></i>
                <input type="text" id="monthPicker" name="month" class="form-input month-picker-input" value="{{ request('month', date('Y-m')) }}" placeholder="Pilih Bulan">
            </div>
        </div>
    </form>

    <!-- Top Summary Cards (Hanya tampil jika tidak ada filter status) -->
    @if(!$status)
    <div class="stats-grid animate-in animate-delay-1">
        <!-- 1. Keseluruhan -->
        <div class="stat-card">
            <div class="stat-icon overall-icon"><i class="ph ph-globe"></i></div>
            <div class="stat-info">
                <div class="stat-label">Total Keseluruhan</div>
                <div class="stat-value">Rp {{ number_format($overallTotal, 0, ',', '.') }}</div>
                <div class="text-muted-small">{{ number_format($overallCount) }} order</div>
            </div>
        </div>

        <!-- 2. Tahunan -->
        <div class="stat-card">
            <div class="stat-icon yearly-icon"><i class="ph ph-chart-bar"></i></div>
            <div class="stat-info">
                <div class="stat-label">Tahun {{ $parsedMonth->year }}</div>
                <div class="stat-value">Rp {{ number_format($yearlyTotal, 0, ',', '.') }}</div>
                <div class="text-muted-small">{{ number_format($yearlyCount) }} order</div>
            </div>
        </div>

        <!-- 3. Bulanan -->
        <div class="stat-card">
            <div class="stat-icon monthly-icon"><i class="ph ph-calendar-blank"></i></div>
            <div class="stat-info">
                <div class="stat-label">{{ $parsedMonth->translatedFormat('F Y') }}</div>
                <div class="stat-value">Rp {{ number_format($monthlyTotal, 0, ',', '.') }}</div>
                <div class="text-muted-small">{{ number_format($monthlyCount) }} order</div>
            </div>
        </div>

        <!-- 4. Harian -->
        <div class="stat-card">
            <div class="stat-icon today-icon"><i class="ph ph-clock"></i></div>
            <div class="stat-info">
                <div class="stat-label">Hari Ini</div>
                <div class="stat-value">Rp {{ number_format($todayTotal, 0, ',', '.') }}</div>
                <div class="text-muted-small">{{ number_format($todayCount) }} order</div>
            </div>
        </div>
    </div>
    @endif

    <!-- Data Table -->
    <div class="table-container animate-in animate-delay-2">
        <div class="table-header">
            <h3 class="m-0"><i class="ph ph-table"></i> Data Statistik</h3>
            
            <div class="d-flex align-items-center gap-2">
                <span class="text-uppercase text-bold text-muted-custom">Tampilkan:</span>
                <div class="pill-tabs">
                    <button type="button" onclick="setGroupBy('daily')" class="pill-tab {{ $groupBy === 'daily' ? 'active' : '' }}">Harian</button>
                    <button type="button" onclick="setGroupBy('monthly')" class="pill-tab {{ $groupBy === 'monthly' ? 'active' : '' }}">Bulanan</button>
                    <button type="button" onclick="setGroupBy('yearly')" class="pill-tab {{ $groupBy === 'yearly' ? 'active' : '' }}">Tahunan</button>
                </div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Periode</th>
                    <th class="text-center">Total Order</th>
                    @if(!$status || $status === 'waiting')<th class="text-center">Waiting</th>@endif
                    @if(!$status || $status === 'pending_payment')<th class="text-center">Pending</th>@endif
                    @if(!$status || $status === 'paid')<th class="text-center">Paid</th>@endif
                    @if(!$status || $status === 'printed')<th class="text-center">Printed</th>@endif
                    @if(!$status || $status === 'expired')<th class="text-center">Expired</th>@endif
                    @if(!$status || in_array($status, ['paid', 'printed']))<th class="text-right">Pendapatan</th>@endif
                </tr>
            </thead>
            <tbody>
                @forelse($tableData as $data)
                <tr>
                    <td class="text-bold text-head-custom">
                        @if($groupBy === 'daily')
                            {{ \Carbon\Carbon::parse($data->period)->translatedFormat('d F Y') }}
                        @elseif($groupBy === 'yearly')
                            Tahun {{ $data->period }}
                        @else
                            {{ \Carbon\Carbon::createFromFormat('Y-m', $data->period)->translatedFormat('F Y') }}
                        @endif
                    </td>
                    <td class="text-center text-bold">{{ $data->total_orders }}</td>
                    @if(!$status || $status === 'waiting')<td class="text-center"><span class="status-badge badge-waiting">{{ $data->waiting_count }}</span></td>@endif
                    @if(!$status || $status === 'pending_payment')<td class="text-center"><span class="status-badge badge-pending">{{ $data->pending_count }}</span></td>@endif
                    @if(!$status || $status === 'paid')<td class="text-center"><span class="status-badge badge-paid">{{ $data->paid_count }}</span></td>@endif
                    @if(!$status || $status === 'printed')<td class="text-center"><span class="status-badge badge-printed-custom">{{ $data->printed_count }}</span></td>@endif
                    @if(!$status || $status === 'expired')<td class="text-center"><span class="status-badge badge-expired">{{ $data->expired_count }}</span></td>@endif
                    
                    @if(!$status || in_array($status, ['paid', 'printed']))
                    <td class="text-right text-bold text-primary">
                        Rp {{ number_format($data->revenue, 0, ',', '.') }}
                    </td>
                    @endif
                </tr>
                @empty
                <tr>
                    <td colspan="10" class="p-5 text-center text-muted">
                        <i class="ph ph-folder-open empty-icon"></i>
                        Tidak ada data pada periode ini.
                    </td>
                </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    @if($tableData->hasPages())
    <div class="pagination-container animate-in">
        {{ $tableData->links() }}
    </div>
    @endif

    <div data-island="AdminDashboard" style="display:none"></div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/plugins/monthSelect/index.js"></script>
@endsection
