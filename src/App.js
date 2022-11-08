import React, { Component } from 'react'
import Click from './components/click';
import Home from './Pages/Home'
import Testers from './Pages/Testers'
import ErrorPage from './Pages/ErrorPage'

import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom'


var VIEWLIST = [],
    VIEWMAP = {},
    VIEWCLEANUPTIMER = null;

function db_create_view(name, table, filter, inserter) {
    var view = {
        name: name,
        table: table,
        filter: filter,
        inserter: inserter ? inserter : db_default_inserter,
        subscribers: [],
        rowmap: {}
    };
    VIEWLIST.push(view);
    VIEWMAP[name] = view;
}

function db_delete_view(name) {
    for (var i = VIEWLIST.length - 1; i >= 0; i--) {
        var view = VIEWLIST[i];
        if (view.name === name) {
            VIEWLIST.splice(i, 1);
            break;
        }
    }
    delete VIEWMAP[name];
}

function db_cleanup_views() {
    for (var i = VIEWLIST.length - 1; i >= 0; i--) {
        var view = VIEWLIST[i];
        if (view.subscribers.length === 0) {
            db_delete_view(view.name);
        }
    }
}

function db_subscribe(viewname, callback) {
    var view = VIEWMAP[viewname];
    if (!view) return;
    view.subscribers.push(callback);
    console.log("db_subscribe callback", callback)
    return [viewname, callback];
}

function db_unsubscribe(ticket) {
    var viewname = ticket[0], callback = ticket[1];
    var view = VIEWMAP[viewname];
    if (!view) return;
    for (var i = view.subscribers.length - 1; i >= 0; i--) {
        if (view.subscribers[i] === callback) {
            view.subscribers.splice(i, 1);
            break;
        }
    }
    if (!VIEWCLEANUPTIMER) {
        VIEWCLEANUPTIMER = setTimeout(function () {
            VIEWCLEANUPTIMER = null;
            db_cleanup_views();
        }, 2000);
    }
}

function db_notify_subscribers(viewname) {
    var view = VIEWMAP[viewname];
    console.log("view: ", view)
    for (var i = view.subscribers.length - 1; i >= 0; i--){
        console.log("view.subscribers[i]: ", view.subscribers[i], "i=", i);
        view.subscribers[i]();
    }
}

function db_default_inserter(view, row) {
    // This is the default inserter, it simply adds a row to
    // the table.
    view.rowmap[row.id] = row;
    db_notify_subscribers(view.name)
}

function db_limited_inserter(field, limit) {
    return function (view, row) {
        // This inserter adds a row to the table and then optionally
        // trims it, so it won't exceed 'limit' elements. The rows with
        // the smallest 'field' values will be trimmed first.
        var minf = row[field], minl = [row.id], count = 1;
        for (var k in view.rowmap) {
            var r = view.rowmap[k],
                f = r[field];
            if (f < minf) { minf = f;  minl = [r.id]; }
            else if (f === minf) { minl.push(r.id); }
            count++;
        }
        // The purpuse of this test is to make sure that if there
        // are multiple rows with identical 'field' values, they are
        // treated as a single entity.
        //
        // Note that this means that the number of elements in the
        // view may exceed 'limit' if the smallest row shares it's
        // 'field' value with more rows.
        if (count + 1 - minl.length > limit) {
            if (minl.length === 1 && minl[0] === row.id) {
                // The newly inserted row is immidiately removed;
                // skipping the notification step.
            } else {
                view.rowmap[row.id] = row;
                for (var i = minl.length - 1; i >= 0; i--)
                    delete view.rowmap[minl[i]];
                db_notify_subscribers(view.name)
            }
        } else {
            view.rowmap[row.id] = row;
            db_notify_subscribers(view.name)
        }
    }
}

function db_insert(table, row) {
    for (var i = VIEWLIST.length - 1; i >= 0; i--) {
        var view = VIEWLIST[i];
        if (view.table === table && view.filter(row)) {
            view.inserter(view, row);
        }
    }
}

function db_populate_view(viewname, rowlist) {
    var view = VIEWMAP[viewname];
    if (!view) return;
    for (var i = rowlist.length - 1; i >= 0; i--) {
        var row = rowlist[i];
        if (view.filter(row))
            view.rowmap[row.id] = row;
    }
    db_notify_subscribers(view.name);
    console.log("db_populate_view finished")
}

function db_update(table, row) {
    for (var i = VIEWLIST.length - 1; i >= 0; i--) {
        var view = VIEWLIST[i];
        if (view.table === table && view.rowmap[row.id]) {
            view.rowmap[row.id] =
                React.__spread({}, view.rowmap[row.id], row);
            db_notify_subscribers(view.name);
        }
    }
    // XXX: update denormalized data in related tables
}

function db_delete(table, id) {
    for (var i = VIEWLIST.length - 1; i >= 0; i--) {
        var view = VIEWLIST[i];
        if (view.table === table && view.rowmap[id]) {
            delete view.rowmap[id];
            db_notify_subscribers(view.name);
        }
    }
    // XXX: cascade into related tables
    // XXX: update denormalized data in related tables
}

function db_item_by_id(viewname, id) {
    var view = VIEWMAP[viewname];
    if (!view) return null;
    return view.rowmap[id];
}

function db_items(viewname) {
    var view = VIEWMAP[viewname];
    var items = [];
    if (!view) return items;
    for (var k in view.rowmap) {
        items.push(view.rowmap[k]);
    }
    return items;
}

function db_filter_items(viewname, filter) {
    var view = VIEWMAP[viewname];
    var items = [];
    if (!view) return items;
    for (var k in view.rowmap) {
        var row = view.rowmap[k];
        if (filter(row)) items.push(row);
    }
    return items;
}

