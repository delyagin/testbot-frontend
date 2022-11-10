import React, { Component, useEffect, useRef, useState} from 'react'
import {V_products_all, V_machines_all, db_subscribe, db_unsubscribe, db_items } from '../functions/functions'

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
        this.state = {
          items: V_products_all(),
          contacts_list: [],
          // machines: V_machines_all(),
          isShow: false,
          _isMounted: false,
          popup: false
        }
        this.doNewProduct = this.doNewProduct.bind(this)
        this.showFunc = this.showFunc.bind(this)
        this._dbDidUpdate = this._dbDidUpdate.bind(this)
        console.log("Constructor")
    }
    _dbDidUpdate = () => {
      console.log("_dbDidUpdate isMounted", this.state._isMounted)
      if (this.state._isMounted) this.forceUpdate();
    }
    componentDidMount(){
      console.log("DidMount");
      var statemap = this._dbum_state || (this._dbum_state = []);
          for (var key in this.state) {
              var prev = statemap[key];
              statemap[key] = db_subscribe(this.state[key], this._dbDidUpdate)
              if (prev) db_unsubscribe(prev);
          }
      this.setState({
        _isMounted: true
      })
    //   doNewProduct = () => {
    //     this.ref.
    //   }
      
  };
  showFunc = () => {
    console.log("Show func")
    return "SHOW !!!";
  }
  render() {
        var products = db_items(this.state.items);

        return (
        <>
            <div className='row'>
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
            <div className='ppup'>{this.state.popUpMenu && <PopUpMenu onSelect={this.showFunc} text="Add a new product..." />}</div>
            
            <tbody>
                <tr>
                    <th>Title</th>
                    <th>Path pattern</th>
                </tr>
                {products.map((item,i) => 
                <tr key={i}>
                    <td> {item.title} </td>
                    <td> {item.path_pattern} </td>
                </tr>
                )}

            </tbody>
        </>
        )
  }
}

function PopUpMenu(props) {
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef)
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
    this.toggleDialog = this.toggleDialog.bind(this);
    this.renderDialog = this.renderDialog.bind(this);
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
  render() {
    return (
      <div>ProductList</div>
    )
  }
}




