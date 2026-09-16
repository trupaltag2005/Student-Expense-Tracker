import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.ts';
import { AuthenticatedRequest, signToken } from '../middleware/auth.ts';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({ success: false, message: 'All fields are required.' });
      return;
    }

    if (name.trim().length < 2) {
      res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    // Check duplicate email
    const existingUser = db.findUserByEmail(email.trim());
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = db.createUser({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
    });

    const token = signToken(newUser._id, newUser.email);
    const { password: _, ...userData } = newUser;

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = db.findUserByEmail(email.trim());
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = signToken(user._id, user.email);
    const { password: _, ...userData } = user;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }
  res.status(200).json({ success: true, user: req.user });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { name, email } = req.body;
    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Name cannot be empty.' });
      return;
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({ success: false, message: 'A valid email is required.' });
      return;
    }

    // Check if email is used by another user
    const existing = db.findUserByEmail(email.trim());
    if (existing && existing._id !== userId) {
      res.status(409).json({ success: false, message: 'Email is already taken by another account.' });
      return;
    }

    const updated = db.updateUser(userId, { name: name.trim(), email: email.trim() });
    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { password: _, ...userData } = updated;
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: userData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ success: false, message: 'All password fields are required.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: 'New passwords do not match.' });
      return;
    }

    const user = db.findUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    db.updateUser(userId, { password: hashedPassword });

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { password } = req.body;
    if (!password) {
      res.status(400).json({ success: false, message: 'Password is required to confirm account deletion.' });
      return;
    }

    const user = db.findUserById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect password. Account was not deleted.' });
      return;
    }

    db.deleteUser(userId);
    res.status(200).json({ success: true, message: 'Account and associated financial data have been permanently deleted.' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account.' });
  }
};
