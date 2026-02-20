let settings = {
    type: "PERCENTAGE", // or FIXED
    value: 30, // 30%
};

export const getAdvanceSettings = () => settings;

export const saveAdvanceSettings = (newSettings) => {
    settings = newSettings;
};
