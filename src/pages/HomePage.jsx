import { useState, useEffect, useCallback } from 'react';
import { Heart, MessageCircle, Share2, Eye, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { fetchRecommendations } from '@/lib/api'; // استيراد دالة جلب التوصيات الجديدة

const HomePage = ({ user }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // يجب أن يكون user.id متاحًا بعد تسجيل الدخول
  const userId = user?.id || 1; // استخدام معرف وهمي إذا لم يكن المستخدم مسجلاً للدخول

  const loadRecommendations = useCallback(async (pageNumber) => {
    if (!hasMore && pageNumber > 1) return;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchRecommendations(userId, pageNumber);
      
      if (data && data.recommendations) {
        setRecommendations(prev => pageNumber === 1 ? data.recommendations : [...prev, ...data.recommendations]);
        // افتراض أن الواجهة الخلفية ترسل عدد العناصر في الصفحة
        // إذا كان عدد العناصر أقل من 5 (الحد الأقصى للصفحة)، فهذا يعني أنه لا يوجد المزيد
        setHasMore(data.recommendations.length === 5); 
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error loading recommendations:", err);
      setError("فشل في تحميل التوصيات. يرجى المحاولة لاحقًا.");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [userId, hasMore]);

  useEffect(() => {
    loadRecommendations(1);
  }, [loadRecommendations]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadRecommendations(page + 1);
    }
  };

  const handleLike = (id) => {
    // يجب أن يتم إرسال طلب API هنا لتسجيل الإعجاب
    setRecommendations(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, likes: item.likes + (item.liked ? -1 : 1), liked: !item.liked }
          : item
      )
    );
  };

  if (loading && page === 1) {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        <div className="text-center text-gray-500">
          <Loader2 size={24} className="animate-spin mx-auto mb-2" />
          جاري تحميل التوصيات...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-4 text-center text-red-500">
        <p>{error}</p>
        <Button onClick={() => loadRecommendations(1)} className="mt-4">إعادة المحاولة</Button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4 text-center text-gray-500">
        <p>لا توجد توصيات متاحة حاليًا.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Welcome Message */}
      {user && (
        <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-4">
          <h2 className="text-lg font-semibold">مرحباً {user.name}!</h2>
          <p className="text-sm opacity-90">إليك أحدث التوصيات المخصصة لك</p>
        </div>
      )}

      {/* Recommendations Feed */}
      <div className="space-y-6 pb-6">
        {recommendations.map((item) => (
          <Card key={item.id} className="overflow-hidden border-0 shadow-lg">
            {/* User Info */}
            <div className="flex items-center p-4 pb-2">
              <img 
                src={item.user_avatar || user.avatar} // استخدام صورة المستخدم الذي نشر أو صورة المستخدم الحالي
                alt={item.user_name || user.name}
                className="w-8 h-8 rounded-full mr-3"
              />
              <div className="flex-1">
                <p className="font-semibold text-sm">{item.user_name || user.name}</p>
                <p className="text-xs text-gray-500">منذ {item.time_ago || 'ساعتين'}</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {item.ai_match || 90}% مطابقة
              </Badge>
            </div>

            {/* Product Image */}
            <div className="relative">
              <img 
                src={item.image_url} 
                alt={item.title}
                className="w-full h-96 object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-black/50 text-white">
                  {item.brand}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-4 pb-2">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleLike(item.id)}
                  className={`p-2 ${item.liked ? 'text-red-500' : ''}`}
                >
                  <Heart size={20} fill={item.liked ? 'currentColor' : 'none'} />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <MessageCircle size={20} />
                </Button>
                <Button variant="ghost" size="sm" className="p-2">
                  <Share2 size={20} />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Link to={`/virtual-try-on/${item.id}`}>
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Eye size={16} className="mr-1" />
                    جربه
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <ShoppingBag size={16} className="mr-1" />
                  {item.price}
                </Button>
              </div>
            </div>

            {/* Engagement Info */}
            <div className="px-4 pb-2">
              <p className="text-sm font-semibold">{item.likes?.toLocaleString() || 0} إعجاب</p>
            </div>

            {/* Description */}
            <div className="px-4 pb-2">
              <p className="text-sm">
                <span className="font-semibold">{item.title}</span> {item.description}
              </p>
            </div>

            {/* Tags */}
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-1">
                {item.tags?.map((tag, index) => (
                  <span key={index} className="text-blue-500 text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Comments Preview */}
            <div className="px-4 pb-4">
              <Button variant="ghost" size="sm" className="text-gray-500 p-0 h-auto">
                عرض جميع التعليقات الـ {item.comments || 0}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="p-4 text-center">
        {hasMore && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin ml-2" />
                جاري التحميل...
              </>
            ) : (
              'تحميل المزيد من التوصيات'
            )}
          </Button>
        )}
        {!hasMore && recommendations.length > 0 && (
          <p className="text-sm text-gray-500">لا توجد المزيد من التوصيات.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
