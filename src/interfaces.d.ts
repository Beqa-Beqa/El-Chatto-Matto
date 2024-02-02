declare interface PostData {
  text: string | null,
  media: {
    url: string | null,
    ref: string | null,
    type: string | null
  },
  by: string,
  photoURL: string,
  date: number,
  displayName: string,
  postId: string,
  likes?: PostLike,
  comments?: PostCommentData
}

declare interface PostLike {
  [by: string]: {
    photoURL: string,
    displayName: string,
    date: string,
  }
}

declare interface PostCommentData {
  [by: string]: {
    photoURL: string,
    displayName: string,
    comments: PostComment[]
  }
}

declare interface PostComment {
  id: string,
  text: string | null,
  mediaUrl: {
    type: string | null,
    url: string | null
  },
  date: string,
  isReply?: {
    replyTo: string
  } | false
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
  profileImageRefs?: {[key: string]: {date: number, ref: string}}
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