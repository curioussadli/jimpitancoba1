import { supabase } from "./supabase.js";

// ================= GUARD =================
if (!localStorage.getItem("device_id")) {
  localStorage.setItem("device_id", crypto.randomUUID());
}

const device_id = localStorage.getItem("device_id");


if (!localStorage.getItem("grup") || !localStorage.getItem("petugas")) {
  location.href = "login-jimpitan.html";
}


const grup = localStorage.getItem("grup");
const petugas = localStorage.getItem("petugas");

console.log("LOGIN:", grup, petugas);




console.log("CATATAN WHATSAPP FINAL FIXED");

// ================= UTIL =================
const formatRupiah = (n = 0) => n.toLocaleString("id-ID");

// ================= CONSTANT =================
const TARIF = 500;

// ================= STATE =================
const state = {
  warga: [],
  input: {},
  total: {},
  jam: {},
    updatedAt: {}, // ⬅️ tambahin
  filter: "all",
  active: null,
  lastScrollId: null,
  lastUpdatedId: null, // ⬅️ baru
};

// ================= DOM =================
const el = {
  list: document.getElementById("listWarga"),
  search: document.getElementById("searchInput"),

  sidebar: document.getElementById("sidebar"),
  overlay: document.getElementById("overlay"),
  btnMenu: document.getElementById("btnMenu"),

  badge: document.getElementById("filterBadge"),
  badgeText: document.getElementById("filterText"),
  badgeIcon: document.getElementById("filterIcon"),

  // DETAIL
  detailPage: document.getElementById("detailPage"),
  detailId: document.getElementById("detailId"),
  detailNama: document.getElementById("detailNama"),
  detailNamaBig: document.getElementById("detailNamaBig"),
  detailValue: document.getElementById("detailValue"),

  minus: document.getElementById("minus"),
  plus: document.getElementById("plus"),
  save: document.getElementById("saveBtn"),
  back: document.getElementById("btnBack"),
};


// ================= SESSION =================
async function lockAudit() {
  await supabase
    .from("session_jimpitan")
    .update({ status: "closed" })
    .eq("tanggal", getTanggal());
}

const lockScreen = document.getElementById("lockScreen");

function isJamBuka() {
  const now = new Date();
  const wib = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const hour = wib.getHours();

  return (hour >= 6 || hour < 3);
}

function showLock(title, desc) {
  document.getElementById("lockTitle").textContent = title;
  document.getElementById("lockDesc").textContent = desc;

  lockScreen.classList.remove("hidden");

  // 🔥 sembunyikan app
  document.querySelector("main").style.display = "none";
}



