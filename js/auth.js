import { auth } from './firebase.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

export function initAuth(onUserAuthenticated) {
  onAuthStateChanged(auth, (user) => {
    const authModal = document.getElementById('auth-modal');
    if (user) {
      if (authModal) authModal.style.display = 'none';
      const emailDisplay = document.getElementById('user-email-display');
      if (emailDisplay) emailDisplay.textContent = user.email;
      const settingsEmail = document.getElementById('settings-email');
      if (settingsEmail) settingsEmail.textContent = user.email;
      
      if (typeof onUserAuthenticated === 'function') {
        onUserAuthenticated(user);
      }
    } else {
      if (authModal) {
        authModal.style.display = 'flex';
      } else {
        window.location.href = 'settings.html';
      }
    }
  });

  const logoutBtns = document.querySelectorAll('#logout-btn, #settings-logout-btn');
  logoutBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', async () => {
        try {
          await signOut(auth);
          window.location.href = 'index.html';
        } catch (error) {
          console.error("Gagal keluar:", error);
        }
      });
    }
  });

  const authForm = document.getElementById('auth-form');
  if (authForm) {
    let isRegisterMode = false;
    const toggleBtn = document.getElementById('toggle-auth-mode');
    const modalTitle = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');

    toggleBtn.addEventListener('click', () => {
      isRegisterMode = !isRegisterMode;
      modalTitle.textContent = isRegisterMode ? 'Daftar Akun ORBIT' : 'Masuk ke ORBIT';
      submitBtn.textContent = isRegisterMode ? 'Daftar' : 'Masuk';
      toggleBtn.textContent = isRegisterMode ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar';
    });

    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;

      try {
        if (isRegisterMode) {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          await signInWithEmailAndPassword(auth, email, password);
        }
      } catch (error) {
        alert("Autentikasi gagal: " + error.message);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});