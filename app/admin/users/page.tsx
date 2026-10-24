"use client";

import { useState, useEffect } from "react";
import { getAdminUsers, deleteUser } from "@/lib/actions/admin-users";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const fetchUsers = () => {
    getAdminUsers().then((res) => {
      if (res.success && res.users) setUsers(res.users);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    const res = await deleteUser(userToDelete);
    
    if (res.success) {
      fetchUsers();
    } else {
      alert(res.error);
    }
    
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // Filter users based on search term (Name, Phone, Company)
  const filteredUsers = users.filter(u => 
    (u.fullName && u.fullName.includes(searchTerm)) ||
    (u.phone && u.phone.includes(searchTerm)) ||
    (u.companyName && u.companyName.includes(searchTerm))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">مدیریت کاربران</h1>
          <p className="text-sm text-gray-500">مشاهده و مدیریت تمام کاربران پلتفرم</p>
        </div>
        
        {/* Search Bar */}
        <input
          type="text"
          placeholder="جستجوی نام، شماره یا شرکت..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-80 px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">کاربری یافت نشد.</div>
        ) : (
          <table className="w-full text-right min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
              <tr>
                <th className="px-4 py-4 font-bold">کاربر</th>
                <th className="px-4 py-4 font-bold">نقش</th>
                <th className="px-4 py-4 font-bold">شماره تماس</th>
                <th className="px-4 py-4 font-bold">شهر</th>
                <th className="px-4 py-4 font-bold text-center">اشتراک</th>
                <th className="px-4 py-4 font-bold text-center">فعالیت‌ها</th>
                <th className="px-4 py-4 font-bold text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt={user.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{user.fullName || "بدون نام"}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.companyName || "بدون شرکت"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                      user.role === 'BUYER' ? 'bg-emerald-100 text-emerald-700' : 
                      user.role === 'SELLER' ? 'bg-red-100 text-red-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'BUYER' ? "خریدار" : user.role === 'SELLER' ? "فروشنده" : "هر دو"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600" dir="ltr">{user.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.city?.name || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    {user.subscriptionType === "BASIC" ? (
                      <span className="text-xs text-gray-400">پایه</span>
                    ) : (
                      <span className={`text-xs font-bold ${
                        user.subscriptionType === "SILVER" ? "text-gray-600" :
                        user.subscriptionType === "GOLD" ? "text-amber-600" : "text-black"
                      }`}>
                        {user.subscriptionType === "SILVER" ? "نقره‌ای" :
                         user.subscriptionType === "GOLD" ? "طلایی" : "پلاتینیوم"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-500">
                    {user._count.requests} درخواست / {user._count.products} آگهی
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        setUserToDelete(user.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        title="حذف کاربر"
        description="آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟ تمام درخواست‌ها و آگهی‌های او نیز حذف خواهند شد. این عمل غیرقابل بازگشت است."
      />

    </div>
  );
}