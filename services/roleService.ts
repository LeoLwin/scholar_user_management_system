import { RoleRepository, CreateRoleData, UpdateRoleData } from '../repositories/roleRepository';
import { PermissionRepository } from '../repositories/permissionRepository';
import StatusCode from '../helper/responseStatus';
import { ResponseStatus } from '../helper/responseStatus';

export class RoleService {
  private roleRepository: RoleRepository;
  private permissionRepository: PermissionRepository;

  constructor() {
    this.roleRepository = new RoleRepository();
    this.permissionRepository = new PermissionRepository();
  }

  async createRole(data: CreateRoleData): Promise<ResponseStatus> {
    try {
      if (!data.name) {
        return StatusCode.INVALID_ARGUMENT('Role name is required');
      }

      // Check if role already exists
      const existingRole = await this.roleRepository.findByName(data.name);
      if (existingRole) {
        return StatusCode.ALREADY_EXISTS('Role already exists');
      }

      const role = await this.roleRepository.create(data);

      return StatusCode.OK({
        id: role.id,
        name: role.name,
      }, 'Role created successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }

  async createRoleWithPermission(data: { name: string; permissionId: number }): Promise<ResponseStatus> {
    try {
      if (!data.name || !data.permissionId) {
        return StatusCode.INVALID_ARGUMENT('Role name and permission ID are required');
      }

      // Check if role already exists
      const existingRole = await this.roleRepository.findByName(data.name);
      if (existingRole) {
        return StatusCode.ALREADY_EXISTS('Role already exists');
      }

      // Verify permission exists
      const permission = await this.permissionRepository.findById(data.permissionId);
      if (!permission) {
        return StatusCode.NOT_FOUND('Permission not found');
      }

      // Create role and assign permission in transaction
      const role = await this.roleRepository.create({ name: data.name });
      await this.roleRepository.assignPermission(role.id, data.permissionId);

      return StatusCode.OK({
        roleId: role.id,
        permissionId: data.permissionId,
        role: role.name,
        permission: permission.name,
      }, 'Role created and permission assigned successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }

  async getRoleById(id: number): Promise<ResponseStatus> {
    try {
      const role = await this.roleRepository.findById(id) as any;
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
  }

  async getRoles(page: number = 1, limit: number = 10): Promise<ResponseStatus> {
    try {
      const skip = (page - 1) * limit;
      const [roles, total] = await Promise.all([
        this.roleRepository.findAll({ skip, take: limit }),
        this.roleRepository.count(),
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
  }

  async updateRole(id: number, data: UpdateRoleData): Promise<ResponseStatus> {
    try {
      const existingRole = await this.roleRepository.findById(id);
      if (!existingRole) {
        return StatusCode.NOT_FOUND('Role not found');
      }

      // Check name uniqueness if name is being updated
      if (data.name && data.name !== existingRole.name) {
        const nameExists = await this.roleRepository.findByName(data.name);
        if (nameExists) {
          return StatusCode.ALREADY_EXISTS('Role name already exists');
        }
      }

      const updatedRole = await this.roleRepository.update(id, data);

      return StatusCode.OK({
        id: updatedRole.id,
        name: updatedRole.name,
      }, 'Role updated successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }

  async deleteRole(id: number): Promise<ResponseStatus> {
    try {
      const role = await this.roleRepository.findById(id) as any;
      if (!role) {
        return StatusCode.NOT_FOUND('Role not found');
      }

      // Check if role has users
      if (role.adminUsers.length > 0) {
        return StatusCode.FAILED_PRECONDITION('Cannot delete role with assigned users');
      }

      await this.roleRepository.delete(id);
      return StatusCode.OK(null, 'Role deleted successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }

  async assignPermissionToRole(roleId: number, permissionId: number): Promise<ResponseStatus> {
    try {
      // Verify role exists
      const role = await this.roleRepository.findById(roleId) as any;
      if (!role) {
        return StatusCode.NOT_FOUND('Role not found');
      }

      // Verify permission exists
      const permission = await this.permissionRepository.findById(permissionId) as any;
      if (!permission) {
        return StatusCode.NOT_FOUND('Permission not found');
      }

      // Check if permission is already assigned
      const existingPermissions = await this.roleRepository.getPermissions(roleId);
      const alreadyAssigned = existingPermissions.some(rp => rp.permissions_id === permissionId);
      if (alreadyAssigned) {
        return StatusCode.ALREADY_EXISTS('Permission already assigned to role');
      }

      await this.roleRepository.assignPermission(roleId, permissionId);

      return StatusCode.OK({
        roleId,
        permissionId,
        role: role.name,
        permission: permission.name,
      }, 'Permission assigned to role successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<ResponseStatus> {
    try {
      // Verify role exists
      const role = await this.roleRepository.findById(roleId) as any;
      if (!role) {
        return StatusCode.NOT_FOUND('Role not found');
      }

      // Check if permission is assigned
      const existingPermissions = await this.roleRepository.getPermissions(roleId);
      const isAssigned = existingPermissions.some(rp => rp.permissions_id === permissionId);
      if (!isAssigned) {
        return StatusCode.NOT_FOUND('Permission not assigned to role');
      }

      await this.roleRepository.removePermission(roleId, permissionId);

      return StatusCode.OK({
        roleId,
        permissionId,
      }, 'Permission removed from role successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }

  async getRolePermissions(roleId: number): Promise<ResponseStatus> {
    try {
      const role = await this.roleRepository.findById(roleId) as any;
      if (!role) {
        return StatusCode.NOT_FOUND('Role not found');
      }

      const permissions = role.permissions.map((rp: any) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        feature: rp.permission.feature.name,
      }));

      return StatusCode.OK({
        roleId,
        roleName: role.name,
        permissions,
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }
}