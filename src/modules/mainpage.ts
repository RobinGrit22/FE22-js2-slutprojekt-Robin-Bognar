
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { fetchUsers } from './firebase';
import { createPost } from './firebase';
import { updateLikes } from './firebase';
import { logOutAccount } from './firebase';
import { deleteAccount } from './firebase';


//main function för att lägga i window EventListener så att allt annat laddar innan den körs.
const main = () => {
    console.log('main function called');
    const auth = getAuth();
   

  
    onAuthStateChanged(auth, (user) => {
      console.log('auth state changed', user);
      if (user) {
        const userId = user.uid;
        const db = getDatabase();
        const userRef = ref(db, `users/${userId}`);
  
        onValue(userRef, (snapshot) => {
            const userData = snapshot.val();
            console.log('userData:', userData);
            const userNameDisplay = document.getElementById('username'); 
            const userNameLogOutDisplay = document.querySelector('.logout-container p');
            const userImageDisplay = document.getElementById('profileImage') as HTMLImageElement;
          
            userNameLogOutDisplay && (userNameLogOutDisplay.innerHTML = userData.username);
            userNameDisplay && (userNameDisplay.innerText = userData.username);
            if(userImageDisplay){
             userImageDisplay.src = userData.image
            }
          });
          //kalla på visa inlägg
          displayPosts();
          displayTop10LikedPosts();
        
        //Visa users på höger section och lägg till url för profil besök
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
      } else {
        console.log('No user is signed in');
      }
    });
  };
  
  
window.addEventListener('load', main);




//Skapa inlägg
document.getElementById('postBtn')?.addEventListener('click', async (event) => {
  event.preventDefault(); 

  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (currentUser) {
    const userId = currentUser.uid;
    const contentInput = document.getElementById('postContent') as HTMLInputElement;
    const content = contentInput.value;

    if (content) {
      await createPost(userId, content);
      contentInput.value = ''; 
    } else {
      console.log('No content provided');
    }
  } else {
    console.log('No user is signed in');
  }
});


//Visa inlägg
interface Post {
  id: string,
  userId: string;
  content: string;
  createdAt: string;
  likes: number;
}

export const displayPosts = (userId?: string) => {
  const db = getDatabase();
  const postsRef = ref(db, 'posts');

  onValue(postsRef, async (snapshot) => {
    const posts = snapshot.val();
    const postContainer = document.getElementById('postsList');

    if (posts && postContainer) {
      postContainer.innerHTML = '';

      
      const postArray = Object.entries(posts).map(([id, post]) => ({ id, userId: (post as Post).userId, content: (post as Post).content, createdAt: (post as Post).createdAt, likes: (post as Post).likes }));
     


      // Sortera array efter tid skapad
      postArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      for (const post of postArray) {
        const userSnapshot = await get(ref(db, `users/${post.userId}`));
        const user = userSnapshot.val();

        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        postItem.innerHTML = `
          <h5 class="postName">${user.username}</h5>
          <p class="postContent">${post.content}</p>
          <p class="postTime">${post.createdAt}</p>
          <div class="post-actions">
          <a class="like-btn" data-post-id="${post.id}"><i class="far fa-heart"></i> ${post.likes}</a>
            <a class="reply-btn"><i class="far fa-comment"></i></a>
          </div>
        `;

        postContainer.appendChild(postItem);

        const likeBtn = postItem.querySelector('.like-btn') as HTMLElement;
        if (likeBtn) {
          likeBtn.addEventListener('click', (event) => {
            event.preventDefault();
            handleLike(event, post.id, post.userId);
            
          });
        }
      }
    }
  });
};




 //hantera likes
export async function handleLike(event: Event, postId: string, userId: string) {
  event.preventDefault();
  
  const db = getDatabase();
  
  const postSnapshot = await get(ref(db, `posts/${postId}`));
  const postData = postSnapshot.val();

  if (postData) {
    const currentLikes = postData.likes;

    
    const updatedLikes = currentLikes + 1;
    await updateLikes( postId, updatedLikes);

     
     const likeButton = event.target as HTMLElement;
     likeButton.textContent = ` Likes: ${updatedLikes}`;
   } else {
     console.error(`Unable to find post data for post ID: ${postId}`);
   }
 }

//visa top 10 liked inlägg
export const displayTop10LikedPosts = async () => {
  const db = getDatabase();
  const postsRef = ref(db, 'posts');
  const snapshot = await get(postsRef);
  const posts = snapshot.val();
  console.log(posts)

  const postArray = Object.entries(posts).map(([id, post]) => ({ id, userId: (post as Post).userId, content: (post as Post).content, createdAt: (post as Post).createdAt, likes: (post as Post).likes }));
  console.log(postArray)
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