import { Avatar, IconButton, Tooltip, Input, FormControl, Button, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, OutlinedInput, InputAdornment } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import MoreVerticalIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import styled from "styled-components";
import { color } from "@mui/system";
import { signOut } from "firebase/auth";
import { auth, db } from "../config/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState } from "react";
import * as EmailValidator from "email-validator";
import { addDoc, collection, query, where } from "firebase/firestore";
import {useCollection} from 'react-firebase-hooks/firestore';
import { Conversation } from "../types";
import ConversationSelect from './ConversationSelect';

const StyledContainer = styled.div`
    height: 100vh;
    min-width: 300px;
    max-width: 350px;
    border-right: 1.2px solid #d8d8d8;
    
    overflow-y: scroll;

    /* Hide scrollbar for Chrome, Safari and Opera */
    ::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */

    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */

    @media(max-width: 768px){
        & p {
            display: none;
        }
    }


`;
const StyleHeader = styled.div`
    display: flex;
    position:sticky;
    top: 0;
    justify-content: space-between;
    align-items: center;
    padding: 0.475rem 1.25rem;
    background-color: #fff;
    border-bottom: 1.2px solid #d8d8d8;
`;
const StyledSearch = styled.div`
    display: flex;
    align-items: center;
    margin-top: 1em;
`;
const StyledSearchInput = styled(FormControl)`
    width: 100%;
    & .outlinedInputSearch{
        border-radius: 30px;
    }
    & input{
        padding:8.5px 14px 8.5px 0px;
    }

`
const StyledSidebarButton = styled(Button)`
    width: 100%;
`;

const StyledUserAvater = styled(Avatar)`
    cursor: pointer;
    :hover{
        opacity: 0.8
    }
`;



const StyledWarapperAction = styled.div`
   padding: 0.78125rem 1.25rem;
`
const Sidebar = () => {
    const logout = async() => {
        try{
            await signOut(auth);
        }catch(err){
            
        }
    }
    const [loggedInUser, loading, error] = useAuthState(auth);
    const [recipientEmail, setRecipientEmail] = useState("");
    const [isOpenNewConversationDialog, setIsOpenNewConversationDialog] = useState(false);
    const isInviteMySelf = loggedInUser?.email === recipientEmail;
    const [isValidDialogConversation, setIsValidDialogConversation] = useState(false);
    const [searchContact, setSearchContact] = useState("");
    const [contacts, setContacts] = useState([]);
    const openToggleNewConversation = (isOpen: boolean) => {
        setIsOpenNewConversationDialog(isOpen);
            if(!isOpen) setRecipientEmail("")           
    }

    const closeleNewConversation = () => {
        openToggleNewConversation(false)
    }

    const onChangeEmail = (e: any)=>{
        setRecipientEmail(e.target.value);
        if(!e.target.value) {
            setIsValidDialogConversation(false)
        }
        else{
            setIsValidDialogConversation(EmailValidator.validate(e.target.value) && e.target.value !== loggedInUser?.email)
        }
        
    }

    const queryGetConversationForCurrentUser = query(collection(db, 'conversation'), where('users', 'array-contains', loggedInUser?.email))

    const [conversationSnapshot, __loading, _error]= useCollection(queryGetConversationForCurrentUser);

    const isConversationAlreadyExist = (recipientEmail: string) => {
        return conversationSnapshot?.docs.find(conversation=> (conversation.data() as Conversation).users.includes(recipientEmail))
    }

    const createNewConversation = async()=>{
        if(!recipientEmail) return;
        if(EmailValidator.validate(recipientEmail) && !isInviteMySelf && !isConversationAlreadyExist(recipientEmail as string)){
            // add conversation user to db 'conversation' collection
            // a conversation is between currently user and logged in user
            try{
                await addDoc(collection(db, 'conversation'), {
                    users: [loggedInUser?.email, recipientEmail] 
                })
            }catch(error){console.log(error);
        }

        }
        closeleNewConversation();
    }

    const searchContactConversation = (e: any)=>{
        setSearchContact(e.target.value);
        const result  = conversationSnapshot?.docs.filter(conversation => (conversation.data() as Conversation).users.indexOf(e.target.value));
        
    }

    return (

    <StyledContainer className="sidebar">
        <StyleHeader>
            <Tooltip title={loggedInUser?.email as string} placement="right">
                <StyledUserAvater color="default" src={loggedInUser?.photoURL || ''}/>
            </Tooltip>
            <div>
                <IconButton onClick={logout}>
                    <LogoutIcon/>
                </IconButton>
            </div>
        </StyleHeader>
        <StyledWarapperAction>
            <StyledSidebarButton variant="outlined" onClick={()=>{openToggleNewConversation(true)}}>
                Start a new conversation
            </StyledSidebarButton>
            <StyledSearch>
                <StyledSearchInput>
                    <OutlinedInput className="outlinedInputSearch" placeholder="Search for contact..."
                        startAdornment={<InputAdornment position="start"><SearchIcon/></InputAdornment >}
                        onChange={(e)=>searchContactConversation(e)}/>
                </StyledSearchInput>
            </StyledSearch>
           
        </StyledWarapperAction>
        
        
        
        {
            
            conversationSnapshot?.docs.map(conversation=> 
            <ConversationSelect 
                key={conversation.id} 
                id={conversation.id}
                conversationUsers={(conversation.data() as Conversation).users} />)
        }
        
            {/*Start dialog */}
            <Dialog open={isOpenNewConversationDialog} onClose={closeleNewConversation}>
                <DialogTitle>New conversation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter a google email address for the user you wish to chat with.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        label="Email Address"
                        type="email"
                        value={recipientEmail}
                        onChange={(e)=>onChangeEmail(e)}
                        fullWidth
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeleNewConversation}>Cancel</Button>
                    <Button onClick={createNewConversation} disabled={!isValidDialogConversation}>Create</Button>
                </DialogActions>
            </Dialog>
            {/* End Dialog */}
        </StyledContainer>
  )
}

export default Sidebar