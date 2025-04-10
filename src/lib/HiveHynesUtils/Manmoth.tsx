import React, { useState, useEffect } from "react";
import mammoth from "mammoth";
import "./mammoth.css";
import DOMPurify from "dompurify";
import axios from "axios";

interface DocumentContent {
  src: string;
  fileType: string;
  sourceType: string;
  setContent: (content: string) => void;
}

interface MammothProps {
  fileUrl: string;
  fileType: string;
  removeSection: () => void;
  handleClosePreview: () => void;
}

const Mammoth = ({
  fileUrl,
  fileType,
  removeSection,
  handleClosePreview,
}: MammothProps) => {
  const [content, setContent] = useState("");
  const [src, setSrc] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [render, setRender] = useState(false);

  useEffect(() => {
    const fetchFileUrl = async () => {
      try {
        // Determine the source type based on fileName
        if (fileUrl.includes("drive.google.com")) {
          await setSourceType("googleDrive");
          await setSrc(fileUrl);
          await setRender(false);
        } else if (
          fileUrl.includes("s3.") ||
          fileUrl.includes("backblazeb2.com")
        ) {
          await setSourceType("backblaze");
          const response = await axios.get(
            `${process.env.REACT_APP_API}/s3-file-url/${encodeURIComponent(
              fileUrl
            )}`
          );
          setSrc(response.data.url);
          await setRender(true);
        } else {
          setSourceType("other");
          setSrc(fileUrl); // For other sources, use the fileName as src directly
          await setRender(true);
        }
      } catch (error) {
        console.error("Error fetching signed URL:", error);
      }
    };

    fetchFileUrl();
    console.log("FileURL: ", fileUrl);
  }, [fileUrl]);

  // Function moved outside useEffect to avoid redefinition
  interface ConversionOptions {
    convertImage: any; // mammoth types are not easily available
    styleMap: string[];
    includeDefaultStyleMap: boolean;
  }

  interface FileReaderResult {
    arrayBuffer: ArrayBuffer;
  }

  interface MammothResult {
    value: string;
  }

  const fetchDocumentContent = async (
    src: string,
    fileType: string,
    sourceType: string,
    setContent: (content: string) => void
  ): Promise<void> => {
    if (sourceType === "backblaze" || sourceType === "other") {
      if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        try {
          const response: Response = await fetch(src);
          const blob: Blob = await response.blob();
          const reader: FileReader = new FileReader();

          reader.onloadend = async () => {
            const options: ConversionOptions = {
              convertImage: mammoth.images.imgElement((element: any) => {
                return element.read("base64").then((imageBuffer: string) => {
                  return {
                    src: `data:${element.contentType};base64,${imageBuffer}`,
                  };
                });
              }),
              styleMap: [
                "p[style-name='Title'] => h1.title",
                "p[style-name='Subtitle'] => h2.subtitle",
                "p[style-name='Heading 1'] => h1.heading1",
                "p[style-name='Heading 2'] => h2.heading2",
                "p[style-name='Heading 3'] => h3.heading3",
                "p[style-name='Heading 4'] => h4.heading4",
                "p[style-name='Heading 5'] => h5.heading5",
                "p[style-name='Heading 6'] => h6.heading6",
                "p[style-name='Normal'] => p.normal",
                "r[style-name='Strong'] => strong",
                "r[style-name='Emphasis'] => em",
                "p[style-name='centered'] => p.text-center",
                "p[style-name='left'] => p.text-left",
                "p[style-name='right'] => p.text-right",
              ],
              includeDefaultStyleMap: true,
            };
            const result: MammothResult = await mammoth.convertToHtml(
              { arrayBuffer: reader.result } as FileReaderResult,
              options
            );
            setContent(result.value);
          };

          reader.readAsArrayBuffer(blob);
        } catch (error) {
          console.error("Error fetching or parsing the document:", error);
          setContent("Error loading document");
        }
      } else {
        setContent("Unsupported file type");
      }
    } else {
      setContent("Unsupported source type");
    }
  };

  // Updated useEffect
  useEffect(() => {
    if (src && fileType && sourceType) {
      fetchDocumentContent(src, fileType, sourceType, setContent);
    }
  }, [src, fileType, sourceType]); // Dependencies updated

  return (
    <div>
      <div className="text-center mb-3">
        <h4>Preview</h4>
        <div className="flex justify-end my-2"></div>
        <div className="flex">
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
      </div>
      {render &&
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ? (
        <div
          className="doc-content"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        />
      ) : (
        <div className="container">
          <p>{content}</p>
        </div>
      )}
    </div>
  );
};

export default Mammoth;
