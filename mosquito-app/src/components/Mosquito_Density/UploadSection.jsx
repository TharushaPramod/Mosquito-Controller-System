// import { Upload, FileText, Activity, Loader2, Database, BrainCircuit } from 'lucide-react';
// import { useState } from 'react';

// export const UploadSection = ({ onModelDeployed }) => {
//     const [file, setFile] = useState(null);
//     const [uploading, setUploading] = useState(false);
//     const [message, setMessage] = useState(null);

//     // Toggle state: 'data' (CSV) or 'model' (PKL)
//     const [uploadMode, setUploadMode] = useState('data');

//     const handleUpload = async () => {
//         if (!file) {
//             setMessage({ type: 'error', text: 'Please select a file first!' });
//             return;
//         }

//         setUploading(true);
//         setMessage(null);

//         const formData = new FormData();
//         formData.append('file', file);

//         // Determine URL based on mode
//         const endpoint = uploadMode === 'data'
//             ? 'http://127.0.0.1:5001/api/upload'        // Existing CSV route
//             : 'http://127.0.0.1:5001/api/upload-model'; // New PKL route

//         try {
//             const response = await fetch(endpoint, {
//                 method: 'POST',
//                 body: formData,
//             });

//             const result = await response.json();

//             if (response.ok) {
//                 setMessage({
//                     type: 'success',
//                     text: uploadMode === 'data'
//                         ? 'Data uploaded & Model retrained!'
//                         : 'New AI Model (.pkl) updated successfully!'
//                 });
//                 setFile(null);
//                 // If model was deployed, refresh the forecast on dashboard
//                 if (uploadMode === 'model' && onModelDeployed) {
//                     // Delay to allow backend model reload and file release
//                     setTimeout(() => onModelDeployed(), 3000);
//                 }
//             } else {
//                 setMessage({ type: 'error', text: result.error || 'Upload failed' });
//             }
//         } catch (error) {
//             console.error("Upload Error:", error);
//             setMessage({ type: 'error', text: `Connection Error: ${error.message}` });
//         } finally {
//             setUploading(false);
//         }
//     };

//     return (
//         <div className="p-6 transition-all duration-300 bg-white shadow-lg rounded-xl">
//             {/* Header with Mode Toggle */}
//             <div className="flex items-center justify-between mb-6">
//                 <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
//                     {uploadMode === 'data' ? (
//                         <><Upload className="w-5 h-5 text-blue-600" /> MOH Data Import</>
//                     ) : (
//                         <><BrainCircuit className="w-5 h-5 text-purple-600" /> Update AI Model</>
//                     )}
//                 </h3>

//                 {/* Toggle Buttons */}
//                 <div className="flex p-1 bg-gray-100 rounded-lg">
//                     <button
//                         onClick={() => { setUploadMode('data'); setFile(null); setMessage(null); }}
//                         className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${uploadMode === 'data' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
//                             }`}
//                     >
//                         CSV Data
//                     </button>
//                     <button
//                         onClick={() => { setUploadMode('model'); setFile(null); setMessage(null); }}
//                         className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${uploadMode === 'model' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
//                             }`}
//                     >
//                         PKL Model
//                     </button>
//                 </div>
//             </div>

//             {/* File Input Area - Changes Color based on Mode */}
//             <div className={`p-8 text-center border-2 border-dashed rounded-lg transition-colors ${uploadMode === 'data' ? 'border-blue-200 hover:bg-blue-50' : 'border-purple-200 hover:bg-purple-50'
//                 }`}>
//                 {uploadMode === 'data' ? (
//                     <Database className="w-12 h-12 mx-auto mb-4 text-blue-300" />
//                 ) : (
//                     <BrainCircuit className="w-12 h-12 mx-auto mb-4 text-purple-300" />
//                 )}

//                 <p className="font-medium text-gray-600">
//                     {uploadMode === 'data' ? 'Upload Monthly CSV / Excel' : 'Upload Trained Model (.pkl)'}
//                 </p>
//                 <p className="mt-1 text-sm text-gray-500">
//                     {uploadMode === 'data' ? 'Support for Gampaha MOH Format' : 'System will restart with new logic'}
//                 </p>

//                 <input
//                     type="file"
//                     accept={uploadMode === 'data' ? ".csv,.xlsx,.xls" : ".pkl"}
//                     onChange={(e) => setFile(e.target.files[0])}
//                     className="mt-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-50"
//                 />
//             </div>

//             {/* Selected File Status */}
//             {file && (
//                 <div className={`p-3 mt-4 rounded animate-fade-in ${uploadMode === 'data' ? 'bg-blue-50 text-blue-800' : 'bg-purple-50 text-purple-800'
//                     }`}>
//                     <p className="flex items-center gap-2 text-sm font-medium">
//                         <FileText className="w-4 h-4" /> {file.name} - Ready
//                     </p>
//                 </div>
//             )}

//             {/* Error/Success Messages */}
//             {message && (
//                 <div className={`p-3 mt-4 rounded text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//                     }`}>
//                     {message.text}
//                 </div>
//             )}

//             {/* Action Button */}
//             <button
//                 onClick={handleUpload}
//                 disabled={uploading || !file}
//                 className={`flex items-center justify-center w-full gap-2 py-3 mt-6 font-medium text-white rounded-lg transition-all ${uploading || !file
//                     ? 'bg-gray-400 cursor-not-allowed'
//                     : uploadMode === 'data'
//                         ? 'bg-blue-600 hover:bg-blue-700'
//                         : 'bg-purple-600 hover:bg-purple-700'
//                     }`}
//             >
//                 {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
//                 {uploading
//                     ? 'Processing...'
//                     : uploadMode === 'data' ? 'Run Prediction Model' : 'Deploy New Model'
//                 }
//             </button>
//         </div>
//     );
// };