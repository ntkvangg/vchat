import React from 'react';
import styled from 'styled-components';

const StyledContainer = styled.div`
    display: flex;
    margin: 10px;
`
const StyledCardUploadFile = styled.div`
    background-color: #fff;
    box-shadow: 5px 3px #eee;


`

const ReviewFileUpload = () => {
  return (
    <StyledContainer>
        <StyledCardUploadFile></StyledCardUploadFile>
    </StyledContainer>
  )
}

export default ReviewFileUpload
