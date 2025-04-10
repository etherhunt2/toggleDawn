// src/components/Notes/SelectProject.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../../css/display-cat-in-notes.css';

const SelectNotesCategory = ({ selectedValue, handleChange }) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API}/categories`);
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const handleCheckboxChange = (e, categoryId) => {
        if (e.target.checked) {
            // Add the selected category ID to the array
            handleChange([...selectedValue, categoryId]);
        } else {
            // Remove the unselected category ID from the array
            handleChange(selectedValue.filter((id) => id !== categoryId));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <label htmlFor="selectCategory" style={{ fontWeight: 'bold', color: '#333', fontSize: '18px', marginBottom: '10px' }}>Select Category</label>
            <div id="selectCategory" style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', maxWidth: '500px', margin: '20px auto', maxHeight: '300px', overflowY: 'auto' }}>
                {categories
                    .filter((category) => category.type === 'notes')
                    .map((category) => (
                        <div key={category.categoryId} className="form-check" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', transition: 'background-color 0.2s ease' }}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id={`category-${category.categoryId}`}
                                value={category.categoryId}
                                onChange={(e) => handleCheckboxChange(e, category.categoryId)}
                                checked={selectedValue.includes(category.categoryId)}
                                style={{ marginRight: '12px', cursor: 'pointer' }}
                            />
                            <label className="form-check-label" htmlFor={`category-${category.categoryId}`} style={{ fontSize: '16px', color: '#555' }}>
                                {category.title}
                            </label>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default SelectNotesCategory;