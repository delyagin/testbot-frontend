import React from 'react'
import './popup.css'
import MenuItem from './MenuItem';

export default function PopUpMenu(props) {  
  // console.log("PopUp props: ", props);
  return (  
            props.text.map((item, i) => 
              <MenuItem key={i} className='dropdown-content' onClick={props.onClick[i]} text={item}/> 
    ) 
            // <MenuItem className='dropdown-content' onClick={props.onClick} text={props.text}/>           
        );
}
// className='menu-popup right-pos'