import { Avatar } from "@mui/material";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { auth } from "../config/firebase";
import { useRecipient } from "../hooks/useRecipent";
import {Conversation, IMessage} from "../types";

const StyledMessage = styled.p`
    word-break: break-all;
    width: fit-content;
    max-width: 90%;
    min-width: 30%;
    padding: 15px 15px 30px;
    border-radius: 8px;
    margin: 10px;
    position: relative;

`

const StyledSendMessageWrapper = styled.div`
    display: flex;
    justify-content: flex-end;
    padding-right: 5px;
    
`

const StyledReciveMessageWrapper = styled.div`
    display: flex;
    padding-left: 5px;
    
`

const StyledSenderMessage = styled(StyledMessage)`
    background-color: #cdf8c6;

`

const StyledReciveMessage = styled(StyledMessage)`
    background-color: #fff;
`

const StyledTimestamp = styled.span`
    color: gray;
    padding: 10px;
    font-size: x-small;
    position: absolute;
    bottom: 0;
    right: 0;
    text-align: right;

`

const SingleMessage = ({message, conversation}: {message: IMessage, conversation: Conversation}) => {
    const [loggedInUer, loading, error] = useAuthState(auth);
    const conversationUser = conversation.users;
    const {recipient, recipientEmail} = useRecipient(conversationUser);

    // const MessageType = loggedInUer?.email === message.user ? StyledSenderMessage : StyledReciveMessage;

    

    return (
        // <StyledMessageWrapper>
        //     <MessageType>
        //         {message.text}
        //         <StyledTimestamp>{message.send_at}</StyledTimestamp>
        //     </MessageType>
        // </StyledMessageWrapper>
       <>
            {
                loggedInUer?.email === message.user ? 
                <StyledSendMessageWrapper style={{justifyContent: 'flex-end'}}>
                    
                    <StyledSenderMessage>
                        {message.text}
                        <StyledTimestamp>{message.send_at}</StyledTimestamp>
                    </StyledSenderMessage>
                    <Avatar src={loggedInUer?.photoURL || ''}/>
                </StyledSendMessageWrapper>
                :
                <StyledReciveMessageWrapper>
                    <Avatar src={recipient?.photoURL}/>
                    <StyledReciveMessage>
                        {message.text}
                        <StyledTimestamp>{message.send_at}</StyledTimestamp>
                    </StyledReciveMessage>
                    
                </StyledReciveMessageWrapper>
            
            }
       </>
    );
}

export default SingleMessage;
