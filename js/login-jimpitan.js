import { supabase } from "./supabase.js";

// ================= GUARD =================
if (!localStorage.getItem("device_id")) {
  location.href = "index.html";
}

const device_id = localStorage.getItem("device_id");

// ================= DEVELOPMENT =================
const DEV_MODE = true;

console.log("DEV MODE =", DEV_MODE);
console.log("login-jimpitan.js terbaru berhasil dimuat");

// ================= ELEMENT =================
const loginForm = document.getElementById("loginForm");
const btnMasuk = document.getElementById("btnMasuk");
const status = document.getElementById("status");

// ================= DROPDOWN =================
let selectedGrup = "";
let selectedNama = "";

const grupDropdown = document.getElementById("grupDropdown");
const grupSelected = grupDropdown.querySelector(".dropdown-selected");
const grupList = grupDropdown.querySelector(".dropdown-list");

const namaDropdown = document.getElementById("namaDropdown");
const namaSelected = namaDropdown.querySelector(".dropdown-selected");
const namaList = namaDropdown.querySelector(".dropdown-list");

// ================= TIME =================
function getWIB() {
  const now = new Date();
  const wib = now.toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" });
  const [date, time] = wib.split(" ");
  return { date, time };
}

function getTanggal() {
  const { date, time } = getWIB();

  let [y, m, d] = date.split("-");
  const hour = parseInt(time.split(":")[0]);

  if (hour < 9) {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - 1);

    y = prev.getFullYear();
    m = String(prev.getMonth() + 1).padStart(2, "0");
    d = String(prev.getDate()).padStart(2, "0");
  }

  return `${y}-${m}-${d}`;
}


// ================= JAM =================

function isJamBuka() {
  const now = new Date();
  const wib = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const hour = wib.getHours();

  return (hour >= 6 || hour < 5);
}


// ================= LOCK =================
function showLock(title, desc) {
  document.body.innerHTML = `
    <div class="lock-page">
      
      <div class="lock-content">

        <!-- ICON -->
        <img src="assets/icons/loader.svg" class="lock-icon" />

        <!-- TITLE -->
        <h2>${title}</h2>

        <!-- DESC -->
        <p class="desc">${desc}</p>

        <!-- COUNTDOWN -->
        <div id="countdown" class="countdown"></div>

        <!-- ATAU -->
        <div class="divider">
          <span>ATAU</span>
        </div>

        <!-- INFO -->
        <p class="info">
          Anda juga bisa lihat halaman dibawah ini
        </p>

        <!-- BUTTON -->
        <button class="btn-alt" onclick="location.href='laporan.html'">
          Laporan Keuangan
        </button>

      </div>

    </div>
  `;
}

function getNextJamBuka() {
  const now = new Date();
  const target = new Date();

  target.setHours(6, 0, 0, 0);

  if (now.getHours() >= 6) {
    target.setDate(target.getDate() + 1);
  }

  return target;
}

function startCountdown() {
  const el = document.getElementById("countdown");

  setInterval(() => {
    const now = new Date();
    const diff = getNextJamBuka() - now;

    const h = Math.floor(diff / 1000 / 60 / 60);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);

    el.textContent =
      `${String(h).padStart(2,"0")}:` +
      `${String(m).padStart(2,"0")}:` +
      `${String(s).padStart(2,"0")}`;
  }, 1000);
}

// ================= SYSTEM CHECK =================
(async () => {

  /*
  console.log("isJamBuka =", isJamBuka());

  const { data } = await supabase
    .from("session_jimpitan")
    .select("*")
    .eq("tanggal", getTanggal())
    .maybeSingle();

  // ================= PRODUCTION MODE =================
  if (!DEV_MODE) {

    // Belum jam buka
    if (!isJamBuka()) {
      showLock("Belum Waktunya", "Audit dibuka jam 06:00 - 03:00");
      startCountdown();
      return;
    }

    // Audit sudah ditutup
    if (data?.status === "closed") {
      showLock("Audit Selesai", "Data hari ini sudah dikunci");
      return;
    }

    // Sedang dipakai device lain
    if (data && data.device_id !== device_id) {
      showLock(
        "Sedang Audit",
        `Grup ${data.grup} - ${data.petugas}`
      );
      return;
    }

  }
  */

  // Langsung tampilkan form login
  loginForm.classList.remove("hidden");

})();

// ================= DATA GRUP =================
const grupData = [
  "Grup 1","Grup 2","Grup 3","Grup 4",
  "Grup 5","Grup 6","Grup 7","Grup 8"
];

// isi dropdown grup
grupData.forEach(g => {
  const item = document.createElement("div");
  item.className = "dropdown-item";
  item.textContent = g;

  item.onclick = () => {
    selectedGrup = g;
    grupSelected.textContent = g;
    grupSelected.classList.add("active");
    grupDropdown.classList.remove("open");

    loadNama(g);
  };

  grupList.appendChild(item);
});

// ================= TOGGLE =================
grupSelected.onclick = () => {
  grupDropdown.classList.toggle("open");
};

namaSelected.onclick = () => {
  namaDropdown.classList.toggle("open");
};

document.addEventListener("click", (e) => {
  if (!grupDropdown.contains(e.target)) {
    grupDropdown.classList.remove("open");
  }
  if (!namaDropdown.contains(e.target)) {
    namaDropdown.classList.remove("open");
  }
});

// ================= LOAD NAMA =================
async function loadNama(grup) {
  namaList.innerHTML = "Loading...";

  const { data } = await supabase
    .from("petugas_jimpitan")
    .select("*")
    .eq("grup", grup)
    .order("nama", { ascending: true });

  namaList.innerHTML = "";

  (data || [])
    .filter(p => p.nama !== "-")
    .forEach(p => {
      const item = document.createElement("div");
      item.className = "dropdown-item";
      item.textContent = p.nama;

      item.onclick = () => {
        selectedNama = p.nama;
        namaSelected.textContent = p.nama;
        namaSelected.classList.add("active");
        namaDropdown.classList.remove("open");
      };

      namaList.appendChild(item);
    });
}

// ================= MASUK =================
btnMasuk.onclick = async () => {

  const grup = selectedGrup;
  const nama = selectedNama;

  if (!grup || !nama) {
    status.textContent = "⚠️ Pilih grup & nama dulu";
    return;
  }

  btnMasuk.disabled = true;
  btnMasuk.textContent = "Memproses...";

  try {
    await supabase.from("session_jimpitan").upsert({
      tanggal: getTanggal(),
      device_id,
      grup,
      petugas: nama,
      status: "open",
      updated_at: new Date().toISOString()
    }, { onConflict: "tanggal" });

    localStorage.setItem("grup", grup);
    localStorage.setItem("petugas", nama);

    location.replace("catatan.html");

  } catch (err) {
    status.textContent = "❌ Terjadi error";
  } finally {
    btnMasuk.disabled = false;
    btnMasuk.textContent = "Masuk";
  }
};