// ================= TIME =================
function getWIB() {
  const now = new Date();
  const wib = now.toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" });
  const [date, time] = wib.split(" ");
  return { date, time, full: `${date} ${time.slice(0, 5)}` };
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
















const clearBtn = document.getElementById("clearSearch");

// kontrol animasi tombol X
function updateClearButton() {
  if (el.search.value) {
    clearBtn.classList.add("show");
  } else {
    clearBtn.classList.remove("show");
  }
}

// klik X
clearBtn.onclick = () => {
  el.search.value = "";
  render();
  updateClearButton();
};



// awal load
updateClearButton();


// ================= ICON =================
function getIcon(nama) {
  const total = state.total[nama];
  if (total == null) return "circle-alert.svg";
  if (total === 0) return "circle-x.svg";
  return "circle-check.svg";
}

// ================= FILTER =================
function filterData(list) {
  const f = state.filter;

  const getVal = (w) => state.total[w.nama];

  if (f === "all") return list;

  // ❗ BELUM INPUT = NULL
  if (f === "alert") {
    return list.filter(w => getVal(w) == null);
  }

  // ❗ SUDAH INPUT TAPI 0
  if (f === "zero") {
    return list.filter(w => getVal(w) !== null && getVal(w) === 0);
  }

  // ❗ SUDAH BAYAR (>0)
  if (f === "done") {
    return list.filter(w => getVal(w) > 0);
  }

  return list;
}

// ================= FILTER UI =================
function updateFilterUI() {
  if (!el.badge) return;

  if (state.filter === "all") {
    el.badge.classList.remove("show");
    return;
  }

  el.badge.classList.add("show");
  el.badgeText.textContent = "Filter Aktif";

  const map = {
    alert: "circle-alert.svg",
    zero: "circle-x.svg",
    done: "circle-check.svg",
  };

  el.badgeIcon.src = `assets/icons/${map[state.filter]}`;
}

// ================= LOAD =================
async function loadWarga() {
  const { data } = await supabase
    .from("warga")
    .select("*")
    .order("id", { ascending: true });

  state.warga = data || [];
}

async function loadHarian() {
  const { data } = await supabase
    .from("jimpitan_harian")
    .select("*")
    .eq("tanggal", getTanggal());

  state.total = {};
  state.jam = {};
  state.updatedAt = {}; // ⬅️ tambah

  (data || []).forEach(d => {
    state.total[d.nama] = d.jumlah;

    const t = new Date(d.created_at);

    state.jam[d.nama] =
      `${String(t.getHours()).padStart(2, "0")}.${String(t.getMinutes()).padStart(2, "0")}`;

    state.updatedAt[d.id] = t.getTime();
  });
}

// ================= OPEN DETAIL =================
function openDetail(w) {
  state.active = w;

  el.detailId.textContent = w.id;
  el.detailNamaBig.textContent = w.nama;

  // 🔥 ambil prioritas:
  // 1. input sementara
  // 2. data dari database
  // 3. default 0
  const value =
    state.input[w.id] ??
    state.total[w.nama] ??
    0;

  // 🔥 sync ke state.input biar tombol + jalan normal
  state.input[w.id] = value;

  el.detailValue.textContent = formatRupiah(value);
  updateDetailColor(value);

  el.detailPage.classList.add("open");

  history.pushState({ page: "detail" }, "");
}

function updateDetailColor(value) {
  if (!el.detailValue) return;

  el.detailValue.classList.remove("zero", "positive");

  if (value > 0) {
    el.detailValue.classList.add("positive");
  } else {
    el.detailValue.classList.add("zero");
  }
}

// ================= CLOSE DETAIL =================
function closeDetail() {
  el.detailPage.classList.remove("open");
  state.active = null;

  requestAnimationFrame(() => {
    if (state.lastScrollId) {
      const target = document.querySelector(`[data-id="${state.lastScrollId}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
}

// ================= RENDER =================
function render() {
  let list = [...state.warga];

  const keyword = el.search.value?.toLowerCase();
  if (keyword) {
    list = list.filter(
      w =>
        w.nama.toLowerCase().includes(keyword) ||
        w.id.toLowerCase().includes(keyword)
    );
  }

  list = filterData(list);

  // 🔥 PRIORITAS: yang terakhir diinput naik ke atas
list.sort((a, b) => {
  if (a.id === state.lastUpdatedId) return -1;
  if (b.id === state.lastUpdatedId) return 1;

  const ta = state.updatedAt[a.id] || 0;
  const tb = state.updatedAt[b.id] || 0;

  // kalau belum pernah input → pakai ID (biar tetap urut rapi)
  if (ta === 0 && tb === 0) {
    return a.id.localeCompare(b.id);
  }

  return tb - ta;
});

  el.list.innerHTML = "";
  list.forEach(drawItem);
}

// ================= ITEM =================
function drawItem(w) {

  const div = document.createElement("div");
  div.className = "wa-item";
  div.dataset.id = w.id;
  div.dataset.nama = w.nama;

  div.innerHTML = `
    <div class="wa-row">
      <div class="wa-left">
        <img class="icon" src="assets/icons/${getIcon(w.nama)}">
        <div class="wa-text">
          <div class="kode">${w.id}</div>
          <div class="nama">${w.nama}</div>
        </div>
      </div>

      <div class="wa-right">
        <div class="total">
          ${state.total[w.nama] != null ? formatRupiah(state.total[w.nama]) : "-"}
        </div>
        <div class="status">${state.jam[w.nama] || "Belum input"}</div>
      </div>
    </div>
  `;

  // 🔥 BOUNCE ICON (item terakhir diupdate)
  if (w.id === state.lastUpdatedId) {
    setTimeout(() => {
      const icon = div.querySelector(".icon");
      icon?.classList.add("bounce");

      setTimeout(() => {
        icon?.classList.remove("bounce");
      }, 400);
    }, 50);
  }

  div.addEventListener("click", () => {
    state.lastScrollId = w.id;
    openDetail(w);
  });

  el.list.appendChild(div);
}

// ================= DETAIL ACTION =================
el.plus.onclick = () => {
  if (!state.active) return;

  const w = state.active;
  const value = (state.input[w.id] || 0) + TARIF;

  state.input[w.id] = value;

  el.detailValue.textContent = formatRupiah(value);
  updateDetailColor(value);
};

el.minus.onclick = () => {
  if (!state.active) return;

  const w = state.active;
  const value = Math.max(0, (state.input[w.id] || 0) - TARIF);

  state.input[w.id] = value;

  el.detailValue.textContent = formatRupiah(value);
  updateDetailColor(value);
};

el.save.onclick = async () => {
  if (!state.active) return;
  const w = state.active;

  await supabase.from("jimpitan_harian").upsert(
    {
      id: w.id, // ⬅️ penting
      nama: w.nama,
      tanggal: getTanggal(),
      jumlah: state.input[w.id] ?? 0,
      created_at: new Date().toISOString()
    },
    { onConflict: "nama,tanggal" }
  );

  delete state.input[w.id];

  await loadHarian();

  // 🔥 reset search
  el.search.value = "";
  updateClearButton();

  // 🔥 tandai item terakhir
  state.lastUpdatedId = w.id;

  render();
  updateFilterUI();

  closeDetail();

  // 🔥 reset setelah animasi selesai
  setTimeout(() => {
    state.lastUpdatedId = null;
  }, 500);
};

// ================= BACK =================

// ================= SIDEBAR =================
el.btnMenu.onclick = (e) => {
  e.stopPropagation();
  el.sidebar.classList.toggle("open");
  el.overlay.classList.toggle("show");
};

document.addEventListener("click", (e) => {
  if (!el.sidebar.contains(e.target) && !el.btnMenu.contains(e.target)) {
    el.sidebar.classList.remove("open");
    el.overlay.classList.remove("show");
  }
});



// ================= PLACEHOLDER TYPING =================
function startTypingPlaceholder() {
  const text = "Cari nama warga...";
  let index = 0;
  let typingInterval;
  let repeatTimeout;

  function type() {
    typingInterval = setInterval(() => {
      // kalau user sudah mulai ngetik → stop
      if (el.search.value) {
        clearInterval(typingInterval);
        clearTimeout(repeatTimeout);
        return;
      }

      el.search.setAttribute("placeholder", text.slice(0, index + 1));
      index++;

      if (index === text.length) {
        clearInterval(typingInterval);

        // tunggu 5 detik lalu ulang lagi
        repeatTimeout = setTimeout(() => {
          index = 0;
          type();
        }, 5000);
      }
    }, 80); // kecepatan ketik
  }

  type();
}


// ================= FILTER =================
document.querySelectorAll(".sidebar-item").forEach(item => {
  item.onclick = () => {
    state.filter = item.dataset.filter;

    document.querySelectorAll(".sidebar-item").forEach(i =>
      i.classList.remove("active")
    );

    item.classList.add("active");

    updateFilterUI();
    render();

    el.sidebar.classList.remove("open");
    el.overlay.classList.remove("show");
  };
});

// ================= SEARCH =================
el.search.addEventListener("input", render);

(async () => {

  if (!isJamBuka()) {
    showLock("Belum Waktunya", "Audit dibuka jam 06:00 - 03:00");
    return;
  }

  const device_id = localStorage.getItem("device_id");

  const { data } = await supabase
    .from("session_jimpitan")
    .select("*")
    .eq("tanggal", getTanggal())
    .maybeSingle();

  if (data?.status === "closed") {
    showLock("Audit Selesai", "Data hari ini sudah dikunci");
    return;
  }

  if (data && data.device_id !== device_id) {
    showLock(
      "Sedang Audit",
      `Grup ${data.grup} - ${data.petugas}`
    );
    return;
  }

  // ✅ baru jalanin app
  init();

})();



// ================= INIT =================
async function init() {

  await loadWarga();
  await loadHarian();
  render();
  updateFilterUI();
  startTypingPlaceholder();
}


// ================= HANDLE BACK BUTTON HP =================
window.addEventListener("popstate", () => {
  if (el.detailPage.classList.contains("open")) {
    closeDetail();
  }
});


const btnRiwayat = document.getElementById("btnRiwayat");

btnRiwayat.addEventListener("click", async (e) => {
  e.preventDefault();

  // 🔥 cek apakah semua sudah diisi
  const belum = state.warga.filter(w => state.total[w.nama] == null);

  if (belum.length > 0) {
    alert("Masih ada warga belum diinput!");
    return;
  }

  // 🔥 konfirmasi
  const yakin = confirm("Yakin tidak ada revisi?");

  if (!yakin) return;

  // 🔥 LOCK audit
  await lockAudit();

  // 🔥 pindah halaman
  window.location.href = "riwayat.html";
});