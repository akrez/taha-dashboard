<?php

namespace App\Http\Resources\Api\Payslip;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MyPayslipResource extends JsonResource
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
            'national_code' => $this->national_code,
            'employee_name' => $this->employee_name,
            'display_name' => $this->displayName(),
            'data' => $this->data ?? [],
        ];
    }
}
