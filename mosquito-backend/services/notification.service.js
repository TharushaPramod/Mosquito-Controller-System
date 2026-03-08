const Alert = require("../models/Alert");

const getActiveAlerts = async (query) => {
    let mongoQuery = { active: true };
    if (query.type) mongoQuery.type = query.type;
    if (query.riskLevel) mongoQuery.riskLevel = query.riskLevel;
    if (query.district) mongoQuery.district = query.district;

    return await Alert.find(mongoQuery).sort({ createdAt: -1 }).limit(parseInt(query.limit) || 20);
};

const createAlert = async (data) => {
    const alert = new Alert(data);
    return await alert.save();
};

const subscribeToTopic = async (token, topic) => {
    // Keeping this as a placeholder for now, maybe still use Firebase for FCM?
    return { success: true };
};

const autoGenerateOutbreakAlert = async (district, cases, diseaseType) => {
    if (cases > 50) {
        await createAlert({
            titleEn: `Outbreak Warning: ${district}`,
            messageEn: `High case count (${cases}) of ${diseaseType} detected.`,
            district,
            riskLevel: "high",
            type: "outbreak"
        });
    }
};

module.exports = {
    getActiveAlerts,
    createAlert,
    subscribeToTopic,
    autoGenerateOutbreakAlert
};
