import React, { Component } from 'react'

export default class MaybeInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
          value: '',
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
            this.props.onChange(this.state.value);
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
  doClick = () => {
    console.log("doClick")
    this.setState({value: this.props.defaultValue, editable: true});
    }
  render() {
    if (this.state.editable){
        return <input className='fake-input' onKeyPress={this.doKeyPress} onChange={this.doChange} value={this.state.value} />
    }
    else return (
    //   <div className='cell flex-2' onKeyPress={this.doKeyPress} onClick={this.doKeyPress}>this.state.defaultValue</div>
      <span className='fake-input' onClick={this.doClick}>{this.props.defaultValue}</span>
    )
  }
}

// export default function MaybeInput(props) {
//   const [value, doChange] = useState('');

//   return (
//     <div>MaybeInput</div>
//   )
// }
