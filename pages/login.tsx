import { Button } from "@mui/material";
import Head from "next/head";
import styled from "styled-components";
import Image from "next/image";
import vChatLogo from "../assets/vChatLogo.png";
import {useSignInWithGoogle} from 'react-firebase-hooks/auth'
import { auth } from "../config/firebase";

const StyledContainer = styled.div`

    height: 100vh;
    display: grid;
    place-items: center;
    background-color: whitesmoke;
`;

const StyledLoginContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100px;
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 /0.1), 0 4px 6px -4px rgb(0 0 0 /0.1);

`

export const StyledImageWrapper = styled.div`
    margin-bottom: 50px;


`


const Login = () => {
    const [signInWithGoogle, __user, __loading, error] = useSignInWithGoogle(auth);
    const signin = ()=>{
        signInWithGoogle();
    }
  return (
    <StyledContainer>
        <Head>
            <title>vChat</title>
        </Head>
        <StyledLoginContainer>
            <StyledImageWrapper>
                <Image src={vChatLogo} alt="vChat Logo" height="200" width="200"/>
            </StyledImageWrapper>
            <Button variant="outlined" onClick={signin}>
                Sign with google
            </Button>
        </StyledLoginContainer>
    </StyledContainer>
  );
}

export default Login;
