<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Throwable;

class MaintenanceController extends Controller
{
    /**
     * Run the application maintenance commands.
     */
    public function __invoke(Request $request): JsonResponse
    {
        if (false) {

            $expected = (string) config('app.maintenance_token');

            if ($expected === '') {
                return response()->json([
                    'message' => 'Maintenance endpoint is disabled.',
                ], 404);
            }

            $provided = (string) (
                $request->query('token')
                ?: $request->header('X-Maintenance-Token')
                ?: $request->bearerToken()
            );

            if ($provided === '' || ! hash_equals($expected, $provided)) {
                return response()->json([
                    'message' => 'Invalid maintenance token.',
                ], 401);
            }
        }

        @set_time_limit(0);

        $results = [];

        $commands = [
            'migrate' => fn () => Artisan::call('migrate', ['--force' => true]),
            'seed_permissions' => fn () => Artisan::call('app:seed-permissions'),
            'optimize' => fn () => Artisan::call('app:optimize'),
        ];

        foreach ($commands as $step => $command) {
            try {
                $exitCode = $command();

                $results[$step] = [
                    'success' => $exitCode === 0,
                    'output' => trim(Artisan::output()),
                ];
            } catch (Throwable $exception) {
                $results[$step] = [
                    'success' => false,
                    'output' => $exception->getMessage(),
                ];
            }
        }

        $success = collect($results)->every(fn (array $result) => $result['success'] ?? false);

        return response()->json([
            'success' => $success,
            'message' => $success
                ? 'عملیات نگهداری با موفقیت انجام شد.'
                : 'برخی از مراحل با خطا مواجه شدند؛ جزئیات را در results ببینید.',
            'results' => $results,
        ], $success ? 200 : 500);
    }
}
