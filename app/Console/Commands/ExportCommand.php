<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

class ExportCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:export {--output=head.zip : The output zip file name}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export Git HEAD to a zip archive';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $outputFile = $this->option('output') ?: 'head.zip';

        $this->components->info("Exporting git HEAD to {$outputFile}...");

        $result = Process::path(base_path())
            ->run(['git', 'archive', '-o', $outputFile, 'HEAD']);

        if ($result->successful()) {
            $fullPath = base_path($outputFile);
            $this->components->info("Successfully exported Git HEAD to: {$fullPath}");
            return Command::SUCCESS;
        }

        $this->components->error('Git export failed: ' . ($result->errorOutput() ?: $result->output()));
        return Command::FAILURE;
    }
}
