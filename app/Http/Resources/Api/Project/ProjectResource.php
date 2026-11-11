<?php

namespace App\Http\Resources\Api\Project;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            // شناسه و مشخصات پروژه
            'internal_code' => $this->internal_code,
            'project_name' => $this->project_name,
            'contract_number' => $this->contract_number,
            'plan_code' => $this->plan_code,

            // اطلاعات سازمانی
            'ministry' => $this->ministry,
            'employer_id' => $this->employer_id,
            'consultant' => $this->consultant,
            'employer' => $this->whenLoaded('employer', fn () => $this->employer ? [
                'id' => $this->employer->id,
                'name' => $this->employer->name,
                'is_active' => $this->employer->is_active,
            ] : null),

            // مبالغ
            'initial_amount_billion_rials' => $this->initial_amount_billion_rials,
            'initial_amount_million_currency' => $this->initial_amount_million_currency,
            'aggregate_amount' => $this->aggregate_amount,
            'remaining_amount' => $this->remaining_amount,

            // اطلاعات زمانی قرارداد (شمسی، Y-m-d)
            'contract_date' => $this->contract_date,
            'notification_date' => $this->notification_date,
            'start_date' => $this->start_date,
            'initial_duration' => $this->initial_duration,
            'end_date' => $this->end_date,
            'extended_duration' => $this->extended_duration,
            'extended_end_date' => $this->extended_end_date,

            // ابعاد و شاخص پروژه
            'project_dimension' => $this->project_dimension,
            'unit' => $this->unit,
            'base_index' => $this->base_index,
            'base_year' => $this->base_year,

            // مشخصات تخصصی
            'field' => $this->field,
            'specialization' => $this->specialization,
            'acquisition_method' => $this->acquisition_method,
            'nature' => $this->nature,

            // وضعیت و نوع پروژه و قرارداد
            'status_code' => $this->status_code,
            'project_type' => $this->project_type,
            'contract_status' => $this->contract_status,
            'project_status' => $this->project_status,
            'contract_type' => $this->contract_type,

            // وضعیت عمرانی پروژه
            'is_civil' => $this->is_civil?->name,

            // موقعیت جغرافیایی
            'country' => $this->country,
            'province' => $this->province,
            'county' => $this->county,

            // وضعیت فعالیت
            'activity_status' => $this->activity_status?->name,

            // وضعیت پروژه در سیستم (فعال/غیرفعال)
            'is_active' => $this->is_active,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
