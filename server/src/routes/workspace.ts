import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { DatabaseManager } from '../config/database';
import { logger } from '../utils/logger';
import sql from 'mssql';

const router = express.Router();

// Apply authentication to all workspace routes
router.use(authenticateToken);

const dbManager = DatabaseManager.getInstance();

// Get user's workspaces (users see only assigned workspaces, admins see all they own)
router.get('/', validate(schemas.pagination), async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { page = 1, limit = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;
    
    const pool = await dbManager.getPool();
    const offset = (Number(page) - 1) * Number(limit);
    
    let workspaceQuery = '';
    let countQuery = '';
    
    if (userRole === 'admin') {
      // Admins can see all workspaces they own
      workspaceQuery = `
        SELECT 
          w.*,
          (SELECT COUNT(*) FROM Chats WHERE workspaceId = w.id AND isArchived = 0) as chatCount,
          (SELECT MAX(lastMessageAt) FROM Chats WHERE workspaceId = w.id) as lastActivity
        FROM Workspaces w
        WHERE w.ownerId = @userId
        ORDER BY w.${sortBy} ${sortOrder}
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;
      countQuery = 'SELECT COUNT(*) as total FROM Workspaces WHERE ownerId = @userId';
    } else {
      // Regular users can only see workspaces they're assigned to
      workspaceQuery = `
        SELECT 
          w.*,
          wu.accessLevel,
          (SELECT COUNT(*) FROM Chats WHERE workspaceId = w.id AND isArchived = 0) as chatCount,
          (SELECT MAX(lastMessageAt) FROM Chats WHERE workspaceId = w.id) as lastActivity
        FROM Workspaces w
        INNER JOIN WorkspaceUsers wu ON w.id = wu.workspaceId
        WHERE wu.userId = @userId
        ORDER BY w.${sortBy} ${sortOrder}
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `;
      countQuery = `
        SELECT COUNT(*) as total 
        FROM Workspaces w
        INNER JOIN WorkspaceUsers wu ON w.id = wu.workspaceId
        WHERE wu.userId = @userId
      `;
    }
    
    const result = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .input('limit', sql.Int, Number(limit))
      .input('offset', sql.Int, offset)
      .query(workspaceQuery);
    
    const countResult = await pool.request()
      .input('userId', sql.NVarChar, userId)
      .query(countQuery);
    
    const total = countResult.recordset[0].total;

    res.json({
      message: 'Workspaces retrieved successfully',
      workspaces: result.recordset,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Get workspaces error:', error);
    res.status(500).json({
      error: 'Failed to retrieve workspaces'
    });
  }
});

// Create new workspace (admin only)
router.post('/', requireAdmin, validate(schemas.createWorkspace), async (req, res) => {
  try {
    const { name, description, color, isShared } = req.body;
    const userId = req.user.userId;
    const workspaceId = uuidv4();
    
    const pool = await dbManager.getPool();
    
    const result = await pool.request()
      .input('id', sql.NVarChar, workspaceId)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description || '')
      .input('color', sql.NVarChar, color || '#3B82F6')
      .input('isShared', sql.Bit, isShared || false)
      .input('ownerId', sql.NVarChar, userId)
      .query(`
        INSERT INTO Workspaces (id, name, description, color, isShared, ownerId)
        OUTPUT INSERTED.*
        VALUES (@id, @name, @description, @color, @isShared, @ownerId)
      `);
    
    const workspace = result.recordset[0];

    res.status(201).json({
      message: 'Workspace created successfully',
      workspace
    });

    logger.info(`Workspace created: ${workspaceId} by user: ${userId}`);
  } catch (error) {
    logger.error('Create workspace error:', error);
    res.status(500).json({
      error: 'Failed to create workspace'
    });
  }
});

// Update workspace (admin only)
router.put('/:id', requireAdmin, validate(schemas.uuidParam), validate(schemas.updateWorkspace), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color, isShared } = req.body;
    const userId = req.user.userId;
    
    const pool = await dbManager.getPool();
    
    // Verify workspace belongs to user
    const workspaceCheck = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('userId', sql.NVarChar, userId)
      .query('SELECT id FROM Workspaces WHERE id = @id AND ownerId = @userId');
    
    if (workspaceCheck.recordset.length === 0) {
      return res.status(404).json({
        error: 'Workspace not found',
        message: 'Workspace not found or access denied'
      });
    }
    
    const result = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('name', sql.NVarChar, name)
      .input('description', sql.NVarChar, description)
      .input('color', sql.NVarChar, color)
      .input('isShared', sql.Bit, isShared)
      .query(`
        UPDATE Workspaces 
        SET 
          name = COALESCE(@name, name),
          description = COALESCE(@description, description),
          color = COALESCE(@color, color),
          isShared = COALESCE(@isShared, isShared),
          updatedAt = GETUTCDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    
    const workspace = result.recordset[0];

    res.json({
      message: 'Workspace updated successfully',
      workspace
    });

    logger.info(`Workspace updated: ${id} by user: ${userId}`);
  } catch (error) {
    logger.error('Update workspace error:', error);
    res.status(500).json({
      error: 'Failed to update workspace'
    });
  }
});

