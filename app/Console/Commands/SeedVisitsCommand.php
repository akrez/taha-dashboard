<?php

namespace App\Console\Commands;

use App\Models\Visit;
use Illuminate\Console\Command;

class SeedVisitsCommand extends Command
{
    protected $signature = 'app:seed-visits {count? : Number of fake visits to create}';

    protected $description = 'Generate fake visit records for testing';

    public function handle(): void
    {
        $total = max((int) $this->argument('count', 3000), 1);

        $this->info("Generating {$total} fake visits...");

        $ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '203.0.113.1', '198.51.100.1'];
        $agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 14) Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) Firefox/121',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17) AppleWebKit/537.36',
            'Mozilla/5.0 (Android 14; Mobile) Chrome/120',
        ];

        foreach (range(1, $total) as $i) {
            $now = verta()->now();
            $offsetHours = fake()->numberBetween(0, 365 * 24);
            $time = $now->copy()->subHours($offsetHours);

            Visit::create([
                'user_id' => null,
                'ip_address' => $ips[fake()->numberBetween(0, count($ips) - 1)],
                'user_agent' => $agents[fake()->numberBetween(0, count($agents) - 1)],
                'jdate' => $time->format('YmdH'),
                'jyear' => $time->year,
                'jmonth' => $time->month,
                'jday' => $time->day,
                'jhour' => $time->hour,
                'visited_at' => $time->toCarbon()->toDateTimeString(),
            ]);
        }

        $this->info("Done! {$total} fake visits created.");
    }
}
