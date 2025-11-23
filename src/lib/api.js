const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// نقطة نهاية التسجيل الجديدة
export const registerUser = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/register/`, {
            method: 'POST',
            body: formData, // FormData for file upload
            // لا نحدد Content-Type هنا، المتصفح يحددها تلقائيًا لـ FormData مع boundary

        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error during user registration:", error);
        throw error;
    }
};

// نقطة نهاية جلب التوصيات (التغذية المتدرجة)
export const fetchRecommendations = async (userId, page = 1) => {
    try {
        // نقطة النهاية في الخلفية هي /api/recommendations/
        const response = await fetch(`${API_BASE_URL}/api/recommendations/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, page: page }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        throw error;
    }
};

// نقطة نهاية البحث المتقدم
export const smartSearch = async (userId, filters, page = 1) => {
    try {
        // نقطة النهاية في الخلفية هي /api/advanced-search/
        const response = await fetch(`${API_BASE_URL}/api/advanced-search/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, filters: filters, page: page }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error during smart search:", error);
        throw error;
    }
};

// نقطة نهاية التجربة الافتراضية (لم تتغير)
export const virtualTryOn = async (imageFile, productDetails) => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('product_details', JSON.stringify(productDetails));

        const response = await fetch(`${API_BASE_URL}/api/virtual-try-on`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error during virtual try-on:", error);
        throw error;
    }
};
