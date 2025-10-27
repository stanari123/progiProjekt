const form = document.getElementById('loginForm');
const submitBtn = document.getElementById('submitBtn');
const feedback = document.getElementById('feedback');

const toggleBtn = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

toggleBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    toggleBtn.textContent = isHidden ? 'Vidljiva šifra 👁️' : 'Skrivena šifra 🙈';
  });

function setFeedback(type, msg) {
  console.log(type + ": " + msg);
  if (!msg) { feedback.innerHTML = ''; return; }
  feedback.innerHTML = msg;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = form.email.value;
    const password = form.password.value;

    if (!email){
      setFeedback('error', 'Upišite elektroničku poštu');
      return;
    }
    if (!password){
      setFeedback('error', 'Upišite lozinku');
      return;
    }

    setFeedback('success', 'Ulazite...');

    /* ovdje ide handleanje email i password*/
});