function db_reduce_items(viewname, reducer, init) {
    var view = VIEWMAP[viewname];
    var result = init;
    if (!view) return result;
    for (var k in view.rowmap) {
        result = reducer(result, view.rowmap[k]);
    }
    return result;
}

var WS_PROTO = window.location.protocol === "https" ? "wss" : "ws";
var WS = null;
var CALLBACKMAP = {};
var API_BACKLOG = [];
var API_STATUSCHANGE = null;

function api_connect() {
    // WS = new WebSocket(WS_PROTO + "://" + location.host + "/api/client");
    WS = new WebSocket(WS_PROTO + "://" + "localhost:80" + "/api/client");
    console.log("WS_PROTO: ", WS_PROTO)
    console.log("window.location.host: ", window.location.host)
    WS.onopen = function () {
        console.log("WS open", API_BACKLOG.length);
        for (var i = 0; i < API_BACKLOG.length; i++)
            WS.send(API_BACKLOG[i]);
        API_BACKLOG = [];
    }
    WS.onmessage = function (event) {
        var obj = JSON.parse(event.data);
        console.log("WS recv", obj);
        if (obj.m === "insert") db_insert(obj.table, obj.value);
        if (obj.m === "update") db_update(obj.table, obj.value);
        if (obj.m === "delete") db_delete(obj.table, obj.id);
        if (obj.m === "response") {
            var cookie = obj.cookie;
            var callback = CALLBACKMAP[cookie];
            delete CALLBACKMAP[cookie];
            if (callback) callback(obj.data);
        }
    }
    WS.onerror = function (ws, e) {
        console.log("WS error", e);
        if (API_STATUSCHANGE) API_STATUSCHANGE(api_status());
    }
    WS.onclose = function () {
        // console.log("WS close");
        if (API_STATUSCHANGE) API_STATUSCHANGE(api_status());
    }
}

function api_status() {
    return (!WS || WS.readyState === WebSocket.CONNECTING) ? "connecting" :
           (WS.readyState === WebSocket.OPEN) ? "open" : "disconnected";
}

function api_onstatuschange(fn) {
    API_STATUSCHANGE = fn;
}

function api_connected() {
    return WS !== null && WS.readyState == WebSocket.OPEN;
}

function api_request(m, params, callback) {
    var request = {m: m};
    if (callback) {
        var cookie;
        do {
            cookie = Math.random().toString(36).substring(2);
        } while (CALLBACKMAP[cookie]);
        request.cookie = cookie;
        CALLBACKMAP[cookie] = callback;
    }
    if (params) for (var k in params) request[k] = params[k];
    if (api_connected()) {
        console.log("Api connect")
        WS.send(JSON.stringify(request));
    } else {
        console.log("Api not connect")
        API_BACKLOG.push(JSON.stringify(request));
    }
}

function populate_db_from_api(viewname, request, params) {
    api_request(request, params, function (rowlist) {
        db_populate_view(viewname, rowlist);
    });
    console.log("populate_db_from_api finished")
}

function V_machines_all() {
    var name = "m/all";
    if (VIEWMAP[name]) return name;
    db_create_view(name, "machines", function (row) { return true; });
    populate_db_from_api(name, "list/machines/all");
    return name;
}

function V_contacts_all() {
    var name = "c/all";
    if (VIEWMAP[name]) return name;
    db_create_view(name, "contacts", function (row) { return true; });
    populate_db_from_api(name, "list/contacts/all");
    console.log("V_contacts_all finished")
    console.log("VIEWLIST", VIEWLIST)
    return name;
    
}



class App extends Component {
    constructor(props) {
      super(props);
      this.state = {
        contacts: V_contacts_all(),
        contacts_list: [],
        // machines: V_machines_all(),
        isShow: false,
        _isMounted: false
      }
      this.getContacts = this.getContacts.bind(this)
      this.handleClick = this.handleClick.bind(this)
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
        // this.setState(state);
        // func => {
        //   console.log("!!!");
        // });
    this.setState({
      _isMounted: true
    })
    
};

  handleClick = event => {
    // 👇️ toggle shown state
    const prev = this.state.isShow;
    this.setState({ isShow: !prev })
  }

  getContacts = () => {
    this.setState({
      contacts_list: db_items(this.state.contacts)
    })
    console.log("!: ", this.state.contacts)
  }
  getMachines = () => {
    var m = db_items(V_machines_all());
    console.log("var machines: ", m)
  }
  
    render() {
      var contacts2 = db_items(this.state.contacts);
      console.log("this.state.contacts", this.state.contacts)
      var machines = db_items(this.state.machines);
      console.log("isShow", this.state.isShow)
      console.log("render: ", contacts2)
      return (
        <div>
          App
          <Testers/>
          <Click/>
          <button onClick={this.getContacts}>Get contacts</button>
          <button onClick={this.getMachines}>Get machines</button>
          <button onClick={this.handleClick}>Click</button>
          { this.state.isShow && (
            <div>Some list</div>
          )}
            <ul>
            {contacts2.map(item => 
              <li key={item.id}>{item.name}</li>)}
          </ul>
          <ul>
            {machines.map(item => 
              <li key={item.id}>{item.name}</li>)}
          </ul>
        </div>
      )
    }
  }

  function App2(){
    return (
        <Router>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/testers">Testers</Link>
                {/* <Link>Home</Link> */}
            </nav>
            <Routes>
                <Route path="/" element={<Home />}   />
                <Route path="/testers" element={<Testers />}   />
                <Route path="*" element={<ErrorPage />}   />
            </Routes>
        </Router>
    )
  }
export default App2;
api_connect();
// if (api_connected()) {
//     console.log("Api connect")
//     // WS.send(JSON.stringify(request));
// }
// else {
//     console.log("Api not connect")
// }
