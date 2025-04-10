// src/components/Notes/SelectProject.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SelectProject = ({ selectedValue, handleChange }) => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API}/projects`);
                setProjects(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div>
            <label htmlFor="selectProject">Select Project</label>
            <select
                className="form-control"
                id="selectProject"
                value={selectedValue}
                onChange={handleChange}
            >
                <option value="">Select an option</option>
                {projects.map(project => (
                    <option key={project.projectId} value={project.projectId}>
                        {project.title}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectProject;
