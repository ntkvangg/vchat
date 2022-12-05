import IconButton from '@mui/material/IconButton';
import React, { KeyboardEventHandler, useRef, useState } from 'react'
import styled from 'styled-components';
import { useRecipient } from '../hooks/useRecipent';
import { Conversation, IMessage } from '../types/index';
import { convertFirestoreTimestampToString, generateQueryGetMessageConversation, transforMessage } from '../utils/getRecipentEmail';
import { RecipientAvatar } from './RecipientAvatar';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useRouter } from 'next/router';
import { useCollection } from 'react-firebase-hooks/firestore';
import SingleMessage from './SingleMessage';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MoodIcon from '@mui/icons-material/Mood';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';


const StyleRecipientHeader = styled.div`
    display: flex;
    position: sticky;
    top: 0;
    align-items: center;
    background-color: #fff;
    padding: 8px;
    height: 80px;
    border-bottom: 1px solid #eee;
    z-index: 100;

`

const StyledHeaderInfo = styled.div`
    margin: 5px;
    flex-grow: 1;

    >h3{
        margin-top: 0;
        margin-bottom: 3px;
    }
    >span{
        font-size: 14px;
        color: gray
    }

`

const StyledH3 = styled.h3`
    word-break: break-all;
`

const StyleHeaderIcons = styled.div`
    display: flex;
`

const StyledMessageContainer = styled.div`
    padding: 3px;
    background-color: #e5dedf;
    min-height: 90%;

    

    
        
`

const StyledInputContainer = styled.form`
    display: flex;
    align-items: center;    
    position: sticky;
    bottom: 0;
    background-color: #fff;
    z-index: 100;
    
`

const EndOfMessageForAutoScroll = styled.div`
    margin-bottom: 30px;
`

const StyledInput = styled.input`
    flex-grow: 1;
    border: none;
    outline: none;
    border-radius: 10px;
    background-color: #fff;
    border-radius: 10px;
    padding: 15px;
    margin-left: 15px;
    margin-right: 15px;
`

const ConversationScreen = ({conversation, messages}: {conversation: Conversation; messages: IMessage[]}) => {
    const [loggedInUser, _loading, _error] = useAuthState(auth);
    const conversationUsers  =  conversation.users;
    const {recipient, recipientEmail} = useRecipient(conversationUsers);
    const [newMessage, setNewMessage] = useState("");

    const router = useRouter()
    const conversationId = router.query.id;

    const sendMessageEnter: KeyboardEventHandler<HTMLInputElement> = event=>{
        if(!newMessage)return
        if(event.key === 'Enter' && newMessage){
            event.preventDefault();
            addMessageToDbAndUpdateLastSeen();
        }
    }

    const onClickSendMessage = ()=>{
        if(!newMessage)return
        if(newMessage){
            addMessageToDbAndUpdateLastSeen();
        }
    }

    const endOfMessageRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = ()=>{
        endOfMessageRef.current?.scrollIntoView({behavior: 'smooth'});

    }

    const addMessageToDbAndUpdateLastSeen = async()=>{
        await setDoc(doc(db, 'users', loggedInUser?.email as string), {
            email: loggedInUser?.email,
            lastSeen: serverTimestamp(),
            photoURL: loggedInUser?.photoURL,
        }, {merge: true})

        await addDoc(collection(db, 'messages'), {
            conversation_id: conversationId,
            send_at: serverTimestamp(),
            text: newMessage,
            user: loggedInUser?.email
        })

        setNewMessage("");

        scrollToBottom();
    }

    const queryGetMessages =  generateQueryGetMessageConversation(conversationId as string);

    const [messagesSnapshot, messagesLoading, error]  = useCollection(queryGetMessages);

    const handleSendNewMessage = (e: any)=>{
        // addMessageToDbAndUpdateLastSeen();
        
        if (e.key === 'Enter') {
            console.log("sendNewMessage");
            e.preventDefault();
        }
    }


    const showMessages = ()=>{

        //if front-end loading messages behind the screen, display messages
        if(messagesLoading){
            return messages.map((message, index)=> <SingleMessage key={message.id} message={message}/>);
        }
        //If front-end finished loadding message
        if(messagesSnapshot){
            return messagesSnapshot.docs.map((message, index)=><SingleMessage key={message.id} message={transforMessage(message)}/>)
            
        }
    }

    // useEffect(()=>{

    // })
    
    return (
        <>
            <StyleRecipientHeader>
                <RecipientAvatar recipient={recipient} recipientEmail={recipientEmail}/>     
                <StyledHeaderInfo>
                        <StyledH3>
                            {recipientEmail}
                        </StyledH3>
                            {recipient && <span>Last active: {convertFirestoreTimestampToString(recipient?.lastSeen)}</span>}
                </StyledHeaderInfo>
                <StyleHeaderIcons>
                        <IconButton>
                            <AttachFileIcon/>
                        </IconButton>
                        <IconButton>
                            <MoreVertIcon/>
                        </IconButton>
                </StyleHeaderIcons>
            </StyleRecipientHeader>
            <StyledMessageContainer>
                {showMessages()}
                <EndOfMessageForAutoScroll ref={endOfMessageRef}/>
            </StyledMessageContainer>
            <StyledInputContainer>
                <IconButton>
                    <MoodIcon/>
                </IconButton>
                <StyledInput value={newMessage} onChange={(e)=> setNewMessage(e.target.value)} onKeyDown={sendMessageEnter}/>
                <IconButton onClick={onClickSendMessage}>
                    <SendIcon/>
                </IconButton>
                <IconButton>
                    <PhotoOutlinedIcon/>
                </IconButton>
            </StyledInputContainer>
        </>

    )
}

export default ConversationScreen