import React, { Component, Fragment } from 'react';

import { Col, Container, Row, Button } from "reactstrap";
import {API_URL} from "../constants/constants"
import axios from "axios"
import {V_contacts_all, V_machines_all, db_subscribe, db_unsubscribe, db_items } from '../functions/functions'

class TestersList extends Component {
    // render() {
    //     // var button = <Button onClick={this.getTesters}>Edit</Button>;
    //     return (
    //         <div className="create-post">
    //             <textarea placeholder="What's on your mind?"
    //             />
    //         </div>

    //     );
    // }
    constructor(props) {
        super(props);
        this.state = {
          contacts: V_contacts_all(),
          contacts_list: [],
          // machines: V_machines_all(),
          isShow: false,
          _isMounted: false
        }
        this.getContacts = this.getContacts.bind(this)
        this.handleClick = this.handleClick.bind(this)
        this._dbDidUpdate = this._dbDidUpdate.bind(this)
        console.log("Constructor")
    }
    _dbDidUpdate = () => {
      console.log("_dbDidUpdate isMounted", this.state._isMounted)
      if (this.state._isMounted) this.forceUpdate();
    }
    componentDidMount(){
      console.log("DidMount");
      let _dbDidUpdate = () => {
        console.log("_dbDidUpdate isMounted", this.state._isMounted)
        if (this._isMounted) this.forceUpdate();
      }
      var statemap = this._dbum_state || (this._dbum_state = []);
          for (var key in this.state) {
              var prev = statemap[key];
              statemap[key] = db_subscribe(this.state[key], this._dbDidUpdate)
              if (prev) db_unsubscribe(prev);
          }
          // this.setState(state);
          // func => {
          //   console.log("!!!");
          // });
      this.setState({
        _isMounted: true
      })
      
  };
  
    handleClick = event => {
      // 👇️ toggle shown state
      const prev = this.state.isShow;
      this.setState({ isShow: !prev })
    }
  
    getContacts = () => {
      this.setState({
        contacts_list: db_items(this.state.contacts)
      })
      console.log("!: ", this.state.contacts)
    }
    getMachines = () => {
      var m = db_items(V_machines_all());
      console.log("var machines: ", m)
    }
    
      render() {
        var contacts2 = db_items(this.state.contacts);
        console.log("this.state.contacts", this.state.contacts)
        var machines = db_items(this.state.machines);
        console.log("isShow", this.state.isShow)
        console.log("render: ", contacts2)
        return (
          <div>
            App
            <button onClick={this.getContacts}>Get contacts</button>
            <button onClick={this.getMachines}>Get machines</button>
            <button onClick={this.handleClick}>Click</button>
            { this.state.isShow && (
              <div>Some list</div>
            )}
              <ul>
              {contacts2.map(item => 
                <li key={item.id}>{item.name}</li>)}
            </ul>
            {/* <ul>
              {machines.map(item => 
                <li key={item.id}>{item.name}</li>)}
            </ul> */}
          </div>
        )
      }
}
export default TestersList;
