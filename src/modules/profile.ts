import { getDatabase, ref, onValue, get } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase'; // Update the import path if needed
import {  handleLike } from './mainpage';
import { logOutAccount, deleteAccount } from './firebase';
import { fetchUsers } from './firebase';

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);


const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');

async function getUsername(userId: string): Promise<string> {
  const userSnapshot = await get(ref(db, `users/${userId}`));
  return userSnapshot.val().username;
}

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
    userImageDisplay.src = userData.image
    }
    displayTop10LikedPosts()
  });

  // visa användarens inlägg
  const postsRef = ref(db, 'posts');
  onValue(postsRef, async (snapshot) => {
    const posts = snapshot.val();
    const postContainer = document.getElementById('postsList');

    if (posts && postContainer) {
      postContainer.innerHTML = '';

      
      const userPosts = Object.entries(posts)
        .filter(([_, post]) => (post as any).userId === userId)
        .map(([id, post]) => ({ id, ...(post as any) }));

      userPosts.sort((a, b) => new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime());
      console.log(userPosts)

      for (const post of userPosts) {
        const username = await getUsername((post as any).userId);

        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        postItem.innerHTML = `
          <h5 class="postName">${username}</h5>
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
interface Post {
  id: string,
  userId: string;
  content: string;
  createdAt: string;
  likes: number;
}
export const displayTop10LikedPosts = async () => {
  const db = getDatabase();
  const postsRef = ref(db, 'posts');
  const snapshot = await get(postsRef);
  const posts = snapshot.val();

  const postArray = Object.entries(posts).map(([id, post]) => ({ id, userId: (post as Post).userId, content: (post as Post).content, createdAt: (post as Post).createdAt, likes: (post as Post).likes }));
 
  postArray.sort((a, b) => b.likes - a.likes);
  const top10Posts = postArray.slice(0, 5);
  
  const top10PostsContainer = document.getElementById('top10LikedPosts');

  if (top10PostsContainer) {
    top10PostsContainer.innerHTML = '';

    for (const post of top10Posts) {
      const userSnapshot = await get(ref(db, `users/${post.userId}`));
      const user = userSnapshot.val();

      const postItem = document.createElement('div');
      postItem.className = 'postLiked10';
      postItem.innerHTML = `
        <h5 class="postNameLiked">${user.username}</h5>
        <p class="postContentLiked">${post.content}</p>
        <p class="postLikesLiked">Likes: ${post.likes}</p>
      `;

      top10PostsContainer.appendChild(postItem);
    }
  }
};
      //Visa users på höger section
      fetchUsers().then((users) => {
        console.log('users:', users);
        console.log(Object.values(users))
     
      interface User {
      username: string;
       }
       (Object.entries(users) as [string, User][]).forEach(([userId, user]) => {
        const container = document.querySelector('.user-names');
        const p = document.createElement('p');
        p.setAttribute('data-user-id', userId);
        container?.append(p);
        p && (p.innerText = user.username);
      
        p.addEventListener('click', () => {
          window.location.href = `./profile.html?userId=${userId}`;
        });
      });
      });


      //logga ut
const logOutBtn = document.querySelector('#loggOutBtn') as HTMLElement;
logOutBtn.addEventListener('click', () =>{
   logOutAccount().then(() => {
    location.assign('../index.html');
  });
})

//radera konto
const deleteAccountBtn = document.querySelector('#deleteAccountBtn') as HTMLElement
deleteAccountBtn.addEventListener('click', () => {
  deleteAccount().then(() => {
    location.assign('../index.html');
  });
})