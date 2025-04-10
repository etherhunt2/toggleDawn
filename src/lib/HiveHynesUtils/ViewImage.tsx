import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../Loader/Loader";

interface ViewImageProps {
  fileName: string;
  alt: string;
  previewWidth?: number;
}

const ViewImage: React.FC<ViewImageProps> = ({
  fileName,
  alt,
  previewWidth,
}) => {
  const [src, setSrc] = useState<string>("");
  const [sourceType, setSourceType] = useState<
    "googleDrive" | "backblaze" | "other" | ""
  >("");

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
            `${process.env.NEXT_PUBLIC_API}/get-image-url/${encodeURIComponent(
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
      <div className="flex justify-start gap-3 mb-3"></div>
      <div>
        {sourceType === "googleDrive" ? (
          <div className="w-[28rem] mx-8 bg-white rounded-lg shadow-lg p-4">
            <div className="p-4">
              <h5 className="text-xl font-bold mb-2">Google Drive File</h5>
              <p className="mb-4">File Name: {fileName.split("/").pop()}</p>
              <button
                type="button"
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
              style={
                previewWidth
                  ? { maxWidth: `${previewWidth}vw`, height: "auto" }
                  : undefined
              }
              className="max-w-full h-auto mx-auto block"
              onError={() => console.error("Failed to load image")}
            />
          ) : (
            <Loader />
          )
        ) : (
          src && (
            <img
              src={src}
              alt={alt}
              style={
                previewWidth
                  ? { maxWidth: `${previewWidth}vw`, height: "auto" }
                  : undefined
              }
              className="max-w-full h-auto mx-auto block"
              onError={() => console.error("Failed to load image")}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ViewImage;
