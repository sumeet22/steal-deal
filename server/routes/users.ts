import express, { Request, Response } from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, isBanned } = req.body;
    if (!name || !email || !password || !phone) return res.status(400).json({ message: 'Missing required fields' });
    const existing = await User.findOne({ $or: [{ email }] });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const user = new User({ name, email, password, phone, role: role || 'user', isBanned: isBanned || false });
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role, isBanned } = req.body;
    const updateFields: any = { updatedAt: new Date() };
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (phone !== undefined) updateFields.phone = phone;
    if (role !== undefined) updateFields.role = role;
    if (isBanned !== undefined) updateFields.isBanned = isBanned;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Ban / Unban user
router.post('/:id/ban', async (req: Request, res: Response) => {
  try {
    const { ban } = req.body; // boolean
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: !!ban, updatedAt: new Date() }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;