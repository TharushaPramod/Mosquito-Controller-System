// import { AlertTriangle, CheckCircle } from 'lucide-react';

// export const RiskCard = ({ riskLevel, probability }) => {
    
//     // Default values if data hasn't loaded yet
//     const level = riskLevel || "LOADING...";
//     const prob = probability || 0;

//     // Logic: Determine Color based on Risk Level
//     const isHighRisk = level === "HIGH";

//     return (
//         <div className={`p-6 border rounded-xl ${
//             isHighRisk 
//             ? 'bg-red-50 border-red-200' 
//             : 'bg-green-50 border-green-200'
//         }`}>
//             <div className="flex items-center gap-3 mb-4">
//                 {isHighRisk ? (
//                     <AlertTriangle className="w-8 h-8 text-red-600" />
//                 ) : (
//                     <CheckCircle className="w-8 h-8 text-green-600" />
//                 )}
//                 <h3 className="text-lg font-semibold text-gray-800">Predicted Risk Level</h3>
//             </div>
            
//             <p className={`text-4xl font-bold ${
//                 isHighRisk ? 'text-red-600' : 'text-green-600'
//             }`}>
//                 {level}
//             </p>
            
//             <p className="mt-2 text-gray-600">
//                 Probability: {prob}%
//             </p>
//         </div>
//     );
// };