import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="p-10 bg-white shadow-xl rounded-2xl text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Tailwind Working! 🚀
        </h1>

        <p className="text-gray-700 text-lg">
          If you can see blue text and a centered card, Tailwind is installed correctly.
        </p>

        <button className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          Test Button
        </button>
      </div>
    </div>
  )
}

export default App
