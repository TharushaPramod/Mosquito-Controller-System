import React, { useState } from 'react';

function FanControl() {
    // Raspberry Pi eke IP address eka
    const PI_IP = "192.168.31.135";

    const toggleFan = async (state) => {
        try {
            // Backend ekata request eka yawana widiya
            const response = await fetch(`http://${PI_IP}:8000/fan/${state}`, {
                mode: 'cors' // CORS issues nathi wenna
            });

            if (response.ok) {
                console.log(`Fan successfully turned ${state}`);
            }
        } catch (err) {
            console.error("Connection failed! Check if Pi server is running.");
            alert("Raspberry Pi ekata connect wenna baha. IP eka hariyatama check karanna.");
        }
    };

    return (
        <div style={{
            textAlign: 'center',
            marginTop: '100px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f4f4f9',
            padding: '40px',
            borderRadius: '20px',
            maxWidth: '400px',
            margin: '100px auto',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{ color: '#333' }}>Mosquito Trap</h1>
            <h3 style={{ color: '#666' }}>Fan Control Unit</h3>

            <div style={{ marginTop: '30px' }}>
                <button
                    onClick={() => toggleFan('on')}
                    style={{
                        padding: '15px 40px',
                        fontSize: '18px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Fan ON
                </button>

                <button
                    onClick={() => toggleFan('off')}
                    style={{
                        padding: '15px 40px',
                        fontSize: '18px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        marginLeft: '20px',
                        fontWeight: 'bold'
                    }}
                >
                    Fan OFF
                </button>
            </div>

            <p style={{ marginTop: '30px', fontSize: '12px', color: '#999' }}>
                Connected to: http://{PI_IP}:8000
            </p>
        </div>
    );
}

export default FanControl;