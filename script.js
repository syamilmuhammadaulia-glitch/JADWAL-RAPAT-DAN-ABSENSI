// 1. DATA MASTER PENGURUS
const daftarPengurus = [
    { n: "Asykar Munadhil Syabib Irnowo", j: "Ketua BEST OSIS" },
    { n: "Ikhsan Ramadhan Kusnadi", j: "Wakil ketua BEST OSIS" },
    { n: "Hafidzah Bequina Aghniya A.", j: "Sekretaris" },
    { n: "Lulu Fatin Nabila", j: "Bendahara" },
    { n: "Kayla Azka Shazia Wibowo", j: "Mentri Dept. Humas" },
    { n: "Kayyasa Syalabiyyah Purnomosidi", j: "Wakil Mentri Dept. Humas" },
    { n: "Athaya Zahratus Silmi", j: "Anggota" },
    { n: "Alleira Aydina Nadifa S.", j: "Anggota" },
    { n: "Tsabita Nur Azizah", j: "Anggota" },
    { n: "Kirania Maiza", j: "Mentri Dept. Disorkes" },
    { n: "Shakila Hana Azzahra", j: "Anggota" },
    { n: "Almira Qanita Farzani Wakhid", j: "Anggota" },
    { n: "Dimarsyah Daanish Hafiz", j: "Anggota" },
    { n: "Muhammad Razka Thariq A.", j: "Anggota" },
    { n: "Muhammad Ichigo Ararie Putra", j: "Mentri Dept. SABDA" },
    { n: "Alya Ulfa", j: "Wakil Mentri Dept. SABDA" },
    { n: "Sahla Abira Syufie", j: "Anggota" },
    { n: "Aruni Khaira Sabila", j: "Anggota" },
    { n: "Dastian Al Qassimy", j: "Anggota" },
    { n: "Muhammad Roffiq musaffa", j: "Mentri Dept. Agama" },
    { n: "Mazaya Nairuwa A.", j: "Wakil Mentri Dept. Agama" },
    { n: "Hafy Aydin Ramaputra", j: "Anggota" },
    { n: "Arkaan Raffaizaz A.", j: "Anggota" },
    { n: "Arfa Syazia Bisyri", j: "Anggota" },
    { n: "Muhammad Zuhair Asyraf", j: "Mentri Dept. Lingkup" },
    { n: "Atiqah Fauziyah Rahma", j: "Wakil Mentri Dept. Lingkup" },
    { n: "Arvina Andya Putri", j: "Anggota" },
    { n: "Annisa Mutmainah Arifin", j: "Anggota" },
    { n: "Ibamez Arsyad Zamzami", j: "Anggota" },
    { n: "Almarzuq Ramadhan Qoimudin", j: "Mentri Dept. IPTEK" },
    { n: "Fairuz Azzahra M", j: "Wakil Mentri Dept. IPTEK" },
    { n: "Devdan Abyaz Rasyad", j: "Anggota" },
    { n: "Intan Fitri Mahrizal", j: "Anggota" },
    { n: "Safira Azkadina Ardiyanti", j: "Anggota" }
];

// 2. STATE MANAGEMENT
let users = JSON.parse(localStorage.getItem('osis_users')) || [];
let meetings = JSON.parse(localStorage.getItem('osis_meetings')) || [];
let currentUser = JSON.parse(sessionStorage.getItem('user_session')) || null;
let activeMeetingId = null;

// Inisialisasi User jika storage kosong
if (users.length === 0) {
    daftarPengurus.forEach((p, index) => {
        let id = (index + 1).toString().padStart(3, '0');
        users.push({
            usn: p.n.toLowerCase().replace(/\s+/g, ''),
            realName: p.n,
            pass: id,
            role: 'pengurus',
            jabatan: p.j
        });
    });
    users.push({ usn: 'osissmpbm', realName: 'Admin Utama', pass: 'BESTOSISSMPIPBM', role: 'admin', jabatan: 'Admin' });
    localStorage.setItem('osis_users', JSON.stringify(users));
}

// 3. CORE FUNCTIONS (LOGIN & DASHBOARD)
window.onload = () => {
    if (currentUser) showDashboard();
};

function handleLogin() {
    const usnInput = document.getElementById('username').value.trim().toLowerCase();
    const passInput = document.getElementById('password').value.trim();
    const user = users.find(u => u.usn === usnInput && u.pass === passInput);

    if (user) {
        sessionStorage.setItem('user_session', JSON.stringify(user));
        location.reload(); 
    } else {
        document.getElementById('login-error').innerText = "Username/Password Salah!";
    }
}

