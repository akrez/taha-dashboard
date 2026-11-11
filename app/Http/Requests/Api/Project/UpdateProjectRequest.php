<?php

namespace App\Http\Requests\Api\Project;

use Illuminate\Validation\Rule;

class UpdateProjectRequest extends BaseProjectRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $project = $this->route('project');

        return [
            'internal_code' => [
                'required',
                'digits:8',
                Rule::unique('projects', 'internal_code')->ignore($project),
            ],

            ...$this->sharedRules(),
        ];
    }
}
