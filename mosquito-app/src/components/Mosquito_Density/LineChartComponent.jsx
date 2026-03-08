// import React from 'react';
// import { 
//   LineChart, 
//   Line, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   Legend, 
//   ResponsiveContainer 
// } from 'recharts';

// // Change: Accept 'data' as a prop
// export const ForecastLineChart = ({ data }) => {
    
//     // Fallback: If no data is passed, show an empty array to prevent crashing
//     const chartData = data || [];

//     return (
//         <ResponsiveContainer width="100%" height={400}>
//             <LineChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="day" />
//                 <YAxis />
//                 <Tooltip 
//                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
//                 />
//                 <Legend />
//                 <Line 
//                     type="monotone" 
//                     dataKey="actual" 
//                     stroke="#3b82f6" 
//                     name="Actual Density" 
//                     strokeWidth={3} 
//                     dot={{ r: 4 }}
//                 />
//                 <Line 
//                     type="monotone" 
//                     dataKey="predicted" 
//                     stroke="#ef4444" 
//                     name="AI Predicted" 
//                     strokeWidth={3} 
//                     strokeDasharray="5 5" 
//                     dot={{ r: 4 }}
//                 />
//             </LineChart>
//         </ResponsiveContainer>
//     );
// };