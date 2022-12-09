import React, { Component } from 'react'

export default class MaybeInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
          value: this.props.defaultValue,
          defaultValue: this.props.defaultValue,
          editable: false
        }
      this.doKeyPress = this.doKeyPress.bind(this);
      this.doKeyDown = this.doKeyDown.bind(this);
      this.doBlur = this.doBlur.bind(this);
      this.doClick = this.doClick.bind(this);
    }
  doKeyPress = (event) => {
    console.log("doKeyPress")
    if (event.key === "Enter") {
        this.setState({editable: false});
        if (this.state.value !== this.props.defaultValue)
          this.props.onChange();
    }
    }
  doKeyDown = (event) => {
        if (event.key === "Escape")
            this.doBlur();
    }
  doBlur = (event) => {
        this.setState({value: this.props.defaultValue, editable: false});
    }
  doChange = (event) => {
      console.log("doChange called");
      this.setState({value: event.target.value});
    }
  hadleClick = (e) => {
    e.target.select();
  }  
  doClick = () => {
    // console.log("doClick")
    this.setState({value: this.props.defaultValue, editable: true});
    }
  render() {
    // console.log("this.state.defaultValue: ", this.state.defaultValue);
    // console.log("this.props.defaultValue: ", this.props.defaultValue);
    if (this.state.editable){
        return <input onKeyPress={this.doKeyPress} 
                      onChange={this.doChange} 
                      value={this.state.value} 
                      onClick={this.hadleClick} 
                      onKeyDown={this.doKeyDown}
                      onblur={this.doBlur}/>
    }
    else return (
      <span onClick={this.doClick}>{this.props.defaultValue}</span>
    )
  }
}

class InputWithAutoSelect extends Component {
  componentDidMount(){
    this.getDOMNode().select();
  }
  render() {
    return (
      <input>{this.props}</input>
    )
  }
}


