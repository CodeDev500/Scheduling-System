import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { scheduleGenerationAlgorithm } from '../services/scheduleGenerationService';

const prisma = new PrismaClient();

// Get all schedule constraints for a department
export const getConstraints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department } = req.params;
    
    const constraints = await prisma.scheduleConstraint.findMany({
      where: {
        department,
        isActive: true
      },
      orderBy: {
        priority: 'desc'
      }
    });

    res.json({
      success: true,
      data: constraints
    });
  } catch (error) {
    console.error('Error fetching constraints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch constraints'
    });
  }
};

// Create or update schedule constraint
export const createConstraint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, constraintType, constraintValue, priority } = req.body;

    const constraint = await prisma.scheduleConstraint.create({
      data: {
        department,
        constraintType,
        constraintValue: JSON.stringify(constraintValue),
        priority
      }
    });

    res.json({
      success: true,
      data: constraint
    });
  } catch (error) {
    console.error('Error creating constraint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create constraint'
    });
  }
};

// Get generation preferences for a department
export const getPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department } = req.params;
    
    const preferences = await prisma.generationPreference.findMany({
      where: { department }
    });

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preferences'
    });
  }
};

// Update generation preferences
export const updatePreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department } = req.params;
    const {
      optimizationGoal,
      maxConsecutiveHours,
      preferredTimeSlots,
      avoidTimeSlots,
      roomPreferences,
      facultyPreferences
    } = req.body;

    const existingPreferences = await prisma.generationPreference.findMany({
      where: { department },
    });
    const existingPreference = existingPreferences[0] || null;

    const preferences = await prisma.generationPreference.upsert({
      where: { id: existingPreference?.id || 0 },
      update: {
        optimizationGoal,
        maxConsecutiveHours,
        preferredTimeSlots: JSON.stringify(preferredTimeSlots),
        avoidTimeSlots: JSON.stringify(avoidTimeSlots),
        roomPreferences: JSON.stringify(roomPreferences),
        facultyPreferences: JSON.stringify(facultyPreferences)
      },
      create: {
        department,
        optimizationGoal,
        maxConsecutiveHours,
        preferredTimeSlots: JSON.stringify(preferredTimeSlots),
        avoidTimeSlots: JSON.stringify(avoidTimeSlots),
        roomPreferences: JSON.stringify(roomPreferences),
        facultyPreferences: JSON.stringify(facultyPreferences)
      }
    });

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
};

// Generate schedule automatically
export const generateSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, academicYear, semester, yearLevel } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Create generation record
    const generation = await prisma.scheduleGeneration.create({
      data: {
        department,
        academicYear,
        semester,
        yearLevel,
        generatedBy: userId,
        status: 'IN_PROGRESS'
      }
    });

    // Get constraints and preferences
    const constraints = await prisma.scheduleConstraint.findMany({
      where: { department, isActive: true }
    });

    const preferences = await prisma.generationPreference.findMany({
      where: { department }
    });

    // Run generation algorithm
    const result = await scheduleGenerationAlgorithm({
      department,
      academicYear,
      semester,
      yearLevel,
      constraints,
      preferences: preferences[0] || null
    });

    // Update generation record with results
    const updatedGeneration = await prisma.scheduleGeneration.update({
      where: { id: generation.id },
      data: {
        status: result.success ? 'COMPLETED' : 'FAILED',
        scheduleData: JSON.stringify(result.scheduleData),
        conflictsFound: JSON.stringify(result.conflicts),
        constraintsUsed: JSON.stringify(constraints)
      }
    });

    // Create conflict records if any
    if (result.conflicts && result.conflicts.length > 0) {
      await prisma.scheduleConflict.createMany({
        data: result.conflicts.map((conflict: any) => ({
          generationId: generation.id,
          conflictType: conflict.type,
          description: conflict.description,
          affectedItems: JSON.stringify(conflict.affectedItems),
          severity: conflict.severity
        }))
      });
    }

    res.json({
      success: true,
      data: {
        generation: updatedGeneration,
        scheduleData: result.scheduleData,
        conflicts: result.conflicts
      }
    });
  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate schedule'
    });
  }
};

// Get generation history
export const getGenerationHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department } = req.params;
    
    const generations = await prisma.scheduleGeneration.findMany({
      where: { department },
      include: {
        generatedByUser: {
          select: {
            firstname: true,
            lastname: true,
            email: true
          }
        },
        conflicts: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: generations
    });
  } catch (error) {
    console.error('Error fetching generation history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch generation history'
    });
  }
};

// Get specific generation with conflicts
export const getGeneration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const generation = await prisma.scheduleGeneration.findUnique({
      where: { id: parseInt(id) },
      include: {
        generatedByUser: {
          select: {
            firstname: true,
            lastname: true,
            email: true
          }
        },
        conflicts: true
      }
    });

    if (!generation) {
      res.status(404).json({
        success: false,
        message: 'Generation not found'
      });
      return;
    }

    res.json({
      success: true,
      data: generation
    });
  } catch (error) {
    console.error('Error fetching generation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch generation'
    });
  }
};

// Update schedule data (for manual modifications)
export const updateScheduleData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { scheduleData, notes } = req.body;

    const generation = await prisma.scheduleGeneration.update({
      where: { id: parseInt(id) },
      data: {
        scheduleData: JSON.stringify(scheduleData),
        notes
      }
    });

    res.json({
      success: true,
      data: generation
    });
  } catch (error) {
    console.error('Error updating schedule data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule data'
    });
  }
};

// Resolve conflict
export const resolveConflict = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    const conflict = await prisma.scheduleConflict.update({
      where: { id: parseInt(id) },
      data: {
        isResolved: true,
        resolution
      }
    });

    res.json({
      success: true,
      data: conflict
    });
  } catch (error) {
    console.error('Error resolving conflict:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve conflict'
    });
  }
};