import React, { Component } from 'react'
import { V_contacts_all, V_contact_assignments_all, V_test_suites_all, db_subscribe, 
         db_unsubscribe, api_request, db_items, compareByKey, compareByTwoKeys, 
         db_item_by_id } from '../../functions/functions';
import PopUpMenu from '../popUpMenu/PopUpMenu';
import Modal from '../Modal/Modal';
import InputRow from '../Input/InputRow';
import { Button } from 'reactstrap';
import MaybeInput from '../Input/MaybeInput';

export default class ContactList extends Component {
    constructor(props) {
        super(props);
        this.state = {
          titleContact: '',
          titleContactAssignment: '',
          contacts: V_contacts_all(),
          contact_assignments: V_contact_assignments_all(),
          tsuites: V_test_suites_all(), 
          modalContact: false,
          modalContactAssignment: false,
          confirm: false, 
          idContactToDel: ''
        }
        this.doUpdateContact = this.doUpdateContact.bind(this);
        this.doDeleteContact = this.doDeleteContact.bind(this);
        this.doDeleteContactAssignment = this.doDeleteContactAssignment.bind(this);
        this._dbDidUpdate = this._dbDidUpdate.bind(this);
        this.doUpdateContactAssignment = this.doUpdateContactAssignment.bind(this);
        this.doCreateContact = this.doCreateContact.bind(this);
        this.showPopup = this.showPopup.bind(this);
        this.setModalContact = this.setModalContact.bind(this);
        this.setModalContactAssignment = this.setModalContactAssignment.bind(this);
        this.doRemoveContact = this.doRemoveContact.bind(this);
        this.doRemoveAssignment = this.doRemoveAssignment.bind(this);

    }
  setTitleContact = (event) => {
    this.setState({
      titleContact : event.target.value
      })
  }
  _dbDidUpdate = () => {
      if (this.state._isMounted) { 
        this.forceUpdate();
      }
    }
  doUpdateContactAssignment = (cassignment, test_name_pattern) => {
      api_request("update/contact-assignment", {
          id: cassignment.id,
          contact_id: cassignment.contact_id,
          test_suite_id: cassignment.test_suite_id,
          test_name_pattern: test_name_pattern
      });
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
  doDeleteContact = (contact_id) => {
    api_request("delete/contact", {id: contact_id});
    this.setState({
      idContactToDel: '',
      confirm: false
    })
}
  doDeleteContactAssignment = (contact_assignment_id) => {
  api_request("delete/contact-assignment", {id: contact_assignment_id});
}
  doUpdateContact = (contact, name) => {
    api_request("update/contact", {
      id: contact.id,
      name: name
  });
}
  doCreateContact = (event) => {
    event.preventDefault();
    api_request("create/contact", {
      name: this.state.titleContact
  });
    this.setState({
      titleContact: '',
      modalContact: false
    })
}

  showPopup = () => {
    this.setState(prevState => {
      return{
          ...prevState,
          popUpMenu: !prevState.popUpMenu
      }})
}
  setModalContact = (value) => {
    this.setState({
      modalContact: value,
      titleContact: "",
      titleContactAssignment: "",
      popUpMenu: false,
    })
  }
  setModalConfirm = (value, id) => {
    this.setState({
      confirm: value,
      idContactToDel: id
    })
  }
  setModalContactAssignment = (value) => {
    this.setState({
      modalContactAssignment: value,
      titleContact: "",
      titleContactAssignment: "",
      popUpMenu: false,
  })
  }
  doRemoveContact = (event) => {
    // (id, event) => {
    // event.preventDefault();
    this.doDeleteContact(this.state.idContactToDel);
  }
  doRemoveAssignment = (id, event) => {
    event.preventDefault();
    this.doDeleteContactAssignment(id);
  }
  render() {
    var contacts = db_items(this.state.contacts);
    var assignments = db_items(this.state.contact_assignments);
    contacts.sort(compareByKey("name"));
    assignments.sort(compareByTwoKeys("test_suite_id", "test_name_pattern"));
    return (
      <div className='table'>
        <div className='row h1'>
          <div className='cell flex-1'>Contacts</div>
            <div>
              <button className='menu-container icon icon-menu' onClick={this.showPopup}>
              </button>
            </div> 
        </div>
        <div className='row h2'>
          <div className='cell flex-1' >Contact name</div>
          <div className='cell flex-2' >Test Suite</div>
          <div className='cell flex-3' >Test Name Pattern</div>
          <span className='icon icon-remove'/>
        </div>
        <div className='dropdown'>
          {this.state.popUpMenu && <PopUpMenu 
          onClick={[() => this.setModalContact(true), () => this.setModalContactAssignment(true)]} 
          text={["Add a new contact...", "Add a new contact assignment..."]} />}
        </div>
        <Modal active={this.state.modalContact} setActive={this.setModalContact} setModal={this.setModalContactAssignment}>
            <div className='table'>
                <div className='row2'>
                    <div className='cell flex-1'>Name</div>
                    <Button color='danger' onClick={() => this.setModalContact(false)}>X</Button>
                </div>
                <InputRow label='Tester' value={this.state.titleContact} onChange={this.setTitleContact} />
                <Button 
                    color='primary' 
                    className='button'
                    onClick={this.doCreateContact}> Create
                </Button>
            </div>
        </Modal>
        <NewContactAssignmentDialog modalActive={this.state.modalContactAssignment} setModalNotActive={this.setModalContactAssignment}/>
        <Modal active={this.state.confirm} setActive={this.setModalConfirm}>
                <div className='row2'>
                    <div className='cell flex-1'>Do you want delete this tester?</div>
                    <Button color='danger' onClick={() => this.setModalConfirm(false)}>X</Button>
                </div>
                <div>
                  <Button 
                      color='primary' 
                      className='button-confirm'
                      onClick={ this.doRemoveContact }> Yes
                  </Button>
                  <Button 
                      color='primary' 
                      className='button-confirm'
                      onClick={() => this.setModalConfirm(false) }> No
                  </Button>
            </div>
        </Modal>
        {contacts.map((contact, i) => 
          <div key={i} className='item-block'>
            <div className='row h3'>
              <div className='cell flex-1'>
                <MaybeInput className='item-block' defaultValue={contact.name} onChange={value => this.doUpdateContact(contact, value)}/>
              </div>
              <span className='icon icon-remove clickable'
                onClick={() => this.setModalConfirm(true, contact.id) }
                // doRemoveContact.bind(this, contact.id)
              />
            </div>
            {assignments.filter(a => a.contact_id == contact.id)
            .map((a, i) => 
              <div className='row' key={i}>
                <div className='cell flex-1'></div>
                <div className='cell flex-2'>{db_item_by_id(this.state.tsuites, a.test_suite_id).title}</div>
                <div className='cell flex-3' >
                  <MaybeInput defaultValue={a.test_name_pattern} onChange={value => this.doUpdateContactAssignment(a, value)}
                />
                </div>
                <span className='icon icon-remove clickable'
                  onClick={event => this.doRemoveAssignment(a.id, event) }
                />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
}

class NewContactAssignmentDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      titleContact: '',
      testNamePattern: '',
      contacts: V_contacts_all(),
      test_suites: V_test_suites_all(),
    }
    this.doCreate = this.doCreate.bind(this);
    this.inputRef = React.createRef();
    this.contactIdRef = React.createRef();
    this.testSuiteIdRef = React.createRef();
  }
  setTestNamePattern = (event) => {
    this.setState({
      testNamePattern : event.target.value
    })
  }
  doCreate = (event) => {
    // console.log("doCreateContactAssignment called")
    event.preventDefault();
    var contact_id = this.contactIdRef.current.getRowId();
    // console.log("contact id: ", contact_id);
    var test_suite_id = this.testSuiteIdRef.current.getRowId();
    // console.log("test_suite_id: ", test_suite_id);
    if (contact_id === null) return;
    if (test_suite_id === null) return;
    api_request("create/contact-assignment", {
      contact_id: contact_id,
      test_suite_id: test_suite_id,
      test_name_pattern: this.state.testNamePattern
  });
}
  render() {
    var rows = db_items(this.state.contacts);
    return (
      <Modal active={this.props.modalActive} setActive={this.props.setModalNotActive}>
            <div className='table'>
                <div className='row2'>
                    <div className='cell flex-1'>New contact assignment:</div>
                    <Button color='danger' onClick={() => this.props.setModalNotActive(false)}>X</Button>
                </div>
                <div className='row'>
                  <div className='cell flex-1'>Contact:</div>
                  <div className='cell flex-3'>
                    <DropdownRowSelect 
                      ref={this.contactIdRef}
                      viewName={this.state.contacts} 
                      defaultRowId={null} 
                      labelFactory={(row) => <ContactLabel row={row}/>}  
                    />
                  </div>
                </div>
                <div className='row'>
                  <div className='cell flex-1'>Test Suite:</div>
                  <div className='cell flex-3'>
                    <DropdownRowSelect 
                      ref={this.testSuiteIdRef}
                      viewName={this.state.test_suites} 
                      defaultRowId={null}
                      labelFactory={(row) => <TestSuiteLabel row={row}/>} 
                    />
                  </div>
                </div>
                <InputRow 
                  label='Test name pattern:' 
                  value={this.state.testNamePattern} 
                  onChange={this.setTestNamePattern} 
                  ref={this.inputRef}
                />
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

class DropdownRowSelect extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      rowId: this.props.defaultRowId,
      hostname: '',
      description: '', 
      opened: false,
      defaultRowId: this.props.defaultRowId,
      title: 'None',
      sortKey: null
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
  doClickLabel = () => {
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
        // this.props.onChange(id);
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
    // console.log("this.props.labelFactory: ", this.props.labelFactory)
    // var label = row ? row.title : null   
    var label = row ? this.props.labelFactory(row=row) : null;
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
                  <div className='dropdown-item' key={row.id} onMouseDown={this.doRowMouseDown.bind(this, row.id)}>{this.props.labelFactory(row=row)}</div>
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

function ContactLabel(props) {
  return (
    <span>{props.row.name}</span>
  )
}

function TestSuiteLabel(props) {
  return (
    <span>{props.row.title}</span>
  )
}
