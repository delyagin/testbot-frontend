import React, { Component } from 'react'
import { V_contacts_all, V_contact_assignments_all, V_test_suites_all, db_subscribe, 
         db_unsubscribe, api_request, db_items, compareByKey, compareByTwoKeys, db_item_by_id } from '../../functions/functions';
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
        this.doCreateContactAssignment = this.doCreateContactAssignment.bind(this);
        this.showPopup = this.showPopup.bind(this);
        this.setModalContact = this.setModalContact.bind(this);
        this.setModalContactAssignment = this.setModalContactAssignment.bind(this);
        this.doRemoveContact = this.doRemoveContact.bind(this);
        this.doRemoveAssignment = this.doRemoveAssignment.bind(this);

        // this.refContactModal = React.createRef();
        // this.refAssignmentModal = React.createRef();
    }
  setTitleContact = (event) => {
    this.setState({
      titleContact : event.target.value
      })
    }
  setTitleContactAssignment = (event) => {
      this.setState({
          titleContactAssignment : event.target.value
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
  // this.toggleDialog();
    this.showPopup();
    this.setState({
      titleContact: '',
      modalContact: false
    })
}
  doCreateContactAssignment = (event) => {
    console.log("doCreateContactAssignment called")
  // event.preventDefault();
  // var contact_id = this.refs.contact_id.getRowId();
  // var test_suite_id = this.refs.test_suite_id.getRowId();
  // if (contact_id === null) return;
  // if (test_suite_id === null) return;
  // api_request("create/contact-assignment", {
  //     contact_id: contact_id,
  //     test_suite_id: test_suite_id,
  //     test_name_pattern: this.refs.test_name_pattern.getValue()
  // });
  // this.toggleDialog();
  this.showPopup();
}
  showPopup = () => {
    console.log("!!!")
    this.setState(prevState =>{
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
      popUpMenu: value,
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
      popUpMenu: value,
  })
  }
  doRemoveContact = (event) => {
    // (id, event) => {
    // event.preventDefault();
    this.doDeleteContact(this.state.idContactToDel);
  }
  doRemoveAssignment = (id, event) => {
    event.preventDefault();
    console.log("doRemoveContactAssignment id:", id);
    this.doDeleteContactAssignment(id);
  }
  render() {
    var contacts = db_items(this.state.contacts);
    var assignments = db_items(this.state.contact_assignments);
    contacts.sort(compareByKey("name"));
    assignments.sort(compareByTwoKeys("test_suite_id", "test_name_pattern"));
    // console.log("assignments: ", assignments)
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
        <Modal active={this.state.modalContact} setActive={this.setModalContact}>
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
        <Modal active={this.state.modalContactAssignment} setActive={this.setModalContactAssignment}>
            <div className='table'>
                <div className='row2'>
                    <div className='cell flex-1'>Contact</div>
                    <Button color='danger' onClick={() => this.setModalContactAssignment(false)}>X</Button>
                </div>
                <InputRow label='Tester' value={this.state.titleContact} onChange={this.setTitleContactAssignment} />
                <Button 
                    color='primary' 
                    className='button'
                    onClick={this.doCreate}> Create
                </Button>
            </div>
        </Modal>
        <Modal active={this.state.confirm} setActive={this.setModalConfirm}>
            {/* <div className='table'> */}
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
                  {/* </div> */}
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
