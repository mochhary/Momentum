<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Dashboard operator: list semua order
     */
    public function index(Request $request)
    {
        $status = $request->get('status');
        $month = $request->get('month', \Carbon\Carbon::now()->format('Y-m'));
        $groupBy = $request->get('group_by', 'daily');

        $parsedMonth = \Carbon\Carbon::createFromFormat('Y-m', $month);

        $baseQuery = Order::query();
        if ($status) {
            $baseQuery->where('status', $status);
        }

        $stats = (clone $baseQuery)->selectRaw("
            SUM(CASE WHEN status IN ('paid', 'printed') THEN total_price ELSE 0 END) as overall_total,
            COUNT(*) as overall_count,
            SUM(CASE WHEN DATE(created_at) = ? AND status IN ('paid', 'printed') THEN total_price ELSE 0 END) as today_total,
            SUM(CASE WHEN DATE(created_at) = ? THEN 1 ELSE 0 END) as today_count,
            SUM(CASE WHEN MONTH(created_at) = ? AND YEAR(created_at) = ? AND status IN ('paid', 'printed') THEN total_price ELSE 0 END) as monthly_total,
            SUM(CASE WHEN MONTH(created_at) = ? AND YEAR(created_at) = ? THEN 1 ELSE 0 END) as monthly_count,
            SUM(CASE WHEN YEAR(created_at) = ? AND status IN ('paid', 'printed') THEN total_price ELSE 0 END) as yearly_total,
            SUM(CASE WHEN YEAR(created_at) = ? THEN 1 ELSE 0 END) as yearly_count
        ", [
            \Carbon\Carbon::today()->toDateString(), 
            \Carbon\Carbon::today()->toDateString(),
            $parsedMonth->month, $parsedMonth->year,
            $parsedMonth->month, $parsedMonth->year,
            $parsedMonth->year,
            $parsedMonth->year
        ])->first();

        $overallTotal = $stats->overall_total ?? 0;
        $overallCount = $stats->overall_count ?? 0;
        $todayTotal = $stats->today_total ?? 0;
        $todayCount = $stats->today_count ?? 0;
        $monthlyTotal = $stats->monthly_total ?? 0;
        $monthlyCount = $stats->monthly_count ?? 0;
        $yearlyTotal = $stats->yearly_total ?? 0;
        $yearlyCount = $stats->yearly_count ?? 0;

        // Table Data
        $tableQuery = clone $baseQuery;
        
        $selectRaw = "
            COUNT(id) as total_orders,
            SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END) as waiting_count,
            SUM(CASE WHEN status = 'pending_payment' THEN 1 ELSE 0 END) as pending_count,
            SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
            SUM(CASE WHEN status = 'printed' THEN 1 ELSE 0 END) as printed_count,
            SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired_count,
            SUM(CASE WHEN status IN ('paid', 'printed') THEN total_price ELSE 0 END) as revenue
        ";

        if ($groupBy === 'daily') {
            $tableQuery->selectRaw("DATE_FORMAT(created_at, '%Y-%m-%d') as period, " . $selectRaw);
            $tableQuery->whereMonth('created_at', $parsedMonth->month)->whereYear('created_at', $parsedMonth->year);
        } elseif ($groupBy === 'yearly') {
            $tableQuery->selectRaw("DATE_FORMAT(created_at, '%Y') as period, " . $selectRaw);
        } else {
            $tableQuery->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as period, " . $selectRaw);
            $tableQuery->whereYear('created_at', $parsedMonth->year);
        }

        $tableData = $tableQuery->groupBy('period')->orderBy('period', 'desc')->paginate(10);

        // Ensure "Today" always appears in the daily list if viewing the current month
        if ($groupBy === 'daily' && $tableData->currentPage() === 1) {
            $today = \Carbon\Carbon::today()->format('Y-m-d');
            $hasToday = $tableData->getCollection()->contains('period', $today);
            
            if (!$hasToday && $parsedMonth->isSameMonth(\Carbon\Carbon::today())) {
                $todayEntry = (object)[
                    'period' => $today,
                    'total_orders' => 0,
                    'waiting_count' => 0,
                    'pending_count' => 0,
                    'paid_count' => 0,
                    'printed_count' => 0,
                    'expired_count' => 0,
                    'revenue' => 0
                ];
                $newCollection = $tableData->getCollection()->prepend($todayEntry);
                $tableData->setCollection($newCollection);
            }
        }

        // Chart Data: Monthly (Daily revenue in selected month)
        $monthlyDataRaw = Order::whereIn('status', ['paid', 'printed'])
            ->whereMonth('created_at', $parsedMonth->month)
            ->whereYear('created_at', $parsedMonth->year)
            ->selectRaw("DAY(created_at) as label, SUM(total_price) as revenue")
            ->groupBy('label')
            ->get()
            ->pluck('revenue', 'label');
        
        $monthlyChartData = [];
        for ($i = 1; $i <= $parsedMonth->daysInMonth; $i++) {
            $monthlyChartData[] = [
                'label' => str_pad($i, 2, '0', STR_PAD_LEFT),
                'revenue' => (int)($monthlyDataRaw[$i] ?? 0)
            ];
        }

        // Chart Data: Yearly (Monthly revenue in selected year)
        $yearlyDataRaw = Order::whereIn('status', ['paid', 'printed'])
            ->whereYear('created_at', $parsedMonth->year)
            ->selectRaw("MONTH(created_at) as label, SUM(total_price) as revenue")
            ->groupBy('label')
            ->get()
            ->pluck('revenue', 'label');
        
        $yearlyChartData = [];
        for ($i = 1; $i <= 12; $i++) {
            $yearlyChartData[] = [
                'label' => str_pad($i, 2, '0', STR_PAD_LEFT),
                'revenue' => (int)($yearlyDataRaw[$i] ?? 0)
            ];
        }

        // 4. Chart Data: Overall (Yearly revenue)
        $firstOrder = Order::orderBy('created_at', 'asc')->first();
        $startYear = $firstOrder ? $firstOrder->created_at->year : now()->year;
        $currentYear = now()->year;
        
        $overallDataRaw = Order::whereIn('status', ['paid', 'printed'])
            ->selectRaw("YEAR(created_at) as label, SUM(total_price) as revenue")
            ->groupBy('label')
            ->get()
            ->pluck('revenue', 'label');
        
        $overallChartData = [];
        // Start from the actual first year of the application
        for ($i = $startYear; $i <= $currentYear; $i++) {
            $overallChartData[] = [
                'label' => (string)$i,
                'revenue' => (int)($overallDataRaw[$i] ?? 0)
            ];
        }

        // Chart Data: Today (Hourly revenue)
        $todayDataRaw = Order::whereIn('status', ['paid', 'printed'])
            ->whereDate('created_at', \Carbon\Carbon::today())
            ->selectRaw("HOUR(created_at) as label, SUM(total_price) as revenue")
            ->groupBy('label')
            ->get()
            ->pluck('revenue', 'label');
        
        $todayChartData = [];
        for ($i = 0; $i < 24; $i++) {
            $todayChartData[] = [
                'label' => str_pad($i, 2, '0', STR_PAD_LEFT),
                'revenue' => (int)($todayDataRaw[$i] ?? 0)
            ];
        }

        if ($request->ajax()) {
            return response()->json([
                'overallTotal' => number_format($overallTotal, 0, ',', '.'),
                'overallCount' => number_format($overallCount),
                'todayTotal' => number_format($todayTotal, 0, ',', '.'),
                'todayCount' => number_format($todayCount),
                'monthlyTotal' => number_format($monthlyTotal, 0, ',', '.'),
                'monthlyCount' => number_format($monthlyCount),
                'yearlyTotal' => number_format($yearlyTotal, 0, ',', '.'),
                'yearlyChartData' => $yearlyChartData,
                'overallChartData' => $overallChartData,
                'todayChartData' => $todayChartData
            ]);
        }

        return view('admin.index', compact(
            'overallTotal', 'overallCount',
            'todayTotal', 'todayCount',
            'monthlyTotal', 'monthlyCount',
            'yearlyTotal', 'yearlyCount',
            'status', 'groupBy', 'tableData', 'parsedMonth',
            'monthlyChartData', 'yearlyChartData', 'overallChartData', 'todayChartData'
        ));
    }
}
