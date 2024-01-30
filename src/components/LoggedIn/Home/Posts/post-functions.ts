import { User } from "firebase/auth";
import { updateDoc, doc, deleteDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { firestore, storage } from "../../../../config/firebase";

export const handlePostLike = async (
  currentUser: User, 
  postsData: {[key: string]: PostData}, 
  setPostsData: React.Dispatch<React.SetStateAction<{
    [key: string]: PostData;
  }>>,
  post: PostData
  ) => {
  const currentDate = new Date().toLocaleString();
  const postKey = new Date(post.date).getTime();
  const newPostsData: {[key: string]: PostData} = {...postsData};
  let updateChunk: any = {};
  if(post.likes && (currentUser!.uid in post.likes)) {
    updateChunk = {...post.likes};
    delete updateChunk[currentUser!.uid];
    delete newPostsData[postKey].likes![currentUser!.uid];
    setPostsData(newPostsData);
  } else {
    const data = {
      date: currentDate,
      displayName: currentUser?.displayName!,
      photoURL: currentUser?.photoURL!
    }
    updateChunk = {...post.likes, [currentUser!.uid]: data};

    newPostsData[postKey].likes! = updateChunk;
    setPostsData(newPostsData);
  }
  try {
    await updateDoc(doc(firestore, "posts", post.postId), {likes: updateChunk});
  } catch (err) {
    console.error(err);
  }
}

export const handlePostDelete = async (
  currentUser: User,
  postsData: {[key: string]: PostData},
  setPostsData: React.Dispatch<React.SetStateAction<{
    [key: string]: PostData;
  }>>, 
  post: PostData, 
  postsCount: number,
  postKey?: string
  ) => {
  try {
    post.media.ref && await deleteObject(ref(storage, post.media.ref));
    await deleteDoc(doc(firestore, "posts", post.postId));
    await updateDoc(doc(firestore, "userChats", currentUser!.uid), {
      postsCount: postsCount - 1
    });
    const newPostsData = {...postsData};
    postKey && delete newPostsData[postKey];
    setPostsData(newPostsData);
  } catch (err) {
    console.error(err);
  }
}

export const handlePostEdit = async (
  postsData: {[key: string]: PostData},
  setPostsData: React.Dispatch<React.SetStateAction<{
    [key: string]: PostData;
  }>>, 
  post: PostData, 
  postKey: string,
  postInputValue: string, 
  setError: React.Dispatch<React.SetStateAction<{
    type: string;
    text: string;
  }>>,
  setPostPromptVisible: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
  try {
    if(postInputValue.trim().length > 20000) throw Error("The post characters exceed 20000");

    try {
      const postDocRef = doc(firestore, "posts", post.postId);
      await updateDoc(postDocRef, {
        text: postInputValue
      });
      
      let newPostsData = {...postsData};
      newPostsData[postKey].text = postInputValue;
      setPostsData(newPostsData);
      setPostPromptVisible(false);
    } catch (err) {
      console.error(err);
    }
  } catch (err) {
    setError({
      type: "Post",
      text: (err as Error).message
    });
  }
}