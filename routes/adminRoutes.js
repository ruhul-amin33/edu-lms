const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');

const isAdmin = (req, res, next) => {
  if (req.session.user?.role === 'admin') return next();
  res.redirect('/login');
};

router.get('/dashboard', isAdmin, admin.dashboard);
router.get('/courses', isAdmin, admin.courseList);
router.post('/courses/add', isAdmin, admin.addCourse);
router.post('/courses/delete/:id', isAdmin, admin.deleteCourse);
router.get('/questions', isAdmin, admin.questionList);
router.post('/questions/add', isAdmin, admin.addQuestion);
router.get('/students', isAdmin, admin.studentList);
router.post('/students/block/:id', isAdmin, admin.blockStudent);
router.get('/reports', isAdmin, admin.reportList);
router.post('/reports/fix/:id', isAdmin, admin.fixReport);

module.exports = router;