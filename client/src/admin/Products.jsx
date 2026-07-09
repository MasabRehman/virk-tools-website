import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Search, EyeOff, X, Trash2 } from 'lucide-react';

const initialFormState = {
  name: '',
  sku: '',
  category_id: '',
  subcategory_ids: [],
  brand_id: '',
  selling_price: '',
  main_image_url: '',
  description: '',
  is_featured: false,
  is_published: true,
  is_disabled: false,
  supplierInfo: {
    supplier_name: '',
    purchase_price: '',
    internal_notes: ''
  }
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [batchSubInput, setBatchSubInput] = useState('');
  const [showSubBatch, setShowSubBatch] = useState(false);
  const [addingSubcategory, setAddingSubcategory] = useState(false);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [addingBrand, setAddingBrand] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetProducts();
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        api.getCategories(),
        api.getBrands()
      ]);
      setCategories(catRes.data || []);
      setBrands(brandRes.data || []);
    } catch (err) {
      console.error('Error fetching dropdown data', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchDropdownData();
  }, []);

  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'category_id' && value) {
      try {
        const res = await api.adminGetSubcategories(value);
        setSubcategories(res.data || []);
      } catch (err) {
        console.error('Failed to fetch subcategories', err);
      }
    } else if (name === 'category_id' && !value) {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory_ids: [] }));
    }
  };

  const handleSupplierChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      supplierInfo: {
        ...prev.supplierInfo,
        [name]: value
      }
    }));
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setFormData(initialFormState);
    setImageFile(null);
    setAdditionalImages([]);
    setExistingAdditionalImages([]);
    setSubcategories([]);
    setShowSubBatch(false);
    setBatchSubInput('');
    setShowAddBrand(false);
    setNewBrandName('');
    setIsModalOpen(true);
  };

  const openEditModal = async (id) => {
    setEditingProductId(id);
    setImageFile(null);
    setAdditionalImages([]);
    setIsModalOpen(true);
    try {
      const res = await api.adminGetProductById(id);
      const prod = res.data;
      setFormData({
        name: prod.name || '',
        sku: prod.sku || '',
        category_id: prod.category_id || '',
        subcategory_ids: prod.subcategory_ids || [],
        brand_id: prod.brand_id || '',
        selling_price: prod.selling_price || '',
        main_image_url: prod.main_image_url || '',
        description: prod.description || '',
        is_featured: prod.is_featured || false,
        is_published: prod.is_published || false,
        is_disabled: prod.is_disabled || false,
        supplierInfo: {
          supplier_name: prod.supplierInfo?.supplier_name || '',
          purchase_price: prod.supplierInfo?.purchase_price || '',
          internal_notes: prod.supplierInfo?.internal_notes || ''
        }
      });
      setExistingAdditionalImages(prod.images || []);
      
      if (prod.category_id) {
        const subRes = await api.adminGetSubcategories(prod.category_id);
        setSubcategories(subRes.data || []);
      } else {
        setSubcategories([]);
      }
    } catch (err) {
      console.error('Failed to fetch product details for editing', err);
      alert('Failed to load product details.');
      setIsModalOpen(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    if (e.target.files) {
      setAdditionalImages([...additionalImages, ...Array.from(e.target.files)]);
    }
  };

  const removeAdditionalImage = (index) => {
    const newFiles = [...additionalImages];
    newFiles.splice(index, 1);
    setAdditionalImages(newFiles);
  };

  const removeExistingImage = (index) => {
    const newImages = [...existingAdditionalImages];
    newImages.splice(index, 1);
    setExistingAdditionalImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      let finalImageUrl = formData.main_image_url;
      
      // Upload main image first if one was selected
      if (imageFile) {
        const uploadRes = await api.adminUploadImage(imageFile);
        finalImageUrl = uploadRes.data.imageUrl;
      }

      // Upload additional images
      const uploadedAdditionalImages = [];
      for (const file of additionalImages) {
        const uploadRes = await api.adminUploadImage(file);
        uploadedAdditionalImages.push({ image_url: uploadRes.data.imageUrl });
      }

      // Combine with existing images that weren't deleted
      const finalImagesList = [
        ...existingAdditionalImages.map(img => ({ image_url: img.image_url })),
        ...uploadedAdditionalImages
      ];

      // Format data for API
      const submitData = {
        ...formData,
        main_image_url: finalImageUrl,
        images: finalImagesList,
        category_id: parseInt(formData.category_id),
        subcategory_ids: formData.subcategory_ids || [],
        selling_price: parseFloat(formData.selling_price),
        supplierInfo: {
          ...formData.supplierInfo,
          purchase_price: formData.supplierInfo.purchase_price ? parseFloat(formData.supplierInfo.purchase_price) : null
        }
      };

      // Safely handle optional integer IDs
      if (formData.brand_id) {
        submitData.brand_id = parseInt(formData.brand_id);
      } else {
        delete submitData.brand_id;
      }

      if (editingProductId) {
        await api.adminUpdateProduct(editingProductId, submitData);
      } else {
        await api.adminCreateProduct(submitData);
      }
      setIsModalOpen(false);
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save product: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.adminDeleteProduct(id);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product: ' + err.message);
      }
    }
  };

  const handleDeleteSubcategory = async (subId) => {
    if (window.confirm('Are you sure you want to delete this option?')) {
      try {
        await api.adminDeleteSubcategory(formData.category_id, subId);
        // Refresh subcategories
        const res = await api.adminGetSubcategories(formData.category_id);
        setSubcategories(res.data || []);
        if (formData.subcategory_id == subId) {
          setFormData({ ...formData, subcategory_id: '' });
        }
      } catch (err) {
        alert('Failed to delete option: ' + err.message);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-heading font-bold text-3xl text-white">Inventory Management</h1>
          <p className="text-gray-400 mt-1">Manage catalog and strictly isolated supplier data.</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="http://localhost:5000/api/v1/catalog/download"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary py-2 px-4 flex items-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Catalog PDF
          </a>
          <button onClick={openAddModal} className="btn-primary py-2 px-4 flex items-center">
            <Plus size={18} className="mr-2" /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-industrial-dark border border-border-gray rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border-gray flex justify-between items-center">
          <div className="relative w-64">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-black border border-border-gray rounded py-2 pl-10 pr-4 text-sm text-white focus:border-safety-yellow focus:outline-none"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
          </div>
          <div className="flex items-center text-xs text-safety-yellow border border-safety-yellow bg-[#1a1600] px-3 py-1.5 rounded">
            <EyeOff size={14} className="mr-2" />
            Supplier data is strictly hidden from public API
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-black border-b border-border-gray">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category / Subcategory</th>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4">Selling Price</th>
                <th className="px-6 py-4 bg-[#1a1600] text-safety-yellow border-l border-r border-[#332c00]">Supplier Info (Private)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gray">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-8 text-center">Loading inventory...</td></tr>
              ) : products.map((product) => (
                <tr key={product.id} className="hover:bg-black transition-colors">
                  <td className="px-6 py-4 font-mono">{product.id}</td>
                  <td className="px-6 py-4 font-bold text-white">
                    {product.name}
                    {product.is_featured && <span className="ml-2 bg-safety-yellow text-black text-[10px] px-1.5 py-0.5 rounded font-bold">FEATURED</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white text-sm">{product.category_name || '—'}</div>
                    {product.subcategory_name && (
                      <div className="text-xs text-safety-yellow mt-0.5">↳ {product.subcategory_name}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">{product.brand_name}</td>
                  <td className="px-6 py-4">Rs. {product.selling_price?.toLocaleString()}</td>
                  <td className="px-6 py-4 bg-[#0a0800] border-l border-r border-[#332c00]">
                    <div className="flex flex-col">
                      <span className="text-safety-yellow font-bold text-xs">{product.supplier_name || 'N/A'}</span>
                      <span className="text-gray-500 text-xs mt-1">Cost: Rs. {product.wholesale_price?.toLocaleString() || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.is_disabled ? (
                      <span className="px-2 py-1 rounded text-xs font-bold bg-red-900 text-red-400">DISABLED</span>
                    ) : (
                      <span className={`px-2 py-1 rounded text-xs font-bold ${product.is_published ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>
                        {product.is_published ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => openEditModal(product.id)} className="text-safety-yellow hover:underline mr-3">Edit</button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-industrial-dark border border-border-gray rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-border-gray flex justify-between items-center bg-black">
              <h2 className="text-xl font-bold font-heading text-white">
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-8">
                
                <div>
                  <h3 className="text-white font-bold mb-4 border-b border-border-gray pb-2">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-gray-400 text-sm mb-1">Product Name *</label>
                      <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full bg-black border border-border-gray rounded px-3 py-2 text-white focus:border-safety-yellow focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">SKU *</label>
                      <input required name="sku" value={formData.sku} onChange={handleInputChange} type="text" className="w-full bg-black border border-border-gray rounded px-3 py-2 text-white focus:border-safety-yellow focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Selling Price (Rs.) *</label>
                      <input required name="selling_price" value={formData.selling_price} onChange={handleInputChange} type="number" min="0" step="0.01" className="w-full bg-black border border-border-gray rounded px-3 py-2 text-white focus:border-safety-yellow focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Category *</label>
                      <select required name="category_id" value={formData.category_id} onChange={handleInputChange} className="w-full bg-black border border-border-gray rounded px-3 py-2 text-white focus:border-safety-yellow focus:outline-none">
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    {formData.category_id && (
                      <div className="col-span-2 bg-[#11141c] p-4 rounded border border-border-gray mt-2">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-safety-yellow font-bold text-sm uppercase tracking-wider">Subcategories (Options for buyer)</label>
                          <button
                            type="button"
                            onClick={() => { setShowSubBatch(s => !s); setBatchSubInput(''); }}
                            className="text-xs text-safety-yellow border border-safety-yellow/40 hover:bg-safety-yellow/10 px-2 py-1 rounded transition-colors"
                          >+ Add Options</button>
                        </div>

                        {showSubBatch && (
                          <div className="mb-4 space-y-3 bg-black/40 p-3 rounded border border-border-gray">
                            <p className="text-gray-400 text-xs">Type all options separated by commas. e.g. <span className="text-safety-yellow">Corded, Cordless, 18V, 20V</span></p>
                            <textarea
                              rows={3}
                              value={batchSubInput}
                              onChange={e => setBatchSubInput(e.target.value)}
                              placeholder="Option 1, Option 2, Option 3..."
                              className="w-full bg-black border border-border-gray rounded px-3 py-2 text-white text-sm focus:border-safety-yellow focus:outline-none resize-none"
                            />
                            {/* Preview tags */}
                            {batchSubInput.trim() && (
                              <div className="flex flex-wrap gap-2">
                                {batchSubInput.split(',').map(n => n.trim()).filter(Boolean).map((name, i) => (
                                  <span key={i} className="bg-safety-yellow/20 border border-safety-yellow/50 text-safety-yellow text-xs px-2 py-1 rounded">{name}</span>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={addingSubcategory || !batchSubInput.trim()}
                                onClick={async () => {
                                  const names = batchSubInput.split(',').map(n => n.trim()).filter(Boolean);
                                  if (!names.length) return;
                                  setAddingSubcategory(true);
                                  try {
                                    await Promise.all(names.map(name =>
                                      api.adminCreateSubcategory(formData.category_id, { name })
                                    ));
                                    const res = await api.adminGetSubcategories(formData.category_id);
                                    setSubcategories(res.data || []);
                                    setBatchSubInput('');
                                    setShowSubBatch(false);
                                  } catch (err) {
                                    alert('Failed to save options: ' + err.message);
                                  } finally {
                                    setAddingSubcategory(false);
                                  }
                                }}
                                className="bg-safety-yellow text-black text-sm font-bold px-4 py-1.5 rounded hover:bg-yellow-400 disabled:opacity-50 transition-colors"
                              >{addingSubcategory ? 'Saving...' : `Save ${batchSubInput.split(',').filter(n => n.trim()).length} Option(s)`}</button>
                              <button type="button" onClick={() => setShowSubBatch(false)} className="text-sm text-gray-500 hover:text-white px-3 py-1.5 rounded border border-border-gray transition-colors">Cancel</button>
                            </div>
                          </div>
                        )}

                        {subcategories.length === 0 ? (
                          <p className="text-gray-500 text-sm">No options yet. Click "+ Add Options" to create some.</p>
                        ) : (
                          <>
                            <p className="text-gray-400 text-xs mb-2">Select which options apply to this product:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {subcategories.map(sub => (
                                  <div key={sub.id} className={`flex items-center justify-between p-2 rounded border transition-colors ${formData.subcategory_ids.includes(sub.id) ? 'border-safety-yellow bg-[#1a1600]' : 'border-border-gray bg-black hover:border-gray-500'}`}>
                                    <label className="flex items-center space-x-2 cursor-pointer flex-grow">
                                      <input 
                                        type="checkbox" 
                                        name="subcategory_ids" 
                                        value={sub.id} 
                                        checked={formData.subcategory_ids.includes(sub.id)} 
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setFormData(prev => ({ ...prev, subcategory_ids: [...prev.subcategory_ids, sub.id] }));
                                          } else {
                                            setFormData(prev => ({ ...prev, subcategory_ids: prev.subcategory_ids.filter(id => id !== sub.id) }));
                                          }
                                        }} 
                                        className="accent-safety-yellow"
                                      />
                                    <span className="text-white text-sm">{sub.name}</span>
                                  </label>
                                  <button 
                                    type="button" 
                                    onClick={(e) => { e.preventDefault(); handleDeleteSubcategory(sub.id); }}
                                    className="text-gray-500 hover:text-red-500 transition-colors ml-2"
                                    title="Delete option"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-gray-400 text-sm">Brand</label>
                        {!showAddBrand && (
                          <button type="button" onClick={() => setShowAddBrand(true)} className="text-xs text-safety-yellow hover:underline">+ Add Brand</button>
                        )}
                      </div>
                      
                      {showAddBrand ? (
                        <div className="flex gap-2 mb-2">
                          <input 
                            type="text" 
                            value={newBrandName} 
                            onChange={(e) => setNewBrandName(e.target.value)} 
                            placeholder="Brand Name" 
                            className="w-full bg-black border border-border-gray rounded px-3 py-1.5 text-white text-sm focus:border-safety-yellow focus:outline-none"
                            autoFocus
                          />
                          <button 
                            type="button"
                            disabled={addingBrand || !newBrandName.trim()}
                            onClick={async () => {
                              if (!newBrandName.trim()) return;
                              setAddingBrand(true);
                              try {
                                const res = await api.adminCreateBrand({ name: newBrandName.trim() });
                                const fetchRes = await api.adminGetBrands();
                                setBrands(fetchRes.data || []);
                                setFormData(prev => ({ ...prev, brand_id: res.data.id || res.data.brand_id || '' }));
                                setShowAddBrand(false);
                                setNewBrandName('');
                              } catch (err) {
                                alert('Failed to create brand: ' + err.message);
                              } finally {
                                setAddingBrand(false);
                              }
                            }}
                            className="bg-safety-yellow text-black text-sm px-3 py-1.5 rounded font-bold hover:bg-yellow-400 disabled:opacity-50"
                          >
                            {addingBrand ? 'Saving...' : 'Save'}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => { setShowAddBrand(false); setNewBrandName(''); }} 
                            className="text-gray-500 hover:text-white px-2"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : null}
                      
                      <select name="brand_id" value={formData.brand_id} onChange={handleInputChange} className="w-full bg-black border border-border-gray rounded px-3 py-2 text-white focus:border-safety-yellow focus:outline-none">
                        <option value="">No Brand</option>
                        {brands.map(brand => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-4 border-b border-border-gray pb-2">Media & Details</h3>
                  <div className="space-y-4">
                    <div className="flex space-x-4 items-start">
                      <div className="flex-1">
                        <label className="block text-gray-400 text-sm mb-1">Upload Main Image</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full bg-black border border-border-gray rounded px-3 py-2 text-white focus:border-safety-yellow focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-industrial-dark file:text-safety-yellow hover:file:bg-[#2a2a2a] cursor-pointer" />
                        {imageFile && <p className="text-xs text-green-400 mt-2">File selected: {imageFile.name}</p>}
                        {!imageFile && formData.main_image_url && <p className="text-xs text-gray-500 mt-2">Current image: {formData.main_image_url.split('/').pop()}</p>}
                      </div>
                      {(imageFile || formData.main_image_url) && (
                        <div className="w-24 h-24 bg-black border border-border-gray rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
                          <img src={imageFile ? URL.createObjectURL(imageFile) : formData.main_image_url} alt="Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t border-border-gray">
                      <label className="block text-gray-400 text-sm mb-1">Additional Images</label>
                      <input type="file" multiple accept="image/*" onChange={handleAdditionalImagesChange} className="w-full bg-black border border-border-gray rounded px-3 py-2 text-white focus:border-safety-yellow focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-industrial-dark file:text-safety-yellow hover:file:bg-[#2a2a2a] cursor-pointer mb-3" />
                      
                      <div className="flex flex-wrap gap-3">
                        {existingAdditionalImages.map((img, idx) => (
                          <div key={`existing-${idx}`} className="relative w-20 h-20 bg-black border border-border-gray rounded overflow-hidden flex items-center justify-center group">
                            <img src={img.image_url} alt="Additional" className="max-w-full max-h-full object-contain" />
                            <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        {additionalImages.map((file, idx) => (
                          <div key={`new-${idx}`} className="relative w-20 h-20 bg-black border border-border-gray rounded overflow-hidden flex items-center justify-center group">
                            <img src={URL.createObjectURL(file)} alt="Additional" className="max-w-full max-h-full object-contain" />
                            <button type="button" onClick={() => removeAdditionalImage(idx)} className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Description</label>
                      <textarea name="description" value={formData.description} onChange={handleInputChange} rows="4" className="w-full bg-black border border-border-gray rounded px-3 py-2 text-white focus:border-safety-yellow focus:outline-none"></textarea>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-bold mb-4 border-b border-border-gray pb-2">Visibility Options</h3>
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-2 text-white cursor-pointer">
                      <input name="is_featured" checked={formData.is_featured} onChange={handleInputChange} type="checkbox" className="accent-safety-yellow w-5 h-5" />
                      <span>Featured on Homepage</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white cursor-pointer">
                      <input name="is_published" checked={formData.is_published} onChange={handleInputChange} type="checkbox" className="accent-safety-yellow w-5 h-5" />
                      <span>Published (Visible to public)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-white cursor-pointer">
                      <input name="is_disabled" checked={formData.is_disabled} onChange={handleInputChange} type="checkbox" className="accent-red-500 w-5 h-5" />
                      <span className="text-red-400">Disable Product</span>
                    </label>
                  </div>
                </div>

                <div className="bg-[#1a1600] p-4 rounded border border-[#332c00]">
                  <div className="flex items-center mb-4 border-b border-[#332c00] pb-2">
                    <EyeOff size={18} className="text-safety-yellow mr-2" />
                    <h3 className="text-safety-yellow font-bold">Strictly Private Supplier Info</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Supplier Name</label>
                      <input name="supplier_name" value={formData.supplierInfo.supplier_name} onChange={handleSupplierChange} type="text" className="w-full bg-black border border-border-gray rounded px-3 py-2 text-white focus:border-safety-yellow focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Purchase Price (Cost)</label>
                      <input name="purchase_price" value={formData.supplierInfo.purchase_price} onChange={handleSupplierChange} type="number" min="0" step="0.01" className="w-full bg-black border border-border-gray rounded px-3 py-2 text-white focus:border-safety-yellow focus:outline-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-gray-400 text-sm mb-1">Internal Notes</label>
                      <textarea name="internal_notes" value={formData.supplierInfo.internal_notes} onChange={handleSupplierChange} rows="2" className="w-full bg-black border border-border-gray rounded px-3 py-2 text-white focus:border-safety-yellow focus:outline-none"></textarea>
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-4 border-t border-border-gray bg-black flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 border border-border-gray text-gray-300 rounded hover:bg-industrial-dark transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="productForm" 
                className="btn-primary py-2 px-6"
                disabled={saving}
              >
                {saving ? 'Saving...' : (editingProductId ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
