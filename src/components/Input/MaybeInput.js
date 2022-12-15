import React, { Component } from 'react'

export default class MaybeInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
          value: this.props.defaultValue,
          defaultValue: this.props.defaultValue,
          editable: false
        }
      this.doKeyDown = this.doKeyDown.bind(this);
      this.doBlur = this.doBlur.bind(this);
      this.doClick = this.doClick.bind(this);
      this.onFocus = this.onFocus.bind(this);
    }
  onFocus = (e) => {
    e.target.select();
  }
  doKeyDown = (event) => {
    if (event.key === "Escape")
      this.doBlur();
    if (event.key === "Enter") {
      this.setState({editable: false});
      if (this.state.value !== this.props.defaultValue)
        this.props.onChange(this.state.value);
    }
  }
  doBlur = (event) => {
    this.setState({value: this.props.defaultValue, editable: false});
    }
  doChange = (event) => {
    this.setState({value: event.target.value});
    }
  hadleClick = (e) => {
    e.target.select();
  }  
  doClick = () => {
    this.setState({value: this.props.defaultValue, editable: true});
    }
  render() {
    if (this.state.editable){
        return <InputWithAutoSelect
                  onChange={this.doChange} 
                  value={this.state.value} 
                  onClick={this.hadleClick} 
                  onKeyDown={this.doKeyDown}
                  onBlur={this.doBlur} />
    }
    else return (
      <span className='fake-input' onClick={this.doClick}>{this.props.defaultValue}</span>
    )
  }
}

class InputWithAutoSelect extends Component {
  constructor(props) {
    super(props);
    this.refInput = React.createRef();
  }
  componentDidMount(){
    this.refInput.current.select();
  }
  render() {
    return (
      <input ref={this.refInput} 
        onChange={this.props.onChange} 
        value={this.props.value} 
        onClick={this.props.onClick} 
        onKeyDown={this.props.onKeyDown}
        onBlur={this.props.onBlur} />
    )
  }
}


