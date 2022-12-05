import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useRecipient } from '../hooks/useRecipent';
import {Conversation} from '../types';
import { RecipientAvatar } from './RecipientAvatar';

const StyledContainer = styled.div`
    display: flex;
    align-items: center;
    padding: 10px;
    cursor: pointer;
    word-break: break-all;
    border-bottom: 1px solid #eee;
    justify-content: 'space-around';

    :hover{
        background-color: #e9eaeb;
    }
`

const ConversationSelect = ({id, conversationUsers} : { id: string, conversationUsers: Conversation['users']}) => {

    const {recipient, recipientEmail} = useRecipient(conversationUsers);
    const router = useRouter();
    const onSelectConversation = ()=>{
        router.push(`/conversation/${id}`)
    }

    return (
        <StyledContainer onClick={onSelectConversation}>
            <RecipientAvatar recipient={recipient} recipientEmail={recipientEmail}/>
            <p>{recipientEmail}</p>
        </StyledContainer>
    )
}

export default ConversationSelect

