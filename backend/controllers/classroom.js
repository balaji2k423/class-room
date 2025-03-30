import Classroom from '../models/classroom.js';
import User from '../models/auth.js'; // Changed to auth.js to match your file structure
import asyncHandler from 'express-async-handler'; // For error handling

/**
 * @desc    Create a new classroom
 * @route   POST /api/classroom
 * @access  Private (Any authenticated user)
 */
const createClassroom = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    
    // Validate classroom name
    if (!name || name.trim().length < 3) {
      res.status(400);
      throw new Error('Classroom name must be at least 3 characters');
    }
    
    try {
      // Create the classroom
      const classroom = await Classroom.create({
        name: name.trim(),
        description: description ? description.trim() : '',
        creator: req.user.id // From auth middleware
      });
      
      res.status(201).json({
        success: true,
        data: classroom,
        message: 'Classroom created successfully'
      });
    } catch (error) {
      console.error('Error creating classroom:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create classroom'
      });
    }
  });
/**
 * @desc    Get all classrooms
 * @route   GET /api/classroom
 * @access  Private
 */
const getClassrooms = asyncHandler(async (req, res) => {
  // Get classrooms based on user role
  const isAdmin = req.user.isAdmin;
  
  let query = {};
  
  // If not admin, only show classrooms where user is creator or student
  if (!isAdmin) {
    query = {
      $or: [
        { creator: req.user.id },
        { students: req.user.id }
      ],
      isArchived: false // Non-admins don't see archived classes
    };
  }
  
  const classrooms = await Classroom.find(query)
    .populate('creator', 'name email')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: classrooms.length,
    data: classrooms
  });
});

/**
 * @desc    Get single classroom by ID
 * @route   GET /api/classroom/:id
 * @access  Private
 */
const getClassroomById = asyncHandler(async (req, res) => {
  const classroom = await Classroom.findById(req.params.id)
    .populate('creator', 'name email')
    .populate('students', 'name email');
  
  if (!classroom) {
    res.status(404);
    throw new Error('Classroom not found');
  }
  
  // Check if user has access to this classroom
  const isCreator = classroom.creator._id.toString() === req.user.id;
  const isStudent = classroom.students.some(student => 
    student._id.toString() === req.user.id
  );
  
  if (!req.user.isAdmin && !isCreator && !isStudent && classroom.isArchived) {
    res.status(403);
    throw new Error('You do not have permission to access this classroom');
  }
  
  res.status(200).json({
    success: true,
    data: classroom
  });
});

/**
 * @desc    Join a classroom by code
 * @route   POST /api/classroom/join
 * @access  Private
 */
const joinClassroom = asyncHandler(async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    res.status(400);
    throw new Error('Classroom code is required');
  }
  
  // Find classroom by code
  const classroom = await Classroom.findOne({ code, isArchived: false });
  
  if (!classroom) {
    res.status(404);
    throw new Error('Invalid classroom code or classroom has been archived');
  }
  
  // Check if user is already in the classroom
  if (classroom.students.includes(req.user.id)) {
    res.status(400);
    throw new Error('You are already a member of this classroom');
  }
  
  // Add user to classroom
  classroom.students.push(req.user.id);
  await classroom.save();
  
  res.status(200).json({
    success: true,
    message: 'Successfully joined classroom',
    data: {
      classroom: classroom._id,
      name: classroom.name
    }
  });
});

/**
 * @desc    Archive a classroom (admin only)
 * @route   PUT /api/classroom/:id/archive
 * @access  Private (Admin only)
 */
const archiveClassroom = asyncHandler(async (req, res) => {
  const classroom = await Classroom.findById(req.params.id);
  
  if (!classroom) {
    res.status(404);
    throw new Error('Classroom not found');
  }
  
  // Only creator or admin can archive
  if (!req.user.isAdmin && classroom.creator.toString() !== req.user.id) {
    res.status(403);
    throw new Error('You do not have permission to archive this classroom');
  }
  
  classroom.isArchived = true;
  await classroom.save();
  
  res.status(200).json({
    success: true,
    message: 'Classroom archived successfully'
  });
});

export {
  createClassroom,
  getClassrooms,
  getClassroomById,
  joinClassroom,
  archiveClassroom
};