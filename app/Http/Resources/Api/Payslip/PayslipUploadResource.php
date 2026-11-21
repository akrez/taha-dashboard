<?php

namespace App\Http\Resources\Api\Payslip;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayslipUploadResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $uploaderName = trim(
            ($this->uploadedBy?->first_name ?? '').' '.($this->uploadedBy?->last_name ?? '')
        );

        return [
            'id' => $this->id,
            'year' => $this->year,
            'month' => $this->month,
            'is_active' => $this->is_active,
            'status_label' => $this->is_active ? 'فعال' : 'غیرفعال',
            'original_file_name' => $this->original_file_name,
            'uploaded_by_id' => $this->uploaded_by,
            'uploaded_by_name' => $uploaderName !== '' ? $uploaderName : null,
            'total_rows' => $this->total_rows,
            'imported_rows' => $this->imported_rows,
            'linked_rows' => $this->linked_rows,
            'unlinked_rows' => $this->unlinked_rows,
            'skipped_rows' => $this->skipped_rows,
            'uploaded_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
