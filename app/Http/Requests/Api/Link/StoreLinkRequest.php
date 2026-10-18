<?php

namespace App\Http\Requests\Api\Link;

use Illuminate\Foundation\Http\FormRequest;

class StoreLinkRequest extends FormRequest
{
    /**
     * The route is already guarded by the Link permission middleware.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'url' => ['required', 'string', 'max:2048'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'show_in_top' => ['nullable', 'boolean'],
            'show_in_bottom' => ['nullable', 'boolean'],
            'file' => ['nullable', 'file', 'max:5120'],
        ];
    }
}
