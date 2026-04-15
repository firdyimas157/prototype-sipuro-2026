import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Patient {
  patientId: string;
  fullName: string;
  phoneNumber: string;
  diagnosis: string;
  gender: string;
  birthDate: string;
  address: string;
  medicalRecordNumber: string;
}

interface Schedule {
  scheduleId: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
  operationRoom: string;
  notes: string;
  patient: { fullName: string; medicalRecordNumber: string };
  doctor: { user: { fullName: string } };
}

type TabType = 'schedules' | 'patients';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('schedules');
  
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    patientId: '',
    scheduledStart: '',
    scheduledEnd: '',
    operationRoom: '',
    notes: '',
  });

  const [patientForm, setPatientForm] = useState({
    fullName: '',
    phoneNumber: '',
    gender: '',
    birthDate: '',
    address: '',
    diagnosis: '',
    medicalRecordNumber: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesData, patientsData] = await Promise.all([
        api.schedules.getUpcoming(),
        api.patients.getAll(),
      ]);
      setSchedules(schedulesData || []);
      setPatients(patientsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.patients.create(patientForm);
      setShowPatientForm(false);
      setPatientForm({ fullName: '', phoneNumber: '', gender: '', birthDate: '', address: '', diagnosis: '', medicalRecordNumber: '' });
      loadData();
      setActiveTab('patients');
    } catch (error) {
      console.error('Error creating patient:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.doctorId) return;
    try {
      setSaving(true);
      await api.schedules.create({ ...scheduleForm, doctorId: user.doctorId });
      setShowScheduleForm(false);
      setScheduleForm({ patientId: '', scheduledStart: '', scheduledEnd: '', operationRoom: '', notes: '' });
      loadData();
    } catch (error) {
      console.error('Error creating schedule:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirm = async (scheduleId: string) => {
    try {
      await api.schedules.updateStatus(scheduleId, 'CONFIRMED');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleComplete = async (scheduleId: string) => {
    try {
      await api.schedules.updateStatus(scheduleId, 'COMPLETED');
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'WAITING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h2 className="text-2xl font-bold">Dashboard Dokter</h2>
          <p className="text-gray-600">Selamat datang, {user?.fullName}</p>
        </div>
        <Button variant="outline" onClick={loadData}>Segar</Button>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'schedules' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Jadwal Operasi
        </button>
        <button
          onClick={() => setActiveTab('patients')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'patients' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
        >
          Data Pasien
        </button>
      </div>

      {activeTab === 'schedules' && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowScheduleForm(!showScheduleForm)}>
              {showScheduleForm ? 'Batal' : '+ Jadwal Baru'}
            </Button>
          </div>

          {showScheduleForm && (
            <Card>
              <CardHeader><CardTitle>Tambah Jadwal Operasi Baru</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSchedule} className="space-y-4">
                  <div>
                    <Label>Pasien</Label>
                    <Select value={scheduleForm.patientId} onValueChange={(v: string) => setScheduleForm({ ...scheduleForm, patientId: v })}>
                      <SelectTrigger><SelectValue placeholder="Pilih pasien" /></SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.patientId} value={p.patientId}>
                            {p.fullName} - {p.diagnosis || 'Tanpa diagnosis'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Mulai</Label>
                      <Input type="datetime-local" value={scheduleForm.scheduledStart} onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledStart: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Selesai</Label>
                      <Input type="datetime-local" value={scheduleForm.scheduledEnd} onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledEnd: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <Label>Ruang Operasi</Label>
                    <Select value={scheduleForm.operationRoom} onValueChange={(v: string) => setScheduleForm({ ...scheduleForm, operationRoom: v })}>
                      <SelectTrigger><SelectValue placeholder="Pilih ruang" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OK-1">OK-1</SelectItem>
                        <SelectItem value="OK-2">OK-2</SelectItem>
                        <SelectItem value="OK-3">OK-3</SelectItem>
                        <SelectItem value="OK-UGD">OK-UGD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Catatan</Label>
                    <Input placeholder="Catatan..." value={scheduleForm.notes} onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })} />
                  </div>
                  <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Jadwal'}</Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Jadwal Mendatang</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{schedules.length}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Menunggu</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{schedules.filter((s) => s.status === 'WAITING').length}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-600">Dikonfirmasi</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{schedules.filter((s) => s.status === 'CONFIRMED').length}</p></CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Daftar Jadwal Operasi</CardTitle></CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Tidak ada jadwal</p>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.scheduleId} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{schedule.patient?.fullName}</p>
                        <p className="text-sm text-gray-600">{formatDate(schedule.scheduledStart)} • {formatTime(schedule.scheduledStart)} - {formatTime(schedule.scheduledEnd)}</p>
                        <p className="text-sm text-gray-500">Ruang: {schedule.operationRoom}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(schedule.status)}`}>{schedule.status}</span>
                        {schedule.status === 'WAITING' && <Button size="sm" onClick={() => handleConfirm(schedule.scheduleId)}>Konfirmasi</Button>}
                        {schedule.status === 'CONFIRMED' && <Button size="sm" onClick={() => handleComplete(schedule.scheduleId)}>Selesai</Button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'patients' && (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowPatientForm(!showPatientForm)}>
              {showPatientForm ? 'Batal' : '+ Tambah Pasien'}
            </Button>
          </div>

          {showPatientForm && (
            <Card>
              <CardHeader><CardTitle>Tambah Pasien Baru</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePatient} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nama Lengkap</Label>
                      <Input placeholder="Nama pasien" value={patientForm.fullName} onChange={(e) => setPatientForm({ ...patientForm, fullName: e.target.value })} required />
                    </div>
                    <div>
                      <Label>No. Rekam Medis</Label>
                      <Input placeholder="RM (opsional)" value={patientForm.medicalRecordNumber} onChange={(e) => setPatientForm({ ...patientForm, medicalRecordNumber: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>No. Telepon</Label>
                      <Input placeholder="08xxxxxxxxxx" value={patientForm.phoneNumber} onChange={(e) => setPatientForm({ ...patientForm, phoneNumber: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Jenis Kelamin</Label>
                      <Select value={patientForm.gender} onValueChange={(v: string) => setPatientForm({ ...patientForm, gender: v })}>
                        <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                          <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tanggal Lahir</Label>
                      <Input type="date" value={patientForm.birthDate} onChange={(e) => setPatientForm({ ...patientForm, birthDate: e.target.value })} />
                    </div>
                    <div>
                      <Label>Diagnosis</Label>
                      <Input placeholder="Diagnosis awal" value={patientForm.diagnosis} onChange={(e) => setPatientForm({ ...patientForm, diagnosis: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>Alamat</Label>
                    <Input placeholder="Alamat lengkap" value={patientForm.address} onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })} />
                  </div>
                  <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Pasien'}</Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Daftar Pasien</CardTitle></CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Belum ada pasien</p>
              ) : (
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <div key={patient.patientId} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{patient.fullName}</p>
                        <p className="text-sm text-gray-600">{patient.phoneNumber} • {patient.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}</p>
                        <p className="text-sm text-gray-500">RM: {patient.medicalRecordNumber || '-'} • Diagnosis: {patient.diagnosis || '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}