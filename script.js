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

// Fungsi pembantu untuk cek kedaluwarsa (8 jam)
function isExpired(meetingDate) {
    const meetingTime = new Date(meetingDate).getTime();
    const currentTime = new Date().getTime();
    const eightHoursInMs = 8 * 60 * 60 * 1000; 

    return (currentTime - meetingTime) > eightHoursInMs;
}

// Fungsi Countdown yang Anda tanyakan
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

    // Sisa kode countdown untuk menghitung selisih waktu
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
    users.push({ usn: 'OSISSMPBM', realName: 'Admin Utama', pass: 'BESTOSISSMPIPBM', role: 'admin', jabatan: 'Admin' });
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
    renderMeetings(); // Menampilkan jadwal (yang sudah di-filter 8 jam)
    updateCountdown(); // Menampilkan hitung mundur rapat terdekat
    generateReport(); // Menyiapkan data laporan (tetap ada meski sudah lewat 8 jam)

    if (currentUser.role === 'admin') {
        renderAdminUserList();
    } else {
        updateUserStats();
    }
    if (currentUser.role === 'admin') {
        renderAdminUserList();
        renderAdminMonitoring(); // <--- Tambahkan pemanggilan ini
    } else {
        updateUserStats();
    }
}

function setupMenuByRole() {
    const adminMenu = document.querySelector('.admin-only');
    if (currentUser.role === 'admin') adminMenu.classList.remove('hidden');
    else adminMenu.classList.add('hidden');
}

// 4. KELOLA AKUN (ADMIN ONLY)
function renderAdminUserList() {
    const container = document.getElementById('admin-user-list');
    if (!container) return;

    container.innerHTML = users.filter(u => u.role !== 'admin').map(u => `
        <tr>
            <td style="padding: 15px 10px;"><strong>${u.realName}</strong></td>
            <td style="padding: 15px 10px;">
                <input type="text" id="usn-edit-${u.usn}" value="${u.usn}" 
                       style="padding: 8px; border-radius: 8px; border: 1px solid #ddd; width: 100%;">
            </td>
            <td style="padding: 15px 10px;">
                <input type="text" id="pass-edit-${u.usn}" value="${u.pass}" 
                       style="padding: 8px; border-radius: 8px; border: 1px solid #ddd; width: 80px;">
            </td>
            <td style="padding: 15px 10px;">
                <button class="btn-primary" style="padding: 8px 15px; font-size: 12px; width: auto;" 
                        onclick="updateAccount('${u.usn}')">Update</button>
            </td>
        </tr>
    `).join('');
}

function updateAccount(oldUsername) {
    const newUsername = document.getElementById(`usn-edit-${oldUsername}`).value.trim().toLowerCase();
    const newPassword = document.getElementById(`pass-edit-${oldUsername}`).value.trim();
    
    if (!newUsername || !newPassword) return alert("Data tidak boleh kosong!");

    const userIndex = users.findIndex(u => u.usn === oldUsername);
    if (userIndex !== -1) {
        // Cek duplikat username
        if (users.some((u, idx) => u.usn === newUsername && idx !== userIndex)) {
            return alert("Username sudah digunakan!");
        }

        users[userIndex].usn = newUsername;
        users[userIndex].pass = newPassword;
        localStorage.setItem('osis_users', JSON.stringify(users));
        alert("Akun berhasil diperbarui!");
        renderAdminUserList();
    }
}

// 5. PENJADWALAN & ABSENSI
function addMeeting() {
    const title = document.getElementById('meeting-title').value;
    const date = document.getElementById('meeting-date').value;
    if (!title || !date) return alert("Lengkapi data!");

    meetings.push({
        id: "RPT-" + Date.now(),
        title, date, absensi: {},
        timestamp: new Date().toLocaleString()
    });
    localStorage.setItem('osis_meetings', JSON.stringify(meetings));
    location.reload();
}

