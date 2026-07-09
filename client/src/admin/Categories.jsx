import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Plus, Search, ChevronRight, X, Trash2, Edit } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ id: null, name: '', image_url: '' });
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const [subFormData, setSubFormData] = useState({ name: '' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const res = await api.adminGetSubcategories(categoryId);
      setSubcategories(res.data || []);
    } catch (err) {
      console.error('Failed to fetch subcategories', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchSubcategories(category.id);
  };

  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setFormData({ id: category.id, name: category.name, image_url: category.image_url || '' });
      setIsEditMode(true);
    } else {
      setFormData({ id: null, name: '', image_url: '' });
      setIsEditMode(false);
    }
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalImageUrl = formData.image_url;
      
      if (imageFile) {
        const uploadRes = await api.adminUploadImage(imageFile);
        finalImageUrl = uploadRes.data?.imageUrl || uploadRes.imageUrl || uploadRes.url;
      }
      
      const payload = { name: formData.name, image_url: finalImageUrl };

      if (isEditMode) {
        await api.adminUpdateCategory(formData.id, payload);
      } else {
        await api.adminCreateCategory(payload);
      }
      
      setIsCategoryModalOpen(false);
      fetchCategories();
      
      // Update selected if editing currently selected
      if (isEditMode && selectedCategory?.id === formData.id) {
        setSelectedCategory({ ...selectedCategory, ...payload });
      }
    } catch (err) {
      alert('Failed to save category: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSubcategory = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setSaving(true);
    try {
      await api.adminCreateSubcategory(selectedCategory.id, subFormData);
      setIsSubcategoryModalOpen(false);
      fetchSubcategories(selectedCategory.id);
    } catch (err) {
      alert('Failed to create subcategory: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this category? All its subcategories will also be deleted.')) return;
    try {
      await api.adminDeleteCategory(id);
      if (selectedCategory && selectedCategory.id === id) {
        setSelectedCategory(null);
        setSubcategories([]);
      }
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category: ' + err.message);
    }
  };

  const handleDeleteSubcategory = async (e, subId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      await api.adminDeleteSubcategory(selectedCategory.id, subId);
      fetchSubcategories(selectedCategory.id);
    } catch (err) {
      alert('Failed to delete subcategory: ' + err.message);
    }
  };

  return (
    <div className="flex space-x-6 h-full">
      {/* Categories Panel */}
      <div className="w-1/2 flex flex-col h-[80vh]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-heading font-bold text-3xl text-white">Categories</h1>
            <p className="text-gray-400 mt-1">Manage main product categories.</p>
          </div>
          <button onClick={() => handleOpenCategoryModal()} className="btn-primary py-2 px-4 flex items-center">
            <Plus size={18} className="mr-2" /> Add Category
          </button>
        </div>

        <div className="bg-industrial-dark border border-border-gray rounded-lg overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-black border-b border-border-gray sticky top-0">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray">
                {loading ? (
                  <tr><td colSpan="3" className="px-6 py-8 text-center">Loading categories...</td></tr>
                ) : categories.map((cat) => (
                  <tr 
                    key={cat.id} 
                    onClick={() => handleCategorySelect(cat)}
                    className={`cursor-pointer transition-colors ${selectedCategory?.id === cat.id ? 'bg-gray-800' : 'hover:bg-black'}`}
                  >
                    <td className="px-6 py-4">
                      {cat.image_url ? (
                        <img src={cat.image_url.startsWith('http') ? cat.image_url : `http://localhost:5000${cat.image_url}`} alt={cat.name} className="w-10 h-10 object-cover rounded border border-gray-600" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-800 rounded border border-gray-600 flex items-center justify-center text-xs text-gray-500">None</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{cat.name}</td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenCategoryModal(cat); }} className="text-blue-400 hover:text-blue-300 mr-3 transition-colors" title="Edit Category">
                        <Edit size={16} />
                      </button>
                      <button onClick={(e) => handleDeleteCategory(e, cat.id)} className="text-red-500 hover:text-red-400 mr-4 transition-colors" title="Delete Category">
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight size={18} className="inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Subcategories Panel */}
      <div className="w-1/2 flex flex-col h-[80vh]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-heading font-bold text-3xl text-white">Subcategories</h1>
            <p className="text-gray-400 mt-1">
              {selectedCategory ? `Subcategories for ${selectedCategory.name}` : 'Select a category to view subcategories.'}
            </p>
          </div>
          {selectedCategory && (
            <button onClick={() => { setSubFormData({ name: '' }); setIsSubcategoryModalOpen(true); }} className="btn-primary py-2 px-4 flex items-center bg-gray-200 text-black hover:bg-white">
              <Plus size={18} className="mr-2" /> Add Subcategory
            </button>
          )}
        </div>

        <div className="bg-industrial-dark border border-border-gray rounded-lg overflow-hidden flex-1 flex flex-col">
          {!selectedCategory ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Please select a category from the left panel.
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-black border-b border-border-gray sticky top-0">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Subcategory Name</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-gray">
                  {subcategories.length === 0 ? (
                    <tr><td colSpan="2" className="px-6 py-8 text-center text-gray-500">No subcategories found.</td></tr>
                  ) : subcategories.map((sub) => (
                    <tr key={sub.id} className="hover:bg-black transition-colors">
                      <td className="px-6 py-4 font-mono">{sub.id}</td>
                      <td className="px-6 py-4 font-bold text-white">{sub.name}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={(e) => handleDeleteSubcategory(e, sub.id)} className="text-red-500 hover:text-red-400 transition-colors" title="Delete Subcategory">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-industrial-dark border border-border-gray rounded-lg w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-border-gray flex justify-between items-center bg-black">
              <h2 className="text-xl font-bold font-heading text-white">{isEditMode ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6">
              <form id="catForm" onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Category Name *</label>
                  <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-black border border-border-gray rounded px-3 py-2 text-white focus:border-safety-yellow focus:outline-none" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Category Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-safety-yellow file:text-black hover:file:bg-yellow-500 mb-2" 
                  />
                  {(imageFile || formData.image_url) && (
                    <div className="mt-2 text-xs text-gray-500 border border-border-gray p-2 rounded bg-black">
                      {imageFile ? (
                        <span>New file selected: {imageFile.name}</span>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <img src={formData.image_url.startsWith('http') ? formData.image_url : `http://localhost:5000${formData.image_url}`} alt="Current" className="w-8 h-8 object-cover rounded" />
                          <span>Current Image</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-border-gray bg-black flex justify-end space-x-3">
              <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 border border-border-gray text-gray-300 rounded hover:bg-industrial-dark transition-colors" disabled={saving}>Cancel</button>
              <button type="submit" form="catForm" className="btn-primary py-2 px-6" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {isSubcategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-industrial-dark border border-border-gray rounded-lg w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-border-gray flex justify-between items-center bg-black">
              <h2 className="text-xl font-bold font-heading text-white">Add Subcategory</h2>
              <button onClick={() => setIsSubcategoryModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6">
              <form id="subForm" onSubmit={handleCreateSubcategory} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Subcategory Name *</label>
                  <input required value={subFormData.name} onChange={(e) => setSubFormData({name: e.target.value})} type="text" className="w-full bg-black border border-border-gray rounded px-3 py-2 text-white focus:border-safety-yellow focus:outline-none" />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-border-gray bg-black flex justify-end space-x-3">
              <button type="button" onClick={() => setIsSubcategoryModalOpen(false)} className="px-4 py-2 border border-border-gray text-gray-300 rounded hover:bg-industrial-dark transition-colors" disabled={saving}>Cancel</button>
              <button type="submit" form="subForm" className="btn-primary py-2 px-6" disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;
