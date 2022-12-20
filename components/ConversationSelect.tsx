import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useRecipient } from '../hooks/useRecipent';
import {Conversation} from '../types';
import { RecipientAvatar } from './RecipientAvatar';
import Box from '@mui/material/Box';


const StyledContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 5px;
    cursor: pointer;
    word-break: break-all;
    margin-right: 10px;
    justify-content: 'space-around';

    :hover{
        background-color: #d7dae7;
        border-radius: 5px;
    }
    &.active{
        background-color: #E4E6EF;
        border-radius: 5px;
    }
`

const ConversationSelect = ({id, conversationUsers} : { id: string, conversationUsers: Conversation['users']}) => {

    const {recipient, recipientEmail} = useRecipient(conversationUsers);
    const router = useRouter();
    const conversationId = router.query.id;
    const onSelectConversation = ()=>{
        router.push(`/conversation/${id}`);
    }

    return (
        <StyledContainer onClick={onSelectConversation} className={conversationId === id ? 'active': ''}>
            <RecipientAvatar recipient={recipient} recipientEmail={recipientEmail}/>
            <p>{recipientEmail}</p>
        </StyledContainer>
    )
}

export default ConversationSelect

