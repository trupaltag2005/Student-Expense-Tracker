import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserDocument } from '../config/db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'expense_tracker_secret_key_change_in_production_2025';

export interface AuthenticatedRequest extends Request {
  user?: Omit<UserDocument, 'password'>;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = db.findUserById(decoded.id);

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid or expired session. User not found.' });
      return;
    }

    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
    return;
  }
};

export const signToken = (userId: string, email: string): string => {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });
};
