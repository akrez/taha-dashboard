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
            'position' => $this->user?->position?->name,
            'group' => $this->data['گروه'] ?? '',
            'workplace' => $this->data['محل خدمت'] ?? '',
        ];
    }
}
