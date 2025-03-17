/**
 * Downloads an image from a URL - optimized for DALL-E generated images
 * @param {string} url - The URL of the image to download
 * @param {string} filename - The filename to save the image as
 */
export const downloadLogo = async (url, filename = "generated-logo.png") => {
  try {
    console.log(`🔽 Attempting to download logo from: ${url}`);

    // Method 1: Direct link approach (no fetch, avoids CORS issues)
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank"; // Ensures it works even if download attribute is ignored
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();

    // Remove the link from the document
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);

    console.log(`✅ Download initiated for ${filename}`);
    return true;
  } catch (error) {
    console.error("❌ Error initiating download:", error);

    // Method 2: Try using the Fetch API with proxy if available
    try {
      // You can set up a simple proxy endpoint on your server
      // that fetches the image and returns it with proper CORS headers
      if (process.env.REACT_APP_IMAGE_PROXY_URL) {
        const proxyUrl = `${
          process.env.REACT_APP_IMAGE_PROXY_URL
        }?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);

        if (!response.ok) throw new Error("Proxy fetch failed");

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

        console.log(`✅ Image downloaded via proxy as ${filename}`);
        return true;
      }
    } catch (proxyError) {
      console.error("❌ Proxy download failed:", proxyError);
    }

    // Method 3: Final fallback - open in new tab with instructions
    alert(
      "Automatic download failed. The image will open in a new tab. Please right-click and select 'Save Image As...' to download it."
    );
    window.open(url, "_blank");

    return false;
  }
};

/**
 * Alternative approach using a server-side proxy (if you have backend control)
 * This function assumes you have an endpoint on your server that can
 * fetch the image and serve it with proper headers
 */
export const downloadLogoViaProxy = async (
  imageId,
  filename = "generated-logo.png",
  originalUrl = null
) => {
  try {
    // Construct a URL to your backend proxy endpoint
    const proxyUrl = `/api/proxy/images/${imageId}`;

    // Create a link to the proxy URL
    const link = document.createElement("a");
    link.href = proxyUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);

    console.log(`✅ Image download initiated via proxy`);
    return true;
  } catch (error) {
    console.error("❌ Error downloading via proxy:", error);

    // Fallback to original method
    // Use originalUrl if provided, otherwise try to construct one from imageId
    const fallbackUrl =
      originalUrl ||
      (typeof imageId === "string" && imageId.startsWith("http")
        ? imageId // imageId is already a URL
        : `/api/images/${imageId}`); // construct URL from ID

    return downloadLogo(fallbackUrl, filename);
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
