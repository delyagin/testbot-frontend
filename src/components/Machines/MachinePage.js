import React, { Component } from 'react'
import { api_request, V_machines_all, V_machine_groups_all, db_item_by_id, db_subscribe, db_unsubscribe, db_items, compareByKey } from '../../functions/functions';
import withRouter from '../../functions/withRouter'
import MaybeInput from '../Input/MaybeInput';
import PopUpMenu from '../popUpMenu/PopUpMenu';

class MachinePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
          machines: V_machines_all(),
          mgroups: V_machine_groups_all(), 
          id: Number(this.props.params.id),
          isShow: false,
          _isMounted: false,
          popUpMenu: false, 
          modalActive : false,
          modalAddMachineActive : false,
        }
        this.doUpdate = this.doUpdate.bind(this);
        this.doDelete = this.doDelete.bind(this);
        this.changeId = this.changeId.bind(this);
        this._dbDidUpdate = this._dbDidUpdate.bind(this);
        this.showPopup = this.showPopup.bind(this);
        // this.handleChangeHostname = this.handleChangeHostname.bind(this);
        // this.handleChangeDescription = this.handleChangeDescription.bind(this);

        this.hostnameRef = React.createRef();
        this.descriptionRef = React.createRef();
    }
    _dbDidUpdate = () => {
      if (this.state._isMounted) { 
        this.forceUpdate();
      }
    }
    componentDidMount(){
    var statemap = this._dbum_state || (this._dbum_state = []);
      for (var key in this.state) {
        // console.log("key: ", key);
        var prev = statemap[key];
        statemap[key] = db_subscribe(this.state[key], this._dbDidUpdate)
        if (prev) db_unsubscribe(prev);
        }
      this.setState({
        _isMounted: true
      })      
  };
  // handleChangeHostname(value) {
  //   console.log("event: ", value); 
  //   this.setState({hostname : value});
  //   console.log("this.state.hostname1: ", this.state.hostname)
  //   this.doUpdate(value);
  // };
  // handleChangeDescription(event) { 
  //   this.setState({ description: event.target.value });
  //   this.doUpdate();
  // };
    doUpdate = () => {
    //   console.log("doUpdate called: ", newHostname);
    //   console.log("this.state.machines: ", this.state.machines);
    //   console.log("this.props.id: ", this.state.id);
      var m = db_item_by_id(this.state.machines, this.state.id);
      console.log("hostRef: ", this.hostnameRef);
      console.log("descrRef: ", this.descriptionRef);
      if (!m) return null;
      api_request("update/machine", {
        // id: this.state.id,
        // machine_group_id: db_item_by_id(this.state.machines, this.state.id).machine_group_id, //this.refs.mgroup_id.getRowId(),
        // hostname: newHostname, //this.refs.hostname.getValue(),
        // description: db_item_by_id(this.state.machines, this.state.id).description //this.refs.description.getValue()
        
        id: this.state.id,
        machine_group_id: db_item_by_id(this.state.machines, this.state.id).machine_group_id, //this.refs.mgroup_id.getRowId(),
        hostname: this.hostnameRef.current.state.value,
        description: this.descriptionRef.current.state.value //this.refs.description.getValue()
    });
}
  doDelete = (event) => {
    api_request("delete/machine", {id: this.state.id });
    this.props.navigate("/mgroup-list");
}
changeId = (id) => {
    this.setState({
      mg_id : id
  })
  }
  showPopup = () => {
    this.setState(prevState =>{
        return{
            ...prevState,
            popUpMenu: !prevState.popUpMenu
        }})
}
  render() {
    var m = db_item_by_id(this.state.machines, this.state.id);
    if (!m) return null;
    // var mg = db_item_by_id(this.state.mgroups, m.machine_group_id);
    console.log("MachinePage render !!! m:", m)
    return (
        <div className='table'>
        <div className='row h1'>
          <div className='cell flex-1'>Machine</div>
          <div>
                  <button className='icon icon-menu' onClick={this.showPopup} />
          </div>
        </div>
        <div className='dropdown'>{this.state.popUpMenu && <PopUpMenu onClick={this.doDelete} text="Delete this machine" />}</div>
        {/* <div className='row '>
          <div className='cell flex-1 '>Hostname:</div>
          <div className='cell flex-2 fsize-90'>
            <div className='row'>
              <div className='cell flex-2 item-row'>{m.hostname}</div>
              {m.valid === null? null : 
              m.valid ? <span className='icon icon-valid good-color' /> : <span className='icon icon-valid bad-color' />}
            </div>
          </div>
        </div> */}
        <div className='row'>
          <div className='cell flex-1 '>Hostname:</div>
          <div className='cell flex-2'>
            <div className='row'>
              <div className='cell flex-2 item-row'>
                <MaybeInput defaultValue={m.hostname} onChange={this.doUpdate} ref={this.hostnameRef} />
                {/* <MaybeInput defaultValue={m.hostname} handleChange={this.handleChangeHostname}/> */}
                </div>
                {m.valid === null? null : 
                   m.valid ? <span className='icon icon-valid good-color' /> : <span className='icon icon-valid bad-color' />}
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='cell flex-1 '>Description:</div>
          <div className='cell flex-2'>
            {/* <div className='row'> */}
              <div className='cell flex-2 item-row'>
                {/* <MaybeInput defaultValue={m.description} onChange={this.doUpdate}/> */}
                <MaybeInput defaultValue={m.description} onChange={this.doUpdate} ref={this.descriptionRef} />
                {/* </div> */}
            </div>
          </div>
        </div>

        {/* <div className='row'>
          <div className='cell flex-1 '>Description:</div>
          <div className='cell flex-2 fsize-90 item-row'>{m.description}</div>
        </div> */}
        <div className='row'>
          <div className='cell flex-1 '>Machine Group:</div>
          <div className='cell flex-2'>
             <DropdownRowSelect className='cell flex-3' viewName={this.state.mgroups} mg_id={m.machine_group_id} onChange={this.changeId}/>
          </div>
        </div>
        
     </div>
    )
  }
}