function renderMeetings() {
    const container = document.getElementById('meeting-list');
    if (!container) return;

    // Logika Filter: Hanya ambil rapat yang belum lewat 8 jam dari jam mulainya
    const activeMeetings = meetings.filter(m => {
        const meetingTime = new Date(m.date).getTime();
        const currentTime = new Date().getTime();
        const eightHoursInMs = 8 * 60 * 60 * 1000; 

        // Rapat tetap muncul jika belum lewat 8 jam dari jadwalnya
        return (currentTime - meetingTime) < eightHoursInMs;
    });

    if (activeMeetings.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:#64748b;">Tidak ada jadwal rapat aktif saat ini.</p>';
        return;
    }

    // Yang di-map adalah 'activeMeetings', bukan 'meetings' seluruhnya
    container.innerHTML = activeMeetings.map(m => `
        <div class="card meeting-item-pro" style="border-left: 6px solid #2563eb; margin-bottom:15px; background:white; border-radius:12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:20px;">
                <div>
                    <h4 style="margin:0; font-size:1.1rem;">${m.title}</h4>
                    <p style="margin:5px 0 0 0; color:#64748b; font-size:0.85rem;">📅 ${new Date(m.date).toLocaleString('id-ID')}</p>
                </div>
                <div style="display:flex; gap: 10px;">
                    ${currentUser.role === 'admin' ? 
                        `
                        <button class="btn-absen-modern" onclick="openAbsenModal('${m.id}')">Absen</button>
                        <button class="btn-danger-outline" onclick="deleteMeeting('${m.id}')" title="Hapus Jadwal">🗑️</button>
                        ` : 
                        `<span class="badge Hadir">Aktif</span>`
                    }
                </div>
            </div>
        </div>
    `).join('');
}

function openAbsenModal(id) {
    activeMeetingId = id;
    const meeting = meetings.find(m => m.id === id);
    document.getElementById('modal-meeting-title').innerText = `Absensi: ${meeting.title}`;
    
    document.getElementById('absen-form-list').innerHTML = users.filter(u => u.role !== 'admin').map(u => {
        const prev = meeting.absensi[u.usn] || { status: 'Hadir', ket: '' };
        return `
            <div class="card" style="margin-bottom:10px; padding:10px">
                <strong>${u.realName}</strong>
                <div style="margin-top:10px; display:flex; gap:10px">
                    <select id="status-${u.usn}">
                        <option value="Hadir" ${prev.status === 'Hadir' ? 'selected' : ''}>Hadir</option>
                        <option value="Sakit" ${prev.status === 'Sakit' ? 'selected' : ''}>Sakit</option>
                        <option value="Izin" ${prev.status === 'Izin' ? 'selected' : ''}>Izin</option>
                        <option value="Alpha" ${prev.status === 'Alpha' ? 'selected' : ''}>Alpha</option>
                    </select>
                    <input type="text" id="ket-${u.usn}" placeholder="Ket..." value="${prev.ket}">
                </div>
            </div>
        `;
    }).join('');
    document.getElementById('absen-modal').classList.remove('hidden');
}

function saveAbsensi() {
    const meeting = meetings.find(m => m.id === activeMeetingId);
    
    // 1. Ambil semua input dari modal dan masukkan ke memori (Array meetings)
    users.filter(u => u.role !== 'admin').forEach(u => {
        const statusVal = document.getElementById(`status-${u.usn}`).value;
        const ketVal = document.getElementById(`ket-${u.usn}`).value;
        
        meeting.absensi[u.usn] = {
            status: statusVal,
            ket: ketVal
        };
    });
    
    // 2. Simpan secara permanen ke LocalStorage
    localStorage.setItem('osis_meetings', JSON.stringify(meetings));
    
    // 3. Notifikasi Berhasil
    alert("Absensi berhasil disimpan dan masuk ke laporan!");
    
    // 4. Otomatis perbarui tampilan tabel di halaman Laporan
    generateReport(); 
    
    // 5. Tutup modal
    closeModal();
}

// 6. UTILITAS (TAB, SIDEBAR, EXPORT)
function showTab(name) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-' + name).classList.remove('hidden');
    document.getElementById('tab-title').innerText = name.toUpperCase();
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }
function closeModal() { document.getElementById('absen-modal').classList.add('hidden'); }
function handleLogout() { sessionStorage.clear(); location.reload(); }

function updateCountdown() {
    const now = new Date();
    const future = meetings.filter(m => new Date(m.date) > now).sort((a,b) => new Date(a.date) - new Date(b.date))[0];
    const el = document.getElementById('countdown-timer');
    if (future) {
        const diff = Math.ceil((new Date(future.date) - now) / (1000 * 60 * 60 * 24));
        el.innerHTML = `<strong>${future.title}</strong> dalam ${diff} hari lagi.`;
    } else {
        el.innerText = "Tidak ada rapat terdekat.";
    }
}

