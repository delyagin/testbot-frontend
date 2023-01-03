import React, { Component } from 'react'
import { api_request, db_subscribe, db_unsubscribe, V_builds_before_date,
  V_products_all, db_item_by_id, db_items, compareByKey, V_machine_groups_all,
  V_test_suites_all, V_results_by_build } from '../../functions/functions'
import PopUpMenu from '../popUpMenu/PopUpMenu';
import { ProductLabel }  from '../../functions/Labels'
import Modal from '../Modal/Modal';
import { Button } from 'reactstrap';
import InputRow from '../Input/InputRow';
import { useNavigate } from 'react-router-dom'
import { MachineGroupRow } from '../Machines/MachineGroupList'

var FUTURE_DATE = 9876543210;

export default class BuildResultList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date_stack: [FUTURE_DATE],
      popUpMenu: false,
      modalNewBuild: false,
      items: V_builds_before_date(FUTURE_DATE, 10),
    }
    this.doReCheck = this.doReCheck.bind(this);
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
      _isMounted: true,
      // items: V_builds_before_date(this.state.date_stack[this.state.date_stack.length - 1], 10),
  })      
};  
showPopup = () => {
  this.setState(prevState => {
    return{
        ...prevState,
        popUpMenu: !prevState.popUpMenu
    }})
}
doReCheck = () => {
  api_request("update/build-list");
}
setModal = (value) => {
  this.setState({
  modalNewBuild: value,
  title: "",
  popUpMenu: false,
})
}
  render() {
    console.log("/////", this.state.items)
    return (
      <div className='table'>
        <div className='row h1'>
          <div className='cell flex-1'>Latest Builds & Results</div>
          <span className='menu-icon icon icon-prev' />
          <span className='menu-icon icon icon-next' />
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
        <div className='dropdown'>
          {this.state.popUpMenu && <PopUpMenu 
          onClick={[() => this.doReCheck, () => this.setModal(true)]} 
          text={["Check for new builds", "Add a new build..."]} />}
        </div>
        <NewBuildDialog modalActive={this.state.modalNewBuild} setModal={this.setModal}/>
        <div className='row h2'>
          <div className='cell flex-1' >Name</div>
          <div className='cell flex-2' >Product</div>
          <div className='cell flex-2' >Date</div>
        </div>
        <SortedRows 
          viewName={this.state.items}
          sortKey='title'
          rowFactory={(id, row) => <BuildRow id={id} row={row} />} 
          />
      </div>
    )
  }
}

class NewBuildDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: V_products_all(),
      path: ''
    }
    this.productIdRef = React.createRef();
  }
  doCreate = (event) => {
    event.preventDefault();
    var product_id = this.productIdRef.current.getRowId();
    if (product_id !== null) {
      api_request("create/build", {
        path: this.state.path,  
        product_id: product_id
      });
      this.props.setModal(false);
    }
}
setPath = (event) => {
  this.setState({
    path : event.target.value
    })
}
  render() {
    return (
      <Modal active={this.props.modalActive} setActive={this.props.setModal}>
            <div className='table'>
              <div className='row2'>
                <div className='cell flex-1'>New Build:</div>
                <Button color='danger' onClick={() => this.props.setModal(false)}>X</Button>
              </div> 
              <div className='row'>
                <div className='cell flex-1'>Product:</div>
                <div className='cell flex-3'>
                  <DropdownRowSelect 
                    ref={this.productIdRef}
                    viewName={this.state.products} 
                    defaultRowId={null}
                    labelFactory={(row) => <ProductLabel row={row}/>} 
                  />     
                </div>
                </div> 
                <div className='row'>
                  <div className='cell flex-3'>
                  <InputRow label='Path' value={this.state.path} onChange={this.setPath} />     
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

class ResultRow extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      mgroups: V_machine_groups_all(),
      tsuites: V_test_suites_all()
    }
  }
  render() {
    var row = this.props.row;
    var mg = db_item_by_id(this.state.mgroups, row.machine_group_id);
    var ts = db_item_by_id(this.state.tsuites, row.test_suite_id);
    var status = row.status ?
        <div className='status-on'>{row.status}</div>  :  
        row.end_date ? 
        <div className='status-off'>ended on <Date timestamp={row.end_date} /> </div>  :
        <div className='status-off' >ended on <Date timestamp={row.start_date} /> </div>
    return (
      <div className='row item-row'>
        <div className='cell flex-1'>
          <ResultShortLink row={row}/>
        </div>
      </div>
    )
  }
}

