import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { 
  Permission, 
  Role, 
  UserRole,
  CreatePermissionInput,
  UpdatePermissionInput,
  CreateRoleInput,
  UpdateRoleInput
} from '@prisma/client';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  // Permission methods
  async findAllPermissions(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }

  async findPermissionById(id: number): Promise<Permission> {
    const permission = await this.prisma.permission.findUnique({
      where: { id }
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }

  async createPermission(data: CreatePermissionInput): Promise<Permission> {
    // Check if permission with same resource and action already exists
    const permissions = await this.permissionRepository.findAllPermissions();
    const existing = permissions.find(p => p.resource === data.resource && p.action === data.action);
    
    if (existing) {
      throw new ConflictException(`Permission for ${data.resource}:${data.action} already exists`);
    }

    return this.permissionRepository.createPermission(data);
  }

  async updatePermission(id: number, data: UpdatePermissionInput): Promise<Permission> {
    await this.findPermissionById(id);
    
    // Check for conflicts if resource or action is being updated
    if (data.resource || data.action) {
      const permissions = await this.permissionRepository.findAllPermissions();
      const current = permissions.find(p => p.id === id);
      const newResource = data.resource || current?.resource;
      const newAction = data.action || current?.action;
      
      const existing = permissions.find(p => 
        p.id !== id && p.resource === newResource && p.action === newAction
      );
      
      if (existing) {
        throw new ConflictException(`Permission for ${newResource}:${newAction} already exists`);
      }
    }

    return this.permissionRepository.updatePermission(id, data);
  }

  async deletePermission(id: number): Promise<void> {
    await this.findPermissionById(id);
    await this.permissionRepository.deletePermission(id);
  }

  // Role methods
  async findAllRoles(): Promise<Role[]> {
    return this.permissionRepository.findAllRoles();
  }

  async findRoleById(id: number): Promise<Role> {
    const role = await this.permissionRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async findRoleByName(name: string): Promise<Role> {
    const role = await this.permissionRepository.findRoleByName(name);
    if (!role) {
      throw new NotFoundException(`Role with name "${name}" not found`);
    }
    return role;
  }

  async createRole(data: CreateRoleInput): Promise<Role> {
    // Check if role name already exists
    const existing = await this.permissionRepository.findRoleByName(data.name);
    if (existing) {
      throw new ConflictException(`Role with name "${data.name}" already exists`);
    }

    // Validate permission IDs if provided
    if (data.permissionIds && data.permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findAllPermissions();
      const validIds = permissions.map(p => p.id);
      const invalidIds = data.permissionIds.filter(id => !validIds.includes(id));
      
      if (invalidIds.length > 0) {
        throw new BadRequestException(`Invalid permission IDs: ${invalidIds.join(', ')}`);
      }
    }

    return this.permissionRepository.createRole(data);
  }

  async updateRole(id: number, data: UpdateRoleInput): Promise<Role> {
    await this.findRoleById(id);
    
    // Check for name conflicts
    if (data.name) {
      const existing = await this.permissionRepository.findRoleByName(data.name);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Role with name "${data.name}" already exists`);
      }
    }

    return this.permissionRepository.updateRole(id, data);
  }

  async deleteRole(id: number): Promise<void> {
    await this.findRoleById(id);
    await this.permissionRepository.deleteRole(id);
  }

  // Role-Permission assignment
  async assignPermissionToRole(roleId: number, permissionId: number): Promise<void> {
    await this.findRoleById(roleId);
    await this.findPermissionById(permissionId);
    
    // Check if already assigned
    const rolePermissions = await this.permissionRepository.getRolePermissions(roleId);
    if (rolePermissions.some(p => p.id === permissionId)) {
      throw new ConflictException('Permission is already assigned to this role');
    }

    await this.permissionRepository.assignPermissionToRole(roleId, permissionId);
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await this.findRoleById(roleId);
    await this.findPermissionById(permissionId);

    await this.permissionRepository.removePermissionFromRole(roleId, permissionId);
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    await this.findRoleById(roleId);
    return this.permissionRepository.getRolePermissions(roleId);
  }

  // User-Role assignment
  async assignRoleToUser(userId: number, roleId: number, assignedBy: number): Promise<UserRole> {
    await this.findRoleById(roleId);
    
    // Check if user already has this role
    const userRoles = await this.permissionRepository.getUserRoles(userId);
    if (userRoles.some(r => r.id === roleId)) {
      throw new ConflictException('User already has this role');
    }

    return this.permissionRepository.assignRoleToUser(userId, roleId, assignedBy);
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    await this.findRoleById(roleId);
    await this.permissionRepository.removeRoleFromUser(userId, roleId);
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    return this.permissionRepository.getUserRoles(userId);
  }

  async getUserPermissions(userId: number): Promise<Permission[]> {
    return this.permissionRepository.getUserPermissions(userId);
  }

  // Permission checking
  async hasPermission(userId: number, resource: string, action: string): Promise<boolean> {
    return this.permissionRepository.hasPermission(userId, resource, action);
  }

  async hasRole(userId: number, roleName: string): Promise<boolean> {
    return this.permissionRepository.hasRole(userId, roleName);
  }

  // Utility methods
  async createDefaultPermissions(): Promise<void> {
    const defaultPermissions = [
      { name: 'Create User', description: 'Can create new users', resource: 'user', action: 'create' },
      { name: 'Read User', description: 'Can view user details', resource: 'user', action: 'read' },
      { name: 'Update User', description: 'Can update user information', resource: 'user', action: 'update' },
      { name: 'Delete User', description: 'Can delete users', resource: 'user', action: 'delete' },
      { name: 'Manage Roles', description: 'Can manage user roles', resource: 'role', action: 'manage' },
      { name: 'Manage Permissions', description: 'Can manage permissions', resource: 'permission', action: 'manage' },
    ];

    for (const permission of defaultPermissions) {
      try {
        await this.createPermission(permission);
      } catch (error) {
        // Skip if already exists
        if (!(error instanceof ConflictException)) {
          throw error;
        }
      }
    }
  }

  async createDefaultRoles(): Promise<void> {
    const defaultRoles = [
      { name: 'admin', description: 'System administrator with all permissions' },
      { name: 'user', description: 'Regular user with basic permissions' },
      { name: 'moderator', description: 'Moderator with limited admin permissions' },
    ];

    for (const role of defaultRoles) {
      try {
        await this.createRole(role);
      } catch (error) {
        // Skip if already exists
        if (!(error instanceof ConflictException)) {
          throw error;
        }
      }
    }
  }
} 