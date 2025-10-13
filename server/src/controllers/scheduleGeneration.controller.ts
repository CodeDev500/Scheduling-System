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

// Save latest schedule (create or overwrite for department+academicYear+semester+yearLevel)
export const saveLatestSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    // console.log('Received save request:', req.body);
    // If body is an array, treat it as the schedule rows to persist directly.
    const isArrayBody = Array.isArray(req.body);

    // Persist each schedule item as its own row (do not change item shape)
    const subjects: any[] = isArrayBody
      ? (req.body as any[])
      : Array.isArray((req.body as any)?.schedules)
        ? (req.body as any).schedules
        : Array.isArray((req.body as any)?.scheduleData?.subjects)
          ? (req.body as any).scheduleData.subjects
          : [];

    if (!subjects || subjects.length === 0) {
      res.status(400).json({ success: false, message: 'No schedule items provided to save' });
      return;
    }

    // Delete ALL previous subject schedule rows before inserting new ones
    await prisma.subjectSchedule.deleteMany({});

    await prisma.subjectSchedule.createMany({
      data: subjects.map((item: any) => ({
        // keep all data as provided; fall back to empty strings/numbers to satisfy required columns
        sourceId: String(item.id ?? ''),
        subjectId: String(item.subjectId ?? ''),
        subject: String(item.subject ?? item.subjectName ?? ''),
        subjectCode: String(item.subjectCode ?? ''),
        subjectName: String(item.subjectName ?? item.subject ?? ''),
        subjectDescription: item.subjectDescription ?? null,
        faculty: String(item.faculty ?? item.facultyName ?? ''),
        facultyId: String(item.facultyId ?? ''),
        facultyName: String(item.facultyName ?? item.faculty ?? ''),
        room: String(item.room ?? item.roomName ?? ''),
        roomId: String(item.roomId ?? ''),
        roomName: String(item.roomName ?? item.room ?? ''),
        time: String(item.time ?? ''),
        day: String(item.day ?? ''),
        days: item.days ?? null,
        startTime: String(item.startTime ?? ''),
        endTime: String(item.endTime ?? ''),
        semester: String(item.semester ?? ''),
        academicYear: String(item.academicYear ?? ''),
        program: String(item.program ?? ''),
        yearLevel: String(item.yearLevel ?? ''),
        units: Number(item.units ?? 0),
        lec: Number(item.lec ?? 0),
        lab: Number(item.lab ?? 0),
        students: item.students ?? null,
        tags: Array.isArray(item.tags) || typeof item.tags === 'object' ? (item.tags as any) : undefined,
        recommendedFaculty: Array.isArray(item.recommendedFaculty) || typeof item.recommendedFaculty === 'object' ? (item.recommendedFaculty as any) : undefined,
        hasConflict: typeof item.hasConflict === 'boolean' ? item.hasConflict : null,
        status: item.status ?? null,
        conflictType: item.conflictType ?? null,
        department: item.department ?? null,
        curriculumId: item.curriculumId ?? null,
        instructorId: item.instructorId ?? null,
        roomLegacyId: item.roomLegacyId ?? null,
        isActive: typeof item.isActive === 'boolean' ? item.isActive : true,
      })) as any
    });

    res.json({ success: true, data: { deletedPrevious: true, inserted: subjects.length } });
  } catch (error) {
    console.error('Error saving latest schedule:', error);
    res.status(500).json({ success: false, message: 'Failed to save latest schedule' });
  }
};

// Get latest saved schedule for filters
export const getLatestSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { department, academicYear, semester, yearLevel } = req.query as Record<string, string | undefined>;

    if (!department) {
      res.status(400).json({ success: false, message: 'department is required' });
      return;
    }

    const where: any = { department };
    if (academicYear) where.academicYear = academicYear;
    if (semester) where.semester = semester;
    if (yearLevel) where.yearLevel = yearLevel;

    const generation = await prisma.scheduleGeneration.findFirst({
      where,
      orderBy: { createdAt: 'desc' }
    });

    if (!generation) {
      res.status(404).json({ success: false, message: 'No saved schedule found' });
      return;
    }

    let data: any = null;
    try {
      data = generation.scheduleData ? JSON.parse(generation.scheduleData) : null;
    } catch {
      data = generation.scheduleData;
    }

    // Also fetch subject schedule rows stored for this filter
    const items = await prisma.subjectSchedule.findMany({
      where: {
        department,
        academicYear: academicYear ?? undefined,
        semester: semester ?? undefined,
        yearLevel: yearLevel ?? undefined,
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }]
    });

    res.json({ success: true, data: { generation, scheduleData: data, scheduleItems: items } });
  } catch (error) {
    console.error('Error fetching latest schedule:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch latest schedule' });
  }
};

export const getAllSubjectSchedule = async (req: Request, res: Response): Promise<void> => {
  try { 
    const items = await prisma.subjectSchedule.findMany({
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }]
    });
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching all subject schedules:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch all subject schedules' });
  }
};