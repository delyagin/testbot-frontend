import React, { Component } from 'react'
import { V_test_suites_all, V_machine_groups_all, V_autorun_items_all, 
         V_products_all, api_request, db_items, db_subscribe, db_unsubscribe,
        db_item_by_id, compareByKey } from '../../functions/functions'
import PopUpMenu from '../popUpMenu/PopUpMenu';
import Modal from '../Modal/Modal';
import Link from '../Link/Link';
import { Button } from 'reactstrap';
import { TestSuiteLabel } from "../../functions/Labels"

export default class AutorunItemList extends Component {
  constructor(props) {
      super(props);
      this.state = {
        mgroups: V_machine_groups_all(),
        products: V_products_all(),
        tsuites: V_test_suites_all(),
        aitems: V_autorun_items_all(),
        popUpMenu: false,
        modal: false
      }
      this.doDeleteAutorunItem = this.doDeleteAutorunItem.bind(this);
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
  doDeleteAutorunItem = (aitem_id) => {
    api_request("delete/autorun-item", {id: aitem_id});
}
  render() {
    var state = this.state;
    var aitems = db_items(state.aitems);
    aitems.sort(function (a, b) {
        var ts1 = db_item_by_id(state.tsuites, a.test_suite_id);
        var ts2 = db_item_by_id(state.tsuites, b.test_suite_id);
        if (ts1.title > ts2.title) return 1;
        if (ts1.title < ts2.title) return -1;
        var p1 = db_item_by_id(state.products, a.product_id);
        var p2 = db_item_by_id(state.products, b.product_id);
        if (p1.title > p2.title) return 1;
        if (p1.title < p2.title) return -1;
        var mg1 = db_item_by_id(state.mgroups, a.machine_group_id);
        if (mg1.title > mg1.title) return 1;
        if (mg1.title < mg1.title) return -1;
        return 0;
    });
    var items = [];
    var prev_ts_id = null;
    var prev_p_id = null;
    for (var i = 0; i < aitems.length; i++) {
        var aitem = aitems[i];
        var ts = db_item_by_id(this.state.tsuites, aitem.test_suite_id);
        var p = db_item_by_id(this.state.products, aitem.product_id);
        var mg = db_item_by_id(this.state.mgroups, aitem.machine_group_id);
        // items.push(DOM.Row({className: "item-row", key: aitem.id},
        //     DOM.Cell1(null,
        //         (ts.id !== prev_ts_id) && DOM.TestSuiteLink({row: ts})),
        //     DOM.Cell1(null,
        //         ((ts.id !== prev_ts_id) || (p.id !== prev_p_id)) &&
        //             DOM.ProductLink({row: p})),
        //     DOM.Cell1(null,
        //         DOM.Row(null,
        //             DOM.Cell1(null, DOM.MachineGroupLink({row: mg})),
        //             DOM.IconRemove({
        //                 className: "clickable",
        //                 onClick: function (id, event) {
        //                     event.preventDefault();
        //                     this.doDeleteAutorunItem(id);
        //                 }.bind(this, aitem.id)})))
        // ));
        items.push(
          <div className='row item-row' key={aitem.id}>
            <div className='cell flex-1'>
             {(ts.id !== prev_ts_id) && <TestSuiteLink row={ts} />}
            </div>
            <div className='cell flex-1'>
              {((ts.id !== prev_ts_id) || (p.id !== prev_p_id)) &&
                    <ProductLink row={p} />}
            </div>
            <div className='cell flex-1'>
              {/* {console.log("aitem.id: ", aitem.id)} */}
              <div className='row'>
                <div className='cell flex-1'>
                  <MachineGroupLink row={mg}/>
                </div>
                <button className='icon icon-remove clickable'
                  onClick={ this.doDeleteAutorunItem.bind(this, aitem.id) }
              />
              </div>
            </div>
          </div>
        )
        prev_ts_id = ts.id;
        prev_p_id = p.id;
    }
    return (
      <div className='table'>
        <div className='row h1'>
          <div className='cell flex-1'>Autorun items</div>
            <div>
              <button className='menu-container icon icon-menu' onClick={() => this.setState(prevState =>{
                return{
                    ...prevState,
                    popUpMenu: !prevState.popUpMenu
                  }
                  })}>
              </button>
            </div> 
        </div>
        <div className='dropdown'>{this.state.popUpMenu && <PopUpMenu onClick={[() => this.setModal(true)]} text={["Add a new autorun item..."]} />}</div>
        <NewAutorunItemDialog modalActive={this.state.modal} setModal={this.setModal}/>
        <div className='row h2'>
          <div className='cell flex-1' >Test Suite</div>
          <div className='cell flex-2' >Product</div>
          <div className='cell flex-2' >Machine Group</div>
        </div>
        {items.map((item, i) => 
          <div key={i}>{item}</div>
       )}
      </div>
    )
  }
}

function TestSuiteLink(props) {
  return (
    <Link href={'/tsuite/' + props.row.id} title={props.row.title} />
  )
}

function MachineGroupLink(props) {
  var row = props.row;
  return (
    <Link href={'/mgroup/' + props.row.id} title={props.row.title} />
  )
}

function ProductLink(props) {
  return (
    <Link href={'/product/' + props.row.id} title={props.row.title} />
  )
}


class NewAutorunItemDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mgroups: V_machine_groups_all(),
      products: V_products_all(),
      tsuites: V_test_suites_all()
    }
    this.tsuiteIdRef = React.createRef();
    this.mgroupIdRef = React.createRef();
    this.productIdRef = React.createRef();
  }
  doCreate = (event) => {
    event.preventDefault();
    var product_id = this.productIdRef.current.getRowId();
    var tsuite_id = this.tsuiteIdRef.current.state.rowId;
    var mgroup_id = this.mgroupIdRef.current.getRowId();
    if (product_id !== null && tsuite_id !== null && mgroup_id !== null) {
      api_request("create/autorun-item", {
          product_id: product_id,
          test_suite_id: tsuite_id,
          machine_group_id: mgroup_id
      });
      this.props.setModal(false);
    }
}
  render() {
    return (
      <Modal active={this.props.modalActive} setActive={this.props.setModal}>
            <div className='table'>
              <div className='row2'>
                <div className='cell flex-1'>New autorun item:</div>
                <Button color='danger' onClick={() => this.props.setModal(false)}>X</Button>
              </div>
              <div className='row'>
                  <div className='cell flex-1'>Test Suite:</div>
                  <div className='cell flex-3'>
                    <DropdownRowSelect 
                      ref={this.tsuiteIdRef}
                      viewName={this.state.tsuites} 
                      defaultRowId={this.props.test_suite_id}
                      labelFactory={(row) => <TestSuiteLabel row={row}/>} 
                    />     
                  </div>
                </div> 
                <div className='row'>
                  <div className='cell flex-1'>Product:</div>
                  <div className='cell flex-3'>
                    <DropdownRowSelect 
                      ref={this.productIdRef}
                      viewName={this.state.products} 
                      defaultRowId={null}
                      labelFactory={(row) => <TestSuiteLabel row={row}/>} 
                    />     
                  </div>
                </div> 
                <div className='row'>
                  <div className='cell flex-1'>Machine Group:</div>
                  <div className='cell flex-3'>
                    <DropdownRowSelect 
                      ref={this.mgroupIdRef}
                      viewName={this.state.mgroups} 
                      defaultRowId={null}
                      labelFactory={(row) => <TestSuiteLabel row={row}/>} 
                    />     
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
  static defaultProps = {
    test_suite_id: null,
    product_id: null,
    machine_group_id: null}
}

class DropdownRowSelect extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      rowId: this.props.defaultRowId,
      hostname: '',
      description: '', 
      opened: false,
      
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
  componentWillUnmount(){
    // console.log("componentWillUnmount called");
    this.setState({
      rowId: null,
      defaultRowId: null,
    })
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
    if (event.button == 0) {
      event.preventDefault();
      event.stopPropagation();
      document.activeElement.blur();
      if (id !== this.props.defaultRowId){
        this.setState({ 
          rowId: id,
          opened: false,
        })
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
    // console.log("this.state.rowId:::", this.state.rowId);
    // console.log("this.props.labelFactory: ", this.props.labelFactory(row))
    // console.log("row: ", row);
    // console.log("viewName: ", this.props.viewName);
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