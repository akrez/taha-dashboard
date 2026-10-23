<?php

namespace App\Http\Controllers\Api;

use App\Exports\UsersExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\User\ImportUserRequest;
use App\Services\UserImportService;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class UserController extends Controller
{
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
