import React, { Component } from 'react'
import { api_request, V_machines_all, V_machine_groups_all, db_subscribe, db_unsubscribe, db_item_by_id, db_filter_items, db_items, compareByKey } from '../../functions/functions';
import withRouter from '../../functions/withRouter'
import PopUpMenu from '../popUpMenu/PopUpMenu';
import { useNavigate } from 'react-router-dom'
import Modal from '../Modal/Modal';
import { Button } from 'reactstrap';
import InputRow from '../Input/InputRow';

class MachineGroups extends Component {
    constructor(props) {
        super(props);
        this.state = {
          mgroups: V_machine_groups_all(),
          machines: V_machines_all(),
          id: Number(this.props.params.id),         
        }
        this.doUpdate = this.doUpdate.bind(this);
        this.doDelete = this.doDelete.bind(this);
        this.showPopup = this.showPopup.bind(this);
        this._dbDidUpdate = this._dbDidUpdate.bind(this);
    }
    _dbDidUpdate = () => {
      if (this.state._isMounted) this.forceUpdate();
    }
    componentDidMount(){
      var statemap = this._dbum_state || (this._dbum_state = []);
          for (var key in this.state) {
              var prev = statemap[key];
              statemap[key] = db_subscribe(this.state[key], this._dbDidUpdate)
              if (prev) db_unsubscribe(prev);
          }
      this.setState({
        _isMounted: true
      })      
  };
  showPopup = () => {
    this.setState(prevState =>{
        return{
            ...prevState,
            popUpMenu: !prevState.popUpMenu
        }})
}
  doDelete = (event) => {
    api_request("delete/machine-group", {id: this.state.id});
    this.props.navigate("/mgroup-list");
  }
  doUpdate = () => {
    api_request("update/machine-group", {
        id: this.props.id,
        title: this.props.title
    });
  }
  render(){
    // console.log("!!!!! id ", this.state.id)
    var mg = db_item_by_id(this.state.mgroups, this.state.id);
    // console.log("MachineGroup", mg)
    if (!mg) return null;
    var machines = db_filter_items(this.state.machines, function (row) {
      return row.machine_group_id === mg.id;
    });
    return (
      <div className='table'>
      <div className='row h1'>
        <div className='cell flex-1'>Machine Group</div>
        <div>
          <button className='icon icon-menu' onClick={this.showPopup} />
        </div>
      </div>
      <div className='dropdown'>{this.state.popUpMenu && <PopUpMenu onClick={[this.doDelete]} text={["Delete this machine group"]} />}</div>
      <div className='row item-row'>
        <div className='cell flex-1 '>Title:</div>
        <div className='cell flex-3 fsize-90'>{mg.title}</div>
      </div>
      <div className='row'>
        <div className='cell flex-1'>Machines:</div>
        <div className='cell flex-3'>
          <MachineList machine_group_id={mg.id} />
        </div>
      </div>
   </div>
    )
  }
}

export default withRouter(MachineGroups);

export class MachineList extends Component {
  constructor(props) {
      super(props);
      this.state = {
        machines: V_machines_all(),  
        _isMounted: false,
      }
      // this.setTitle = this.setTitle.bind(this);
      // this.setModalActive = this.setModalActive.bind(this);
      this._dbDidUpdate = this._dbDidUpdate.bind(this)
  }
  _dbDidUpdate = () => {
    if (this.state._isMounted) this.forceUpdate();
  }
  componentDidMount(){
    var statemap = this._dbum_state || (this._dbum_state = []);
        for (var key in this.state) {
            var prev = statemap[key];
            statemap[key] = db_subscribe(this.state[key], this._dbDidUpdate)
            if (prev) db_unsubscribe(prev);
        }
    this.setState({
      _isMounted: true
    })      
};
setModalActive = (value) => {
  this.setState({
    modalActive: value,
    title: "",
    pathPattern: "",
    popUpMenu: value==false ? false : true
  })
}

render() {
  var mg_id = this.props.machine_group_id;
  var machines = db_filter_items(this.state.machines, function (row) {
    return row.machine_group_id === mg_id;
  });
  // console.log("mg_id", mg_id);
  // console.log("this.state.machines", this.state.machines)
  var labels = [];
  machines.forEach((row, i) => {
    labels.push(<MachineLink key={row.id} row={row} />);
    labels.push(<a className='a-left'>, </a>)
  })
  return (
    <span>
      <span>{labels}</span>
      <span className='clickable' onClick={this.setModalActive}>(new)</span>
      <NewMachineDialog modalActive={this.state.modalActive} setModalActive={this.setModalActive} machine_group_id={mg_id}/>
    </span>
  )
}
}
function MachineLink(props) {
  var row = props.row;
  return (
  //   <div className='row item-row'>
      //   <div className='cell flex-1'>
            <Link href={'/machine/' + row.id} title={props.row.hostname} />
  //       </div>
  //   </div>
  )
}
function Link(props) {
  // console.log("Link props: ", props)
  let navigate = useNavigate();
  const doLink = (event) => {
    event.stopPropagation();
    if(event.button === 0){
        event.preventDefault();
        navigate(props.href);
    }
  }
  return (
    <a className='a-left' href={props.href} onClick={doLink} >{props.title}</a>
  )
}

