import React, { Component } from 'react'
import { V_test_suites_all, db_subscribe, db_unsubscribe, db_item_by_id, api_request } from '../../functions/functions'
import PopUpMenu from '../popUpMenu/PopUpMenu';
import withRouter from '../../functions/withRouter'
import MaybeInput from '../Input/MaybeInput';

class TestSuitePage extends Component {
  constructor(props) {
      super(props);
      this.state = {
        tsuites: V_test_suites_all(),
        popUpMenu: false,
        modal: false,
        id: Number(this.props.params.id),
      }
      this.doUpdate = this.doUpdate.bind(this);
      this.doDelete = this.doDelete.bind(this);

      this.titleRef = React.createRef();
      this.urlRef = React.createRef();
      this.revisionRef = React.createRef();
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
  }
  showPopup = () => {
    this.setState(prevState =>{
      return{
        ...prevState,
        popUpMenu: !prevState.popUpMenu
      }
    })
  }
  doUpdate = () => {
    api_request("update/test-suite", {
      id: this.state.id,
      title: this.titleRef.current.state.value,
      spec: {
          kind: "URSTEST",
          url: this.urlRef.current.state.value,
          revision: this.revisionRef.current.state.value
      }
  })
}
doDelete = (event) => {
  api_request("delete/test-suite", { id: this.state.id });
  this.props.navigate("/tsuite-list");
}
  render() {
    var ts = db_item_by_id(this.state.tsuites, this.state.id);
    if (!ts) return null;
    return (
      <div className='table'>
        <div className='row h1'>
          <div className='cell flex-1'>Test Suite</div>
          <div>
            <button className='icon icon-menu' onClick={this.showPopup} />
          </div>
        </div>
        <div className='dropdown'>{this.state.popUpMenu && <PopUpMenu onClick={[this.doDelete]} text={["Delete this test suite"]} />}</div>
        <div className='row'>
          <div className='cell flex-1 '>Title:</div>
          <div className='cell flex-2'>
            <div className='row'>
              <div className='cell flex-2 item-row'>
                <MaybeInput defaultValue={ts.title} onChange={this.doUpdate} ref={this.titleRef} />
              </div>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='cell flex-1 '>URL:</div>
          <div className='cell flex-2'>
            <div className='row'>
              <div className='cell flex-2 item-row'>
                <MaybeInput defaultValue={ts.spec.url} onChange={this.doUpdate} ref={this.urlRef} />
              </div>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='cell flex-1 '>Revision:</div>
          <div className='cell flex-2'>
            <div className='row'>
              <div className='cell flex-2 item-row'>
                <MaybeInput defaultValue={ts.spec.revision} onChange={this.doUpdate} ref={this.revisionRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(TestSuitePage);