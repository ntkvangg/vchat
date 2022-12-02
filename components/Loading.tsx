import styled from "styled-components";
import {StyledImageWrapper} from "../pages/login";
import Image from "next/image";
import vChatLogo from "../assets/vChatLogo.png";
import { CircularProgress } from "@mui/material";

const StyledContainer = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    place-items: center;
    height: 100vh;    

`

const Loading = () => {
  return (
    <StyledContainer>
      <StyledImageWrapper>  
        <Image src={vChatLogo} alt="Loading" height="200" width="200" />
      </StyledImageWrapper>
      <CircularProgress/>
    </StyledContainer>
  )
}

export default Loading
