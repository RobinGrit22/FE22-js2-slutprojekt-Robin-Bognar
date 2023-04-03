
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import { fetchUsers } from './firebase';
import { createPost } from './firebase';
import { updateLikes } from './firebase';
import 'emoji-picker-element';

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
              if(userData.image === '../image/unicorn.jpg'){
                const imgUrl = new URL('../image/unicorn.jpg', import.meta.url)
              userImageDisplay.src = imgUrl.href
              }
              if(userData.image === '../image/unicorn2.png'){
                const imgUrl = new URL('../image/unicorn2.png', import.meta.url)
              userImageDisplay.src = imgUrl.href
              }
              if(userData.image === '../image/unicorn3.png'){
                const imgUrl = new URL('../image/unicorn3.png', import.meta.url)
              userImageDisplay.src = imgUrl.href
              }
              if(userData.image === '../image/unicorn4.png'){
                const imgUrl = new URL('../image/unicorn4.png', import.meta.url)
              userImageDisplay.src = imgUrl.href
              }
            }
          });
          //kalla på visa inlägg
          displayPosts();
        
        
        //Visa users på höger section
        fetchUsers().then((users) => {
          console.log('users:', users);
          console.log(Object.values(users))
       
        interface User {
        username: string;
         }
(Object.values(users) as User[]).forEach((user: User) => {
  const container = document.querySelector('.user-container');
  const p = document.createElement('p');
  container?.append(p);
  p && (p.innerText = user.username);
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

const displayPosts = () => {
  const db = getDatabase();
  const postsRef = ref(db, 'posts');

  onValue(postsRef, async (snapshot) => {
    const posts = snapshot.val();
    const postContainer = document.getElementById('postsList');

    if (posts && postContainer) {
      postContainer.innerHTML = ''; 
      
      for (const [id, post] of Object.entries(posts) as [string, Post][]) {
        const userSnapshot = await get(ref(db, `users/${post.userId}`));
        const user = userSnapshot.val();
      
        const postItem = document.createElement('div');
        postItem.className = 'post-item';
        postItem.innerHTML = `
          <h5>${user.username}</h5>
          <p>${post.content}</p>
          <p>${post.createdAt}</p>
          <div class="post-actions">
          <a class="like-btn" data-post-id="${id}"><i class="far fa-heart"></i> ${post.likes}</a>

            <a class="reply-btn"><i class="far fa-comment"></i></a>
          </div>
        `;
      
        postContainer.appendChild(postItem);

        const likeBtn = postItem.querySelector('.like-btn') as HTMLElement;
        if (likeBtn) {
            likeBtn.addEventListener('click', (event) => {
              event.preventDefault();
              handleLike(event, id, post.userId);
            });
          
        }
        
      }
    }
  })
};




async function handleLike(event: Event, postId: string, userId: string) {
  event.preventDefault();
  
  const db = getDatabase();
  
  // Fetch current likes count
  const postSnapshot = await get(ref(db, `posts/${postId}`));
  const postData = postSnapshot.val();

  if (postData) {
    const currentLikes = postData.likes;

    // Update the likes count in the database
    const updatedLikes = currentLikes + 1;
    await updateLikes(event, postId, updatedLikes);

     // Toggle the liked class for the heart icon
     const likeButton = event.target as HTMLElement;
     const heartIcon = likeButton.querySelector('i');
     if (heartIcon) {
       if (heartIcon.style.color === 'red') {
         heartIcon.style.color = '';
       } else {
         heartIcon.style.color = 'red';
       }
     }
     likeButton.textContent = ` Likes: ${updatedLikes}`;
   } else {
     console.error(`Unable to find post data for post ID: ${postId}`);
   }
 }



