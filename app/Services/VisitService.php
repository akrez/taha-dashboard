<?php

namespace App\Services;

use App\Models\Visit;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class VisitService
{
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Visit::query()
            ->with('user:id,first_name,last_name,national_code')
            ->latest('visited_at')
            ->paginate($perPage);
    }

    public function record(Request $request): void
    {
        $now = verta()->now();

        Visit::create([
            'user_id' => auth()?->id() ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => substr($request->userAgent(), 0, 256),
            'jdate' => $now->format('YmdH'),
            'jyear' => $now->year,
            'jmonth' => $now->month,
            'jday' => $now->day,
            'jhour' => $now->hour,
            'visited_at' => now(),
        ]);
    }

    public function stats(): array
    {
        $now = verta()->now();

        $stats = Cache::remember(
            "VisitService::stats::{$now->format('YmdH')}",
            now()->addHour(),
            fn () => [
                'hourlyChart' => $this->hourlyChart(),
                'dailyChart' => $this->dailyChart(),
                'monthlyChart' => $this->monthlyChart(),
            ],
        );

        $stats['hourlyChart']['data'][array_key_last($stats['hourlyChart']['data'])] = $this->currentHourTotal();
        $stats['dailyChart']['data'][array_key_last($stats['dailyChart']['data'])] = $this->currentDayTotal();
        $stats['monthlyChart']['data'][array_key_last($stats['monthlyChart']['data'])] = $this->currentMonthTotal();
        $stats['currentYearTotal'] = $this->currentYearTotal();

        return $stats;
    }

    public function hourlyChart(): array
    {
        $now = verta()->now();
        $startJdate = $now->copy()->subHours(24)->format('YmdH');
        $rows = Visit::where('jdate', '>=', $startJdate)
            ->groupBy('jyear', 'jmonth', 'jday', 'jhour')
            ->select('jyear', 'jmonth', 'jday', 'jhour', DB::raw('count(id) as total'))
            ->get();

        $lookup = [];
        foreach ($rows as $row) {
            $key = sprintf('%04d%02d%02d%02d', $row->jyear, $row->jmonth, $row->jday, $row->jhour);
            $lookup[$key] = $row->total;
        }

        $result = ['labels' => [], 'data' => []];
        for ($i = 23; $i >= 0; $i--) {
            $time = $now->copy()->subHours($i);
            $result['labels'][] = $time->format('H');
            $key = $time->format('YmdH');
            if ($i) {
                $count = ($lookup[$key] ?? 0);
            } else {
                $count = 0;
            }
            $result['data'][] = $count;
        }

        return $result;
    }

    public function dailyChart(): array
    {
        $now = verta()->now();
        $startJdate = $now->copy()->subDays(30)->format('Ymd');
        $rows = Visit::where('jdate', '>=', $startJdate)
            ->groupBy('jyear', 'jmonth', 'jday')
            ->select('jyear', 'jmonth', 'jday', DB::raw('count(id) as total'))
            ->get();

        $lookup = [];
        foreach ($rows as $row) {
            $key = sprintf('%04d%02d%02d', $row->jyear, $row->jmonth, $row->jday);
            $lookup[$key] = $row->total;
        }

        $result = ['labels' => [], 'data' => []];
        for ($i = 30; $i >= 0; $i--) {
            $time = $now->copy()->subDays($i);
            $result['labels'][] = $time->format('d');
            $key = $time->format('Ymd');
            if ($i) {
                $count = ($lookup[$key] ?? 0);
            } else {
                $count = 0;
            }
            $result['data'][] = $count;
        }

        return $result;
    }

    public function monthlyChart(): array
    {
        $now = verta()->now();
        $startJdate = $now->copy()->subMonths(12)->format('Ym');
        $rows = Visit::where('jdate', '>=', $startJdate)
            ->groupBy('jyear', 'jmonth')
            ->select('jyear', 'jmonth', DB::raw('count(id) as total'))
            ->get();

        $lookup = [];
        foreach ($rows as $row) {
            $key = sprintf('%04d%02d', $row->jyear, $row->jmonth);
            $lookup[$key] = $row->total;
        }

        $result = ['labels' => [], 'data' => []];
        for ($i = 11; $i >= 0; $i--) {
            $time = $now->copy()->subMonths($i);
            $result['labels'][] = $time->format('m');
            $key = $time->format('Ym');
            if ($i) {
                $count = ($lookup[$key] ?? 0);
            } else {
                $count = 0;
            }
            $result['data'][] = $count;
        }

        return $result;
    }

    public function currentHourTotal(): int
    {
        $now = verta()->now();

        return Visit::where('jyear', $now->year)
            ->where('jmonth', $now->month)
            ->where('jday', $now->day)
            ->where('jhour', $now->hour)
            ->count();
    }

    public function currentDayTotal(): int
    {
        $now = verta()->now();

        return Visit::where('jyear', $now->year)
            ->where('jmonth', $now->month)
            ->where('jday', $now->day)
            ->count();
    }

    public function currentMonthTotal(): int
    {
        $now = verta()->now();

        return Visit::where('jyear', $now->year)
            ->where('jmonth', $now->month)
            ->count();
    }

    public function currentYearTotal(): int
    {
        $now = verta()->now();

        return Visit::where('jyear', $now->year)
            ->count();
    }
}
