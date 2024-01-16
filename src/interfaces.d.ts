declare interface PostData {
  text: string,
  by: string,
  photoURL: string,
  date: string,
  displayName: string,
  postId: string
}

declare interface UserDoc {
  defaultPhotoURL: string,
  displayName: string,
  email: string,
  photoURL: string,
  searchArray: string[],
  uid: string,
  bio?: string,
  coverImageRefs?: {[key: string]: {date: string, ref: string}},
  coverURL?: string,
  profileImageRefs?: {[key: string]: {date: string, ref: string}}
}

declare interface UserChatsDoc {
  friends: string[],
  isAway: boolean,
  isOnline: boolean,
  requestsSent: string[],
  notifications?: {[key: string]: {date: string, type: string, isRead: boolean}},
  postsCount?: number
}

declare interface Message {
  [key: string]: {
    img: null | string,
    message: null | string,
    senderId: string
  }
}