// src/components/Notes/SelectBook.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SelectBook = ({ selectedValue, handleChange, projectId }) => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                if (!projectId) {
                    await setBooks([]);
                    const response = await axios.get(`${process.env.REACT_APP_API}/books`);
                    await setBooks(response.data);
                } else {
                    await setBooks([]);
                    const response = await axios.get(`${process.env.REACT_APP_API}/books`, {
                        params: { projectId }
                    });
                    await setBooks(response.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchBooks();
    }, [projectId]);

    return (
        <div>
            <label htmlFor="selectBook">Select Book</label>
            <select
                className="form-control"
                id="selectBook"
                value={selectedValue}
                // disabled={!projectId}
                onChange={handleChange}
            >
                <option value="">Select an option</option>
                {books.map(book => (
                    <option key={book.bookId} value={book.bookId}>
                        {book.title}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectBook;