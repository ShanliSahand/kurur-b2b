"use client";

interface SubscriptionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionRequiredModal({ isOpen, onClose }: SubscriptionRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Icon */}
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        
        {/* Text */}
        <h3 className="text-xl font-bold text-foreground mb-3">
          دسترسی محدود
        </h3>
        <p className="text-sm text-muted mb-2 leading-relaxed">
          شما مجاز به مشاهده اطلاعات تماس درخواست‌های خرید نیستید.
        </p>
        <p className="text-sm text-muted mb-8 leading-relaxed">
          جهت مشاهده اطلاعات کامل درخواست‌های خرید، باید اشتراک <strong>نقره‌ای</strong> یا <strong>طلایی</strong> داشته باشید.
        </p>
        
        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = "/plans"}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-amber-500/20"
          >
            خرید اشتراک
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-foreground font-bold py-3 rounded-xl transition"
          >
            بازگشت
          </button>
        </div>
      </div>
    </div>
  );
}