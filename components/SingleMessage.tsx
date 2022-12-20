import { Avatar, Card, CardActions, CardMedia } from "@mui/material";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { auth, storage } from "../config/firebase";
import { useRecipient } from "../hooks/useRecipent";
import {Conversation, IMessage} from "../types";
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import IconButton from '@mui/material/IconButton';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Image from 'next/image';
import pdfIcon from "../assets/icon/pdf-file.png";
import csvIcon from "../assets/icon/csv.png";
import excelIcon from "../assets/icon/excel.png";
import pptIcon from "../assets/icon/powerpoint.png";
import wordIcon from "../assets/icon/word.png";
import { getStorage, getDownloadURL, ref } from 'firebase/storage';
import ReactPlayer from "react-player";

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
    background-color: #ddecfa;
    border: 1px solid #eee;
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

const StyledMediaWrapper = styled(Card)`
    margin-right: 5px;
    margin-top: 30px;
    max-width: 280px;

`

const StyledFileWrapper = styled(StyledMediaWrapper)`
    display: flex;
    justify-content: space-between;
    padding: 10px;
    align-items: center;
    width: 90%;
    cursor: pointer;
`

const SingleMessage = ({message, conversation}: {message: IMessage, conversation: Conversation}) => {
    const [loggedInUer, loading, error] = useAuthState(auth);
    const conversationUser = conversation.users;
    const {recipient, recipientEmail} = useRecipient(conversationUser);

    const checkTypeFile = (type: String)=>{
        if(!type) return false;
        return type.indexOf('image') !== -1;
    }

    const fileClassification = (type: String)=>{
        if(!type)return false;
        switch(true) {
            case type.indexOf('pdf') !== -1:
                return <Image src={pdfIcon} alt="pdf" height="30" width="30"/>;
            case type.indexOf('csv') !== -1:
                return <Image src={csvIcon} alt="csv" height="30" width="30"/>;
            case type.indexOf('excel') !== -1 || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                return <Image src={excelIcon} alt="excel" height="30" width="30"/>;
            case type.indexOf('word') !== -1:
                return <Image src={wordIcon} alt="word" height="30" width="30"/>;
            case type.indexOf('ppt') !== -1 || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                return <Image src={pptIcon} alt="powerpoint" height="30" width="30"/>;
            default: 
                return ''
        }
    }

    const downloadFile = (filename: any)=> {
        const storage = getStorage();
        const startRef =  ref(storage, `files/${filename}`);
        getDownloadURL(startRef)
         .then(async (url)=>{
           fetch(url, {method: 'get', mode: 'no-cors', referrerPolicy: 'no-referrer'})
           .then(res=> res.blob())  
           .then(res=>{
                const aElement = document.createElement('a');
                aElement.setAttribute('download', filename);
                const href = URL.createObjectURL(res);
                aElement.href = href;
                aElement.setAttribute('target', '_blank');
                aElement.click();
                URL.revokeObjectURL(href);
           })
           
        }).catch(error=>{
            switch (error.code) {
                case 'storage/object-not-found':
                  // File doesn't exist
                  break;
                case 'storage/unauthorized':
                  // User doesn't have permission to access the object
                  break;
                case 'storage/canceled':
                  // User canceled the upload
                  break;
          
                // ...
          
                case 'storage/unknown':
                  // Unknown error occurred, inspect the server response
                  break;
              }
        })
        
       
    }
    
    const downloadImage = (filename: any)=>{
        const storage = getStorage();
        
        const startRef = ref(storage, `files/${filename}`);
        getDownloadURL(startRef)
            .then(async(url)=>{
                const image = await fetch(url, {method: 'GET'})
                const imageBlog = await image.blob()
                const imageURL = URL.createObjectURL(imageBlog)

                const link = document.createElement('a')
                link.href = imageURL
                link.download = filename;
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                
                                
            }).catch(error=> console.log(error))

        
        
        

    }

    const checkYoutubeUrl = (url: String)=>{
        if (url) {
        var regExp = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        if (url.match(regExp)) {
            return true;
        }
        }
        return false;
    }

  

    

    return (
       <>
            {
                loggedInUer?.email === message.user ? 
                <StyledSendMessageWrapper style={{justifyContent: 'flex-end'}}>
                    { message.text ? 
                        <StyledSenderMessage>
                            { checkYoutubeUrl(message.text) ? 
                                <ReactPlayer url={message.text}/>
                                :
                                message.text
                            }
                            <StyledTimestamp>{message.send_at}</StyledTimestamp>
                        </StyledSenderMessage> : 
                        message.file.type && checkTypeFile(message.file.type) ?
                        <StyledMediaWrapper> 
                            <CardMedia component="img" image={message.file.url || ''} alt={message.file.name || ''} height="210" id="imgMessage"/>
                            <CardActions sx={{justifyContent: 'flex-end', padding: '5px'}}>
                                <IconButton onClick={()=>downloadImage(message.file.name)}> <DownloadOutlinedIcon/></IconButton>
                            </CardActions>
                            </StyledMediaWrapper>
                        : 
                            <StyledFileWrapper sx={{backgroundColor: '#ddecfa'}}>
                                {fileClassification(message.file.type)}
                                {message.file.name}
                                <IconButton aria-label="download" onClick={()=>downloadFile(message.file.name)}> <DownloadOutlinedIcon/> </IconButton>
                            </StyledFileWrapper>
                    }
                    <Avatar src={loggedInUer?.photoURL || ''}/>
                </StyledSendMessageWrapper>
                :
                <StyledReciveMessageWrapper>
                    <Avatar src={recipient?.photoURL}/>
                    { message.text ?  
                        <StyledReciveMessage>
                            {checkYoutubeUrl(message.text) ? 
                                <ReactPlayer url={message.text}/>
                                :
                                message.text
                            }
                            <StyledTimestamp>{message.send_at} 
                            </StyledTimestamp>
                        </StyledReciveMessage>:
                        message.file.type && checkTypeFile(message.file.type) ?
                            <StyledMediaWrapper> 
                                <Image src={message.file.url || ''} alt={message.file.name} height="210"/>
                            </StyledMediaWrapper>
                        :
                        <StyledFileWrapper>
                            {fileClassification(message.file.type)}
                            {message.file.name}
                            <IconButton aria-label="download" onClick={()=>downloadFile(message.file.name)}> <DownloadOutlinedIcon/> </IconButton>
                        </StyledFileWrapper>

                    }
                    
                    
                </StyledReciveMessageWrapper>
            
            }
       </>
    );
}

export default SingleMessage;
