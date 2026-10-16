<?php

namespace App\Services;

use App\Models\Slide;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

class SlideService
{
    public function __construct(protected FileService $files) {}

    /**
     * Slides shown on the home page, in display order.
     */
    public function visible(): Collection
    {
        return Slide::query()
            ->with('file')
            ->where('is_visible', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    /**
     * Every slide, in display order, for the management screen.
     */
    public function all(): Collection
    {
        return Slide::query()
            ->with('file')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?UploadedFile $image, ?int $createdBy): Slide
    {
        $slide = new Slide($data);
        $slide->created_by = $createdBy;

        if ($image) {
            $slide->file_hash = $this->files->store($image, $createdBy)?->hash;
        }

        $slide->save();

        return $slide;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Slide $slide, array $data, ?UploadedFile $image = null): Slide
    {
        $slide->fill($data);

        if ($image) {
            $slide->file_hash = $this->files->store($image, $slide->created_by)?->hash;
        }

        $slide->save();

        return $slide;
    }

    public function delete(Slide $slide): void
    {
        $slide->delete();
    }
}
