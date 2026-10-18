<?php

namespace App\Http\Resources\Api\Link;

use App\Services\FileService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LinkResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'url' => $this->url,
            'sort_order' => $this->sort_order,
            'show_in_top' => $this->show_in_top,
            'show_in_bottom' => $this->show_in_bottom,
            'file_url' => $this->file ? app(FileService::class)->url($this->file) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
