import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';

const SelectFile = ({ handlePreviewClick, onChange, removeSection, upload, fileType, s3upload }) => {
    const isS3UploadEnabled = fileType === 'file'; // Derive this directly from the prop

    return (
        <Row className="d-flex align-items-center" style={{ maxWidth: '100%' }}>
            <Col lg={10} className="d-flex">
                <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    onClick={handlePreviewClick}
                >
                    Preview
                </button>
                <div className="form-file ml-2">
                    <label htmlFor="file-input" className="form-label visually-hidden">
                        Select File
                    </label>
                    <input
                        id="file-input"
                        type="file"
                        className="form-file-input form-control"
                        onChange={onChange}
                    />
                </div>
            </Col>
            <Col lg={2} className="d-flex justify-content-end gap-2 my-2">
                <button
                    className="btn btn-danger btn-sm"
                    type="button"
                    onClick={removeSection}
                >
                    <svg
                        fill="#000000"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20px"
                        height="20px"
                        viewBox="0 0 490.646 490.646"
                        xmlSpace="preserve"
                    >
                        <g>
                            <g>
                                <path d="M399.179,67.285l-74.794,0.033L324.356,0L166.214,0.066l0.029,67.318l-74.802,0.033l0.025,62.914h307.739L399.179,67.285z
                    M198.28,32.11l94.03-0.041l0.017,35.262l-94.03,0.041L198.28,32.11z"/>
                                <path d="M91.465,490.646h307.739V146.359H91.465V490.646z M317.461,193.372h16.028v250.259h-16.028V193.372L317.461,193.372z
                    M237.321,193.372h16.028v250.259h-16.028V193.372L237.321,193.372z M157.18,193.372h16.028v250.259H157.18V193.372z"/>
                            </g>
                        </g>
                    </svg>
                </button>
                <button
                    className="btn btn-success btn-sm"
                    type="button"
                    onClick={upload}
                >
                    Upload
                </button>
                {isS3UploadEnabled && (
                    <button
                        className="btn btn-warning btn-sm"
                        type="button"
                        onClick={s3upload}
                    >
                        Upload to S3
                    </button>
                )}
            </Col>
        </Row>
    );
};

// Add PropTypes for better type checking
SelectFile.propTypes = {
    handlePreviewClick: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    removeSection: PropTypes.func.isRequired,
    upload: PropTypes.func.isRequired,
    fileType: PropTypes.string,
    s3upload: PropTypes.func,
};

SelectFile.defaultProps = {
    fileType: '',
    s3upload: null,
};

export default SelectFile;