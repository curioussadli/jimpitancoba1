import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

document.addEventListener("DOMContentLoaded", async () => {

  const content = document.getElementById("content");
  const btnMenu = document.getElementById("btnMenu");

  // ================= MENU CLICK =================
  if (btnMenu) {
    btnMenu.addEventListener("click", () => {
      window.location.href = "profil.html";
    });
  }

  // ================= CEK LOGIN =================
  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      window.location.href = "index.html";
      return;
    }

    console.log("USER LOGIN:", user.uid);

    // ================= LOAD PROFIL UI =================
    try {
      const res = await fetch("profil.html");
      const html = await res.text();

      content.innerHTML = html;

      // setelah HTML masuk, baru load logic profil
      import("./profil.js");

    } catch (err) {
      console.error("Gagal load profil:", err);
    }

  });

});