<?php

namespace App\Http\Requests\Api\Project;

use Illuminate\Validation\Rule;

class UpdateAddendumRequest extends BaseAddendumRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $addendum = $this->route('addendum');

        return [
            'number' => [
                'required',
                'integer',
                'min:1',
                'max:65535',
                Rule::unique('addenda', 'number')
                    ->where('project_id', $addendum->project_id)
                    ->ignore($addendum->id),
            ],

            ...$this->sharedRules(),
        ];
    }
}