// Delete workspace (admin only)
router.delete('/:id', requireAdmin, validate(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const pool = await dbManager.getPool();
    
    // Verify workspace belongs to user
    const workspaceCheck = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('userId', sql.NVarChar, userId)
      .query('SELECT id FROM Workspaces WHERE id = @id AND ownerId = @userId');
    
    if (workspaceCheck.recordset.length === 0) {
      return res.status(404).json({
        error: 'Workspace not found',
        message: 'Workspace not found or access denied'
      });
    }
    
    // Check if workspace has chats
    const chatCheck = await pool.request()
      .input('workspaceId', sql.NVarChar, id)
      .query('SELECT COUNT(*) as count FROM Chats WHERE workspaceId = @workspaceId AND isArchived = 0');
    
    const chatCount = chatCheck.recordset[0].count;
    
    if (chatCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete workspace',
        message: 'Workspace contains active chats. Please archive or move them first.'
      });
    }
    
    // Delete workspace
    await pool.request()
      .input('id', sql.NVarChar, id)
      .query('DELETE FROM Workspaces WHERE id = @id');

    res.json({
      message: 'Workspace deleted successfully',
      workspaceId: id
    });

    logger.info(`Workspace deleted: ${id} by user: ${userId}`);
  } catch (error) {
    logger.error('Delete workspace error:', error);
    res.status(500).json({
      error: 'Failed to delete workspace'
    });
  }
});

// Get workspace details with chats
router.get('/:id', validate(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    const pool = await dbManager.getPool();
    
    // Check if user has access to this workspace
    let accessQuery = '';
    if (userRole === 'admin') {
      // Admin can access workspaces they own
      accessQuery = `
        SELECT 
          w.*,
          'owner' as accessLevel,
          (SELECT COUNT(*) FROM Chats WHERE workspaceId = w.id AND isArchived = 0) as chatCount
        FROM Workspaces w
        WHERE w.id = @id AND w.ownerId = @userId
      `;
    } else {
      // Regular users can only access assigned workspaces
      accessQuery = `
        SELECT 
          w.*,
          wu.accessLevel,
          (SELECT COUNT(*) FROM Chats WHERE workspaceId = w.id AND isArchived = 0) as chatCount
        FROM Workspaces w
        INNER JOIN WorkspaceUsers wu ON w.id = wu.workspaceId
        WHERE w.id = @id AND wu.userId = @userId
      `;
    }
    
    const workspaceResult = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('userId', sql.NVarChar, userId)
      .query(accessQuery);
    
    if (workspaceResult.recordset.length === 0) {
      return res.status(404).json({
        error: 'Workspace not found',
        message: 'Workspace not found or access denied'
      });
    }
    
    const workspace = workspaceResult.recordset[0];
    
    // Get recent chats in workspace
    const chatsResult = await pool.request()
      .input('workspaceId', sql.NVarChar, id)
      .query(`
        SELECT TOP 10
          c.*,
          (SELECT COUNT(*) FROM Messages WHERE chatId = c.id) as messageCount
        FROM Chats c
        WHERE c.workspaceId = @workspaceId AND c.isArchived = 0
        ORDER BY c.updatedAt DESC
      `);

    res.json({
      message: 'Workspace details retrieved successfully',
      workspace: {
        ...workspace,
        recentChats: chatsResult.recordset
      }
    });
  } catch (error) {
    logger.error('Get workspace details error:', error);
    res.status(500).json({
      error: 'Failed to retrieve workspace details'
    });
  }
});

