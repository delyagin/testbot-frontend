import React, { Component, useEffect, useState } from 'react'
import { V_test_suites_all, api_request, db_items, compareByKey, db_subscribe, db_unsubscribe } from '../../functions/functions'
import InputRow from '../Input/InputRow';
import PopUpMenu from '../popUpMenu/PopUpMenu';
import Modal from '../Modal/Modal';
import { Button } from 'reactstrap';
import Link from '../Link/Link';

export default class TestSuiteList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: V_test_suites_all(),
      popUpMenu: false,
      modal: false
    }
  }
  _dbDidUpdate = () => {
    if (this.state._isMounted) { 
      this.forceUpdate();
    }
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
    this.setState(prevState => {
      return{
          ...prevState,
          popUpMenu: !prevState.popUpMenu
      }})
}
setModal = (value) => {
  this.setState({
    modal: value,
    title: "",
    popUpMenu: false,
  })
}
  render() {
    return (
      <div className='table'>
        <div className='row h1'>
          <div className='cell flex-1'>Test Suites</div>
            <div>
              <button className='menu-container icon icon-menu' onClick={this.showPopup}>
              </button>
            </div> 
        </div>
        <div className='dropdown'>
          {this.state.popUpMenu && <PopUpMenu 
              onClick={[() => this.setModal(true)]} 
              text={["Add a new test suite..."]} />}
        </div>
        <NewTestSuiteDialog modalActive={this.state.modal} setModal={this.setModal}/>
        <div className='row h2'>
          <div className='cell flex-1' >Title</div>
          <div className='cell flex-2' >Description</div>
        </div>
        <SortedRows 
          viewName={this.state.items} 
          sortKey="title" 
          rowFactory={(row) => <TestSuiteRow row={row} />}
        />
      </div>
    )
  }
}

class NewTestSuiteDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      url: '',
      revision: ''
    }
  }
  doCreate = (event) => {
    event.preventDefault();
    let spec = {
      kind: "URSTEST",
      url: this.state.url,
      revision: this.state.revision
    }
    api_request("create/test-suite", {
      title: this.state.title,
      spec: spec
  });
  this.setState({
    title: '',
      url: '',
      revision: ''
  });
  this.props.setModal(false);
  }
  setTitle = (event) => {
    this.setState({
      title : event.target.value
    })
  }
  setUrl = (event) => {
    this.setState({
      url : event.target.value
    })
  }
  setRevision = (event) => {
    this.setState({
      revision : event.target.value
    })
  }
  render() {
    return (
      <Modal active={this.props.modalActive} setActive={this.props.setModal}>
        <div>
          <div className='row2'>
            <div className='cell flex-1'>New Test Suite</div>
            <Button color='danger' className='icon icon-close' onClick={() => this.props.setModal(false)} />
          </div>
          <InputRow label='Title:' value={this.state.title} onChange={this.setTitle} />
          <InputRow label='URL:' value={this.state.url} onChange={this.setUrl} />
          <InputRow label='Revision:' value={this.state.revision} onChange={this.setRevision} />
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

function SortedRows(props) {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    var data = db_items(props.viewName);
    setRows(data);
  }, [props]);
  if(rows){
    if (props.reverse) rows.reverse();
    rows.sort(compareByKey(props.sortKey));
    return (    
      rows.map((row) => 
          <div key={row.id}>
            {/* {row.title} */}
            {props.rowFactory(row={row})}
          </div>
        ))
  }  
}

function TestSuiteRow(props) {
  // console.log("!!!!!!", props)
  const [row, setRow] = useState(null);
  useEffect(() => {
    setRow(props.row);
  }, [props]);
  if (row) {
    return (
      <div className='row item-row'>
        <div className='cell flex-1'>
          <Link href={'/tsuite/' + row.row.id} title={row.row.title} />
        </div>
        <div className='cell flex-2'>
          <TestSuiteRowDesc row={row} />
        </div>
      </div>
      )
  }
}

function TestSuiteRowDesc(props) {
  var spec = props.row.row.spec;
  return (
    <span>
      <ExternalLink href={spec.url} >{spec.url}</ExternalLink>
      <span>
        , revision {spec.revision}     
      </span>
    </span>
  )
}

function ExternalLink(props) {
  return (
    <a href={props.href} 
      rel="nofollow noopener noreferrer"
      target={"_blank"}>{props.children}
    </a>
  )
}


// class SortedRows extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//     }
// }
// _dbDidUpdate = () => {
//   if (this.state._isMounted) { 
//     this.forceUpdate();
//   }
// }
// componentDidMount(){
//   var statemap = this._dbum_state || (this._dbum_state = []);
//   for (var key in this.state) {
//     var prev = statemap[key];
//     statemap[key] = db_subscribe(this.state[key], this._dbDidUpdate)
//     if (prev) db_unsubscribe(prev);
//     }
//   this.setState({
//     _isMounted: true
//   })      
// };  
//   render() {
//   var rows = db_items(this.props.viewName);
//   console.log("rows: ", rows);
//   rows.sort(compareByKey(this.props.sortKey));
//   if (this.props.reverse) rows.reverse();
//     return (
//       rows.map((row) => 
//         <div key={row.id}>{row.title}</div>
//    ))
//   }
// }

