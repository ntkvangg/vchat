import IconButton from '@mui/material/IconButton';
import React, { KeyboardEventHandler, useEffect, useRef, useState } from 'react'
import styled from 'styled-components';
import { useRecipient } from '../hooks/useRecipent';
import { AppUser, Conversation, IMessage } from '../types/index';
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
import { addDoc, collection, doc, query, serverTimestamp, setDoc, where,updateDoc, getDoc, getDocs  } from 'firebase/firestore';
import { auth, db, storage } from '../config/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import PhotoOutlinedIcon from '@mui/icons-material/PhotoOutlined';
import { Avatar, Card, OutlinedInput, FormControl, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, Stack, Checkbox, Badge, Input, InputAdornment } from '@mui/material';
import {getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable} from 'firebase/storage';
import EmojiPicker from 'emoji-picker-react';
import FilterIcon from '@mui/icons-material/Filter';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchIcon from '@mui/icons-material/Search';

interface File {
    name: String;
}


const StyleRecipientHeader = styled.div`
    display: flex;
    position: sticky;
    top: 0;
    align-items: center;
    background-color: #fff;
    border-bottom: 1.2px solid #d8d8d8;
    z-index: 100;

`

const StyledHeaderInfo = styled.div`
    margin: 5px;
    flex-grow: 1;

    & p{
        word-break: break-all;
        margin: 0px;
        font-family: Inter, sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        line-height: 1.5;
        letter-spacing: 0.15px;
        color: rgba(58, 53, 65, 0.87);
        font-weight: 700;
        font-size: 0.875rem;
    }
    & span{
        margin: 0px;
        font-family: Inter, sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-weight: 400;
        font-size: 0.75rem;
        line-height: 1.66;
        letter-spacing: 0.4px;
        color: rgba(58, 53, 65, 0.38);
    }

`

const StyledH3 = styled.p`
    

`

const StyleHeaderIcons = styled.div`
    display: flex;
`

const StyledMessageContainer = styled.div`
    padding: 3px;
    background-color: #f7f7f8;
    min-height: 90%;

    

    
        
`

const StyledFooterChatContainer = styled(Card)`
    display: flex;
    align-items: center;    
    position: sticky;
    bottom: 0;
    z-index: 100;
    
`

const EndOfMessageForAutoScroll = styled.div`
    margin-bottom: 30px;
`

const StyledInput = styled(OutlinedInput)`
    & input{
      padding:10px 14px 10px 0px;
    }

    &.inputSearch .MuiOutlinedInput-notchedOutline{
        border: none
    }
`

const StyledAvatar = styled(Avatar)`

`

const StyledChoseUser = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

