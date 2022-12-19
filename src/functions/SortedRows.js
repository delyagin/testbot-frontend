
export default function SortedRows(props) {
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
      rows.sort(compareByKey(props.sortKey));
      if (props.reverse) rows.reverse();
    return (    
      rows.map((item, i) => 
          <MachineGroupRow id={i} row={item} />
          )
    )
  }