// Admin endpoints for user-workspace management

// Get all users for workspace assignment (admin only)
router.get('/:id/available-users', requireAdmin, validate(schemas.uuidParam), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { search = '' } = req.query;
    
    const pool = await dbManager.getPool();
    
    // Verify workspace belongs to admin
    const workspaceCheck = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('userId', sql.NVarChar, userId)
      .query('SELECT id FROM Workspaces WHERE id = @id AND ownerId = @userId');
    
    if (workspaceCheck.recordset.length === 0) {
      return res.status(404).json({
        error: 'Workspace not found',
        message: 'Workspace not found or access denied'
      });
    }
    
    let whereClause = "WHERE u.role != 'admin'";
    let searchInput = '';
    
    if (search) {
      whereClause += ` AND (u.firstName LIKE @search OR u.lastName LIKE @search OR u.email LIKE @search)`;
      searchInput = `%${search}%`;
    }
    
    const result = await pool.request()
      .input('workspaceId', sql.NVarChar, id)
      .input('search', sql.NVarChar, searchInput)
      .query(`
        SELECT 
          u.id,
          u.firstName,
          u.lastName,
          u.email,
          u.isActive,
          wu.accessLevel,
          wu.assignedAt,
          CASE WHEN wu.userId IS NOT NULL THEN 1 ELSE 0 END as isAssigned
        FROM Users u
        LEFT JOIN WorkspaceUsers wu ON u.id = wu.userId AND wu.workspaceId = @workspaceId
        ${whereClause}
        ORDER BY u.firstName, u.lastName
      `);

    res.json({
      message: 'Users retrieved successfully',
      users: result.recordset
    });
  } catch (error) {
    logger.error('Get available users error:', error);
    res.status(500).json({
      error: 'Failed to retrieve users'
    });
  }
});

// Assign user to workspace (admin only)
router.post('/:id/assign-user', requireAdmin, validate(schemas.uuidParam), validate(schemas.assignUsersToWorkspace), async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds, accessLevel = 'member' } = req.body;
    const adminId = req.user.userId;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        error: 'User IDs are required',
        message: 'Please provide an array of user IDs to assign'
      });
    }
    
    const pool = await dbManager.getPool();
    
    // Verify workspace belongs to admin
    const workspaceCheck = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('adminId', sql.NVarChar, adminId)
      .query('SELECT id FROM Workspaces WHERE id = @id AND ownerId = @adminId');
    
    if (workspaceCheck.recordset.length === 0) {
      return res.status(404).json({
        error: 'Workspace not found',
        message: 'Workspace not found or access denied'
      });
    }
    
    const assignments = [];
    for (const userId of userIds) {
      const assignmentId = uuidv4();
      
      // Check if user is already assigned
      const existingAssignment = await pool.request()
        .input('workspaceId', sql.NVarChar, id)
        .input('userId', sql.NVarChar, userId)
        .query('SELECT id FROM WorkspaceUsers WHERE workspaceId = @workspaceId AND userId = @userId');
      
      if (existingAssignment.recordset.length === 0) {
        await pool.request()
          .input('id', sql.NVarChar, assignmentId)
          .input('workspaceId', sql.NVarChar, id)
          .input('userId', sql.NVarChar, userId)
          .input('accessLevel', sql.NVarChar, accessLevel)
          .input('assignedBy', sql.NVarChar, adminId)
          .query(`
            INSERT INTO WorkspaceUsers (id, workspaceId, userId, accessLevel, assignedBy)
            VALUES (@id, @workspaceId, @userId, @accessLevel, @assignedBy)
          `);
        
        assignments.push({ userId, assignmentId, status: 'assigned' });
      } else {
        assignments.push({ userId, status: 'already_assigned' });
      }
    }

    res.json({
      message: 'User assignments completed',
      assignments
    });

    logger.info(`Users assigned to workspace ${id} by admin ${adminId}:`, assignments);
  } catch (error) {
    logger.error('Assign user to workspace error:', error);
    res.status(500).json({
      error: 'Failed to assign users to workspace'
    });
  }
});

