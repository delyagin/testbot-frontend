
// export function SortedRows(props) {
//     const getDefaultProps = () => {
//       return {
//           viewName: null,
//           sortKey: null,
//           reverse: false,
//           tableFactory: <div />,
//           rowFactory: null
//       };
//     }  
//       var rows = db_items(props.viewName);
//       rows.sort(compareByKey(props.sortKey));
//       if (props.reverse) rows.reverse();
//     return (    
//       rows.map((item, i) => 
//           <MachineGroupRow id={i} row={item} />
//           )
//     )
//   }

//   function MachineGroupRow(props) {
//     var row = props.row;
//     console.log("ProductRow props: ", props)
//     return (
//       <div className='row item-row'>
//           <div className='cell flex-1'>
//               <Link href={'/mgroup/' + row.id} title={props.row.title} />
//           </div>
//           <div className='cell flex-3'>
//             <MachineList machine_group_id={row.id} />
//           </div>
//       </div>
//     )
//   }

  