import express from 'express';
const router = express.Router();
import { 
  createClassroom, 
  getClassrooms, 
  getClassroomById,
  joinClassroom,
  archiveClassroom
} from '../controllers/classroom.js';
import { protect, adminOnly } from '../middleware/auth.js';

// Base route: /api/classroom
router.route('/')
  .post(protect, createClassroom)  // Allow any authenticated user to create classrooms
  .get(protect, getClassrooms);    // Get all classrooms

// Join classroom by code
router.route('/join')
  .post(protect, joinClassroom);

// Get, update, delete specific classroom
router.route('/:id')
  .get(protect, getClassroomById);

// Archive classroom
router.route('/:id/archive')
  .put(protect, archiveClassroom);

export default router;