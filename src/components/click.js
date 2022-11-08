import React, { Component } from 'react';
import { Placeholder } from 'reactstrap';

class Click extends Component {
    constructor(props){
        super(props);
        this.state = {
            content: "",
            valid: false
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    handleSubmit(event){
        console.log("Handling submission!")
        console.log(this.state)
    }
    handleChange(event){
        const content = event.target.value;
        // this.setState({content: content})
        this.setState(() => {return {
            content,
            valid: content.length <= 10
        };
    })
        console.log("Hadling onChange!")
    }
    render() {
        return (
            <div className='creta-post'>
                <button onClick={this.handleSubmit}>Post</button>
                <textarea
                    value={this.state.content}
                    onChange={this.handleChange}
                    placeholder="What you want?"
                />
            </div>
        );
    }
}

export default Click;
