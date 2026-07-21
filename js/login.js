import { supabase } from "./supabase.js";

// ================= DEVICE ID =================
function getDeviceId() {
  let id = localStorage.getItem("device_id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }

  return id;
}

// ================= CLICK LANJUTKAN =================
document.getElementById("btnLanjutkan").onclick = async () => {

  const device_id = getDeviceId();

  // simpan ke local
  localStorage.setItem("device_id", device_id);

  // simpan ke Supabase (optional log)
  const { error } = await supabase.from("device_session").insert([
    {
      device_id,
      created_at: new Date().toISOString()
    }
  ]);

  if (error) {
    console.error("Gagal log device:", error);
  }

  // 🔥 LANJUT KE LOGIN PETUGAS
  window.location.href = "login-jimpitan.html";
};