`
const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
const ConversationScreen = ({conversation, messages}: {conversation: Conversation; messages: IMessage[]}) => {
    const [loggedInUser, _loading, _error] = useAuthState(auth);
    const conversationUsers  =  conversation.users;
    const {recipient, recipientEmail} = useRecipient(conversationUsers);
    const [newMessage, setNewMessage] = useState("");   
    const [selectedFile, setSelectedFile] = useState(null);
    const [isOpenEmotion, setIsOpenEmotion] = useState(false);
    const [emojies, setEmojies] = useState(Array<any>([]));
    const [isOpenAddGroup, setIsOpenAddGroup] = useState(false);
    const [searchPeople, setSearchPeople] = useState("");
    const [selectedUsers, setSelectedUsers] = useState(Array<any>([]));
    const [isDisabledAddGroup, setIsDisabledAddGroup] = useState(true);
    const [userList, setUserList]= useState(Array<any>([]));
    const [usersListDefault, setUsersListDefault] = useState(Array<any>([]));

    let icons: any[] = [];

    const router = useRouter()
    const conversationId = router.query.id;

    const sendMessageEnter: KeyboardEventHandler<HTMLInputElement> = event=>{
        if(!newMessage)return
        if(event.key === 'Enter' && newMessage){
            event.preventDefault();
            addMessageToDbAndUpdateLastSeen();
        }
    }

    const onChangeFileUpload = (e: any)=>{
        if(!(e.target.files && e.target.files[0])) return;

        const storageRef = ref(storage, `files/${e.target.files[0].name}`);
        
        // Upload the file and metadata
        const uploadTask = uploadBytesResumable(storageRef, e.target.files[0]);

        uploadTask.on('state_changed', (snapshot)=>{
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            switch (snapshot.state) {
            case 'paused':
                
                break;
            case 'running':
                
                break;
            }
        },(error)=>{
            // Handle unsuccessful uploads
        },()=>{
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then( async (downloadURL) => {
                await setDoc(doc(db, 'users', loggedInUser?.email as string), {
                    email: loggedInUser?.email,
                    lastSeen: serverTimestamp(),
                    photoURL: loggedInUser?.photoURL,
                }, {merge: true})
        
                await addDoc(collection(db, 'messages'), {
                    conversation_id: conversationId,
                    send_at: serverTimestamp(),
                    text: newMessage,
                    user: loggedInUser?.email,
                    file:{
                        url: downloadURL,
                        name: e.target.files[0].name,
                        type: e.target.files[0].type
                    }
                })  
                
            });
        })
        setNewMessage("");
        
        scrollToBottom();
    }
  

    const onClickSendMessage = ()=>{
        if(!newMessage)return
        if(newMessage){
            addMessageToDbAndUpdateLastSeen();
        }
    }

   
    const endOfMessageRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = ()=>{
        if(messages && messages.length){
            endOfMessageRef.current?.scrollIntoView({behavior: 'smooth'});    
        }
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
        setIsOpenEmotion(false);
        setEmojies([]);
        scrollToBottom();
    }

    const queryGetMessages =  generateQueryGetMessageConversation(conversationId as string);

    const [messagesSnapshot, messagesLoading, error]  = useCollection(queryGetMessages);
    const queryGetConversationForCurrentUser = query(collection(db, 'conversation'), where('users', 'array-contains', loggedInUser?.email))
    const [conversationSnapshot, __loading, __error]= useCollection(queryGetConversationForCurrentUser);
    


    const showMessages = ()=>{

        //if front-end loading messages behind the screen, display messages
        if(messagesLoading){
            return messages.map((message, index)=> <SingleMessage key={message.id} message={message} conversation={conversation} />);
        }
        //If front-end finished loadding message
        if(messagesSnapshot){
            return messagesSnapshot.docs.map((message, index)=>{
                return <SingleMessage key={message.id} message={transforMessage(message)} conversation={conversation} />
            })
            
        }
    }

    const onEmojiClick = (emojiObject: any)=> {
        emojies.push(emojiObject.emoji);
        setNewMessage(emojies.join(' '));
        
    }

    const closeAddGroupDialog = async()=>{
        setIsOpenAddGroup(false);
        setSelectedUsers([]);
        setIsDisabledAddGroup(true);

    }

    const addMemberToGroup = async()=>{
        const memberOrigin = [loggedInUser?.email, recipientEmail];
        const newMembers:any[] = [];
        const conversationRef = doc(db, "conversation", conversationId as string);
        selectedUsers.forEach((item, index)=>{
            newMembers.push(item[0]);
        });
        const groups:any[] = memberOrigin.concat(newMembers);
        try{
            await updateDoc(conversationRef, {
                users: groups
            });
        }catch(error){console.log(error);}
        closeAddGroupDialog();
    }

    const onChangeSearchContact = (e: any)=>{
        setSearchPeople(e.target.value);
        setUserList(()=>{
            if(!e.target.value)return usersListDefault;
            return userList.filter(item=> item.indexOf(e.target.value) !== -1);
        })
    }

    const addGroup = (isOpen: boolean)=>{
        setIsOpenAddGroup(isOpen);
    }

    const onChangeSelectedUser = (e: any, email: string)=>{
        if(e.target.checked) {
           selectedUsers.push(email);
        }else{
            selectedUsers.forEach((item, index)=>{
                if(item === email){
                    selectedUsers.splice(index, 1);
                }
            })
        }
        setIsDisabledAddGroup(!!!selectedUsers.length);
    }


    useEffect(()=>{
        scrollToBottom();
        const getUsers = async()=>{
            const queryGetConversationForCurrentUser = query(collection(db, 'conversation'), where('users', 'array-contains', loggedInUser?.email));
            const userSnapshot = await getDocs(queryGetConversationForCurrentUser);
            const users: any = [];
            userSnapshot.forEach(doc=>{
                doc.data().users.forEach((user: any)=>{
                    if(user !== loggedInUser?.email){
                        users.push(user);
                    }
                })
            });
            const usersRemoveDuplicate =  users.filter((item: any, index: number)=>users.indexOf(item) === index)
            setUserList(usersRemoveDuplicate);
            setUsersListDefault(usersRemoveDuplicate);
            
        }
        getUsers();
    }, [conversationId])
    
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
                        <IconButton onClick={()=>addGroup(true)}>
                            <GroupAddIcon/>
                        </IconButton>
                        {/* <IconButton>
                            <MoreVertIcon/>
                        </IconButton> */}
                        <IconButton>
                            <FilterIcon/>
                        </IconButton>
                </StyleHeaderIcons>
            </StyleRecipientHeader>
            <StyledMessageContainer>
                {showMessages()}
                <EndOfMessageForAutoScroll ref={endOfMessageRef}/>
            </StyledMessageContainer>
            <StyledFooterChatContainer>
                <IconButton onClick={()=>setIsOpenEmotion(!isOpenEmotion)}>
                    <MoodIcon/>
                </IconButton>
                <FormControl sx={{width: '100%'}}>
                    <StyledInput className='inputSearch' placeholder='Type your message here...' value={newMessage} onChange={(e)=> setNewMessage(e.target.value)} onKeyDown={sendMessageEnter}/>
                </FormControl>
                    <IconButton onClick={onClickSendMessage} disabled={!newMessage}>
                        <SendIcon/>
                    </IconButton>
                    <IconButton aria-label="upload file" component="label">
                        <input hidden type="file" name="file" onChange={(e)=>onChangeFileUpload(e)}/>
                        <PhotoOutlinedIcon/>
                    </IconButton>
                
                
            </StyledFooterChatContainer>
            {isOpenEmotion ? <EmojiPicker onEmojiClick={(emojiObject)=>onEmojiClick(emojiObject)}/> : null}
            <Dialog open={isOpenAddGroup} onClose={closeAddGroupDialog}>
                <DialogTitle sx={{textAlign: 'center'}}>Add to Group</DialogTitle>
                <DialogContent>
                    <TextField
                        id="search-people"
                        placeholder='Search people'
                        value={searchPeople}
                        variant="standard"
                        InputProps={{
                            startAdornment:(
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                        onChange={(e)=>onChangeSearchContact(e)}
                        fullWidth
                        sx={{marginBottom: 2}}
                    />
                    <div>
                        {
                            userList.map(email=>{
                                return(
                                    <StyledChoseUser key={email}>
                                        <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                                            <Avatar src=""/>
                                            <p>{email}</p>
                                        </Stack>
                                        <Checkbox
                                            {...label}
                                            onChange={(e)=>{onChangeSelectedUser(e, email)}}
                                            icon={<RadioButtonUncheckedIcon />}
                                            checkedIcon={<CheckCircleOutlineIcon />}
                                        />
                                    </StyledChoseUser>
                                )
                            })
                        }
                    </div>
                </DialogContent>
                <DialogActions sx={{justifyContent: 'center'}}>
                    <Button onClick={addMemberToGroup} variant="contained" color="secondary" disabled={isDisabledAddGroup}>Done</Button>
                </DialogActions>
            </Dialog>
        </>

    )
}



const AvatarGroup =({user}: {user: Conversation['users']})=>{
    const {recipient, recipientEmail} = useRecipient(user);
    return (
        <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
            <RecipientAvatar recipient={recipient} recipientEmail={recipientEmail}/>
            <p>{recipientEmail}</p>
        </Stack>
        
        
    )
}


export default ConversationScreen