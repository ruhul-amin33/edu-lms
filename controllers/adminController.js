const db = require('../config/db');

exports.dashboard = async (req, res) => {
  const [[{ total_students }]] = await db.query('SELECT COUNT(*) as total_students FROM users WHERE role="student"');
  const [[{ total_courses }]] = await db.query('SELECT COUNT(*) as total_courses FROM courses');
  const [[{ total_exams }]] = await db.query('SELECT COUNT(*) as total_exams FROM exams');
  const [[{ pending_reports }]] = await db.query('SELECT COUNT(*) as pending_reports FROM reports WHERE status="pending"');
  res.render('admin/dashboard', { total_students, total_courses, total_exams, pending_reports });
};

exports.courseList = async (req, res) => {
  const [courses] = await db.query('SELECT * FROM courses ORDER BY created_at DESC');
  res.render('admin/courses', { courses });
};

exports.addCourse = async (req, res) => {
  const { title, description, type, price } = req.body;
  await db.query('INSERT INTO courses (title, description, type, price) VALUES (?, ?, ?, ?)',
    [title, description, type, price || 0]);
  res.redirect('/admin/courses');
};

exports.deleteCourse = async (req, res) => {
  await db.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
  res.redirect('/admin/courses');
};

exports.questionList = async (req, res) => {
  const [exams] = await db.query('SELECT * FROM exams');
  const [questions] = await db.query(`
    SELECT q.*, e.title as exam_title FROM questions q
    JOIN exams e ON q.exam_id = e.id ORDER BY q.id DESC`);
  res.render('admin/questions', { questions, exams });
};

exports.addQuestion = async (req, res) => {
  const { exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;
  await db.query(
    'INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer) VALUES (?,?,?,?,?,?,?)',
    [exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer]
  );
  res.redirect('/admin/questions');
};

exports.studentList = async (req, res) => {
  const [students] = await db.query('SELECT * FROM users WHERE role="student" ORDER BY created_at DESC');
  res.render('admin/students', { students });
};

exports.blockStudent = async (req, res) => {
  const [rows] = await db.query('SELECT is_blocked FROM users WHERE id = ?', [req.params.id]);
  const newStatus = rows[0].is_blocked ? 0 : 1;
  await db.query('UPDATE users SET is_blocked = ? WHERE id = ?', [newStatus, req.params.id]);
  res.redirect('/admin/students');
};

exports.reportList = async (req, res) => {
  const [reports] = await db.query(`
    SELECT r.*, u.name as student_name, q.question_text
    FROM reports r
    JOIN users u ON r.user_id = u.id
    JOIN questions q ON r.question_id = q.id
    ORDER BY r.created_at DESC`);
  res.render('admin/reports', { reports });
};

exports.fixReport = async (req, res) => {
  await db.query('UPDATE reports SET status="fixed" WHERE id = ?', [req.params.id]);
  res.redirect('/admin/reports');
};