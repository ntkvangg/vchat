import Avatar from "@mui/material/Avatar";
import styled from "styled-components";
import { useRecipient } from "../hooks/useRecipent";

type Props = ReturnType <typeof useRecipient>

const StyledAvatar = styled(Avatar)`
    margin: 5px 15px 5px 5px;
    & .avatarCustom{
      height:34px;
      width: 34px;
    }
`


export const RecipientAvatar = ({recipient, recipientEmail}: Props) => {
  return (
    <StyledAvatar>
        {
            recipient?.photoURL ? <Avatar src={recipient?.photoURL}/> : 
            <Avatar className="avatarCustom">
                {recipientEmail && recipientEmail[0].toUpperCase()}
            </Avatar>
        } 
    </StyledAvatar>
  )
}
