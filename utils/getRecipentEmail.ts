import { User } from "firebase/auth"
import { collection, DocumentData, orderBy, query, QueryDocumentSnapshot, Timestamp, where } from "firebase/firestore"
import { db } from "../config/firebase"
import { Conversation, IMessage } from "../types"

export const getRecipientEmail = (conversationUser: Conversation['users'], loggedInUser?: User | null)=> conversationUser.find(userEmail=> userEmail !== loggedInUser?.email)

export const generateQueryGetMessageConversation = (conversationId: string)=> query(collection(db, 'messages'), where('conversation_id', '==', conversationId), orderBy('send_at', 'asc'));

export const transforMessage = (message: QueryDocumentSnapshot<DocumentData>)=>{ 
    return({
    id: message.id,
    ...message.data(), // conversation data, user, text
    send_at: message.data().send_at ? convertFirestoreTimestampToString(message.data().send_at as Timestamp) : null 
} as IMessage)}

export const convertFirestoreTimestampToString = (timestamp: Timestamp)=> new Date(timestamp.toDate().getTime()).toLocaleString()