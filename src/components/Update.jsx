// import React, { useState, useEffect } from "react";
// import { Loader } from "lucide-react";

// const Update = () => {
//   const [loading, setLoading] = useState(false);
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     const savedData = localStorage.getItem("updateData");
//     if (savedData) {
//       setData(JSON.parse(savedData));
//     }
//   }, []);

//   const handleUpdate = async () => {
//     setLoading(true);
//     const url = `${process.env.NEXT_PUBLIC_API_URL}/update-database`;

//     try {
//       const response = await fetch(url, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       const result = await response.json();
//       setData(result);
//       localStorage.setItem("updateData", JSON.stringify(result));
//     } catch (error) {
//       console.error("Error updating:", error);
//       alert("Failed to update database.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getProgress = () => {
//     if (!data || !data.totalDbUsers || data.totalDbUsers === 0) return 0;
//     const percentage = Math.round(
//       (data.totalApiUsers / data.totalDbUsers) * 100
//     );
//     return percentage;
//   };

//   return (
//     <div className="flex justify-end">
//       <div className="flex items-center justify-between gap-4 bg-green-100 p-4 rounded-md shadow-md w-full max-w-3xl h-20">
//         {/* Left: Data Details */}
//         {data && (
//           <div className="flex flex-col gap-2 w-full">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-900 font-medium">
//               <p>
//                 Updated: <span className="font-bold">{data.updatedCount}</span>
//               </p>
//               <p>
//                 Inserted:{" "}
//                 <span className="font-bold">{data.insertedCount}</span>
//               </p>
//               <p>
//                 API Users:{" "}
//                 <span className="font-bold">{data.totalApiUsers}</span>
//               </p>
//               <p>
//                 DB Users: <span className="font-bold">{data.totalDbUsers}</span>
//               </p>
//             </div>

//             {/* Progress Bar */}
//             <div className="mt-2 relative w-full h-6 bg-green-200 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-gradient-to-r from-green-400 to-green-600  text-xs font-semibold flex items-center justify-center transition-all duration-700 ease-out"
//                 style={{ width: `${getProgress()}%` }}
//               >
//                 {getProgress()}%
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Right: Loader Button */}
//         <div
//           onClick={!loading ? handleUpdate : undefined}
//           className={`min-w-[50px] h-[50px] rounded-full text-black flex items-center justify-center bg-green-400 transition cursor-pointer ${
//             loading ? "opacity-60 pointer-events-none" : ""
//           }`}
//         >
//           {loading ? (
//             <Loader className="h-7 w-7 animate-spin text-white" />
//           ) : (
//             <Loader className="h-5 w-5 text-white" />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Update;
