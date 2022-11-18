import React, { Component, useEffect, useRef, useState} from 'react'
import { Button } from 'reactstrap';
import {V_products_all, V_machines_all, db_subscribe, db_unsubscribe, db_items, api_request } from '../functions/functions'
import Modal from './Modal/Modal';
import { useNavigate } from 'react-router-dom'

function useOutsideAlerter(ref) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event) {
        if (ref.current && !ref.current.contains(event.target)) {
          alert("You clicked outside of me!");
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

export default class ProductList extends Component {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.state = {
          items: V_products_all(),
          contacts_list: [],
          // machines: V_machines_all(),
          isShow: false,
          _isMounted: false,
          popUpMenu: false, 
          modalActive : false,
          title: '',
          pathPattern: ''
          
        }
        // this.doNewProduct = this.doNewProduct.bind(this)
        this.setTitle = this.setTitle.bind(this);
        this.setPathPattern = this.setPathPattern.bind(this);
        this.doCreate = this.doCreate.bind(this);
        this._dbDidUpdate = this._dbDidUpdate.bind(this)
        
        // console.log("Constructor")
    }
    _dbDidUpdate = () => {
      // console.log("_dbDidUpdate isMounted", this.state._isMounted)
      if (this.state._isMounted) this.forceUpdate();
    }
    componentDidMount(){
      // console.log("DidMount");
      var statemap = this._dbum_state || (this._dbum_state = []);
          for (var key in this.state) {
              var prev = statemap[key];
              statemap[key] = db_subscribe(this.state[key], this._dbDidUpdate)
              if (prev) db_unsubscribe(prev);
          }
      this.setState({
        _isMounted: true
      })      
  };
  setTitle = (event) => {
    console.log("event.target.value", event.target.value)
    this.setState({
        title : event.target.value
    })
  }
  setPathPattern = (event) => {
    this.setState({
        pathPattern : event.target.value
    })
  }
  doCreate = (event) => {
    event.preventDefault();
    api_request("create/product", {
        title: this.state.title,
        path_pattern: this.state.pathPattern,
    })
    this.setState({
      title: "",
      pathPattern: ""
    })
  }
  setModalActive = (value) => {
    this.setState({
      modalActive: value,
      title: "",
      pathPattern: "",
      popUpMenu: value==false ? false : true
    })
    // console.log("value: ", value)
  }
  render() {
        var products = db_items(this.state.items);

        return (
        <div>
            <div className='row h1'>
                <div className='cell flex-1'>ProductList</div>
                <div>
                    <button className='menu-container' onClick={() => this.setState(prevState =>{
                        return{
                            ...prevState,
                            popUpMenu: !prevState.popUpMenu
                        }
                    })}>
                        Dropdown
                    </button>
                </div>
                
            </div>
            <div className='ppup'>{this.state.popUpMenu && <PopUpMenu onSelect={() => this.setModalActive(true)} text="Add a new product..." />}</div>
            {/* <button onClick={() => this.setModalActive(true)}>Open modal</button>  */}
            {/* onClick={this.setModalActive(true) */}
            <Modal  active={this.state.modalActive} setActive={this.setModalActive}>
                    <div>
                        <div className='row2'>
                            <div className='cell flex-1'>New Product</div>
                            <Button color='danger' onClick={() => this.setModalActive(false)}>X</Button>
                        </div>
                        <InputRow label='Title' value={this.state.title} onChange={this.setTitle} />
                        <InputRow label='Path pattern' value={this.state.pathPattern} onChange={this.setPathPattern} />
                        <Button 
                          color='primary' 
                          className='button'
                          onClick={this.doCreate}
                          >Create</Button>
                    </div>
            </Modal>
            <div className='row h2'>
                <div className='cell flex-1'>Title</div>
                <div className='cell flex-2'>Path pattern</div>
                {/* {products.map((item,i) => 
                <tr key={i}>
                    <td> {item.title} </td>
                    <td> {item.path_pattern} </td>
                </tr>
                )} */}
            </div>
                <SortedRows 
                    viewName={this.state.items}
                    sortKey='title'
                    rowFactory={<ProductRow />} 
                    />

            </div>
        )
  }
}

function PopUpMenu(props) {
    const wrapperRef = useRef(null);
    // useOutsideAlerter(wrapperRef)
    console.log("props", props)
    function child() {
        return "PopUpMenu"
    }
    return (
            // <ul className="drop-down">
            //   <li>Menu-item-1</li>
            //   <li>Menu-item-2</li>
            //   <li>Menu-item-3</li>
            // </ul>
            <div className='menu-popup'>  
              <span>
                <MenuItem onSelect={props.onSelect} text={props.text}/>  
              </span>
            </div>
            
          );
  }

 class MenuItem extends Component {
    constructor(props) {
    super(props);
    this.doMouseDown = this.doMouseDown.bind(this)
    }
    doMouseDown = (event) => {
        console.log("props MenuItem", this.props)
        if (event.button == 0){
            console.log("button is 0")
            event.preventDefault();
            event.stopPropagation();
            document.activeElement.blur();
            this.props.onSelect();
        }
    }
    render() {
      return (
        <div className='menu-item clickable' onMouseDown={this.doMouseDown}>{this.props.text}</div>
      )
    }
  }
  
class NewProductDialog extends Component {
  constructor(props){
    super(props);
    this.state = {
        dialogOpened: false
    }
    
    this.doCreate = this.doCreate.bind(this);
    this.toggleDialog = this.toggleDialog.bind(this);
    // this.renderDialog = this.renderDialog.bind(this);
  }  
  toggleDialog(){
    this.setState(prevState =>{
        return{
            ...prevState,
            dialogOpened: !prevState.dialogOpened
        }})
  }
  renderDialog(){
    //TODO
  }
  //TODO: change refs to callback
  doCreate = (event) => {
    event.preventDefault();
    api_request("create/product", {
        title: this.props.title,
        path_pattern: this.props.path_pattern,
    })
    console.log("NewProductDialog props: ", this.props)
  }

  render() {
    return (
      <form onSubmit={this.doCreate}>
        <InputRow label='Title:' />
      </form>
    )
  }
}


// class InputRow extends Component {
//     constructor(props){
//         super(props);
//         this.getValue = this.getValue.bind(this);
//     }
//   getValue = () => {
//     return this.props.inpuRef
//   }
//   render() {
//     return (
//       <div>
//         <input placeholder='InputRow function' ref={props.inpuRef} />
//       </div>
//     )
//   }
// }

function InputRow(props) {
    // console.log("props", props)
    // const [text, setText] = useState("");
    // const search = (event) => {
    //     console.log("InputRow event.value", event.target.value)
    //     setText(event.target.value);
    //     props.onChange(text);        
    // }
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
              // onChange={search}

            //   ref='input' /*{props.inpuRef} */
            //   type='text'
              //defaultValue={props.defaultValue}
              //required={props.required || false} 
              />
          </div>
        </div>
  )
}

function ProductRow(props) {
  var row = props.row;
  console.log("ProductRow props: ", props)
  return (
    <div className='row item-row'>
        <div className='cell flex-1'>
            <Link href={'/products/' + row.id} title={props.row.title} />
        </div>
        <div className='cell flex-2 fsize-90'> {row.path_pattern} </div>
    </div>
  )
}

function Link(props) {
  console.log("Link props: ", props)
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

function SortedRows(props) {
  console.log("SortedRows", props)
  const getDefaultProps = () => {
    return {
        viewName: null,
        sortKey: null,
        reverse: false,
        tableFactory: <div />,
        rowFactory: null
    };
  }  
    var rows = db_items(props.viewName);
    rows.sort(compareByKey(props.sortKey));
    if (props.reverse) rows.reverse();
  return (    
    rows.map((item, i) => 
        <ProductRow id={i} row={item} />
        // <tr key={item.id}>
        //     <td> {item.title} </td>
        //     <td> {item.path_pattern} </td>
        // </tr>
        )
  )
}
function compareByKey(key) {
    return function (a, b) {
        var va = a[key], vb = b[key];
        return va > vb ? 1 : va < vb ? -1 : 0; 
    }
}




