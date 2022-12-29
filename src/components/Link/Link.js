import { useNavigate } from 'react-router-dom'
import React from 'react'

export default function Link(props) {
    // console.log("Link props: ", props)
    let navigate = useNavigate();
    const doLink = (event) => {
      event.stopPropagation();
      if(event.button === 0){
          event.preventDefault();
          navigate(props.href);
      }
    }
    return (
      <a href={props.href} onClick={doLink} >{props.title}</a>
    )
  }