import './modal.css'

export default function Modal({active, setActive, children, title}) {
    // console.log("children: ", children)
    return (
      <div className={active? 'modal active' : 'modal'} onClick={() => setActive(false)}>
          <div className={active? 'modal__content active' : 'modal__content'} onClick={e => e.stopPropagation()}>
              {/* <div className='dialog-title'>
                <div>
                    <div className='cell flex-1'>

                    </div>
                </div>
              </div> */}
              {children}
          </div>    
      </div>
    )
  }

//   