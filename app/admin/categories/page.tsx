"use client";

import { useState, useEffect } from "react";
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from "@/lib/actions/admin-categories";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const fetchCategories = () => {
    getAdminCategories().then((res) => {
      if (res.success && res.categories) setCategories(res.categories);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setAdding(true);
    const res = await createCategory(newCategory);
    
    if (res.success) {
      setNewCategory("");
      fetchCategories();
    } else {
      alert(res.error);
    }
    setAdding(false);
  };

  const startEditing = (cat: any) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setSaving(true);
    const res = await updateCategory(id, editName);
    
    if (res.success) {
      setEditingId(null);
      fetchCategories();
    } else {
      alert(res.error);
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    const res = await deleteCategory(categoryToDelete);
    
    if (res.success) {
      fetchCategories();
    } else {
      alert(res.error);
    }
    
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">مدیریت دسته‌بندی‌ها</h1>
        <p className="text-sm text-gray-500">افزودن، ویرایش یا حذف دسته‌بندی‌های بازار</p>
      </div>

      {/* Add Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">نام دسته‌بندی جدید</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="مثلاً: لوازم خانگی"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={adding || !newCategory.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition disabled:opacity-50"
          >
            {adding ? "در حال ثبت..." : "افزودن"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">در حال بارگذاری...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">هیچ دسته‌بندی ثبت نشده است.</div>
        ) : (
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
              <tr>
                <th className="px-6 py-4 font-bold">نام دسته‌بندی</th>
                <th className="px-6 py-4 font-bold text-center">درخواست‌ها</th>
                <th className="px-6 py-4 font-bold text-center">آگهی‌ها</th>
                <th className="px-6 py-4 font-bold text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold text-gray-800">
                    {editingId === cat.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full max-w-[200px] px-3 py-1 border border-blue-500 rounded-lg focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-600">{cat._count.requests}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{cat._count.products}</td>
                  <td className="px-6 py-4 text-center">
                    {editingId === cat.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
                          disabled={saving}
                          className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 transition"
                        >
                          {saving ? "..." : "ذخیره"}
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-300 transition"
                        >
                          لغو
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEditing(cat)}
                          className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => {
                            setCategoryToDelete(cat.id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                        >
                          حذف
                        </button>
                      </div>
                    )}
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
          setCategoryToDelete(null);
        }}
        title="حذف دسته‌بندی"
        description="آیا مطمئن هستید؟ اگر این دسته‌بندی دارای درخواست یا آگهی باشد، حذف نخواهد شد."
      />

    </div>
  );
}