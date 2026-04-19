const db = require('../config/db');

exports.dashboard = async (req, res) => {
  try {
    const [[{ total_students }]] = await db.query('SELECT COUNT(*) as total_students FROM users WHERE role="student"');
    const [[{ total_courses }]] = await db.query('SELECT COUNT(*) as total_courses FROM courses');
    const [[{ total_exams }]] = await db.query('SELECT COUNT(*) as total_exams FROM exams');
    const [[{ pending_reports }]] = await db.query('SELECT COUNT(*) as pending_reports FROM reports WHERE status="pending"');
    res.render('admin/dashboard', { total_students, total_courses, total_exams, pending_reports });
  } catch(e) {
    res.send('Error: ' + e.message);
  }
};

exports.courseList = async (req, res) => {
  try {
    const [courses] = await db.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.render('admin/courses', { courses });
  } catch(e) {
    res.send('Error: ' + e.message);
  }
};

exports.addCourse = async (req, res) => {
  try {
    const { title, description, type, price } = req.body;
    await db.query('INSERT INTO courses (title, description, type, price) VALUES (?, ?, ?, ?)',
      [title, description, type, price || 0]);
    res.redirect('/admin/courses');
  } catch(e) {
    res.send('Error: ' + e.message);
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await db.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
    res.redirect('/admin/courses');
  } catch(e) {
    res.send('Error: ' + e.message);
  }
};

exports.examList = async (req, res) => {
  try {
    const [exams] = await db.query('SELECT e.*, c.title as course_title FROM exams e LEFT JOIN courses c ON e.course_id = c.id ORDER BY e.id DESC');
    const [courses] = await db.query('SELECT * FROM courses');
    res.render('admin/exams', { exams, courses });
  } catch(e) {
    res.send('Error: ' + e.message);
  }
};

exports.addExam = async (req, res) => {
  try {
    const { title, course_id, time_limit, type } = req.body;
    await db.query('INSERT INTO exams (title, course_id, time_limit, type) VALUES (?, ?, ?, ?)',
      [title, course_id, time_limit || 30, type]);
    res.redirect('/admin/exams');
  } catch(e) {
    res.send('Error: ' + e.message);
  }
};

exports.questionList = async (req, res) => {
  try {
    const [exams] = await db.query('SELECT * FROM exams');
    const [questions] = await db.query(
      'SELECT q.*, e.title as exam_title FROM questions q JOIN exams e ON q.exam_id = e.id ORDER BY q.id DESC'
    );
    res.render('admin/questions', { questions, exams });
  } catch(e) {
    res.send('Error: ' + e.message);
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;
    await db.query(
      'INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES (?,?,?,?,?,?,?)',
      [exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer]
    );
    res.redirect('/admin/questions');
  } catch(e) {
    res.send('Error: ' + e.message);
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await db.query('DELETE FROM questions WHERE id = ?', [req.params.id]);
    res.redirect('/admin/questions');
  } catch(e) {
    res.send('Error: ' + e.message);
  }
};

exports.studentList = async (req, res) => {
  try {
    const [students] = await db.query('SELECT * FROM users WHERE role="student" ORDER BY created_at DESC');
    res.render('admin/students', { students });
  } catch(e) {
    res.send('Error: ' + e.message);
  }
};

exports.blockStudent = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT is_blocked FROM users WHERE id = ?', [req.params.id]);
    const newStatus = rows[0].is_blocked ? 0 : 1;
    await db.query('UPDATE users SET is_blocked = ? WHERE id = ?', [newStatus, req.params.id]);
    res.redirect('/admin/students');
  } catch(e) {
    res.send('Error: ' + e.message);
  }
};

exports.reportList = async (req, res) => {
  try {
    const [reports] = await db.query(
      'SELECT r.*, u.name as student_name, q.question_text FROM reports r JOIN users u ON r.user_id = u.id JOIN questions q ON r.question_id = q.id ORDER BY r.created_at DESC'
    );
    res.render('admin/reports', { reports });
  } catch(e) {
    res.send('Error: ' + e.message);
  }
};

exports.fixReport = async (req, res) => {
  try {
    await db.query('UPDATE reports SET status="fixed" WHERE id = ?', [req.params.id]);
    res.redirect('/admin/reports');
  } catch(e) {
    res.send('Error: ' + e.message);
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await db.query('DELETE FROM reports WHERE id = ?', [req.params.id]);
    res.redirect('/admin/reports');
  } catch(e) {
    res.send('Error: ' + e.message);
  }
};
