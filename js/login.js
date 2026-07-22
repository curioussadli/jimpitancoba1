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

  localStorage.setItem("device_id", device_id);

  try {
    await supabase
      .from("device_session")
      .upsert({
        device_id,
        created_at: new Date().toISOString()
      });

  } catch (err) {
    console.error(err);
  }

  location.replace("login-jimpitan.html");

};
