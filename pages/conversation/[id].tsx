import styled from 'styled-components';
import Head from "next/head";
import { useRecipient } from '../../hooks/useRecipent';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, getDocs } from 'firebase/firestore';
import {Conversation, IMessage} from "../../types";
import {GetServerSideProps} from 'next';
import { generateQueryGetMessageConversation, getRecipientEmail, transforMessage } from '../../utils/getRecipentEmail';
import Sidebar from '../../components/Sidebar';
import ConversationScreen from '../../components/ConversationScreen';

interface Props {
    conversation: Conversation,
    messages: IMessage[]
}

const StyledContainer = styled.div`
    display: flex;
    

`

const StyledConversationContainer = styled.div`
    flex-grow: 1;
    height: 100vh;
    overflow-y: scroll;
    cursor: pointer;

    /* Hide scrollbar for Chrome, Safari and Opera */
    ::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */

    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */

    
    
`

const ConversationChat = ({conversation, messages}: Props) => {

    const [loggedInUser, loading, error] = useAuthState(auth);
    // const {recipient, recipientEmail} = useRecipient()
    return (
        <StyledContainer>
            <Head>
                <title>Conversation with {getRecipientEmail(conversation.users, loggedInUser)}</title>
            </Head>
            <Sidebar/>
            <StyledConversationContainer>
                <ConversationScreen conversation={conversation} messages={messages}/>
            </StyledConversationContainer>
            {/* {messages.map((message, index) => <p key={index}>{JSON.stringify(message)}</p>)} */}
        </StyledContainer>
    )
}

export default ConversationChat;

export const getServerSideProps: GetServerSideProps<Props, {id: string}> = async context =>{
    const conversationId = context.params?.id;

    //get conversation who know chatting with
    
    const conversationRef = doc(db, 'conversation', conversationId as string)
    const conversationSnapshot = await getDoc(conversationRef);

    // get all message between loggin user and recipient in this conversation
    const queryMessages =  generateQueryGetMessageConversation(conversationId as string);

    //https://firebase.google.com/docs/firestore/query-data/get-data
    const messageSnapshot = await getDocs(queryMessages);
    const messages = messageSnapshot.docs.map(messageDoc=> transforMessage(messageDoc))
    

    return {
        props: {
            conversation: conversationSnapshot.data() as Conversation, 
            messages
        },
        
        
    } 
}