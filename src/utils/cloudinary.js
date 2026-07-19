// // src/utils/cloudinary.js
// export const uploadToCloudinary = async (blob, options = {}) => {
//     const formData = new FormData();
//     formData.append('file', blob, `video-${Date.now()}.webm`);
//     formData.append('upload_preset', 'ml_default'); // Free preset
//     formData.append('resource_type', 'video');
//     formData.append('folder', 'seller-videos');

//     try {
//         const response = await fetch(
//             `https://api.cloudinary.com/v1_1/dkqvwuhqj/video/upload`,
//             {
//                 method: 'POST',
//                 body: formData
//             }
//         );

//         if (!response.ok) {
//             const errorBody = await response.json().catch(() => null);
//             console.error("Cloudinary detailed error (FULL):", JSON.stringify(errorBody, null, 2));
//             console.error("Response status was:", response.status, response.statusText);
//             throw new Error(
//                 `Upload failed: ${errorBody?.error?.message || response.statusText}`,
//             );
//         }

//         const data = await response.json();
//         return data.secure_url;
//     } catch (error) {
//         console.error('Cloudinary error:', error);
//         throw error;
//     }
// };



// src/utils/cloudinary.js
export const uploadToCloudinary = async (blob, options = {}) => {
    // Detect the real extension so we don't lie to Cloudinary about the file type
    // (MediaRecorder can fall back to mp4 on some browsers/devices).
    const extension = blob.extension || (blob.type && blob.type.includes('mp4') ? 'mp4' : 'webm');

    const formData = new FormData();
    formData.append('file', blob, `video-${Date.now()}.${extension}`);
    formData.append('upload_preset', 'ml_default'); // Free preset
    formData.append('folder', 'seller-videos');
    // NOTE: 'resource_type' is intentionally NOT sent here.
    // Cloudinary's unsigned upload API only reads resource_type from the URL
    // path (.../video/upload). Sending it as a form field as well is treated
    // as an invalid/extra parameter by unsigned presets and causes the
    // upload to fail — that was the root cause of the broken uploads.

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/dkqvwuhqj/video/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            console.error("Cloudinary detailed error (FULL):", JSON.stringify(errorBody, null, 2));
            console.error("Response status was:", response.status, response.statusText);
            throw new Error(
                `Upload failed: ${errorBody?.error?.message || response.statusText}`,
            );
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary error:', error);
        throw error;
    }
};