class DropdownRowSelect extends Component {
    constructor(props) {
      super(props);
      this.state = {
        mgroup: V_machine_groups_all(),  
        hostname: '',
        description: '', 
        opened: false,
        rowId: this.props.mg_id,
        title: 'None',
      }
      this.getRowId = this.getRowId.bind(this);
      this.doChange = this.doChange.bind(this);
      // this.doRowMouseDown = this.doRowMouseDown.bind(this)
    }
    getRowId = () => {
      return this.state.rowId;
    }
    getDefaultProps = () => {
       return { defaultRowId: null, viewName: null,
          sortKey: null, reverse: false,
          labelFactory: null, itemFactory: null,
          onChange: null };
    }
    getInitialState = () => {
      return { opened: false, rowId: this.props.defaultRowId };
    }
    doClickLabel = () => {
      // this.refs.trigger.getDOMNode().focus();
      this.setState({opened: false})
    }
    doFocus = () => {
      this.setState(prevState =>{
        return{
             ...prevState,
             opened : !prevState.opened
        }
     })
    }
    doBlur = () => {
      this.setState({ opened: false });
    }
    doRowMouseDown = (id, event) => {
      console.log("doRowMouseDown id", event.target);
      if (event.button === 0) {
        event.preventDefault();
        event.stopPropagation();
        document.activeElement.blur();
        if (id !== this.props.defaultRowId){
          this.setState({ 
            rowId: id,
            opened: false
          })
          this.props.onChange(id);
          }
      }
    }
    doChange = (event) => {
      this.setState({
        title: event.target.value
      })
      console.log("target.value", event.target)
    }
    render() {
      var row = db_item_by_id(this.props.viewName, this.state.rowId);
      console.log("row: ", row)
      var label = row.title   // ? this.props.labelFactory({row: row}) : null;
      console.log("label: ", label)
      var rows = db_items(this.props.viewName);
      console.log("rows: ", rows);
      var key = this.props.sortKey;
      if (key !== null) rows.sort(compareByKey(key));
      if (this.props.reverse) rows.reverse();        
      return (
        <div>
        <div className='dropdown-container'>
          <div className='row'>
            <div className="cell flex-1 dropdown-label">
              <div > 
              <div onClick={this.doFocus}>{label}</div>
                {this.state.opened &&
                <div className='dropdown-list'>
                  {rows.map( (row) => 
                    <div className='dropdown-item' key={row.id} onMouseDown={this.doRowMouseDown.bind(this, row.id)}>{row.title}</div>
                  )}  
                </div>}
              </div>
            </div>
          <span className='icon icon-down  dropdown-trigger' onClick={this.doFocus} />
          </div>
        </div>
        </div>
      )
    
  }}

export default withRouter(MachinePage);