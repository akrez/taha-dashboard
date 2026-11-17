<?php

namespace App\Http\Requests\Api\Project;

use Illuminate\Validation\Rule;

class StoreAddendumRequest extends BaseAddendumRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $project = $this->route('project');

        return [
            'number' => [
                'required',
                'integer',
                'min:1',
                'max:65535',
                Rule::unique('addenda', 'number')->where('project_id', $project->id),
            ],

            ...$this->sharedRules(),
        ];
    }
}
