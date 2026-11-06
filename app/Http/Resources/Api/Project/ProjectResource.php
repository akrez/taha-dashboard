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
            'name' => $this->name,
            'employer_id' => $this->employer_id,
            'employer' => $this->whenLoaded('employer', fn () => $this->employer ? [
                'id' => $this->employer->id,
                'name' => $this->employer->name,
                'is_active' => $this->employer->is_active,
            ] : null),
            'manager_id' => $this->manager_id,
            'manager' => $this->whenLoaded('manager', fn () => $this->manager ? [
                'id' => $this->manager->id,
                'name' => trim($this->manager->first_name.' '.$this->manager->last_name),
            ] : null),
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
