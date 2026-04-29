@extends('layouts.app')
@section('title', 'Dashboard')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/admin.css') }}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/plugins/monthSelect/style.css">
    <style>
        .stat-card { position: relative; overflow: hidden; }
        .stat-card::after {
            content: 'Klik untuk detail';
            position: absolute;
            bottom: -20px;
            right: 15px;
            font-size: 0.6rem;
            text-transform: uppercase;
            font-weight: 700;
            color: var(--primary);
            opacity: 0;
            transition: all 0.3s;
        }
        .stat-card:hover::after { bottom: 10px; opacity: 1; }
        .live-indicator {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.7rem;
            font-weight: 700;
            color: var(--success);
            background: var(--success-bg);
            padding: 4px 10px;
            border-radius: 20px;
            text-transform: uppercase;
        }
        .dot { width: 6px; height: 6px; background: currentColor; border-radius: 50%; animation: blink 1.5s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        
        /* Specific Fix for Filter Bar Labels */
        .filter-label {
            font-size: 0.8rem;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
    </style>
@endsection

@section('content')
<div class="admin-layout container">
    <div class="admin-header animate-in d-flex justify-content-between align-items-center" style="margin-bottom: 30px;">
        <div class="d-flex align-items-center gap-3">
            <div class="stat-icon p-0" style="width: 56px; height: 56px;"><i class="ph ph-desktop"></i></div>
            <h1 class="m-0">Dashboard Statistik</h1>
            <div class="live-indicator"><span class="dot"></span> Live Update</div>
        </div>
        <div class="d-flex gap-2">
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

    <!-- Filter Bar: Slim but Standard Elements -->
    <form method="GET" action="{{ route('admin.index') }}" class="filter-bar animate-in" id="filterForm">
        <input type="hidden" name="group_by" id="groupByInput" value="{{ $groupBy }}">
        
        <div class="d-flex align-items-center gap-3">
            <span class="filter-label">Status</span>
            <div class="pill-tabs">
                <button type="submit" name="status" value="" class="pill-tab {{ !$status ? 'active' : '' }}">Semua</button>
                <button type="submit" name="status" value="waiting" class="pill-tab {{ $status === 'waiting' ? 'active' : '' }}">Waiting</button>
                <button type="submit" name="status" value="pending_payment" class="pill-tab {{ $status === 'pending_payment' ? 'active' : '' }}">Pending</button>
                <button type="submit" name="status" value="paid" class="pill-tab {{ $status === 'paid' ? 'active' : '' }}">Paid</button>
                <button type="submit" name="status" value="printed" class="pill-tab {{ $status === 'printed' ? 'active' : '' }}">Printed</button>
                <button type="submit" name="status" value="expired" class="pill-tab {{ $status === 'expired' ? 'active' : '' }}">Expired</button>
            </div>
        </div>

        <div class="d-flex align-items-center gap-3">
            <span class="filter-label">Periode</span>
            <div class="input-with-icon">
                <i class="ph ph-calendar-blank"></i>
                <input type="text" id="monthPicker" name="month" class="form-input month-picker-input" value="{{ request('month', date('Y-m')) }}" placeholder="Pilih Bulan">
            </div>
        </div>
    </form>

    @if(!$status)
    <div class="stats-grid animate-in animate-delay-1">
        <div class="stat-card" onclick="openChartModal('overall')">
            <div class="stat-icon overall-icon"><i class="ph ph-globe"></i></div>
            <div class="stat-info">
                <div class="stat-label">Total Keseluruhan</div>
                <div class="stat-value" id="overallTotalValue">Rp {{ number_format($overallTotal, 0, ',', '.') }}</div>
                <div class="text-muted-small" id="overallCountValue">{{ number_format($overallCount) }} order</div>
            </div>
        </div>

        <div class="stat-card" onclick="openChartModal('yearly')">
            <div class="stat-icon yearly-icon"><i class="ph ph-chart-bar"></i></div>
            <div class="stat-info">
                <div class="stat-label">Tahun {{ $parsedMonth->year }}</div>
                <div class="stat-value" id="yearlyTotalValue">Rp {{ number_format($yearlyTotal, 0, ',', '.') }}</div>
                <div class="text-muted-small" id="yearlyCountValue">{{ number_format($yearlyCount) }} order</div>
            </div>
        </div>

        <div class="stat-card" onclick="openChartModal('monthly')">
            <div class="stat-icon monthly-icon"><i class="ph ph-calendar-blank"></i></div>
            <div class="stat-info">
                <div class="stat-label">{{ $parsedMonth->translatedFormat('F Y') }}</div>
                <div class="stat-value" id="monthlyTotalValue">Rp {{ number_format($monthlyTotal, 0, ',', '.') }}</div>
                <div class="text-muted-small" id="monthlyCountValue">{{ number_format($monthlyCount) }} order</div>
            </div>
        </div>

        <div class="stat-card" onclick="openChartModal('daily')">
            <div class="stat-icon today-icon"><i class="ph ph-clock"></i></div>
            <div class="stat-info">
                <div class="stat-label">Hari Ini</div>
                <div class="stat-value" id="todayTotalValue">Rp {{ number_format($todayTotal, 0, ',', '.') }}</div>
                <div class="text-muted-small" id="todayCountValue">{{ number_format($todayCount) }} order</div>
            </div>
        </div>
    </div>
    @endif

    <!-- Data Table -->
    <div class="table-container animate-in animate-delay-2">
        <div class="table-header">
            <h3 class="m-0"><i class="ph ph-table"></i> Data Statistik</h3>
            <div class="pill-tabs">
                <button type="button" onclick="setGroupBy('daily')" class="pill-tab {{ $groupBy === 'daily' ? 'active' : '' }}">Harian</button>
                <button type="button" onclick="setGroupBy('monthly')" class="pill-tab {{ $groupBy === 'monthly' ? 'active' : '' }}">Bulanan</button>
                <button type="button" onclick="setGroupBy('yearly')" class="pill-tab {{ $groupBy === 'yearly' ? 'active' : '' }}">Tahunan</button>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Periode</th>
                    <th class="text-center">Order</th>
                    @if(!$status || $status === 'waiting')<th class="text-center">Waiting</th>@endif
                    @if(!$status || $status === 'pending_payment')<th class="text-center">Pending</th>@endif
                    @if(!$status || $status === 'paid')<th class="text-center">Paid</th>@endif
                    @if(!$status || $status === 'printed')<th class="text-center">Printed</th>@endif
                    @if(!$status || $status === 'expired')<th class="text-center">Expired</th>@endif
                    <th class="text-right">Pendapatan</th>
                </tr>
            </thead>
            <tbody>
                @forelse($tableData as $data)
                <tr>
                    <td class="text-bold">
                        @if($groupBy === 'daily') {{ \Carbon\Carbon::parse($data->period)->translatedFormat('d F Y') }}
                        @elseif($groupBy === 'yearly') Tahun {{ $data->period }}
                        @else {{ \Carbon\Carbon::createFromFormat('Y-m', $data->period)->translatedFormat('F Y') }} @endif
                    </td>
                    <td class="text-center text-bold">{{ $data->total_orders }}</td>
                    @if(!$status || $status === 'waiting')<td class="text-center"><span class="status-badge badge-waiting">{{ $data->waiting_count }}</span></td>@endif
                    @if(!$status || $status === 'pending_payment')<td class="text-center"><span class="status-badge badge-pending">{{ $data->pending_count }}</span></td>@endif
                    @if(!$status || $status === 'paid')<td class="text-center"><span class="status-badge badge-paid">{{ $data->paid_count }}</span></td>@endif
                    @if(!$status || $status === 'printed')<td class="text-center"><span class="status-badge badge-printed-custom">{{ $data->printed_count }}</span></td>@endif
                    @if(!$status || $status === 'expired')<td class="text-center"><span class="status-badge badge-expired">{{ $data->expired_count }}</span></td>@endif
                    
                    <td class="text-right text-bold text-primary">Rp {{ number_format($data->revenue, 0, ',', '.') }}</td>
                </tr>
                @empty
                <tr><td colspan="8" class="text-center p-5">Tidak ada data.</td></tr>
                @endforelse
            </tbody>
        </table>
        <div class="pagination-wrapper">{{ $tableData->appends(request()->query())->links() }}</div>
    </div>
</div>

<!-- Modal Grafik -->
<div class="modal-backdrop" id="chartModal">
    <div class="chart-modal">
        <button class="modal-close" onclick="closeChartModal()"><i class="ph ph-x"></i></button>
        <div class="modal-header">
            <h2 id="modalTitle">Grafik Pendapatan</h2>
            <p id="modalSubtitle">Detail performa Momentum</p>
        </div>
        <div class="chart-container">
            <canvas id="revenueChart"></canvas>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/plugins/monthSelect/index.js"></script>
<script>
    let monthlyData = @json($monthlyChartData);
    let yearlyData = @json($yearlyChartData);
    let overallData = @json($overallChartData);
    let todayData = @json($todayChartData);
    let myChart = null;

    function refreshStats() {
        const url = new URL(window.location.href);
        fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then(response => response.json())
        .then(data => {
            if(document.getElementById('overallTotalValue')) document.getElementById('overallTotalValue').innerText = 'Rp ' + data.overallTotal;
            if(document.getElementById('overallCountValue')) document.getElementById('overallCountValue').innerText = data.overallCount + ' order';
            if(document.getElementById('yearlyTotalValue')) document.getElementById('yearlyTotalValue').innerText = 'Rp ' + data.yearlyTotal;
            if(document.getElementById('yearlyCountValue')) document.getElementById('yearlyCountValue').innerText = data.yearlyCount + ' order';
            if(document.getElementById('monthlyTotalValue')) document.getElementById('monthlyTotalValue').innerText = 'Rp ' + data.monthlyTotal;
            if(document.getElementById('monthlyCountValue')) document.getElementById('monthlyCountValue').innerText = data.monthlyCount + ' order';
            if(document.getElementById('todayTotalValue')) document.getElementById('todayTotalValue').innerText = 'Rp ' + data.todayTotal;
            if(document.getElementById('todayCountValue')) document.getElementById('todayCountValue').innerText = data.todayCount + ' order';

            monthlyData = data.monthlyChartData;
            yearlyData = data.yearlyChartData;
            overallData = data.overallChartData;
            todayData = data.todayChartData;

            if (document.getElementById('chartModal').classList.contains('is-active')) {
                const title = document.getElementById('modalTitle').innerText;
                if (title.includes('Hari Ini')) openChartModal('daily');
                else if (title.includes('Bulanan')) openChartModal('monthly');
                else if (title.includes('Tahunan')) openChartModal('yearly');
                else openChartModal('overall');
            }
        });
    }
    setInterval(refreshStats, 30000);

    function openChartModal(type) {
        const backdrop = document.getElementById('chartModal');
        const title = document.getElementById('modalTitle');
        const subtitle = document.getElementById('modalSubtitle');
        backdrop.classList.add('is-active');

        let labels = [], data = [];
        if (type === 'daily') {
            title.innerText = "Pendapatan Hari Ini";
            subtitle.innerText = "Tren per jam pada {{ \Carbon\Carbon::today()->translatedFormat('d F Y') }}";
            labels = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0') + ":00");
            data = labels.map(label => {
                const hour = label.split(':')[0];
                const found = todayData.find(item => item.label === hour);
                return found ? found.revenue : 0;
            });
        } else if (type === 'monthly') {
            title.innerText = "Pendapatan Bulanan";
            subtitle.innerText = "Performa harian di bulan {{ $parsedMonth->translatedFormat('F Y') }}";
            labels = monthlyData.map(item => "Tgl " + item.label);
            data = monthlyData.map(item => item.revenue);
        } else if (type === 'yearly') {
            title.innerText = "Pendapatan Tahunan";
            subtitle.innerText = "Performa bulanan di tahun {{ $parsedMonth->year }}";
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
            labels = yearlyData.map(item => monthNames[parseInt(item.label) - 1]);
            data = yearlyData.map(item => item.revenue);
        } else {
            title.innerText = "Total Keseluruhan";
            subtitle.innerText = "Performa Momentum dari tahun ke tahun";
            labels = overallData.map(item => "Tahun " + item.label);
            data = overallData.map(item => item.revenue);
        }
        renderChart(labels, data);
    }

    function renderChart(labels, data) {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        if (myChart) myChart.destroy();
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pendapatan (Rp)',
                    data: data,
                    borderColor: '#427AB5',
                    backgroundColor: 'rgba(66, 122, 181, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#427AB5'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ' Rp ' + new Intl.NumberFormat('id-ID').format(ctx.raw) } } },
                scales: { y: { beginAtZero: true, ticks: { callback: (val) => val >= 1000000 ? 'Rp ' + (val/1000000).toFixed(1) + 'jt' : 'Rp ' + val.toLocaleString('id-ID') } } }
            }
        });
    }

    function closeChartModal() { document.getElementById('chartModal').classList.remove('is-active'); }
    document.getElementById('chartModal').addEventListener('click', (e) => { if (e.target.id === 'chartModal') closeChartModal(); });

    flatpickr("#monthPicker", {
        plugins: [new monthSelectPlugin({ shothand: true, dateFormat: "Y-m", altFormat: "F Y" })],
        onChange: function() { document.getElementById('filterForm').submit(); }
    });

    function setGroupBy(val) {
        document.getElementById('groupByInput').value = val;
        document.getElementById('filterForm').submit();
    }
</script>
@endsection
