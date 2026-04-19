const express = require('express');
const router = express.Router();
const student = require('../controllers/studentController');

const isStudent = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/login');
};

router.get('/dashboard', isStudent, student.dashboard);
router.get('/exam/:id', isStudent, student.examPage);
router.post('/exam/:id/submit', isStudent, student.submitExam);
router.get('/result/:id', isStudent, student.resultPage);
router.get('/leaderboard/:exam_id', isStudent, student.leaderboard);
router.post('/report', isStudent, student.reportQuestion);

module.exports = router;