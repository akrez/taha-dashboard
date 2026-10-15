<?php

namespace App\Console\Commands;

use App\Services\UserService;
use Illuminate\Console\Command;

class CreateSuperAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-super-admin
        {national_code : The national code of the super admin}
        {password? : The password of the super admin (prompted when omitted)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create (or update) a super admin user with the given national code and password';

    /**
     * Execute the console command.
     */
    public function handle(UserService $userService): int
    {
        $nationalCode = (string) $this->argument('national_code');
        $password = (string) ($this->argument('password') ?: $this->secret('Password'));

        if ($nationalCode === '' || $password === '') {
            $this->components->error('Both national code and password are required.');

            return self::FAILURE;
        }

        $user = $userService->createSuperAdmin($nationalCode, $password);

        $this->components->success("Super admin [{$user->national_code}] is ready.");

        return self::SUCCESS;
    }
}
