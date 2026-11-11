<?php

namespace App\Rules;

use Closure;
use Hekmatinasser\Verta\Verta;
use Illuminate\Contracts\Validation\DataAwareRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Throwable;

class JalaliDate implements DataAwareRule, ValidationRule
{
    /** @var array<string, mixed> */
    private array $data = [];

    public function __construct(
        private readonly ?string $afterOrEqual = null,
        private readonly ?string $comparisonLabel = null,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function setData(array $data): static
    {
        $this->data = $data;

        return $this;
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) !== 1) {
            $fail('قالب تاریخ باید به صورت Y-m-d باشد؛ برای نمونه 1403-05-21.');

            return;
        }

        try {
            $date = Verta::parse($value);
        } catch (Throwable) {
            $fail('تاریخ وارد شده معتبر نیست.');

            return;
        }

        if ($date->format('Y-m-d') !== $value) {
            $fail('تاریخ وارد شده معتبر نیست.');

            return;
        }

        if ($this->afterOrEqual === null) {
            return;
        }

        $other = $this->data[$this->afterOrEqual] ?? null;

        if (! is_string($other) || $other === '') {
            return;
        }

        try {
            $otherDate = Verta::parse($other);
        } catch (Throwable) {
            return;
        }

        if ($date->lessThan($otherDate)) {
            $label = $this->comparisonLabel ?? $this->afterOrEqual;
            $fail("تاریخ وارد شده نباید قبل از {$label} باشد.");
        }
    }
}
