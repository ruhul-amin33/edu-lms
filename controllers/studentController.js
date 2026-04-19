const db = require('../config/db');

exports.dashboard = async (req, res) => {
  const [courses] = await db.query('SELECT * FROM courses ORDER BY created_at DESC');
  const [exams] = await db.query('SELECT e.*, c.title as course_title FROM exams e LEFT JOIN courses c ON e.course_id = c.id WHERE e.type="free"');
  const [results] = await db.query(`
    SELECT r.*, e.title as exam_title
    FROM results r
    JOIN exams e ON r.exam_id = e.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC`, [req.session.user.id]);
  res.render('student/dashboard', { courses, exams, results, user: req.session.user });
};

exports.examPage = async (req, res) => {
  const [exams] = await db.query('SELECT * FROM exams WHERE id = ?', [req.params.id]);
  if (!exams.length) return res.redirect('/student/dashboard');
  const exam = exams[0];

  if (exam.type === 'paid') {
    const [payment] = await db.query(
      'SELECT * FROM payments WHERE user_id=? AND course_id=? AND status="approved"',
      [req.session.user.id, exam.course_id]
    );
    if (!payment.length) return res.send('<h2>এই exam টি শুধুমাত্র paid users এর জন্য। <a href="/student/dashboard">ফিরে যাও</a></h2>');
  }

  const [questions] = await db.query(
    'SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE exam_id = ? ORDER BY RAND()',
    [req.params.id]
  );

  if (!questions.length) return res.send('<h2>এই exam এ এখনো কোনো প্রশ্ন নেই। <a href="/student/dashboard">ফিরে যাও</a></h2>');

  res.render('student/exam', { exam, questions });
};

exports.submitExam = async (req, res) => {
  const [questions] = await db.query(
    'SELECT id, correct_answer FROM questions WHERE exam_id = ?',
    [req.params.id]
  );
  let score = 0;
  questions.forEach(q => {
    if (req.body[`q_${q.id}`] === q.correct_answer) score++;
  });
  const total = questions.length;
  const percentage = total > 0 ? ((score / total) * 100).toFixed(2) : 0;

  const [result] = await db.query(
    'INSERT INTO results (user_id, exam_id, score, total, percentage) VALUES (?,?,?,?,?)',
    [req.session.user.id, req.params.id, score, total, percentage]
  );
  res.redirect(`/student/result/${result.insertId}`);
};

exports.resultPage = async (req, res) => {
  const [rows] = await db.query(`
    SELECT r.*, e.title as exam_title
    FROM results r
    JOIN exams e ON r.exam_id = e.id
    WHERE r.id = ? AND r.user_id = ?`,
    [req.params.id, req.session.user.id]
  );
  if (!rows.length) return res.redirect('/student/dashboard');
  res.render('student/result', { result: rows[0] });
};

exports.leaderboard = async (req, res) => {
  const [rows] = await db.query(`
    SELECT u.name, r.score, r.total, r.percentage, r.created_at
    FROM results r
    JOIN users u ON r.user_id = u.id
    WHERE r.exam_id = ?
    ORDER BY r.percentage DESC LIMIT 20`,
    [req.params.exam_id]
  );
  const [exam] = await db.query('SELECT * FROM exams WHERE id = ?', [req.params.exam_id]);
  res.render('student/leaderboard', { rows, exam: exam[0] });
};

exports.reportQuestion = async (req, res) => {
  const { question_id, reason } = req.body;
  await db.query(
    'INSERT INTO reports (user_id, question_id, reason) VALUES (?,?,?)',
    [req.session.user.id, question_id, reason]
  );
  res.json({ success: true });
};