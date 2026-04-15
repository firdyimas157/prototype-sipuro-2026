import { Router, Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        patient: true,
        doctor: {
          include: { user: true },
        },
      },
      orderBy: { scheduledStart: 'asc' },
    });
    res.json(schedules);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.get('/today', async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedules = await prisma.schedule.findMany({
      where: {
        scheduledStart: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        patient: true,
        doctor: {
          include: { user: true },
        },
      },
      orderBy: { scheduledStart: 'asc' },
    });
    res.json(schedules);
  } catch (error) {
    console.error('Get today schedules error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const schedules = await prisma.schedule.findMany({
      where: {
        scheduledStart: { gte: now },
        status: { in: ['WAITING', 'CONFIRMED'] },
      },
      include: {
        patient: true,
        doctor: {
          include: { user: true },
        },
      },
      orderBy: { scheduledStart: 'asc' },
      take: 20,
    });
    res.json(schedules);
  } catch (error) {
    console.error('Get upcoming schedules error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, scheduledStart, scheduledEnd, operationRoom, notes, priorityLevel } = req.body;

    const schedule = await prisma.schedule.create({
      data: {
        patientId,
        doctorId,
        createdByUserId: doctorId,
        scheduledStart: new Date(scheduledStart),
        scheduledEnd: new Date(scheduledEnd),
        operationRoom,
        notes,
        priorityLevel: priorityLevel || 'NORMAL',
        status: 'WAITING',
      },
      include: {
        patient: true,
        doctor: {
          include: { user: true },
        },
      },
    });

    res.json(schedule);
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const schedule = await prisma.schedule.update({
      where: { scheduleId: id },
      data: { status },
      include: {
        patient: true,
        doctor: {
          include: { user: true },
        },
      },
    });

    res.json(schedule);
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;