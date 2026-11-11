<?php

namespace App\Http\Requests\Api\Project;

class UpdateProjectSystemStatusRequest extends BaseProjectRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'is_active' => ['required', 'boolean'],
        ];
    }
}
