
import { logInAccount } from './firebase';

document.querySelector('form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;
  
  logInAccount(email, password)
    .then(() => {
      window.location.assign('./html/mainpage.html');
    })
    .catch((error) => {
      alert('No account found. Please check your email and password.');
    });
});


