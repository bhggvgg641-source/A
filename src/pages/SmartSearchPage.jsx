import { useState, useEffect, useCallback } from 'react';
import { Search, Mic, Camera, XCircle, Filter, TrendingUp, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { smartSearch } from '../lib/api'; // استيراد دالة البحث الجديدة

const SmartSearchPage = ({ user }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    product_type: '',
    color: '',
    style: '',
  });
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const userId = user?.id || 1; // استخدام معرف وهمي إذا لم يكن المستخدم مسجلاً للدخول

  useEffect(() => {
    // تحميل سجل البحث من التخزين المحلي
    const storedHistory = localStorage.getItem('searchHistory');
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  const handleSearch = useCallback(async (pageNumber = 1) => {
    if (!query.trim() && Object.values(filters).every(f => !f)) return;
    if (!hasMore && pageNumber > 1) return;

    setIsLoading(true);
    setError(null);

    // إضافة البحث إلى السجل فقط في الصفحة الأولى
    if (pageNumber === 1 && query.trim()) {
      const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }

    try {
      const searchData = await smartSearch(userId, { ...filters, query: query.trim() }, pageNumber);
      
      if (searchData && searchData.products) {
        setResults(prev => pageNumber === 1 ? searchData.products : [...prev, ...searchData.products]);
        setHasMore(searchData.products.length === 5); // افتراض أن حجم الصفحة هو 5
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error during smart search:", err);
      setError("فشل في إجراء البحث المتقدم. يرجى المحاولة لاحقًا.");
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [query, filters, userId, hasMore, searchHistory]);

  const handleInitialSearch = () => {
    setPage(1);
    setResults([]);
    setHasMore(true);
    handleSearch(1);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
      handleSearch(page + 1);
    }
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleVoiceSearch = () => {
    alert('البحث الصوتي غير متاح حالياً.');
  };

  const handleImageSearch = () => {
    alert('البحث بالصور غير متاح حالياً.');
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">البحث الذكي المتقدم</h1>

      {/* Search Input */}
      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
        <Input
          type="text"
          placeholder="ابحث عن أزياء، أنماط، ألوان..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleInitialSearch();
            }
          }}
          className="flex-1"
        />
        <Button onClick={handleInitialSearch} disabled={isLoading}>
          <Search size={20} />
        </Button>
        <Button variant="outline" size="icon" onClick={handleVoiceSearch}>
          <Mic size={20} />
        </Button>
        <Button variant="outline" size="icon" onClick={handleImageSearch}>
          <Camera size={20} />
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">الفلاتر المتقدمة</h2>
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Product Type Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">نوع المنتج</label>
              <Select value={filters.product_type} onValueChange={(value) => setFilters({...filters, product_type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  <SelectItem value="dress">فستان</SelectItem>
                  <SelectItem value="shirt">قميص</SelectItem>
                  <SelectItem value="shoes">حذاء</SelectItem>
                  <SelectItem value="pants">بنطال</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">اللون</label>
              <Select value={filters.color} onValueChange={(value) => setFilters({...filters, color: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  <SelectItem value="red">أحمر</SelectItem>
                  <SelectItem value="blue">أزرق</SelectItem>
                  <SelectItem value="black">أسود</SelectItem>
                  <SelectItem value="white">أبيض</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Style Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">الأسلوب</label>
              <Select value={filters.style} onValueChange={(value) => setFilters({...filters, style: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  <SelectItem value="casual">كاجوال</SelectItem>
                  <SelectItem value="formal">رسمي</SelectItem>
                  <SelectItem value="sporty">رياضي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleInitialSearch} className="mt-4 w-full" disabled={isLoading}>
            <Filter size={16} className="ml-2" />
            تطبيق البحث المتقدم
          </Button>
        </Card>
      </div>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold flex items-center justify-between mb-3">
            سجل البحث
            <Button variant="ghost" size="sm" onClick={handleClearHistory}>
              <XCircle size={16} className="ml-2" />
              مسح الكل
            </Button>
          </h2>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term, index) => (
              <Button key={index} variant="secondary" onClick={() => setQuery(term)}>
                {term}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {error && (
        <div className="text-center text-red-500 mb-4">
          <p>{error}</p>
        </div>
      )}

      {isLoading && results.length === 0 ? (
        <div className="text-center text-gray-500">
          <Loader2 size={24} className="animate-spin mx-auto mb-2" />
          جاري البحث...
        </div>
      ) : results.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">النتائج ({results.length})</h2>
          <div className="grid grid-cols-2 gap-4">
            {results.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <img src={product.image_url} alt={product.title} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{product.title}</h3>
                  <p className="text-xs text-gray-500">{product.brand}</p>
                  <p className="text-sm font-bold mt-1">{product.price}</p>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Load More Button */}
          <div className="p-4 text-center">
            {hasMore && (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin ml-2" />
                    جاري التحميل...
                  </>
                ) : (
                  'تحميل المزيد من النتائج'
                )}
              </Button>
            )}
            {!hasMore && results.length > 0 && (
              <p className="text-sm text-gray-500">لا توجد المزيد من النتائج.</p>
            )}
          </div>
        </div>
      ) : (query || Object.values(filters).some(f => f)) && !isLoading ? (
        <div className="text-center text-gray-500">
          <p>لا توجد نتائج لبحثك.</p>
        </div>
      ) : null}
    </div>
  );
};

export default SmartSearchPage;
