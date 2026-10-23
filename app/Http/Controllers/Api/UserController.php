<?php

namespace App\Http\Controllers\Api;

use App\Exports\UsersExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\User\ImportUserRequest;
use App\Models\User;
use App\Services\UserImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class UserController extends Controller
{
    /**
     * Display a paginated list of users.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 10), 1), 100);
        $search = trim($request->query('search'));

        $users = User::query()
            ->with(['discipline', 'project', 'section', 'position'])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('national_code', 'like', "%{$search}%")
                        ->orWhere('personnel_code', 'like', "%{$search}%")
                        ->orWhere('father_name', 'like', "%{$search}%");
                });
            })
            ->orderBy('id')
            ->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Export all users to an Excel spreadsheet.
     */
    public function export(): BinaryFileResponse
    {
        $fileName = 'users-'.date('Y-m-d-His').'.xlsx';

        return Excel::download(new UsersExport, $fileName);
    }

    /**
     * Import users from an Excel spreadsheet.
     */
    public function import(ImportUserRequest $request, UserImportService $service): JsonResponse
    {
        $file = $request->file('file');
        $deactivateMissing = $request->boolean('deactivate_missing');

        $stats = $service->import($file, $deactivateMissing);

        return response()->json([
            'message' => 'اطلاعات با موفقیت پردازش و ثبت شد.',
            'data' => $stats,
        ]);
    }
}
