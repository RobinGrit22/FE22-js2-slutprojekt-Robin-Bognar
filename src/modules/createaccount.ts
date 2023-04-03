import {createUserAccount} from './firebase'


document.querySelector('form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value;
    const profileImage = (document.querySelector('input[name="profile-image"]:checked') as HTMLInputElement).value;
    if (password === confirmPassword) {
        createUserAccount(email, password, username, profileImage)
      } else {
        alert('Password dosent match')
      }
  });
  