function showDashboard() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('main-page').classList.remove('hidden');
    document.getElementById('welcome-text').innerText = `Halo, ${currentUser.realName}`;
    
    setupMenuByRole();
    renderMeetings();
    updateCountdown();
    
    if (currentUser.role === 'admin') {
        renderAdminUserList();
        renderAdminMonitoring();
        if(document.getElementById('user-stats')) document.getElementById('user-stats').classList.add('hidden');
    } else {
        updateUserStats();
        if(document.getElementById('admin-monitoring-section')) document.getElementById('admin-monitoring-section').classList.add('hidden');
    }
}

function setupMenuByRole() {
    const adminMenu = document.querySelector('.admin-only');
    if (currentUser.role === 'admin') adminMenu.classList.remove('hidden');
    else adminMenu.classList.add('hidden');
}

// 4. LOGIKA WAKTU & COUNTDOWN
function isExpired(meetingDate) {
    const meetingTime = new Date(meetingDate).getTime();
    const currentTime = new Date().getTime();
    const eightHoursInMs = 8 * 60 * 60 * 1000; 
    return (currentTime - meetingTime) > eightHoursInMs;
}

function updateCountdown() {
    const upcoming = meetings
        .filter(m => !isExpired(m.date))
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

    const timerElement = document.getElementById('countdown-timer');
    if (!timerElement) return;

    if (!upcoming) {
        timerElement.innerText = "Tidak ada rapat dalam waktu dekat.";
        return;
    }

    const target = new Date(upcoming.date).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
        timerElement.innerText = `Sedang Berlangsung: ${upcoming.title}`;
    } else {
        const jam = Math.floor(diff / (1000 * 60 * 60));
        const menit = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        timerElement.innerText = `${upcoming.title} dalam ${jam}j ${menit}m`;
    }
}

// 5. ABSENSI & JADWAL
function renderMeetings() {
    const container = document.getElementById('meeting-list');
    if (!container) return;

    const activeMeetings = meetings.filter(m => !isExpired(m.date));

    if (activeMeetings.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:#64748b;">Tidak ada jadwal rapat aktif.</p>';
        return;
    }

    container.innerHTML = activeMeetings.map(m => `
        <div class="card meeting-item-pro" style="border-left: 6px solid #2563eb; margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:20px;">
                <div>
                    <h4 style="margin:0;">${m.title}</h4>
                    <p style="margin:5px 0 0 0; color:#64748b; font-size:0.85rem;">📅 ${new Date(m.date).toLocaleString('id-ID')}</p>
                </div>
                <div style="display:flex; gap: 10px;">
                    ${currentUser.role === 'admin' ? 
                        `<button class="btn-absen-modern" onclick="openAbsenModal('${m.id}')">Absen</button>
                         <button class="btn-danger-outline" onclick="deleteMeeting('${m.id}')">🗑️</button>` : 
                        `<span class="badge Hadir">Aktif</span>`
                    }
                </div>
            </div>
        </div>
    `).join('');
}

// 6. LAPORAN & MONITORING
function generateReport() {
    const container = document.getElementById('report-container');
    const btn = document.getElementById('btn-toggle-report');
    if (!container || !btn) return;

    if (!container.innerText.includes("Silakan klik tombol")) {
        container.innerHTML = `<div class="card" style="text-align: center; color: #64748b; padding: 40px;">Silakan klik tombol <strong>Tampilkan Laporan</strong></div>`;
        btn.innerHTML = "🔍 Tampilkan Laporan";
        return;
    }

    if (meetings.length === 0) {
        container.innerHTML = `<div class="card" style="padding:20px; text-align:center;">Belum ada data.</div>`;
        return;
    }

    container.innerHTML = meetings.slice().reverse().map(m => `
        <div class="card shadow-sm" style="margin-bottom:20px; border-top: 5px solid var(--primary);">
            <div style="padding: 15px; background: #f8fafc; display:flex; justify-content:space-between;">
                <div><strong>📋 ${m.title}</strong><br><small>${new Date(m.date).toLocaleString('id-ID')}</small></div>
                <span class="badge Hadir">Selesai</span>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                    ${currentUser.role === 'admin' ? 
                        users.filter(u => u.role !== 'admin').map(u => makeRow(u.realName, m.absensi[u.usn] || {status:'-', ket:'-'})).join('') :
                        makeRow(currentUser.realName, m.absensi[currentUser.usn] || {status:'-', ket:'-'})
                    }
                </tbody>
            </table>
        </div>
    `).join('');
    btn.innerHTML = "❌ Tutup Laporan";
}

function makeRow(name, data) {
    return `<tr style="border-bottom: 1px solid #eee;">
                <td style="padding:10px;">${name}</td>
                <td><span class="badge ${data.status}">${data.status}</span></td>
                <td style="color:#64748b; font-size:0.8rem;">${data.ket || '-'}</td>
            </tr>`;
}

