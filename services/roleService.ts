import {
  createRole as createRoleRepo,
  findRoleById,
  findRoleByName,
  findAllRoles,
  updateRole as updateRoleRepo,
  deleteRole as deleteRoleRepo,
  countRoles,
  assignPermissionToRole,
  removePermissionFromRole,
  getRolePermissions,
} from '../repositories/roleRepository';
import { findPermissionById } from '../repositories/permissionRepository';
import StatusCode from '../helper/responseStatus';
import { ResponseStatus } from '../helper/responseStatus';
import { CreateRoleData, UpdateRoleData } from '../type/roleType';

export const createRole = async (data: CreateRoleData): Promise<ResponseStatus> => {
  try {
    if (!data.name) {
      return StatusCode.INVALID_ARGUMENT('Role name is required');
    }

    const existingRole = await findRoleByName(data.name);
    if (existingRole) {
      return StatusCode.ALREADY_EXISTS('Role already exists');
    }

    const role = await createRoleRepo(data);

    return StatusCode.OK({ id: role.id, name: role.name }, 'Role created successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const createRoleWithPermission = async (data: {
  name: string;
  permissionId: number;
}): Promise<ResponseStatus> => {
  try {
    if (!data.name || !data.permissionId) {
      return StatusCode.INVALID_ARGUMENT('Role name and permission ID are required');
    }

    const existingRole = await findRoleByName(data.name);
    if (existingRole) {
      return StatusCode.ALREADY_EXISTS('Role already exists');
    }

    const permission = await findPermissionById(data.permissionId);
    if (!permission) {
      return StatusCode.NOT_FOUND('Permission not found');
    }

    const role = await createRoleRepo({ name: data.name });
    await assignPermissionToRole(role.id, data.permissionId);

    return StatusCode.OK(
      {
        roleId: role.id,
        permissionId: data.permissionId,
        role: role.name,
        permission: permission.name,
      },
      'Role created and permission assigned successfully'
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const getRoleById = async (id: number): Promise<ResponseStatus> => {
  try {
    const role = await findRoleById(id) as any;
    if (!role) {
      return StatusCode.NOT_FOUND('Role not found');
    }

    const permissions = role.permissions.map((rp: any) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      feature: rp.permission.feature.name,
    }));

    return StatusCode.OK({
      id: role.id,
      name: role.name,
      userCount: role.adminUsers.length,
      permissions,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const getRoles = async (page: number = 1, limit: number = 10, filterName?: string): Promise<ResponseStatus> => {
  try {
    const skip = (page - 1) * limit;
    const whereClause = filterName
      ? { name: { contains: filterName } }
      : {};

    const [roles, total] = await Promise.all([
      findAllRoles({ skip, take: limit, where: whereClause }),
      countRoles(whereClause),
    ]);

    const roleData = roles.map((role: any) => ({
      id: role.id,
      name: role.name,
      userCount: role.adminUsers.length,
      permissions: role.permissions.map((rp: any) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        feature: rp.permission.feature.name,
      })),
    }));

    return StatusCode.OK({
      roles: roleData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const updateRole = async (id: number, data: UpdateRoleData): Promise<ResponseStatus> => {
  try {
    const existingRole = await findRoleById(id);
    if (!existingRole) {
      return StatusCode.NOT_FOUND('Role not found');
    }

    if (data.name && data.name !== existingRole.name) {
      const nameExists = await findRoleByName(data.name);
      if (nameExists) {
        return StatusCode.ALREADY_EXISTS('Role name already exists');
      }
    }

    const updatedRole = await updateRoleRepo(id, data);

    return StatusCode.OK({ id: updatedRole.id, name: updatedRole.name }, 'Role updated successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

// export const deleteRole = async (id: number): Promise<ResponseStatus> => {
//   try {
//     const role = await findRoleById(id) as any;
//     if (!role) {
//       return StatusCode.NOT_FOUND('Role not found');
//     }

//     if (role.adminUsers.length > 0) {
//       return StatusCode.FAILED_PRECONDITION('Cannot delete role with assigned users');
//     }

//     await deleteRoleRepo(id);
//     return StatusCode.OK(null, 'Role deleted successfully');
//   } catch (error) {
//     const message = error instanceof Error ? error.message : 'Unknown error';
//     return StatusCode.UNKNOWN(message);
//   }
// };

export const deleteRole = async (id: number): Promise<ResponseStatus> => {
  try {
    const role = await findRoleById(id) as any;
    if (!role) {
      return StatusCode.NOT_FOUND('Role not found');
    }

    if (role.adminUsers && role.adminUsers.length > 0) {
      return StatusCode.FAILED_PRECONDITION('Cannot delete role: It is currently assigned to users.');
    }

    if (role.rolePermissions && role.rolePermissions.length > 0) {
      return StatusCode.FAILED_PRECONDITION('Cannot delete role: It still has assigned permissions. Please unassign them first.');
    }

    await deleteRoleRepo(id);
    return StatusCode.OK(null, 'Role deleted successfully');

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes("Foreign key constraint violated")) {
      return StatusCode.FAILED_PRECONDITION('This role cannot be deleted because it is still linked to other data.');
    }

    return StatusCode.UNKNOWN(message);
  }
};

export const assignPermission = async (roleId: number, permissionId: number): Promise<ResponseStatus> => {
  try {
    const role = await findRoleById(roleId) as any;
    if (!role) {
      return StatusCode.NOT_FOUND('Role not found');
    }

    const permission = await findPermissionById(permissionId) as any;
    if (!permission) {
      return StatusCode.NOT_FOUND('Permission not found');
    }

    const existingPermissions = await getRolePermissions(roleId);
    const alreadyAssigned = existingPermissions.some(rp => rp.permissions_id === permissionId);
    if (alreadyAssigned) {
      return StatusCode.ALREADY_EXISTS('Permission already assigned to role');
    }

    await assignPermissionToRole(roleId, permissionId);

    return StatusCode.OK(
      {
        roleId,
        permissionId,
        role: role.name,
        permission: permission.name,
      },
      'Permission assigned to role successfully'
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const removePermission = async (roleId: number, permissionId: number): Promise<ResponseStatus> => {
  try {
    const role = await findRoleById(roleId) as any;
    if (!role) {
      return StatusCode.NOT_FOUND('Role not found');
    }

    const existingPermissions = await getRolePermissions(roleId);
    const isAssigned = existingPermissions.some(rp => rp.permissions_id === permissionId);
    if (!isAssigned) {
      return StatusCode.NOT_FOUND('Permission not assigned to role');
    }

    await removePermissionFromRole(roleId, permissionId);

    return StatusCode.OK({ roleId, permissionId }, 'Permission removed from role successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const getRolePermissionList = async (roleId: number): Promise<ResponseStatus> => {
  try {
    const role = await findRoleById(roleId) as any;
    if (!role) {
      return StatusCode.NOT_FOUND('Role not found');
    }

    const permissions = role.permissions.map((rp: any) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      feature: rp.permission.feature.name,
    }));

    return StatusCode.OK({ roleId, roleName: role.name, permissions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const getRolesNameAndValue = async () => {
  try {
    const roles = await findAllRoles({ skip: 0, take: 100 });
    return StatusCode.OK(roles.map((role: any) => ({ label: role.name, value: role.id })));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
}