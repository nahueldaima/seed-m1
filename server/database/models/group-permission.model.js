import { executeSupabaseQuery } from '../supabase.js'
import { GroupPermissionSchema, CreateGroupPermissionSchema, GroupPermissionsArraySchema } from '../schemas/index.js'


class GroupPermissionModel {
  static TABLE_NAME = 'group_permissions'
  /**
   * Find all group-permission relationships
   */
  static async findAll(supabase, options = {}) {
    let query = supabase.from(this.TABLE_NAME).select('*')
    
    if (options.groupId) {
      query = query.eq('group_id', options.groupId)
    }
    
    if (options.permId) {
      query = query.eq('perm_id', options.permId)
    }
    
    if (options.orderBy) {
      query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending ?? true })
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    return executeSupabaseQuery(query)
  }

  /**
   * Find permissions for a specific group
   */
  static async findPermissionsByGroupId(supabase, groupId) {
    const query = supabase.from(this.TABLE_NAME)
      .select(`
        perm_id,
        permissions (
          id,
          code,
          description,
          created_at,
          updated_at
        )
      `)
      .eq('group_id', groupId)
    return executeSupabaseQuery(query)
  }

  /**
   * Find groups for a specific permission
   */
  static async findGroupsByPermissionId(supabase, permId) {
    const query = supabase.from(this.TABLE_NAME)
      .select(`
        group_id,
        groups (
          id,
          name,
          description,
          filters,
          created_at,
          updated_at
        )
      `)
      .eq('perm_id', permId)
    return executeSupabaseQuery(query)
  }

  /**
   * Check if group-permission relationship exists
   */
  static async exists(supabase, groupId, permId) {
    const query = supabase.from(this.TABLE_NAME)
      .select('group_id')
      .eq('group_id', groupId)
      .eq('perm_id', permId)
      .limit(1)
    
    try {
      await executeSupabaseQuery(query)
      return true
    } catch {
      return false
    }
  }

  /**
   * Add permission to group
   */
  static async create(supabase, groupPermissionData) {
    // Validate input data
    const validatedData = CreateGroupPermissionSchema.parse(groupPermissionData)
    
    const query = supabase.from(this.TABLE_NAME).insert(validatedData).select().limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Add permission to group (with existence check)
   */
  static async addPermissionToGroup(supabase, groupId, permId) {
    // Check if relationship already exists
    const relationshipExists = await this.exists(supabase, groupId, permId)
    if (relationshipExists) {
      throw new Error('Group already has this permission')
    }
    
    return this.create(supabase, { group_id: groupId, perm_id: permId })
  }

  /**
   * Remove permission from group
   */
  static async delete(supabase, groupId, permId) {
    const query = supabase.from(this.TABLE_NAME)
      .delete()
      .eq('group_id', groupId)
      .eq('perm_id', permId)
      .select()
      .limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Remove permission from group (alias for delete)
   */
  static async removePermissionFromGroup(supabase, groupId, permId) {
    return this.delete(supabase, groupId, permId)
  }

  /**
   * Remove all permissions for a group
   */
  static async deleteAllPermissionsForGroup(supabase, groupId) {
    const query = supabase.from(this.TABLE_NAME).delete().eq('group_id', groupId).select()
    return executeSupabaseQuery(query)
  }

  /**
   * Remove all groups from a permission
   */
  static async deleteAllGroupsFromPermission(supabase, permId) {
    const query = supabase.from(this.TABLE_NAME).delete().eq('perm_id', permId).select()
    return executeSupabaseQuery(query)
  }

  /**
   * Create multiple group-permission relationships (batch)
   */
  static async createBatch(supabase, groupPermissionsData) {
    // Validate input data
    const validatedData = GroupPermissionsArraySchema.parse(groupPermissionsData)
    
    const query = supabase.from(this.TABLE_NAME).insert(validatedData).select()
    return executeSupabaseQuery(query)
  }

  /**
   * Add multiple permissions to a group
   */
  static async addPermissionsToGroup(supabase, groupId, permIds) {
    const groupPermissionsData = permIds.map(permId => ({
      group_id: groupId,
      perm_id: permId
    }))
    
    return this.createBatch(supabase, groupPermissionsData)
  }

  /**
   * Add group to multiple permissions
   */
  static async addGroupToPermissions(supabase, groupId, permIds) {
    const groupPermissionsData = permIds.map(permId => ({
      group_id: groupId,
      perm_id: permId
    }))
    
    return this.createBatch(supabase, groupPermissionsData)
  }

  /**
   * Replace group's permissions (remove all current and add new ones)
   */
  static async replaceGroupPermissions(supabase, groupId, permIds) {
    // Remove all current permissions for the group
    await this.deleteAllPermissionsForGroup(supabase, groupId)
    
    // Add new permissions if provided
    if (permIds && permIds.length > 0) {
      return this.addPermissionsToGroup(supabase, groupId, permIds)
    }
    
    return []
  }

  /**
   * Replace permission's groups (remove all current and add new ones)
   */
  static async replacePermissionGroups(supabase, permId, groupIds) {
    // Remove all current groups from the permission
    await this.deleteAllGroupsFromPermission(supabase, permId)
    
    // Add new groups if provided
    if (groupIds && groupIds.length > 0) {
      const groupPermissionsData = groupIds.map(groupId => ({
        group_id: groupId,
        perm_id: permId
      }))
      return this.createBatch(supabase, groupPermissionsData)
    }
    
    return []
  }

  /**
   * Count permissions for a group
   */
  static async countPermissionsByGroupId(supabase, groupId) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
    const result = await executeSupabaseQuery(query)
    return result?.count || 0
  }

  /**
   * Count groups for a permission
   */
  static async countGroupsByPermissionId(supabase, permId) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('perm_id', permId)
    const result = await executeSupabaseQuery(query)
    return result?.count || 0
  }

  /**
   * Get permission IDs for a group
   */
  static async getPermissionIdsByGroupId(supabase, groupId) {
    const query = supabase.from(this.TABLE_NAME)
      .select('perm_id')
      .eq('group_id', groupId)
    const result = await executeSupabaseQuery(query)
    return result.map(row => row.perm_id)
  }

  /**
   * Get group IDs for a permission
   */
  static async getGroupIdsByPermissionId(supabase, permId) {
    const query = supabase.from(this.TABLE_NAME)
      .select('group_id')
      .eq('perm_id', permId)
    const result = await executeSupabaseQuery(query)
    return result.map(row => row.group_id)
  }

  /**
   * Get all permissions for a user (through their groups)
   */
  static async getUserPermissions(supabase, userId) {
    const query = supabase.from('user_groups')
      .select(`
        group_id,
        group_permissions!inner (
          perm_id,
          permissions (
            id,
            code,
            description
          )
        )
      `)
      .eq('user_id', userId)
    
    const result = await executeSupabaseQuery(query)
    
    // Flatten and deduplicate permissions
    const permissions = new Map()
    result.forEach(userGroup => {
      userGroup.group_permissions.forEach(groupPerm => {
        const permission = groupPerm.permissions
        permissions.set(permission.id, permission)
      })
    })
    
    return Array.from(permissions.values())
  }

  /**
   * Check if user has specific permission (through their groups)
   */
  static async userHasPermission(supabase, userId, permissionCode) {
    const userPermissions = await this.getUserPermissions(supabase, userId)
    return userPermissions.some(permission => permission.code === permissionCode)
  }

  /**
   * Get permission codes for a user (through their groups)
   */
  static async getUserPermissionCodes(supabase, userId) {
    const userPermissions = await this.getUserPermissions(supabase, userId)
    return userPermissions.map(permission => permission.code)
  }
}

export default GroupPermissionModel 