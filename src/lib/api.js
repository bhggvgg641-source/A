const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // استخدام localhost:8000 لبيئة التطوير

export const fetchRecommendations = async (userId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/recommendations/feed?userId=${userId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        return [];
    }
};

export const smartSearch = async (query, filters) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/search/smart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, filters }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error during smart search:", error);
        return [];
    }
};

export const virtualTryOn = async (imageFile, productDetails) => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('product_details', JSON.stringify(productDetails));

        const response = await fetch(`${API_BASE_URL}/api/virtual-try-on`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Error during virtual try-on:", error);
        return null;
    }
};
