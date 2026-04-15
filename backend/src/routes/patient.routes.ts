import { Router, Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { patientId: id },
      include: {
        schedules: {
          include: {
            doctor: {
              include: { user: true },
            },
          },
          orderBy: { scheduledStart: 'desc' },
        },
      },
    });
    
    if (!patient) {
      return res.status(404).json({ error: 'Pasien tidak ditemukan' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { fullName, phoneNumber, gender, birthDate, address, diagnosis, medicalRecordNumber } = req.body;

    const patient = await prisma.patient.create({
      data: {
        fullName,
        phoneNumber,
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        address,
        diagnosis,
        medicalRecordNumber,
      },
    });

    res.json(patient);
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, phoneNumber, gender, birthDate, address, diagnosis } = req.body;

    const patient = await prisma.patient.update({
      where: { patientId: id },
      data: {
        fullName,
        phoneNumber,
        gender,
        birthDate: birthDate ? new Date(birthDate) : null,
        address,
        diagnosis,
      },
    });

    res.json(patient);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
});

export default router;