const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.loginPage = (req, res) => res.render('login', { error: null });
exports.registerPage = (req, res) => res.render('register', { error: null });

exports.loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.render('login', { error: 'Email পাওয়া যায়নি' });

    const user = rows[0];
    if (user.is_blocked) return res.render('login', { error: 'আপনার account block করা হয়েছে' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render('login', { error: 'Password ভুল' });

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    if (user.role === 'admin') return res.redirect('/admin/dashboard');
    res.redirect('/student/dashboard');
  } catch(e) {
    res.render('login', { error: 'কিছু একটা সমস্যা হয়েছে' });
  }
};

exports.registerPost = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.render('register', { error: 'সব field পূরণ করুন' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "student")',
      [name, email, hashed]
    );
    res.redirect('/login');
  } catch(e) {
    res.render('register', { error: 'এই email দিয়ে আগেই account আছে' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};