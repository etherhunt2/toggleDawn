import React from 'react';

const SelectStatus = ({ selectedValue, handleChange }) => {

    return (
        <div>
            <label htmlFor="exampleFormControlSelect1">Select Status</label>
            <select
                className="form-control"
                id="exampleFormControlSelect1"
                value={selectedValue}
                onChange={handleChange}
            >
                <option value="">Select an option</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Revision">Revision</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Accomplished">Accomplished</option>
            </select>
        </div>
    );
};

export default SelectStatus;