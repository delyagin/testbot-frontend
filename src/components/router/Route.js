import React, { Component } from 'react';
import invariant from 'invariant';

class Route extends Component {
    render() {
        return invariant(false, "<Route> elements are not for config only and should  not be rerendered");
    }
}

export default Route;
