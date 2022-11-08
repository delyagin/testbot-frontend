import React, { Component, Fragment } from 'react';

import { Col, Container, Row, Button } from "reactstrap";
import {API_URL} from "../constants/constants"
import axios from "axios"

class TestersList extends Component {
    // state = {
    //     testers: []
    // }
    // getTesters = () => {
    //     console.log("getTesters")
    //     axios.get(API_URL).then(res => this.setState({testers: res.data}));
    // }
    render() {
        // var button = <Button onClick={this.getTesters}>Edit</Button>;
        return (
            <div className="create-post">
                <textarea placeholder="What's on your mind?"
                />
            </div>

        );
    }
}
export default TestersList;
