<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Payslip\StorePayslipUploadRequest;
use App\Http\Requests\Api\Payslip\UpdatePayslipStatusRequest;
use App\Http\Resources\Api\Payslip\PayslipResource;
use App\Http\Resources\Api\Payslip\PayslipSummaryResource;
use App\Http\Resources\Api\Payslip\PayslipUploadResource;
use App\Models\Payslip;
use App\Models\PayslipUpload;
use App\Services\PayslipImportService;
use App\Services\PayslipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayslipUploadController extends Controller
{
    /**
     * فهرست دوره‌های فیش حقوقی.
     */
    public function index(PayslipService $payslips): JsonResponse
    {
        return PayslipUploadResource::collection($payslips->uploads())->response();
    }

    /**
     * آپلود و پردازش فایل اکسل یک دوره.
     */
    public function store(StorePayslipUploadRequest $request, PayslipImportService $import): JsonResponse
    {
        $result = $import->import(
            $request->file('file'),
            $request->integer('year'),
            $request->integer('month'),
            $request->user()->id,
        );

        return response()->json([
            'message' => 'فایل فیش حقوقی با موفقیت ثبت شد. برای نمایش به کارکنان، دوره را فعال کنید.',
            'data' => new PayslipUploadResource($result['upload']),
            'summary' => [
                'total_rows' => $result['total_rows'],
                'imported_rows' => $result['imported_rows'],
                'linked_rows' => $result['linked_rows'],
                'unlinked_rows' => $result['unlinked_rows'],
                'skipped_rows' => $result['skipped_rows'],
            ],
            'warnings' => $result['warnings'],
        ], 201);
    }

    /**
     * جزئیات یک دوره همراه با ردیف‌های فیش.
     */
    public function show(Request $request, PayslipUpload $upload, PayslipService $payslips): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 20), 1), 100);
        $search = trim((string) $request->query('search', ''));
        $paginator = $payslips->payslips($upload, $search, $perPage);

        return response()->json([
            'upload' => new PayslipUploadResource($upload->load('uploadedBy')),
            'payslips' => [
                'data' => PayslipSummaryResource::collection($paginator->items())->resolve(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * فعال یا غیرفعال کردن یک دوره.
     */
    public function updateStatus(
        UpdatePayslipStatusRequest $request,
        PayslipUpload $upload,
        PayslipService $payslips,
    ): JsonResponse {
        $upload = $payslips->setActive($upload, $request->boolean('is_active'));

        return response()->json([
            'message' => $upload->is_active ? 'دوره فعال شد.' : 'دوره غیرفعال شد.',
            'data' => new PayslipUploadResource($upload->load('uploadedBy')),
        ]);
    }

    /**
     * مشاهده فیش یک کارمند در یک دوره.
     */
    public function showPayslip(
        PayslipUpload $upload,
        Payslip $payslip,
        PayslipService $payslips,
    ): JsonResponse {
        // پاسخ دستی ساخته می‌شود تا کلید data خود فیش با پوشش data پاسخ تداخل نداشته باشد.
        return response()->json([
            'data' => (new PayslipResource($payslips->findPayslip($upload, $payslip)))->resolve(),
        ]);
    }
}
