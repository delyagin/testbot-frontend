import React, { Component } from 'react'
import {V_products_all, V_machines_all, db_subscribe, db_unsubscribe, db_items } from '../functions/functions'

export default class ProductList extends Component {
    constructor(props) {
        super(props);
        this.state = {
          items: V_products_all(),
          contacts_list: [],
          // machines: V_machines_all(),
          isShow: false,
          _isMounted: false
        }
        // this.getContacts = this.getContacts.bind(this)
        // this.handleClick = this.handleClick.bind(this)
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
      this.setState({
        _isMounted: true
      })
      
  };
  render() {
        var products = db_items(this.state.items);
        console.log("this.state.items", this.state.items)
        console.log("products: ", products)
        console.log("isShow", this.state.isShow)
        return (
        <>
            ProductList
            <tbody>
                <tr>
                    <th>Title</th>
                    <th>Path pattern</th>
                </tr>
                {products.map((item,i) => 
                <tr key={i}>
                    <td> {item.title} </td>
                    <td> {item.path_pattern} </td>
                </tr>
                )}

            </tbody>
        </>
        )
  }
}

// defReactClass("ProductList", {
//     mixins: [DBUserMixin],
//     componentWillMount: function () {
//         this.setViewState({ items: V_products_all() });
//     },
//     doNewProduct: function () {
//         this.refs.newProductDialog.toggleDialog();
//     },
//     render: function () {
//         return DOM.Table(null,
//             DOM.Row({className: "h1"},
//                 DOM.Cell1(null, "Products"),
//                 DOM.PopupMenu(null,
//                     DOM.MenuItem({onSelect: this.doNewProduct},
//                         "Add a new product..."))),
//             DOM.Row({className: "h2"},
//                 DOM.Cell1(null, "Title"),
//                 DOM.Cell2(null, "Path Pattern")),
//             DOM.SortedRows({
//                 viewName: this.state.items,
//                 sortKey: "title",
//                 rowFactory: DOM.ProductRow}),
//             DOM.NewProductDialog({ref: "newProductDialog"}));
//     }
// });