function renderUserReport() {
    const tbody = document.getElementById('report-body');
    if (!tbody) return;
    tbody.innerHTML = meetings.map(m => {
        const myAbsen = m.absensi[currentUser.usn] || { status: '-', ket: '-' };
        return `<tr><td>${m.title}</td><td><span class="badge ${myAbsen.status}">${myAbsen.status}</span></td><td>${myAbsen.ket || '-'}</td></tr>`;
    }).join('');
}

function updateUserStats() {
    const attended = meetings.filter(m => m.absensi[currentUser.usn]?.status === 'Hadir').length;
    const percent = meetings.length === 0 ? 0 : Math.round((attended / meetings.length) * 100);
    const bar = document.getElementById('attendance-percent');
    if(bar) { bar.style.width = percent + '%'; bar.innerText = percent + '%'; }

}
function renderAdminMonitoring() {
    const grid = document.getElementById('admin-stats-grid');
    const section = document.getElementById('admin-monitoring-section');
    
    if (!grid || currentUser.role !== 'admin') {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    grid.innerHTML = ""; // Bersihkan grid

    // Loop melalui semua user (kecuali admin sendiri)
    users.filter(u => u.role !== 'admin').forEach(u => {
        let hadir = 0;
        let totalRapat = meetings.length;

        // Hitung kehadiran user ini di semua rapat
        meetings.forEach(m => {
            if (m.absensi[u.usn] && m.absensi[u.usn].status === 'Hadir') {
                hadir++;
            }
        });

        let percent = totalRapat > 0 ? Math.round((hadir / totalRapat) * 100) : 0;
        
        // Tentukan warna berdasarkan persentase
        let color = percent > 70 ? '#22c55e' : (percent > 40 ? '#eab308' : '#ef4444');

        // Buat kartu kecil untuk setiap pengurus
        grid.innerHTML += `
            <div class="card" style="padding: 15px; text-align: center; border-bottom: 4px solid ${color};">
                <div style="font-weight: bold; font-size: 0.9rem; margin-bottom: 10px; height: 40px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    ${u.realName}
                </div>
                <div style="font-size: 1.2rem; font-weight: bold; color: ${color};">
                    ${percent}%
                </div>
                <div style="font-size: 0.7rem; color: #64748b; margin-top: 5px;">
                    ${hadir}/${totalRapat} Pertemuan
                </div>
                <div style="width: 100%; background: #eee; height: 5px; border-radius: 10px; margin-top: 10px;">
                    <div style="width: ${percent}%; background: ${color}; height: 100%; border-radius: 10px;"></div>
                </div>
            </div>
        `;
    });
}
function generateReport() {
    const container = document.getElementById('report-container');
    const btn = document.getElementById('btn-toggle-report');
    if (!container || !btn) return;

    // Logika Buka-Tutup (Toggle)
    if (!container.innerText.includes("Silakan klik tombol")) {
        container.innerHTML = `
            <div class="card" style="text-align: center; color: #64748b; padding: 40px;">
                Silakan klik tombol <strong>Tampilkan Laporan</strong> untuk memuat data absensi.
            </div>`;
        btn.innerHTML = "🔍 Tampilkan Laporan";
        return;
    }

    if (meetings.length === 0) {
        container.innerHTML = `<div class="card" style="padding:20px; text-align:center;">Belum ada jadwal rapat tersedia.</div>`;
        return;
    }

    // Bersihkan kontainer sebelum merender ulang
    container.innerHTML = "";

    // Render KARTU untuk SETIAP rapat
    meetings.forEach(m => {
        let cardHTML = `
            <div class="card shadow-sm" style="border-top: 5px solid var(--primary); background: white; border-radius: 12px; overflow: hidden;">
                <div style="padding: 15px 20px; background: #f8fafc; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin:0; color: var(--primary);">📋 ${m.title}</h4>
                        <small style="color: #64748b;">📅 ${new Date(m.date).toLocaleString('id-ID')}</small>
                    </div>
                    <span class="badge Hadir">Selesai</span>
                </div>
                <div class="table-responsive" style="padding: 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="text-align: left; background: #fff; border-bottom: 2px solid #f1f5f9;">
                                <th style="padding: 12px 20px;">Nama Pengurus</th>
                                <th style="padding: 12px 20px;">Status</th>
                                <th style="padding: 12px 20px;">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>`;

        if (currentUser.role === 'admin') {
            // Admin melihat semua orang di kartu rapat ini
            users.filter(u => u.role !== 'admin').forEach(u => {
                const data = m.absensi[u.usn] || { status: '-', ket: '-' };
                cardHTML += makeRow(u.realName, data);
            });
        } else {
            // User biasa hanya melihat namanya sendiri di kartu rapat ini
            const data = m.absensi[currentUser.usn] || { status: '-', ket: '-' };
            cardHTML += makeRow(currentUser.realName, data);
        }

        cardHTML += `</tbody></table></div></div>`;
        container.innerHTML += cardHTML;
    });

    btn.innerHTML = "❌ Tutup Laporan";
}

// Fungsi bantu untuk membuat baris tabel di dalam kartu
function makeRow(name, data) {
    return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 20px;"><strong>${name}</strong></td>
            <td style="padding: 12px 20px;"><span class="badge ${data.status}">${data.status}</span></td>
            <td style="padding: 12px 20px; color: #64748b;">${data.ket || '-'}</td>
        </tr>`;
}
    // Opsional: Beri notifikasi kecil
    console.log("Laporan absensi berhasil dimuat.");
function exportToExcel() {
    let data = [];
    meetings.forEach(m => {
        users.filter(u => u.role !== 'admin').forEach(u => {
            const a = m.absensi[u.usn] || {status: 'Tanpa Keterangan', ket: '-'};
            data.push({ "Rapat": m.title, "Tanggal": m.date, "Nama": u.realName, "Status": a.status, "Keterangan": a.ket });
        });
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap");
    XLSX.writeFile(wb, "Rekap_OSIS.xlsx");
}
function deleteMeeting(id) {
    // Konfirmasi sebelum menghapus
    if (confirm("Apakah Anda yakin ingin menghapus jadwal ini? Semua data laporan absensi untuk rapat ini akan terhapus permanen!")) {
        
        // 1. Filter rapat: sisihkan rapat yang ID-nya dipilih untuk dihapus
        meetings = meetings.filter(m => m.id !== id);
        
        // 2. Simpan perubahan terbaru ke LocalStorage
        localStorage.setItem('osis_meetings', JSON.stringify(meetings));
        
        // 3. Refresh tampilan jadwal
        renderMeetings();
        
        // 4. Refresh tampilan laporan jika sedang terbuka (agar kartu laporan langsung hilang)
        const container = document.getElementById('report-container');
        if (container && !container.innerText.includes("Silakan klik tombol")) {
            generateReport(); 
        }

        alert("Jadwal dan data absensi berhasil dihapus.");
    }
}
function updateUserStats() {
    if (currentUser.role === 'admin') {
        document.getElementById('user-stats').classList.add('hidden');
        return;
    }

    document.getElementById('user-stats').classList.remove('hidden');

    let counts = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 };
    let totalRapat = meetings.length;

    // Hitung masing-masing status
    meetings.forEach(m => {
        const myAbsen = m.absensi[currentUser.usn];
        if (myAbsen && counts.hasOwnProperty(myAbsen.status)) {
            counts[myAbsen.status]++;
        }
    });

    // Update Angka di UI
    document.getElementById('stat-hadir').innerText = counts.Hadir;
    document.getElementById('stat-izin').innerText = counts.Izin;
    document.getElementById('stat-sakit').innerText = counts.Sakit;
    document.getElementById('stat-alpha').innerText = counts.Alpha;

    // Hitung Persentase (Hadir / Total Rapat)
    let percent = totalRapat > 0 ? Math.round((counts.Hadir / totalRapat) * 100) : 0;
    
    // Update Progress Bar
    const progressBar = document.getElementById('attendance-percent');
    progressBar.style.width = percent + '%';
    progressBar.innerText = percent + '%';
    
    // Warna progress bar (merah jika rendah, hijau jika tinggi)
    progressBar.style.backgroundColor = percent > 70 ? '#22c55e' : (percent > 40 ? '#eab308' : '#ef4444');
}
