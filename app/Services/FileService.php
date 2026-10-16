<?php

namespace App\Services;

use App\Models\File;
use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Mime\MimeTypes;

class FileService
{
    public function store(UploadedFile $upload, ?int $createdBy = null): ?File
    {
        $hash = hash_file('sha256', $upload->getRealPath());
        if ($file = File::find($hash)) {
            return $file;
        }

        $mimeType = $upload->getMimeType();
        $extension = $this->extensionFor($mimeType);
        $path = $this->pathFor($hash, $extension);

        try {
            Storage::put($path, $upload->get());
        } catch (Exception $e) {
            return null;
        }

        return File::create([
            'hash' => $hash,
            'mime_type' => $mimeType,
            'type' => $this->typeFor($mimeType),
            'extension' => $extension,
            'size' => $upload->getSize(),
            'metadata' => $this->metadataFor($upload, $mimeType),
            'created_by' => $createdBy,
        ]);
    }

    public function delete(File $file): bool
    {
        $result = (bool) $file->delete();
        if ($result) {
            Storage::delete($file->path);
        }

        return $result;
    }

    public function url(File $file): string
    {
        return Storage::url($this->pathFor($file->hash, $file->extension));
    }

    public function pathFor(string $hash, ?string $extension): string
    {
        return "{$hash}.{$extension}";
    }

    protected function typeFor(?string $mimeType): ?string
    {
        if (! $mimeType) {
            return null;
        }

        $parts = explode('/', $mimeType, 2);

        return $parts[0] ?? null;
    }

    protected function extensionFor(?string $mimeType): ?string
    {
        if (! $mimeType) {
            return null;
        }

        $extensions = MimeTypes::getDefault()->getExtensions($mimeType);

        return isset($extensions[0]) ? strtolower($extensions[0]) : null;
    }

    protected function metadataFor(UploadedFile $upload, ?string $mimeType): ?array
    {
        if (! $mimeType) {
            return null;
        }

        if (str_starts_with($mimeType, 'image/')) {
            $dimensions = @getimagesize($upload->getRealPath());
            if ($dimensions !== false) {
                return ['width' => $dimensions[0], 'height' => $dimensions[1]];
            }
        }

        return null;
    }
}
