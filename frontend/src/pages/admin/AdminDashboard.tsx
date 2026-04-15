import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Schedule {
  scheduleId: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  operationRoom: string;
  patient: { fullName: string; medicalRecordNumber: string };
  doctor: { user: { fullName: string } };
}

interface Patient {
  patientId: string;
  fullName: string;
  phoneNumber: string;
  diagnosis: string;
  medicalRecordNumber: string;
}

interface Stats {
  totalPatients: number;
  todaySchedules: number;
  waitingCount: number;
  confirmedCount: number;
}

export default function AdminDashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPatients: 0, todaySchedules: 0, waitingCount: 0, confirmedCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesData, patientsData] = await Promise.all([
        api.schedules.getToday(),
        api.patients.getAll(),
      ]);

      const todaySchedules = schedulesData || [];
      const waitingCount = todaySchedules.filter((s: Schedule) => s.status === 'WAITING').length;
      const confirmedCount = todaySchedules.filter((s: Schedule) => s.status === 'CONFIRMED').length;

      setSchedules(todaySchedules);
      setPatients(patientsData || []);
      setStats({
        totalPatients: (patientsData || []).length,
        todaySchedules: todaySchedules.length,
        waitingCount,
        confirmedCount,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'WAITING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Admin</h2>
          <p className="text-gray-600">Kelola jadwal operasi unit urologi</p>
        </div>
        <Button onClick={loadData}>Segar</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pasien</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalPatients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Jadwal Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.todaySchedules}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Menunggu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.waitingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Dikonfirmasi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.confirmedCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Jadwal Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada jadwal hari ini</p>
            ) : (
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <div key={schedule.scheduleId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{schedule.patient?.fullName}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(schedule.scheduledStart)} - {formatDate(schedule.scheduledEnd)}
                      </p>
                      <p className="text-sm text-gray-500">{schedule.doctor?.user?.fullName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(schedule.status)}`}>
                      {schedule.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Pasien</CardTitle>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada pasien</p>
            ) : (
              <div className="space-y-4">
                {patients.slice(0, 5).map((patient) => (
                  <div key={patient.patientId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{patient.fullName}</p>
                      <p className="text-sm text-gray-600">{patient.phoneNumber}</p>
                    </div>
                    <span className="text-sm text-gray-500">{patient.diagnosis || '-'}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}