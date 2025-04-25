// import React, { useEffect, useState } from "react";

// const Next = () => {
//   const [loading, setLoading] = useState(false);
//   useEffect(() => {
//     const getdata = async () => {
//       setLoading(true);
//       try {
//         // Add your logic here to fetch data using queryParams
//       } catch (error) {
//         console.error("Error fetching paginated data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     getdata();
//   }, [  ]);
//   return (
//     <div className="text-center text-gray-400   text-xl">
//       <div className="border rounded-xl shadow-sm bg-white overflow-hidden mt-5">
//         <div className="border rounded-xl bg-white overflow-hidden">
//           <div id="table-container" className="max-h-[500px] overflow-auto">
//             <table className="w-full text-left border-collapse text-sm rounded-xl">
//               <thead className="sticky top-0 bg-green-50">
//                 <tr className="border-b border-gray-200">
//                   <th className="px-4 py-3 font-semibold text-gray-700">
//                     Number
//                   </th>
//                   <th className="px-4 py-3 font-semibold text-gray-700">
//                     Crop Name
//                   </th>
//                   <th className="px-4 py-3 font-semibold text-gray-700">
//                     next-4
//                   </th>
//                   <th className="px-4 py-3 font-semibold text-gray-700">
//                     Next RTH - 4-DAys
//                   </th>
//                   <th className="px-4 py-3 font-semibold text-gray-700">
//                     Edit
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {loading ? (
//                   [...Array(5)].map((_, index) => (
//                     <tr
//                       key={index}
//                       className="border-b border-gray-200 animate-pulse"
//                     >
//                       {[...Array(5)].map((_, i) => (
//                         <td key={i} className="px-4 py-3">
//                           <div className="h-4 bg-gray-300 rounded w-full"></div>
//                         </td>
//                       ))}
//                     </tr>
//                   ))
//                 ) : displayedFarmers.length > 0 ? (
//                   displayedFarmers.map((farmer, index) => (
//                     <tr
//                       key={index}
//                       className="border-b border-gray-200 hover:bg-green-50"
//                     >
//                       <td className="px-4 py-3 text-gray-600">
//                         {farmer.number || "-"}
//                       </td>
//                       <td className="px-4 py-3 text-gray-600">
//                         {farmer.crop_name || "-"}
//                       </td>
//                       <td className="px-4 py-3 text-gray-600">
//                         {farmer.rth || "-"}
//                       </td>
//                       <td className="px-4 py-3 text-gray-600">
//                         {farmer.next_rth || "-"}
//                       </td>
//                       <td className="px-4 py-3">
//                         <button
//                           onClick={() => handleEditClick(farmer)}
//                           className="text-green-500 px-2 py-1 rounded"
//                         >
//                           <PenIcon />
//                         </button>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={5} className="text-center py-4 text-gray-500">
//                       No Data Available
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Next;
