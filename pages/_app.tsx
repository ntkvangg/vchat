import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Login from './login';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';
import Loading from '../components/Loading';
import { useEffect } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Roboto } from '@next/font/google';


export default function App({ Component, pageProps }: AppProps) {
  const [loggedInUser, loading, error] = useAuthState(auth);


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

    if(loggedInUser){
      setUserInDb();
    }
  }, [loggedInUser]);

  if(loading) return <Loading/>;

  if(!loggedInUser) return <Login/>

  return <Component {...pageProps} />
}
