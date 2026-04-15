import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Schedule {
  scheduleId: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  operationRoom: string;
  diagnosis: string;
  doctor: { user: { fullName: string } };
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const allSchedules = await api.schedules.getAll();
      const mySchedules = (allSchedules || []).filter(
        (s: any) => s.patient?.fullName === user?.fullName || s.patient?.phoneNumber === user?.email
      );
      setSchedules(mySchedules);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Dikonfirmasi';
      case 'WAITING':
        return 'Menunggu';
      case 'COMPLETED':
        return 'Selesai';
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return status;
    }
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
      <div>
        <h2 className="text-2xl font-bold">Dashboard Pasien</h2>
        <p className="text-gray-600">Selamat datang, {user?.fullName}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Jadwal Operasi</CardTitle>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Anda belum memiliki jadwal operasi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule.scheduleId} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-lg">{schedule.diagnosis || 'Operasi'}</p>
                      <p className="text-sm text-gray-600">{schedule.doctor?.user?.fullName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(schedule.status)}`}>
                      {getStatusLabel(schedule.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tanggal</p>
                      <p className="font-medium">{formatDate(schedule.scheduledStart)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Waktu</p>
                      <p className="font-medium">
                        {formatTime(schedule.scheduledStart)} - {formatTime(schedule.scheduledEnd)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ruang Operasi</p>
                      <p className="font-medium">{schedule.operationRoom}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Petunjuk</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>1. Simpan jadwal operasi Anda dengan baik</p>
          <p>2. Datang 30 menit sebelum jadwal operasi</p>
          <p>3. Bring your patient card and identity</p>
          <p>4. Follow fasting instructions from your doctor</p>
        </CardContent>
      </Card>
    </div>
  );
}