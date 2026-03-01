// src/utils/cloudinary.js
export const uploadToCloudinary = async (blob, options = {}) => {
    const formData = new FormData();
    formData.append('file', blob, `video-${Date.now()}.webm`);
    formData.append('upload_preset', 'ml_default'); // Free preset
    formData.append('resource_type', 'video');
    formData.append('folder', 'seller-videos');

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/dkqvwuhqj/video/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary error:', error);
        throw error;
    }
};
