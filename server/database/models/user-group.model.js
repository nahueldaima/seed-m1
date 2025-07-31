import { executeSupabaseQuery } from '../supabase.js'
import { CreateUserGroupSchema, UserGroupsArraySchema } from '../schemas/index.js'


class UserGroupModel {
  static TABLE_NAME = 'user_groups'
  /**
   * Find all user-group relationships
   */
  static async findAll(supabase, options = {}) {
    let query = supabase.from(this.TABLE_NAME).select('*')
    
    if (options.userId) {
      query = query.eq('user_id', options.userId)
    }
    
    if (options.groupId) {
      query = query.eq('group_id', options.groupId)
    }
    
    if (options.orderBy) {
      query = query.order(options.orderBy.field, { ascending: options.orderBy.ascending ?? true })
    }
    
    if (options.limit) {
      query = query.limit(options.limit)
    }
    
    return executeSupabaseQuery(query)
  }

  static async groupsAndPermissionsByUserId(supabase, userId) {
    let query = supabase.from(this.TABLE_NAME).select(
      `group_id,
       groups (
         filters,
         group_permissions (
           permissions ( code )
         )
       )`
    ).eq('user_id', userId)

    return executeSupabaseQuery(query)
  }

  /**
   * Find groups for a specific user
   */
  static async findGroupsByUserId(supabase, userId) {
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
      .eq('user_id', userId)
    return executeSupabaseQuery(query)
  }

  /**
   * Find users for a specific group
   */
  static async findUsersByGroupId(supabase, groupId) {
    const query = supabase.from(this.TABLE_NAME)
      .select(`
        user_id,
        user_profiles (
          id,
          display_name,
          is_superadmin,
          mongo_filters,
          created_at,
          updated_at
        )
      `)
      .eq('group_id', groupId)
    return executeSupabaseQuery(query)
  }

  /**
   * Check if user-group relationship exists
   */
  static async exists(supabase, userId, groupId) {
    const query = supabase.from(this.TABLE_NAME)
      .select('user_id')
      .eq('user_id', userId)
      .eq('group_id', groupId)
      .limit(1)
    
    try {
      await executeSupabaseQuery(query)
      return true
    } catch {
      return false
    }
  }

  /**
   * Add user to group
   */
  static async create(supabase, userGroupData) {
    // Validate input data
    const validatedData = CreateUserGroupSchema.parse(userGroupData)
    
    const query = supabase.from(this.TABLE_NAME).insert(validatedData).select().limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Add user to group (with existence check)
   */
  static async addUserToGroup(supabase, userId, groupId) {
    // Check if relationship already exists
    const relationshipExists = await this.exists(supabase, userId, groupId)
    if (relationshipExists) {
      throw new Error('User is already in this group')
    }
    
    return this.create(supabase, { user_id: userId, group_id: groupId })
  }

  /**
   * Remove user from group
   */
  static async delete(supabase, userId, groupId) {
    const query = supabase.from(this.TABLE_NAME)
      .delete()
      .eq('user_id', userId)
      .eq('group_id', groupId)
      .select()
      .limit(1)
    return executeSupabaseQuery(query)
  }

  /**
   * Remove user from group (alias for delete)
   */
  static async removeUserFromGroup(supabase, userId, groupId) {
    return this.delete(supabase, userId, groupId)
  }

  /**
   * Remove all groups for a user
   */
  static async deleteAllGroupsForUser(supabase, userId) {
    const query = supabase.from(this.TABLE_NAME).delete().eq('user_id', userId).select()
    return executeSupabaseQuery(query)
  }

  /**
   * Remove all users from a group
   */
  static async deleteAllUsersFromGroup(supabase, groupId) {
    const query = supabase.from(this.TABLE_NAME).delete().eq('group_id', groupId).select()
    return executeSupabaseQuery(query)
  }

  /**
   * Create multiple user-group relationships (batch)
   */
  static async createBatch(supabase, userGroupsData) {
    // Validate input data
    const validatedData = UserGroupsArraySchema.parse(userGroupsData)
    
    const query = supabase.from(this.TABLE_NAME).insert(validatedData).select()
    return executeSupabaseQuery(query)
  }

  /**
   * Add multiple users to a group
   */
  static async addUsersToGroup(supabase, userIds, groupId) {
    const userGroupsData = userIds.map(userId => ({
      user_id: userId,
      group_id: groupId
    }))
    
    return this.createBatch(supabase, userGroupsData)
  }

  /**
   * Add user to multiple groups
   */
  static async addUserToGroups(supabase, userId, groupIds) {
    const userGroupsData = groupIds.map(groupId => ({
      user_id: userId,
      group_id: groupId
    }))
    
    return this.createBatch(supabase, userGroupsData)
  }

  /**
   * Replace user's groups (remove all current and add new ones)
   */
  static async replaceUserGroups(supabase, userId, groupIds) {
    // Remove all current groups for the user
    await this.deleteAllGroupsForUser(supabase, userId)
    
    // Add new groups if provided
    if (groupIds && groupIds.length > 0) {
      return this.addUserToGroups(supabase, userId, groupIds)
    }
    
    return []
  }

  /**
   * Replace group's users (remove all current and add new ones)
   */
  static async replaceGroupUsers(supabase, groupId, userIds) {
    // Remove all current users from the group
    await this.deleteAllUsersFromGroup(supabase, groupId)
    
    // Add new users if provided
    if (userIds && userIds.length > 0) {
      return this.addUsersToGroup(supabase, userIds, groupId)
    }
    
    return []
  }

  /**
   * Count users in a group
   */
  static async countUsersByGroupId(supabase, groupId) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
    const result = await executeSupabaseQuery(query)
    return result?.count || 0
  }

  /**
   * Count groups for a user
   */
  static async countGroupsByUserId(supabase, userId) {
    const query = supabase.from(this.TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    const result = await executeSupabaseQuery(query)
    return result?.count || 0
  }

  /**
   * Get user IDs for a group
   */
  static async getUserIdsByGroupId(supabase, groupId) {
    const query = supabase.from(this.TABLE_NAME)
      .select('user_id')
      .eq('group_id', groupId)
    const result = await executeSupabaseQuery(query)
    return result.map(row => row.user_id)
  }

  /**
   * Get group IDs for a user
   */
  static async getGroupIdsByUserId(supabase, userId) {
    const query = supabase.from(this.TABLE_NAME)
      .select('group_id')
      .eq('user_id', userId)
    const result = await executeSupabaseQuery(query)
    return result.map(row => row.group_id)
  }
}

export default UserGroupModel 