function renderAdminMonitoring() {
    const grid = document.getElementById('admin-stats-grid');
    if (!grid || currentUser.role !== 'admin') return;

    grid.innerHTML = users.filter(u => u.role !== 'admin').map(u => {
        let hadir = meetings.filter(m => m.absensi[u.usn]?.status === 'Hadir').length;
        let percent = meetings.length > 0 ? Math.round((hadir / meetings.length) * 100) : 0;
        let color = percent > 70 ? '#22c55e' : (percent > 40 ? '#eab308' : '#ef4444');
        return `
            <div class="card" style="padding: 15px; text-align: center; border-bottom: 4px solid ${color};">
                <div style="font-weight: bold; font-size: 0.8rem; height: 35px; overflow: hidden;">${u.realName}</div>
                <div style="font-size: 1.2rem; font-weight: bold; color: ${color};">${percent}%</div>
                <div style="font-size: 0.6rem; color: #64748b;">${hadir}/${meetings.length} Hadir</div>
            </div>`;
    }).join('');
}

function updateUserStats() {
    let counts = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 };
    meetings.forEach(m => {
        const s = m.absensi[currentUser.usn]?.status;
        if (counts.hasOwnProperty(s)) counts[s]++;
    });

    document.getElementById('stat-hadir').innerText = counts.Hadir;
    document.getElementById('stat-izin').innerText = counts.Izin;
    document.getElementById('stat-sakit').innerText = counts.Sakit;
    document.getElementById('stat-alpha').innerText = counts.Alpha;

    let percent = meetings.length > 0 ? Math.round((counts.Hadir / meetings.length) * 100) : 0;
    const bar = document.getElementById('attendance-percent');
    if(bar) {
        bar.style.width = percent + '%';
        bar.innerText = percent + '%';
        bar.style.backgroundColor = percent > 70 ? '#22c55e' : (percent > 40 ? '#eab308' : '#ef4444');
    }
}

// 7. UTILS & OTHERS
function openAbsenModal(id) {
    activeMeetingId = id;
    const meeting = meetings.find(m => m.id === id);
    document.getElementById('modal-meeting-title').innerText = `Absensi: ${meeting.title}`;
    document.getElementById('absen-form-list').innerHTML = users.filter(u => u.role !== 'admin').map(u => {
        const prev = meeting.absensi[u.usn] || { status: 'Hadir', ket: '' };
        return `<div class="card" style="margin-bottom:10px; padding:10px">
                    <strong>${u.realName}</strong>
                    <div style="margin-top:10px; display:flex; gap:10px">
                        <select id="status-${u.usn}">
                            <option value="Hadir" ${prev.status === 'Hadir'?'selected':''}>Hadir</option>
                            <option value="Sakit" ${prev.status === 'Sakit'?'selected':''}>Sakit</option>
                            <option value="Izin" ${prev.status === 'Izin'?'selected':''}>Izin</option>
                            <option value="Alpha" ${prev.status === 'Alpha'?'selected':''}>Alpha</option>
                        </select>
                        <input type="text" id="ket-${u.usn}" placeholder="Ket..." value="${prev.ket}">
                    </div>
                </div>`;
    }).join('');
    document.getElementById('absen-modal').classList.remove('hidden');
}

function saveAbsensi() {
    const meeting = meetings.find(m => m.id === activeMeetingId);
    users.filter(u => u.role !== 'admin').forEach(u => {
        meeting.absensi[u.usn] = {
            status: document.getElementById(`status-${u.usn}`).value,
            ket: document.getElementById(`ket-${u.usn}`).value
        };
    });
    localStorage.setItem('osis_meetings', JSON.stringify(meetings));
    alert("Absensi disimpan!");
    closeModal();
    if(currentUser.role === 'admin') renderAdminMonitoring();
}

function deleteMeeting(id) {
    if (confirm("Hapus jadwal dan laporan ini?")) {
        meetings = meetings.filter(m => m.id !== id);
        localStorage.setItem('osis_meetings', JSON.stringify(meetings));
        renderMeetings();
        if(currentUser.role === 'admin') renderAdminMonitoring();
    }
}

function showTab(name) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-' + name).classList.remove('hidden');
    document.getElementById('tab-title').innerText = name.toUpperCase();
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }
function closeModal() { document.getElementById('absen-modal').classList.add('hidden'); }
function handleLogout() { sessionStorage.clear(); location.reload(); }

// Update Realtime
setInterval(() => {
    updateCountdown();
    if (!document.getElementById('main-page').classList.contains('hidden')) renderMeetings();
}, 60000);
