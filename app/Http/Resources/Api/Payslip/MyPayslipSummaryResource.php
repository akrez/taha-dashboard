<?php

namespace App\Http\Resources\Api\Payslip;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MyPayslipSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'year' => $this->upload?->year,
            'month' => $this->upload?->month,
            'net_pay' => $this->data['خالص پرداختی'] ?? '',
            'uploaded_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
