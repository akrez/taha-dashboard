<?php

namespace App\Http\Requests\Api\Project;

use Illuminate\Validation\Rule;

class StoreProjectRequest extends BaseProjectRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'internal_code' => [
                'required',
                'digits:8',
                Rule::unique('projects', 'internal_code'),
            ],

            ...$this->sharedRules(),
        ];
    }
}
