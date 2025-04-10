import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import api from "../axios";
import Loader from "../Loader/Loader";

// Dynamically import PDF viewer components
const PDFViewer = dynamic(() => import("./PDFViewer"), {
  ssr: false,
  loading: () => <Loader />,
});

interface DisplayPDFProps {
  fileUrl: string;
  handleClosePreview: () => void;
  removeSection: () => void;
}

const DisplayPDF = ({
  fileUrl,
  handleClosePreview,
  removeSection,
}: DisplayPDFProps) => {
  const [src, setSrc] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        // Determine the source type based on fileName
        if (fileUrl.includes("drive.google.com")) {
          setSourceType("googleDrive");
          setSrc(fileUrl);
        } else if (
          fileUrl.includes("s3.") ||
          fileUrl.includes("backblazeb2.com")
        ) {
          setSourceType("backblaze");
          const response = await api.get(
            `${process.env.NEXT_PUBLIC_API}/s3-file-url/${encodeURIComponent(
              fileUrl
            )}`
          );
          setSrc(response.data.url);
        } else {
          setSourceType("other");
          setSrc(fileUrl); // For other sources, use the fileName as src directly
        }
      } catch (error) {
        console.error("Error fetching signed URL:", error);
      }
    };

    fetchImageUrl();
    console.log("FileURL: ", fileUrl);
  }, [fileUrl]);

  if (!isClient) {
    return <Loader />;
  }

  return (
    <div>
      {sourceType === "googleDrive" ? (
        <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white p-4">
          <div className="px-6 py-4">
            <div className="font-bold text-xl mb-2">Google Drive File</div>
            <p className="text-gray-700 text-base">
              File Name: {fileUrl.split("/").pop()}
            </p>
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => window.open(src, "_blank")}
            >
              Open in New Tab
            </button>
          </div>
        </div>
      ) : sourceType === "backblaze" || src ? (
        <>
          <div className="d-flex justify-content-end my-2">
            <button
              className="btn btn-primary btn-sm mx-2 btn-edit"
              type="button"
              onClick={handleClosePreview}
            >
              Change
            </button>
            <button
              className="btn btn-primary btn-sm btn-danger"
              type="button"
              onClick={removeSection}
            >
              Remove
            </button>
          </div>
          {src ? <PDFViewer fileUrl={src} /> : <Loader />}
        </>
      ) : null}
    </div>
  );
};

export default DisplayPDF;
