<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Role\CreateRoleRequest;
use App\Http\Requests\Api\Role\SyncRolePermissionsRequest;
use App\Http\Requests\Api\Role\SyncRoleUsersRequest;
use App\Http\Requests\Api\Role\UpdateRoleRequest;
use App\Http\Resources\Api\Role\PermissionResource;
use App\Http\Resources\Api\Role\RoleResource;
use App\Http\Resources\Api\Role\UserResource;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\RbacService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * List the roles along with their permissions.
     */
    public function index(): JsonResponse
    {
        $roles = Role::query()
            ->with('permissions')
            ->with('users:id,first_name,last_name')
            ->orderBy('name')
            ->get();

        return RoleResource::collection($roles)->response();
    }

    /**
     * Create a role.
     */
    public function create(CreateRoleRequest $request, RbacService $rbac): JsonResponse
    {
        $role = $rbac->createRole($request->validated('name'));

        return (new RoleResource($role))->response()->setStatusCode(201);
    }

    /**
     * Update a role.
     */
    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $role->update(['name' => $request->validated('name')]);

        return (new RoleResource($role))->response();
    }

    public function permissions(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $limit = 10;

        $users = Permission::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->limit($limit)
            ->get();

        return PermissionResource::collection($users)->response();
    }

    /**
     * Replace the permissions assigned to a role.
     */
    public function syncPermissions(SyncRolePermissionsRequest $request, Role $role, RbacService $rbac): JsonResponse
    {
        $rbac->syncRolePermissionsById($role, $request->validated('permissions'));

        return (new RoleResource($role->load('permissions')))->response();
    }

    /**
     * Search users so they can be attached to a role.
     */
    public function users(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $limit = 10;

        $users = User::query()
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('national_code', 'like', "%{$search}%")
                        ->orWhereRaw("concat(first_name, ' ', last_name) like ?", ["%{$search}%"]);
                });
            })
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->limit($limit)
            ->get();

        return UserResource::collection($users)->response();
    }

    /**
     * Replace the users assigned to a role.
     */
    public function syncUsers(SyncRoleUsersRequest $request, Role $role, RbacService $rbac): JsonResponse
    {
        $rbac->syncRoleUsersById($role, $request->validated('users'));

        return (new RoleResource($role->load('users:id,first_name,last_name')))->response();
    }
}
