<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Addendum extends Model
{
    protected $table = 'addenda';

    protected $fillable = [
        'number',
        'duration',
        'amount_rials',
        'amount_currency',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'number' => 'integer',
            'duration' => 'integer',
            'amount_rials' => 'integer',
            'amount_currency' => 'integer',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
