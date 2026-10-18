<?php

namespace App\Services;

use App\Models\Link;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

class LinkService
{
    public function __construct(protected FileService $files) {}

    /**
     * Every link, in display order, for the management screen.
     */
    public function index(): Collection
    {
        return Link::query()
            ->with('file')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    /**
     * Links shown anywhere on the home page (top bar or bottom row), in
     * display order.
     */
    public function visible(): Collection
    {
        return Link::query()
            ->with('file')
            ->where(fn ($query) => $query
                ->where('show_in_top', true)
                ->orWhere('show_in_bottom', true))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data, ?UploadedFile $file, ?int $createdBy): Link
    {
        $link = new Link($data);
        $link->created_by = $createdBy;

        if ($file) {
            $link->file_hash = $this->files->store($file, $createdBy)?->hash;
        }

        $link->save();

        return $link;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Link $link, array $data, ?UploadedFile $file = null): Link
    {
        $link->fill($data);

        if ($file) {
            $link->file_hash = $this->files->store($file, $link->created_by)?->hash;
        }

        $link->save();

        return $link;
    }

    public function delete(Link $link): void
    {
        $link->delete();
    }
}
