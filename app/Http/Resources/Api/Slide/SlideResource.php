<?php

namespace App\Http\Resources\Api\Slide;

use App\Services\FileService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SlideResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'caption' => $this->caption,
            'description' => $this->description,
            'sort_order' => $this->sort_order,
            'is_visible' => $this->is_visible,
            'image_url' => $this->file ? app(FileService::class)->url($this->file) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
