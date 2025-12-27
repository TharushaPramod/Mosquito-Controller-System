import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Day 1', cases: 30, recovered: 20, active: 10 },
    { name: 'Day 2', cases: 40, recovered: 25, active: 15 },
    { name: 'Day 3', cases: 35, recovered: 30, active: 20 },
    { name: 'Day 4', cases: 50, recovered: 35, active: 25 },
    { name: 'Day 5', cases: 45, recovered: 40, active: 30 },
    { name: 'Day 6', cases: 60, recovered: 45, active: 35 },
    { name: 'Day 7', cases: 55, recovered: 50, active: 40 },
    { name: 'Day 8', cases: 70, recovered: 55, active: 45 },
    { name: 'Day 9', cases: 65, recovered: 60, active: 50 },
    { name: 'Day 10', cases: 80, recovered: 65, active: 55 },
    { name: 'Day 11', cases: 75, recovered: 70, active: 60 },
    { name: 'Day 12', cases: 90, recovered: 75, active: 65 },
    { name: 'Day 13', cases: 85, recovered: 80, active: 70 },
    { name: 'Day 14', cases: 100, recovered: 85, active: 75 },
];

const TrendChart = () => {
    return (
        <div className="bg-[#DDEDE7] rounded-xl p-6 shadow-sm h-full flex flex-col">
            <h3 className="text-gray-700 font-semibold mb-4 text-center">Past 14 Days Trends</h3>

            <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                        <XAxis
                            dataKey="name"
                            label={{ value: 'Days', position: 'insideBottom', offset: -10 }}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft', offset: 0 }}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Legend verticalAlign="top" height={36} />
                        <Line type="monotone" dataKey="cases" name="Reported Cases" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="recovered" name="Recovered" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="active" name="Active Cases" stroke="#ffc658" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrendChart;
