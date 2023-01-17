import { collection, doc, getDoc, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { auth, db } from "../config/firebase";
import { AppUser, Conversation } from "../types";
import { getAccountEmail, getRecipientEmail } from "../utils/getRecipentEmail";

export const useRecipient = (conversationUsers: Conversation['users'])=>{
    const [loggedInUser, loading, error] = useAuthState(auth);

    const recipientEmail = getRecipientEmail(conversationUsers, loggedInUser);

    //get recipient avatar
    const queryGetRecipientAvatar = query(collection(db, 'users'), where('email', '==', recipientEmail));

    const [recipientSnapshot, __loading, __error] = useCollection(queryGetRecipientAvatar);

    //recipientSnapshot?.docs could be empty array
    //so we have to force "?" after docs[0] because there no data() on "undefined"
    const recipient = recipientSnapshot?.docs[0]?.data() as AppUser | undefined;

    return {
        recipient,
        recipientEmail
    }
}



