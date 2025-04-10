// src/components/Notes/SelectProject.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SelectChapter = ({ selectedValue, handleChange, bookId }) => {
    const [chapters, setChapters] = useState([]);
    console.log('bookId: ', bookId);

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                if (!bookId) {
                    await setChapters([]);
                    const response = await axios.get(`${process.env.REACT_APP_API}/chapters`);
                    await setChapters(response.data);
                } else {
                    await setChapters([]);
                    const response = await axios.get(`${process.env.REACT_APP_API}/chapters`, {
                        params: { bookId }
                    });
                    await setChapters(response.data);
                }
            } catch (error) {
                console.error('Error fetching Chapters:', error);
            }
        };

        fetchChapters();
    }, [bookId]);

    return (
        <div>
            <label htmlFor="selectChapter">Select Chapter</label>
            <select
                className="form-control"
                id="selectChapter"
                value={selectedValue}
                // disabled={!bookId}
                onChange={handleChange}
            >
                <option value="">Select an option</option>
                {chapters.map(chapter => (
                    <option key={chapter.chapterId} value={chapter.chapterId}>
                        {chapter.title}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectChapter;