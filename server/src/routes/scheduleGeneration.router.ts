import { Router } from 'express';
import * as ScheduleGenerationController from '../controllers/scheduleGeneration.controller';
// import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.get('/generate', ScheduleGenerationController.generateSchedule);
router.put('/generation/:id', ScheduleGenerationController.updateScheduleData);

// Save and retrieve latest saved schedules
router.post('/save', ScheduleGenerationController.saveLatestSchedule);
router.get('/latest', ScheduleGenerationController.getLatestSchedule);

// Conflict resolution routes
router.put('/conflict/:id/resolve', ScheduleGenerationController.resolveConflict);

// Return all subject_schedules rows (unfiltered)
router.get('/items', ScheduleGenerationController.getAllSubjectSchedule);

export default router;