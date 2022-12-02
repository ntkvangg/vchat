import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { auth } from "../config/firebase";
import {IMessage} from "../types";

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

const StyledSenderMessage = styled(StyledMessage)`
    margin-left: auto;
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

const SingleMessage = ({message}: {message: IMessage}) => {
    const [loggedInUer, loading, error] = useAuthState(auth);

    const MessageType = loggedInUer?.email === message.user ? StyledSenderMessage : StyledReciveMessage;

    return (
        <MessageType>
            {message.text}
            <StyledTimestamp>{message.send_at}</StyledTimestamp>
        </MessageType>
    );
}

export default SingleMessage;
