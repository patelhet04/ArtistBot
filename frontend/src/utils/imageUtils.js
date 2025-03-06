// src/components/Chat/utils/imageUtils.js

/**
 * Downloads an image from a URL
 * @param {string} url - The URL of the image to download
 * @param {string} filename - The filename to save the image as
 */
export const downloadLogo = async (url, filename = "generated-logo.png") => {
  try {
    // Create an image element to load the image
    const img = new Image();
    img.crossOrigin = "anonymous"; // Try to avoid CORS issues
    
    // Create a promise to wait for the image to load
    const imageLoadPromise = new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = url;
    });
    
    // Wait for the image to load
    const loadedImg = await imageLoadPromise;
    
    // Create a canvas element to draw the image
    const canvas = document.createElement("canvas");
    canvas.width = loadedImg.width;
    canvas.height = loadedImg.height;
    
    // Draw the image on the canvas
    const ctx = canvas.getContext("2d");
    ctx.drawImage(loadedImg, 0, 0);
    
    // Convert the canvas to a data URL
    // For PNG images with transparency
    const dataURL = canvas.toDataURL("image/png");
    
    // Create a link element to download the image
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("Error in canvas download method:", error);
    
    // Fallback method: Try to fetch the image directly
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      return true;
    } catch (fetchError) {
      console.error("Error in fetch download method:", fetchError);
      
      // Final fallback: Open in a new tab with instructions
      alert("Automatic download failed. The image will open in a new tab. Please right-click and select 'Save Image As...' to download it.");
      window.open(url, "_blank");
      
      throw new Error("Failed to download image automatically.");
    }
  }
};

/**
 * Formats seconds into MM:SS format
 * @param {number} seconds - The number of seconds
 * @returns {string} - Formatted time string
 */
export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};