// Remove user from workspace (admin only)
router.post('/:id/remove-user', requireAdmin, validate(schemas.uuidParam), validate(schemas.removeUsersFromWorkspace), async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds } = req.body;
    const adminId = req.user.userId;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        error: 'User IDs are required',
        message: 'Please provide an array of user IDs to remove'
      });
    }
    
    const pool = await dbManager.getPool();
    
    // Verify workspace belongs to admin
    const workspaceCheck = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('adminId', sql.NVarChar, adminId)
      .query('SELECT id FROM Workspaces WHERE id = @id AND ownerId = @adminId');
    
    if (workspaceCheck.recordset.length === 0) {
      return res.status(404).json({
        error: 'Workspace not found',
        message: 'Workspace not found or access denied'
      });
    }
    
    const removals = [];
    for (const userId of userIds) {
      const result = await pool.request()
        .input('workspaceId', sql.NVarChar, id)
        .input('userId', sql.NVarChar, userId)
        .query('DELETE FROM WorkspaceUsers WHERE workspaceId = @workspaceId AND userId = @userId');
      
      if (result.rowsAffected[0] > 0) {
        removals.push({ userId, status: 'removed' });
      } else {
        removals.push({ userId, status: 'not_found' });
      }
    }

    res.json({
      message: 'User removals completed',
      removals
    });

    logger.info(`Users removed from workspace ${id} by admin ${adminId}:`, removals);
  } catch (error) {
    logger.error('Remove user from workspace error:', error);
    res.status(500).json({
      error: 'Failed to remove users from workspace'
    });
  }
});

// Update user access level in workspace (admin only)
router.put('/:id/user-access', requireAdmin, validate(schemas.uuidParam), validate(schemas.updateUserAccess), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, accessLevel } = req.body;
    const adminId = req.user.userId;
    
    if (!userId || !accessLevel) {
      return res.status(400).json({
        error: 'User ID and access level are required'
      });
    }
    
    const validAccessLevels = ['member', 'readonly'];
    if (!validAccessLevels.includes(accessLevel)) {
      return res.status(400).json({
        error: 'Invalid access level',
        message: 'Access level must be one of: member, readonly'
      });
    }
    
    const pool = await dbManager.getPool();
    
    // Verify workspace belongs to admin
    const workspaceCheck = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('adminId', sql.NVarChar, adminId)
      .query('SELECT id FROM Workspaces WHERE id = @id AND ownerId = @adminId');
    
    if (workspaceCheck.recordset.length === 0) {
      return res.status(404).json({
        error: 'Workspace not found',
        message: 'Workspace not found or access denied'
      });
    }
    
    const result = await pool.request()
      .input('workspaceId', sql.NVarChar, id)
      .input('userId', sql.NVarChar, userId)
      .input('accessLevel', sql.NVarChar, accessLevel)
      .query(`
        UPDATE WorkspaceUsers 
        SET accessLevel = @accessLevel 
        WHERE workspaceId = @workspaceId AND userId = @userId
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        error: 'User assignment not found',
        message: 'User is not assigned to this workspace'
      });
    }

    res.json({
      message: 'User access level updated successfully',
      userId,
      accessLevel
    });

    logger.info(`User ${userId} access level updated to ${accessLevel} in workspace ${id} by admin ${adminId}`);
  } catch (error) {
    logger.error('Update user access level error:', error);
    res.status(500).json({
      error: 'Failed to update user access level'
    });
  }
});

export { router as workspaceRoutes };