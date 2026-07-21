// ================= MAIN JS (GLOBAL) =================

// Ambil data localStorage
export function getData(key) {
  return localStorage.getItem(key);
}

// Simpan data localStorage
export function setData(key, value) {
  localStorage.setItem(key, value);
}

// Hapus data
export function removeData(key) {
  localStorage.removeItem(key);
}

// Clear semua
export function clearAll() {
  localStorage.clear();
}

// Helper ambil data login
export function getUserLogin() {
  return {
    grup: localStorage.getItem("grupTerpilih"),
    nama: localStorage.getItem("namaPetugas")
  };
}

// Debug (optional)
console.log("Main.js loaded");