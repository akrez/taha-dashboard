<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Symfony\Component\Process\ExecutableFinder;
use Throwable;

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
        try {

            $basePath = realpath(base_path());
            $outputFile = (string) ($this->option('output') ?: 'head.zip');
            $fullPath = str_starts_with($outputFile, DIRECTORY_SEPARATOR)
                ? $outputFile
                : $basePath.DIRECTORY_SEPARATOR.$outputFile;

            $this->components->info("Exporting git HEAD to {$outputFile}...");

            if (! File::exists($basePath.'/.git')) {
                $this->components->error(
                    "Not a git repository: {$basePath}/.git was not found. ".
                    'app:export only works on a checkout that contains Git history.'
                );

                return Command::FAILURE;
            }

            $git = (new ExecutableFinder)->find('git');
            if ($git === null) {
                $this->components->error(
                    'The git executable was not found in PATH. '.
                    'Install git in the runtime (for the Docker image: `apk add --no-cache git`).'
                );

                return Command::FAILURE;
            }

            $outputDirectory = dirname($fullPath);
            if (! File::isDirectory($outputDirectory)) {
                File::makeDirectory($outputDirectory, 0755, true);
            }

            $safeDirectory = 'safe.directory='.$basePath;

            $result = Process::path($basePath)
                ->run([$git, '-c', $safeDirectory, 'archive', '-o', $fullPath, 'HEAD']);
        } catch (Throwable $exception) {
            $this->components->error('Git export failed: '.$exception->getMessage());

            return Command::FAILURE;
        }

        if ($result->successful()) {
            $this->components->info("Successfully exported Git HEAD to: {$fullPath}");

            return Command::SUCCESS;
        }

        $details = trim($result->errorOutput().PHP_EOL.$result->output());

        if ($details === '') {
            $details = 'no error output was produced (exit code '.$result->exitCode().').';
        }

        $this->components->error('Git export failed: '.$details);

        return Command::FAILURE;
    }
}
