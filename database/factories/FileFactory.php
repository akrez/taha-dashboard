<?php

namespace Database\Factories;

use App\Models\File;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<File>
 */
class FileFactory extends Factory
{
    protected $model = File::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $contents = $this->faker->sha256();

        return [
            'hash' => hash('sha256', $contents),
            'disk' => 'public',
            'mime_type' => 'text/plain',
            'type' => 'text',
            'extension' => 'txt',
            'size' => strlen($contents),
            'metadata' => null,
            'created_by' => User::factory(),
        ];
    }

    public function image(int $width = 100, int $height = 100): static
    {
        return $this->state(fn (): array => [
            'mime_type' => 'image/png',
            'type' => 'image',
            'extension' => 'png',
            'metadata' => ['width' => $width, 'height' => $height],
        ]);
    }
}
