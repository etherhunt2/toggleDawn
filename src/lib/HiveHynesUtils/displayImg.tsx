import React, { useEffect, useState, FC } from "react";
import axios from "axios";

interface DisplayImgProps {
  fileName: string;
  alt: string;
  previewWidth: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeSection: () => void;
  handleClosePreview: () => void;
  upload: () => void;
}

const DisplayImg: FC<DisplayImgProps> = ({
  fileName,
  alt,
  previewWidth,
  onChange,
  removeSection,
  handleClosePreview,
  upload,
}) => {
  const [src, setSrc] = useState("");
  const [sourceType, setSourceType] = useState("");

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        // Determine the source type based on fileName
        if (fileName.includes("drive.google.com")) {
          setSourceType("googleDrive");
        } else if (
          fileName.includes("s3.") ||
          fileName.includes("backblazeb2.com")
        ) {
          setSourceType("backblaze");
          const response = await axios.get(
            `${process.env.REACT_APP_API}/get-image-url/${encodeURIComponent(
              fileName
            )}`
          );
          setSrc(response.data.url);
        } else {
          setSourceType("other");
          setSrc(fileName); // For other sources, use the fileName as src directly
        }
      } catch (error) {
        console.error("Error fetching signed URL: ", error);
      }
    };

    fetchImageUrl();
  }, [fileName]);

  return (
    <div>
      <div className="flex flex-col gap-3 mb-3">
        {sourceType === "googleDrive" ? (
          <div className="w-[28rem] mx-8 bg-white rounded-lg shadow-md p-4">
            <div className="p-4">
              <h5 className="text-xl font-bold mb-2">Google Drive File</h5>
              <p className="mb-4">File Name: {fileName.split("/").pop()}</p>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => window.open(fileName, "_blank")}
              >
                Open in New Tab
              </button>
            </div>
          </div>
        ) : sourceType === "backblaze" ? (
          src ? (
            <img
              src={src}
              alt={alt}
              style={{ maxWidth: `${previewWidth}vw`, height: "auto" }}
              className="max-w-full h-auto mx-auto block"
              onError={() => console.error("Failed to load image")}
            />
          ) : (
            <p>Loading image...</p>
          )
        ) : (
          src && (
            <img
              src={src}
              alt={alt}
              style={{ maxWidth: `${previewWidth}vw`, height: "auto" }}
              className="max-w-full h-auto mx-auto block"
              onError={() => console.error("Failed to load image")}
            />
          )
        )}
        <div className="mt-2">
          {sourceType !== "googleDrive" && (
            <>
              <input
                type="range"
                min="10"
                max="100"
                value={previewWidth || 10}
                onChange={onChange}
                className="w-full"
              />
              <label>Width: {previewWidth || 10}vw</label>
            </>
          )}
        </div>
        <div className="flex gap-3 mb-3">
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm mt-2"
            type="button"
            onClick={removeSection}
          >
            Remove
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
            type="button"
            onClick={handleClosePreview}
          >
            Change
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm mt-2"
            type="button"
            onClick={upload}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisplayImg;
