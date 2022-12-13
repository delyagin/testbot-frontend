import React, { Component } from 'react'
import { api_request, V_products_all, db_item_by_id, db_subscribe, db_unsubscribe } from '../../functions/functions';
import withRouter from '../../functions/withRouter'
import PopUpMenu from '../popUpMenu/PopUpMenu'
import './product.css'


/*
In react-router-dom v6 the Route components no longer have route props (history, location, and match), 
and the current solution is to use the React hooks "versions" of these to use within the components being rendered. 
React hooks can't be used in class components though.
https://stackoverflow.com/questions/69967745/react-router-v6-access-a-url-parameter
*/

class Product extends Component {
    constructor(props) {
        super(props);
        this.state = {
          products: V_products_all(),
          id: Number(this.props.params.id),
          popUpMenu: false

        }
        this._dbDidUpdate = this._dbDidUpdate.bind(this);
        this.doUpdate = this.doUpdate.bind(this);
        this.doDelete = this.doDelete.bind(this);
        this.showPopup = this.showPopup.bind(this);
        // console.log("Product, id: ", this.props.params.id)
    }
    
    _dbDidUpdate = () => {
        // console.log("_dbDidUpdate isMounted", this.state._isMounted)
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
    doUpdate = () => {
        api_request("update/product", {
            id: this.props.id,
            title: this.props.title,
            path_pattern: this.props.path_pattern
        })
    }
    doDelete = (event) => {
        console.log("doDelete: this.props.id", this.state.id)
        api_request("delete/product", { id: this.state.id });
        this.props.navigate("/products");
    }
    showPopup = () => {
        this.setState(prevState =>{
            return{
                ...prevState,
                popUpMenu: !prevState.popUpMenu
            }})
    }
    render() {
        var product = db_item_by_id(this.state.products, this.state.id)
        // console.log("product", product)
        if (!product) return null;
        
     return (
        <div className='table'>
          <div className='row h1'>
            <div className='cell flex-1'>Product</div>
            <div>
                    <button className='icon icon-menu' onClick={this.showPopup} />
            </div>
          </div>
          <div className='dropdown'>{this.state.popUpMenu && <PopUpMenu onClick={[this.doDelete]} text={["Delete product"]} />}</div>
          <div className='row item-row'>
            <div className='cell flex-1 '>Title:</div>
            <div className='cell flex-2 fsize-90'>{product.title}</div>
          </div>
          <div className='row'>
            <div className='cell flex-1'>Product Path:</div>
            <div className='cell flex-2 fsize-90'>{product.path_pattern}</div>
          </div>
       </div>
    )
  }
}

export default withRouter(Product);