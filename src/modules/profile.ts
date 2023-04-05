import { getDatabase, ref, onValue } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase'; // Update the import path if needed

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);


const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');

if (userId) {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}`);

  onValue(userRef, (snapshot) => {
    const userData = snapshot.val();
    console.log('userData:', userData);
    const userNameDisplay = document.getElementById('username');
    const userImageDisplay = document.getElementById('profileImage') as HTMLImageElement;

    userNameDisplay && (userNameDisplay.innerText = userData.username);

    if (userImageDisplay) {
      if (userData.image === '../image/unicorn.jpg') {
        const imgUrl = new URL('../image/unicorn.jpg', import.meta.url);
        userImageDisplay.src = imgUrl.href;
      }
      if (userData.image === '../image/unicorn2.png') {
        const imgUrl = new URL('../image/unicorn2.png', import.meta.url);
        userImageDisplay.src = imgUrl.href;
      }
      if (userData.image === '../image/unicorn3.png') {
        const imgUrl = new URL('../image/unicorn3.png', import.meta.url);
        userImageDisplay.src = imgUrl.href;
      }
      if (userData.image === '../image/unicorn4.png') {
        const imgUrl = new URL('../image/unicorn4.png', import.meta.url);
        userImageDisplay.src = imgUrl.href;
      }
    }
  });

  // Display the user's posts
  const postsRef = ref(db, 'posts');
  onValue(postsRef, async (snapshot) => {
    const posts = snapshot.val();
    const postContainer = document.getElementById('postsList');

    if (posts && postContainer) {
      postContainer.innerHTML = '';

      // Filter posts for the current user
      const userPosts = Object.entries(posts)
        .filter(([_, post]) => (post as any).userId === userId)
        .map(([id, post]) => ({ id, ...(post as any) }));

      // Sort the array based on createdAt attribute in descending order
      userPosts.sort((a, b) => new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime());

      for (const post of userPosts) {
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        postItem.innerHTML = `
          <h5 class="postName">${(post as any).username}</h5>
          <p class="postContent">${(post as any).content}</p>
          <p class="postTime">${(post as any).createdAt}</p>
        `;

        postContainer.appendChild(postItem);
      }
    }
  });

} else {
  console.log('No user ID provided');
}
