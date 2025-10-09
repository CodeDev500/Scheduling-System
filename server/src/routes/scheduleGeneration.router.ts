import { Router } from 'express';
import * as ScheduleGenerationController from '../controllers/scheduleGeneration.controller';
// import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Apply authentication middleware to all routes
// router.use(verifyToken);

// Constraint management routes
router.get('/constraints/:department', ScheduleGenerationController.getConstraints);
router.post('/constraints', ScheduleGenerationController.createConstraint);

// Preference management routes
router.get('/preferences/:department', ScheduleGenerationController.getPreferences);
router.put('/preferences/:department', ScheduleGenerationController.updatePreferences);

// Schedule generation routes
router.post('/generate', ScheduleGenerationController.generateSchedule);
router.get('/history/:department', ScheduleGenerationController.getGenerationHistory);
router.get('/generation/:id', ScheduleGenerationController.getGeneration);
router.put('/generation/:id', ScheduleGenerationController.updateScheduleData);

// Save and retrieve latest saved schedules
router.post('/save', ScheduleGenerationController.saveLatestSchedule);
router.get('/latest', ScheduleGenerationController.getLatestSchedule);

// Conflict resolution routes
router.put('/conflict/:id/resolve', ScheduleGenerationController.resolveConflict);

// Return all subject_schedules rows (unfiltered)
router.get('/items', ScheduleGenerationController.getAllSubjectSchedule);

export default router;