class NewMachineDialog extends Component {
  constructor(props) {
    super(props);
    this.newMachineDialogRef = React.createRef();
    this.state = {
      mgroups: V_machine_groups_all(),  
      hostname: '',
      description: '',
      mg_id: this.props.machine_group_id 
    }
    this.changeId = this.changeId.bind(this);
    this.setHostname = this.setHostname.bind(this);
    this.setDescription = this.setDescription.bind(this)
}
setHostname = (event) => {
  this.setState({
    hostname : event.target.value
  })
}
changeId = (id) => {
  this.setState({
    mg_id : id
})
}
setDescription = (event) => {
  this.setState({
      description : event.target.value
  })
}
doCreate = (event) => {
  event.preventDefault();
  api_request("create/machine", {
    hostname: this.state.hostname,
    description: this.state.description,
    machine_group_id: this.state.mg_id
  })
  this.setState({
    hostname: "",
    description: ""
  })
  // console.log("mg_id: ", this.state.mg_id)
  // console.log("hostname: ", this.state.hostname)
  // console.log("description: ", this.state.description)
  // console.log("mgroups: ", this.state.mgroups)
}
  render() {
    return (
      <Modal active={this.props.modalActive} setActive={this.props.setModalActive}>
                    <div>
                        <div className='row2'>
                            <div className='cell flex-1'>New Machine</div>
                            <Button color='danger' className='icon icon-close' onClick={() => this.props.setModalActive(false)} />
                        </div>
                        <InputRow label='Hostname:' value={this.state.hostname} onChange={this.setHostname} />
                        <InputRow label='Description:' value={this.state.description} onChange={this.setDescription} />
                        {/* <InputRow label='Machine Group:' value={this.props.machine_group_id} /> */}
                        
                        <div className='row'>
                          <div className='cell flex-1'>Machine Group:</div>
                          <div className='cell flex-2'>
                            <DropdownRowSelect viewName={this.state.mgroups} mg_id={this.state.mg_id} onChange={this.changeId}/>
                            {/* <DropdownRowSelect 
                              ref =  "mgroup_id"
                              defaultRowId = {this.props.machine_group_id}
                              // itemFactory={<MachineGroupLabel />}
                              // labelFactory: DOM.MachineGroupLabel,
                              viewName={this.state.mgroups}
                            /> */}
                          </div>
                        </div>
                        <Button 
                          color='primary' 
                          className='button'
                          onClick={this.doCreate}> Create
                        </Button>
                    </div>
            </Modal>
    )
  }
}

// TODO: Change this DropdownRowSelect to class from ContactList
//       and move to new .js file 
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
    // console.log("doRowMouseDown id", event.target);
    if (event.button == 0) {
      console.log("button is 0")
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
    // console.log("target.value", event.target)
  }
  render() {
    var row = db_item_by_id(this.props.viewName, this.state.rowId);
    // console.log("row: ", row)
    var label = row.title   // ? this.props.labelFactory({row: row}) : null;
    // console.log("label: ", label)
    var rows = db_items(this.props.viewName);
    // console.log("rows: ", rows);
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
        <span className='icon icon-down dropdown-trigger' onClick={this.doFocus} />  
        </div>
      </div>
      </div>
    )
  
}}