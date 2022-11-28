import React from 'react'

export default function InputRow(props) {
    return (
        <div className='row'>
            <div className='cell flex-1'>
                {props.label}
            </div>
              <div className='cell flex-2'>
                <input 
                  type='text'
                  placeholder={props.label}
                  value={props.value}
                  onChange={props.onChange} 
                  />
              </div>
            </div>
      )
}
