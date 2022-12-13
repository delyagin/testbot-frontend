import React, { Component } from 'react'
import './popup.css'

export default class MenuItem extends Component {
    constructor(props) {
    super(props);
    this.doMouseDown = this.doMouseDown.bind(this)
    }
    doMouseDown = (event) => {
        console.log("props MenuItem", this.props)
        if (event.button === 0){
            console.log("button is 0")
            event.preventDefault();
            event.stopPropagation();
            document.activeElement.blur();
            this.props.onClick();
        }
    }
    render() {
      return (
        <div className="dropdown-content" onMouseDown={this.doMouseDown}>{this.props.text}</div>
      )
    }
  }
  