class ResultShortLink extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      mgroups: V_machine_groups_all(),
      tsuites: V_test_suites_all()
    }
  }
  render() {
    var row = this.props.row;
    // var mg = db_item_by_id(this.state.mgroups, row.machine_group_id);
    var ts = db_item_by_id(this.state.tsuites, row.test_suite_id);
    return (
      <Link href={'/result/' + row.id} title={ts.title} />
    )
  }
}
class Date extends Component {
  render() {
    var timestamp = this.props.timestamp;
    if (!timestamp) return <span>---</span>
    var date = new Date(timestamp*1000);
    var Y = 1900 + date.getYear(),
        M = 1 + date.getMonth(),
        D = date.getDate(),
        h = date.getHours(),
        m = date.getMinutes();
    Y = "" + Y;
    M = (M < 10) ? "0" + M : "" + M;
    D = (D < 10) ? "0" + D : "" + D;
    h = (h < 10) ? "0" + h : "" + h;
    m = (m < 10) ? "0" + m : "" + m;
    return (
      <span title={date.toString()}>{Y + "-" + M + "-" + D + " " + h + ":" + m}</span>
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
      items: '',
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
    console.log("componentWillUnmount called");
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
    console.log("doRowMouseDown id", id);
    if (event.button == 0) {
      console.log("button is 0")
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

function SortedRows(props) {
  const getDefaultProps = () => {
    return {
        viewName: null,
        sortKey: null,
        reverse: false,
        tableFactory: <div />,
        rowFactory: null
    };
  }  
    var rows = db_items(props.viewName);
    console.log("sortedRows rows: ", rows)
    rows.sort(compareByKey(props.sortKey));
    if (props.reverse) rows.reverse();
  return (    
    rows.map((row) => 
        props.rowFactory(row.id, row)
        )
  )
}

function ProductRow(props) {
  var row = props.row;
  // console.log("ProductRow props: ", props)
  return (
    <div className='row item-row'>
        <div className='cell flex-1'>
            <Link href={'/product/' + row.id} title={props.row.title} />
        </div>
        <div className='cell flex-2 fsize-90'> {row.path_pattern} </div>
    </div>
  )
}

function BuildLink(props) {
  return (
    <Link href={'/build/' + props.row.id} title={props.row.name} />
  )
}

function ProductLink(props) {
  return (
    <Link href={'/product/' + props.row.id} title={props.row.title} />
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
    <a href={props.href} onClick={doLink} >{props.title}</a>
  )
}

class BuildRow extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      products: V_products_all(),
      results: V_results_by_build(this.props.row.id)
    }
  }
  render() {
    var row = this.props.row;
    var product = db_item_by_id(this.state.products, row.product_id);
    return (
      <div className='item-block'>
        <div className='row h3'>
          <BuildLink row={row} />
          <div>
            {product && <ProductLink row={product}/>}
          </div>
          <div>
            <Date timestamp={row.date} />
          </div>
        </div>
        <SortedRows 
          viewName={this.state.results}
          sortKey="start_date"
          reverse={true}
          rowFactory={<ResultRow />}
        />
      </div>
    )
  }
}

// function MachineGroupRow(props) {
//   var row = props.row;
//   return (
//     <div className='row item-row'>
//         <div className='cell flex-1'>
//             <Link href={'/mgroup/' + row.id} title={props.row.title} />
//         </div>
//         <div className='cell flex-3'>
//           <MachineList machine_group_id={row.id} />
//         </div>
//     </div>
//   )
// }