import { DocumentData, writeBatch, getDoc, doc, arrayUnion, arrayRemove, deleteField, Firestore, updateDoc } from "firebase/firestore";
import { combineIds } from "./general";
import { User, updateProfile } from "firebase/auth";
import { FirebaseStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import Compressor from "compressorjs";
import uuid from "react-uuid";

// Send friend request.
export const handleSendFriendRequest = async (firestore: Firestore, currentUser: User, userData: DocumentData) => {
  const batch = writeBatch(firestore);
  const currentUserDocRef = doc(firestore, "userChats", currentUser.uid)
  try {
    // Get target user's data so override won't happen while sneding notification.
    const targUserData = await getDoc(doc(firestore, "userChats", userData.uid));
    const parsedData = targUserData.data();

    // Save current user's id as recieved request in target user's array.
    const targetUserdocRef = doc(firestore, "userChats", userData.uid);
    // Current date.
    const userIndex = currentUser.uid;
    // We initialzie data for serving to target user because we need current time as a reference.
    const targetUserDataToServe: any = {
      notifications: {
        ...parsedData?.notifications
      }
    };
    // Set notification with current time with respective information.
    targetUserDataToServe.notifications[userIndex!] = {}
    targetUserDataToServe.notifications[userIndex!]["friendRequest"] = {
      timestamp: new Date().getTime(),
      isRead: false
    }

    // Update doc.
    batch.update(targetUserdocRef, targetUserDataToServe);

    // Save target user's id as sent request in current user's array.
    batch.update(currentUserDocRef, {
      requestsSent: arrayUnion(userData.uid)
    });

    await batch.commit();
  } catch (err) {
    console.log(err)
  }
}


// <------------------------------------------------------------------------------------------------>


// Cancel friend request.
export const handleCancelFriendRequest = async (firestore: Firestore, currentUser: User, userData: DocumentData) => {
  const batch = writeBatch(firestore);
  const currentUserDocRef = doc(firestore, "userChats", currentUser.uid)
  try {
    // Remove target user's id from sent requests array in current user docs.
    batch.update(currentUserDocRef, {
      requestsSent: arrayRemove(userData.uid)
    });
    // Remove current user's id from recieved requests array in target user docs.
    const targetUserdocRef = doc(firestore, "userChats", userData.uid);
    const targetUserDataToServe: any = {}
    targetUserDataToServe[`notifications.${currentUser.uid}.friendRequest`] = deleteField();
    
    batch.update(targetUserdocRef, targetUserDataToServe);
    
    await batch.commit();
  } catch (err) {
    console.log(err);
  }
}


// <------------------------------------------------------------------------------------------------>


// Handle request answer.
export const handleRequestAnswer = async (firestore: Firestore, currentUser: User, action: string, target: string, type="friendRequest") => {
  const batch = writeBatch(firestore);
  const currentUserDocRef = doc(firestore, "userChats", currentUser.uid);
  // Generate combinedId for chat access purposes.
  const combinedId = combineIds(currentUser.uid, target);
  // Chat will be saved with id value of combinedId.
  const chatsRef = doc(firestore, "chats", combinedId);
  
  // User's doc reference on whom we target action to.
  const actionTargetUser = doc(firestore, "userChats", target);
  
  // Remove request helper function.
  const removeRequest = async () => {
    try {
      // update chunk is what is sent for an update.
      const updateChunk: any = {};
      // delete the given field.
      updateChunk[`notifications.${target}.${type}`] = deleteField(); 
      // make update request in batch.
      batch.update(currentUserDocRef, updateChunk);
      
      // make update request in batch to remove current user's id from sent request's array
      // in target user's docs.
      batch.update(actionTargetUser, {
        requestsSent: arrayRemove(currentUser.uid)
      });
    } catch (err) {
      console.error(err);
    }
  }
  
  // If the user accepts request.
  if(action === "accept") {
    // write about helper function above.
    await removeRequest();
    
    // make an update in batch, add notification sender user's id in friends array of 
    // notification current user's userchats doc.
    batch.update(currentUserDocRef, {
      friends: arrayUnion(target)
    });
    
    // make an update in batch, add current user's id in friends array of 
    // notification sender's userchats doc.
    batch.update(actionTargetUser, {
      friends: arrayUnion(currentUser.uid)
    });
    
    // Set the document. (in this case create).
    batch.set(chatsRef, {});

  } else if (action === "decline") {
    // if answer is decline then just remove request.
    await removeRequest();
    
  } else if (action === "delete") {
    // Remove chat's document (users` chat with each other) from database.
    batch.delete(chatsRef);
    
    // Remove each other id's from both users friends array in documents.
    const currentUserUpdateChunk = {
      friends: arrayRemove(target)
    }
    
    const targetUserUpdateChunk = {
      friends: arrayRemove(currentUser.uid)
    }
    
    batch.update(currentUserDocRef, currentUserUpdateChunk);
    batch.update(actionTargetUser, targetUserUpdateChunk);
  }
  
  // commit all the changes.
  await batch.commit();
};


// <------------------------------------------------------------------------------------------------>


// Process image upload.
export const handleImageUpload = (
    firestore: Firestore,
    storage: FirebaseStorage,
    currentUser: User
  ) => {
  return async function (
    type: string,
    image: File | null, 
    options: {
      returnURL?: boolean,
      returnRef?: boolean,
      returnURLAndUpload?: boolean,
      returnRefAndUpload?: boolean
    } = {
      returnURL: false,
      returnRef: false,
      returnURLAndUpload: false,
      returnRefAndUpload: false
    }
  ) {
    // If image is present.
    if(image) {
      // doc reference where we will store download url.
      const currUserUsersDocRef = doc(firestore, "users", currentUser.uid);
      // Set storage reference to covers folder in user's storage directory.
      const refString: string = `userImages/${currentUser.uid}/${type}/${uuid()}.cover`;
      const imageRef = ref(storage, refString);
  
      try {
        // Compress image and save it in compressed Image.
        const compressedImage = await new Promise((resolve, reject) => {new Compressor(image, {
          quality: 0.8,
          // The compression process is asynchronous,
          // which means you have to access the `result` in the `success` function.
          success: async (result) => {
              const imageFile: File = new File([result], "user-image", {type: "image/jpeg"});
              
              resolve(imageFile);
            },
            
            error(error) {
              console.log(error.message);
              reject(error);
            }
          })
        });
  
        // Upload image (compressedImage as File is written because by default it's unknown but we need File type).
        await uploadBytesResumable(imageRef, compressedImage as File);
        // Get download url.
        const downloadUrl = await getDownloadURL(imageRef);

        // If by options it's specified to return the download url, or return reference,
        // function won't proceed to update documents.
        if(options.returnURL || options.returnRef) {
          return {
            url: downloadUrl || null,
            ref: refString || null
          }
        }

        if(type === "cover") {
          // Update user docs.
          await updateDoc(currUserUsersDocRef, {
            coverURL: downloadUrl
          });
        } else if (type === "profile") {
          // Update user's documents.
          await updateDoc(currUserUsersDocRef, {
            photoURL: downloadUrl
          });

          // Update user's profile.
          await updateProfile(currentUser, {
            photoURL: downloadUrl
          });
        }
        
        // If by options it's specified to return ref and upload or return url and upload function will
        // update documents as well return reference.
        if(options.returnRefAndUpload || options.returnURLAndUpload) {
          return {
            url: downloadUrl || null,
            ref: refString || null
          }
        };
        
      } catch (err) {
        console.error(err);
      }
    }
  }
}


// <------------------------------------------------------------------------------------------------>


// Process image deletion.
export const handleImageDelete = async (firestore: Firestore, storage: FirebaseStorage, currentUser: User, storageRef: string, type: string) => {
  // Current user document reference.
  const currentUserDocRef = doc(firestore, "users", currentUser.uid);
  // reference of file which is about to be deleted.
  const deleteRef = ref(storage, storageRef);
  // delete the file.
  await deleteObject(deleteRef);

  try {
    // Remove cover image.
    if(type === "cover") {
      await updateDoc(currentUserDocRef, {
        coverURL: deleteField()
      });
    } else if (type === "profile") {
      await updateDoc(currentUserDocRef, {
        photoURL: deleteField()
      });
    }

  } catch (err) {
    console.log(err);
  }
}