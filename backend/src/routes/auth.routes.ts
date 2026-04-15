import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { config } from '../config/env';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { userId: user.userId, role: user.role.roleName },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    const { passwordHash, ...userWithoutPassword } = user;

    let doctorId = null;
    if (user.role.roleName === 'DOCTOR') {
      const doctorProfile = await prisma.doctorProfile.findFirst({
        where: { userId: user.userId },
      });
      doctorId = doctorProfile?.doctorId || null;
    }

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        ...userWithoutPassword,
        role: user.role.roleName,
        doctorId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
      include: {
        role: true,
        doctorProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      user: {
        ...userWithoutPassword,
        role: user.role.roleName,
        doctorId: user.doctorProfile?.doctorId || null,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Token tidak valid' });
  }
});

export default router;