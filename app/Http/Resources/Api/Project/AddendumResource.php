<?php

namespace App\Http\Resources\Api\Project;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddendumResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'number' => $this->number,
            'duration' => $this->duration,
            'amount_rials' => $this->amount_rials,
            'amount_currency' => $this->amount_currency,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
