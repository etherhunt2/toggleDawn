import React, { useEffect, useState } from "react";
import axios from "axios";

interface ViewCoverImgProps {
  fileName: string;
  alt: string;
}

const ViewCoverImg: React.FC<ViewCoverImgProps> = ({ fileName, alt }) => {
  const [src, setSrc] = useState("");

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        if (!fileName) {
          console.log("No file name provided");
        }
        const response = await axios.get(
          `${process.env.REACT_APP_API}/get-image-url/${encodeURIComponent(
            fileName
          )}`
        );
        setSrc(response.data.url);
      } catch (error) {
        console.error("Error fetching signed URL: ", error);
      }
    };

    fetchImageUrl();
  }, [fileName]);

  return (
    <div>
      <img
        // src={src ? src : coverPhoto}
        src={src}
        alt={alt}
        className="img-fluid w-100"
        style={{ maxHeight: "150px", objectFit: "cover" }}
      />
    </div>
  );
};

export default ViewCoverImg;
