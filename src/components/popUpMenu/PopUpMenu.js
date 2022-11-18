import React from 'react'
import './popup.css'
import MenuItem from './MenuItem';

export default function PopUpMenu(props) {  
  return (  
            // <span >
              <MenuItem className='dropdown-content' onClick={props.onClick} text={props.text}/>  
            // </span>          
        );
}
// className='menu-popup right-pos'