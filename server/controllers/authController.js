const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Progress = require('../models/Progress');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Name validation
    if (name.length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters' });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    // Password validation (optional but good)
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role && ['STUDENT', 'INSTRUCTOR'].includes(role) ? role : 'STUDENT'
    });

    // Initialize progress
    await Progress.create({ user: user._id });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    console.log("LOGIN HIT");
    const { email, password } = req.body;
    console.log("LOGIN REQUEST BODY:", req.body);

    if (!email || !password) {
      console.log("LOGIN ERROR: Missing email or password");
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("LOGIN ERROR: Invalid email format");
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    const user = await User.findOne({ email });
    console.log("USER FOUND IN DB:", user ? user.email : "Not Found");

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      user.lastLoginAt = new Date();
      await user.save();

      const token = generateToken(user._id);
      console.log("USER:", user);
      console.log("TOKEN:", token);

      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      console.log("LOGIN ERROR: Invalid email or password match");
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("LOGIN CATCH ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
