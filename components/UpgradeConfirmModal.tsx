"use client";

interface UpgradeConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  currentPlan: string;
  newPlan: string;
  remainingDays: number;
  isExtension: boolean;
}

export default function UpgradeConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  currentPlan,
  newPlan,
  remainingDays,
  isExtension
}: UpgradeConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onCancel} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
        
        <h3 className="text-xl font-bold text-foreground mb-3">
          {isExtension ? "تمدید اشتراک" : "ارتقای اشتراک"}
        </h3>
        
        <div className="text-sm text-gray-600 mb-6 leading-relaxed space-y-4">
          <p>
            شما در حال حاضر <strong className="text-blue-600">{currentPlan}</strong> فعال دارید و <strong className="text-emerald-600">{remainingDays} روز</strong> از آن باقی مانده است.
          </p>
          
          <p>
            {isExtension 
              ? "آیا مطمئن هستید که می‌خواهید اشتراک خود را تمدید کنید؟ (مدت جدید به انتهای تاریخ فعلی اضافه می‌شود)"
              : (
                <>
                  آیا مطمئن هستید که می‌خواهید به <strong className="text-blue-600">{newPlan}</strong> ارتقا دهید؟
                </>
              )
            }
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-500/20"
          >
            بله، ادامه بده
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-foreground font-bold py-3 rounded-xl transition"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}