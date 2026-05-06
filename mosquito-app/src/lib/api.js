const API_BASE_URL = "/pi-api";

export const api = {
    getSettings: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/settings`);
            if (!res.ok) throw new Error("Failed to fetch settings");
            return await res.json();
        } catch (error) {
            console.warn("API Error (getSettings):", error);
            throw error;
        }
    },
    updateSettings: async (settings) => {
        try {
            const res = await fetch(`${API_BASE_URL}/settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error("Failed to update settings");
            return await res.json();
        } catch (error) {
            console.warn("API Error (updateSettings):", error);
            throw error;
        }
    },
    controlComponent: async (component, action) => {
        try {
            const res = await fetch(`${API_BASE_URL}/control`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ component, action }),
            });
            if (!res.ok) throw new Error("Failed to control component");
            return await res.json();
        } catch (error) {
            console.warn("API Error (controlComponent):", error);
            throw error;
        }
    },
    getSystemStatus: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/status`);
            if (!res.ok) throw new Error("Failed to fetch system status");
            return await res.json();
        } catch (error) {
            console.warn("API Error (getSystemStatus):", error);
            throw error;
        }
    }
};