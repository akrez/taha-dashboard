<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Payslip\MyPayslipResource;
use App\Http\Resources\Api\Payslip\MyPayslipSummaryResource;
use App\Models\Payslip;
use App\Services\PayslipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MyPayslipController extends Controller
{
    /**
     * فهرست فیش‌های حقوقی خود کاربر (فقط دوره‌های فعال).
     */
    public function index(Request $request, PayslipService $payslips): JsonResponse
    {
        return MyPayslipSummaryResource::collection(
            $payslips->myPayslips($request->user()),
        )->response();
    }

    /**
     * مشاهدهٔ فیش حقوقی خود کاربر.
     */
    public function show(Request $request, Payslip $payslip, PayslipService $payslips): JsonResponse
    {
        // پاسخ دستی ساخته می‌شود تا کلید data خود فیش با پوشش data پاسخ تداخل نداشته باشد.
        return response()->json([
            'data' => (new MyPayslipResource(
                $payslips->findMyPayslip($request->user(), $payslip),
            ))->resolve(),
        ]);
    }
}
