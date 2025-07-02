import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'shared/prisma';
import { 
  Permission, 
  Role, 
  UserRole,
  Prisma
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

  async createPermission(data: Prisma.PermissionCreateInput): Promise<Permission> {
    // Check if permission with same resource and action already exists
    const existing = await this.prisma.permission.findFirst({
      where: {
        resource: data.resource,
        action: data.action
      }
    });
    
    if (existing) {
      throw new ConflictException(`Permission for ${data.resource}:${data.action} already exists`);
    }

    return this.prisma.permission.create({ data });
  }

  async updatePermission(id: number, data: Prisma.PermissionUpdateInput): Promise<Permission> {
    await this.findPermissionById(id);
    
    // Check for conflicts if resource or action is being updated
    if (data.resource || data.action) {
      const current = await this.prisma.permission.findUnique({ where: { id } });
      const newResource = data.resource as string || current?.resource;
      const newAction = data.action as string || current?.action;
      
      const existing = await this.prisma.permission.findFirst({
        where: {
          id: { not: id },
          resource: newResource,
          action: newAction
        }
      });
      
      if (existing) {
        throw new ConflictException(`Permission for ${newResource}:${newAction} already exists`);
      }
    }

    return this.prisma.permission.update({
      where: { id },
      data
    });
  }

  async deletePermission(id: number): Promise<void> {
    await this.findPermissionById(id);
    await this.prisma.permission.delete({ where: { id } });
  }

  // Role methods
  async findAllRoles(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async findRoleById(id: number): Promise<Role> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async findRoleByName(name: string): Promise<Role> {
    const role = await this.prisma.role.findUnique({ where: { name } });
    if (!role) {
      throw new NotFoundException(`Role with name "${name}" not found`);
    }
    return role;
  }

  async createRole(data: Prisma.RoleCreateInput): Promise<Role> {
    // Check if role name already exists
    const existing = await this.prisma.role.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new ConflictException(`Role with name "${data.name}" already exists`);
    }

    return this.prisma.role.create({ data });
  }

  async updateRole(id: number, data: Prisma.RoleUpdateInput): Promise<Role> {
    await this.findRoleById(id);
    
    // Check for name conflicts
    if (data.name) {
      const existing = await this.prisma.role.findUnique({ 
        where: { name: data.name as string } 
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Role with name "${data.name}" already exists`);
      }
    }

    return this.prisma.role.update({
      where: { id },
      data
    });
  }

  async deleteRole(id: number): Promise<void> {
    await this.findRoleById(id);
    await this.prisma.role.delete({ where: { id } });
  }

  // Role-Permission assignment
  async assignPermissionToRole(roleId: number, permissionId: number): Promise<void> {
    await this.findRoleById(roleId);
    await this.findPermissionById(permissionId);
    
    // Check if already assigned
    const existing = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId
        }
      }
    });
    
    if (existing) {
      throw new ConflictException('Permission is already assigned to this role');
    }

    await this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId
      }
    });
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await this.findRoleById(roleId);
    await this.findPermissionById(permissionId);

    await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId
        }
      }
    });
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    await this.findRoleById(roleId);
    
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true }
    });
    
    return rolePermissions.map(rp => rp.permission);
  }

  // User-Role assignment
  async assignRoleToUser(userId: number, roleId: number, assignedBy: number): Promise<UserRole> {
    await this.findRoleById(roleId);
    
    // Check if user already has this role
    const existing = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    });
    
    if (existing) {
      throw new ConflictException('User already has this role');
    }

    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
        assignedBy
      }
    });
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    await this.findRoleById(roleId);
    
    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    });
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true }
    });
    
    return userRoles.map(ur => ur.role);
  }

  async getUserPermissions(userId: number): Promise<Permission[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });
    
    const permissions = new Set<Permission>();
    userRoles.forEach(ur => {
      ur.role.permissions.forEach(rp => {
        permissions.add(rp.permission);
      });
    });
    
    return Array.from(permissions);
  }

  // Permission checking
  async hasPermission(userId: number, resource: string, action: string): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return userPermissions.some(p => p.resource === resource && p.action === action);
  }

  async hasRole(userId: number, roleName: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.some(r => r.name === roleName);
  }

  // Utility methods
  async createDefaultPermissions(): Promise<void> {
    const defaultPermissions = [
      { name: 'Create User', description: 'Can create new users', resource: 'user', action: 'create' },
      { name: 'Read User', description: 'Can view user details', resource: 'user', action: 'read' },
      { name: 'Update User', description: 'Can update user information', resource: 'user', action: 'update' },
      { name: 'Delete User', description: 'Can delete users', resource: 'user', action: 'delete' },
      { name: 'Manage Roles', description: 'Can manage user roles', resource: 'role', action: 'manage' },
      { name: 'View Audit Logs', description: 'Can view audit logs', resource: 'audit', action: 'read' },
      { name: 'Manage Permissions', description: 'Can manage permissions', resource: 'permission', action: 'manage' },
    ];

    for (const permission of defaultPermissions) {
      try {
        await this.createPermission(permission);
      } catch (error) {
        if (error instanceof ConflictException) {
          // Permission already exists, skip
          continue;
        }
        throw error;
      }
    }
  }

  async createDefaultRoles(): Promise<void> {
    const defaultRoles = [
      { name: 'admin', description: 'Administrator with full access' },
      { name: 'user', description: 'Regular user with basic access' },
      { name: 'moderator', description: 'Moderator with limited admin access' },
    ];

    for (const role of defaultRoles) {
      try {
        await this.createRole(role);
      } catch (error) {
        if (error instanceof ConflictException) {
          // Role already exists, skip
          continue;
        }
        throw error;
      }
    }
  }
} 