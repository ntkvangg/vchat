import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useRecipient } from '../hooks/useRecipent';
import {Conversation} from '../types';
import { RecipientAvatar } from './RecipientAvatar';
import Box from '@mui/material/Box';


const StyledContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 0.2rem 0.3rem;
    cursor: pointer;
    word-break: break-all;
    margin: 0px 10px;
    margin-bottom: 0.375rem;
    justify-content: 'space-around';
    border-radius: 6px;

    :hover{
        background-color: rgba(58, 53, 65, 0.04);
        
    }
    &.active{
        background-image: linear-gradient(98deg, rgb(198, 167, 254), rgb(145, 85, 253) 94%);
        
    }

    & p{
        margin: 0px;
        font-family: Inter, sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        line-height: 1.5;
        letter-spacing: 0.15px;
        color: rgba(58, 53, 65, 0.87);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
        font-size: 0.875rem;
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

