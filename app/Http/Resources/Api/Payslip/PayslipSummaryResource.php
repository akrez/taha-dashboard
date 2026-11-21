<?php

namespace App\Http\Resources\Api\Payslip;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayslipSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'national_code' => $this->national_code,
            'employee_name' => $this->employee_name,
            'display_name' => $this->displayName(),
            'user_id' => $this->user_id,
            'is_linked' => $this->user_id !== null,
        ];
    }
}
