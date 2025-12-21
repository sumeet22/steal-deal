import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
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

// Address Management
router.post('/:id/addresses', async (req: Request, res: Response) => {
  try {
    const { addressLine1, addressLine2, landmark, city, state, pincode, country, isDefault, type } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.addresses) {
      user.addresses = [] as any;
    }

    // Determine type automatically if not provided, or enforce 'Home' as default
    const addrType = type || 'Home';

    console.log('Received Address Data:', JSON.stringify(req.body, null, 2));

    // If setting as default, first unset all other defaults using atomic update
    if (isDefault) {
      await User.updateOne(
        { _id: req.params.id },
        { $set: { "addresses.$[].isDefault": false } }
      );
    }

    const newAddress = {
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      pincode,
      country,
      isDefault: !!isDefault,
      type: addrType,
      _id: new mongoose.Types.ObjectId() // Generate ID manually for subdocument
    };

    console.log('Attempting Raw Collection Update...');

    // Use raw Mongo driver to bypass Mongoose schema issues
    const updateResult = await User.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $push: { addresses: newAddress } as any }
    );

    console.log('Raw Update Result:', JSON.stringify(updateResult));

    // Fetch again with lean
    const updatedUser: any = await User.collection.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) }, { projection: { password: 0 } });

    if (!updatedUser) {
      console.error('CRITICAL: User found initially but not found after update!');
      return res.status(404).json({ message: 'User not found after update' });
    }

    console.log('Full User Object (Lean):', JSON.stringify(updatedUser, null, 2));

    // @ts-ignore
    res.json(updatedUser.addresses || []);
  } catch (error) {
    console.error('Error adding address:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // @ts-ignore
    if (error.errors) {
      // @ts-ignore
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    res.status(500).json({ message: 'Server error adding address', error });
  }
});

router.get('/:id/addresses', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update Address (e.g. set default)
router.put('/:id/addresses/:addressId', async (req: Request, res: Response) => {
  try {
    const { addressLine1, addressLine2, landmark, city, state, pincode, country, isDefault, type } = req.body;

    console.log(`Updating address ${req.params.addressId} for user ${req.params.id}`);

    // If setting as default, first unset all other defaults
    if (isDefault) {
      await User.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(req.params.id) },
        { $set: { "addresses.$[].isDefault": false } } as any
      );
    }

    // Construct update object
    const updateFields: any = {};
    if (addressLine1 !== undefined) updateFields["addresses.$.addressLine1"] = addressLine1;
    if (addressLine2 !== undefined) updateFields["addresses.$.addressLine2"] = addressLine2;
    if (landmark !== undefined) updateFields["addresses.$.landmark"] = landmark;
    if (city !== undefined) updateFields["addresses.$.city"] = city;
    if (state !== undefined) updateFields["addresses.$.state"] = state;
    if (pincode !== undefined) updateFields["addresses.$.pincode"] = pincode;
    if (country !== undefined) updateFields["addresses.$.country"] = country;
    if (isDefault !== undefined) updateFields["addresses.$.isDefault"] = isDefault;
    if (type !== undefined) updateFields["addresses.$.type"] = type;

    const result = await User.collection.updateOne(
      {
        _id: new mongoose.Types.ObjectId(req.params.id),
        "addresses._id": new mongoose.Types.ObjectId(req.params.addressId)
      },
      { $set: updateFields } as any
    );

    console.log('Update result:', JSON.stringify(result));

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User or Address not found' });
    }

    const updatedUser: any = await User.collection.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) }, { projection: { password: 0 } });
    // @ts-ignore
    res.json(updatedUser?.addresses || []);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

router.delete('/:id/addresses/:addressId', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    (user.addresses as any).pull({ _id: req.params.addressId });
    await user.save();

    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json(updatedUser?.addresses || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;