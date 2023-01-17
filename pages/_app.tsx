import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Login from './login';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';
import Loading from '../components/Loading';
import { useEffect, useState } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Roboto } from '@next/font/google';
import { useRouter } from 'next/router';



export default function App({ Component, pageProps }: AppProps) {
  const [loggedInUser, loading, error] = useAuthState(auth);
  const router = useRouter();
  const conversationId = router.query.id;
  const [isLoggedInConversation, setIsLoggedInConversation] = useState(loggedInUser);


  useEffect(() => {
    
    const setUserInDb = async()=>{
      try{
        await setDoc(
          doc(db, 'users', loggedInUser?.email as string),
          {
            email: loggedInUser?.email,
            lastSeen: serverTimestamp(),
            photoURL: loggedInUser?.photoURL,
          },
          {merge: true} // just update what is changed
        )
      }catch(err){
        console.log('ERROR SETTING USER INFO IN DB ',err);
      }
    }

    const getDocConversation = async ()=>{
      const docRef = doc(db, "conversation", conversationId as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
          setIsLoggedInConversation(docSnap.data().users.find((email: any) => email ===loggedInUser?.email));
      }
    }

    if(loggedInUser){
      setUserInDb();
      setIsLoggedInConversation(loggedInUser);
    }

    if(conversationId){
      getDocConversation();
    }

  }, [loggedInUser, conversationId]);


  if(loading) return <Loading/>;

  if(!isLoggedInConversation) return <Login/>

  return <Component {...pageProps} />
}
