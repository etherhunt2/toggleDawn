import React, { useEffect, useState } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/themes/prism-tomorrow.css"; // Optional, for a dark theme

// Import additional languages from Prism
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-clike";

// Define the function to detect the language
const detectLanguage = (code: string) => {
  if (!code) return "plaintext";

  if (/^<\?xml|<!DOCTYPE|<\/?[a-z][\s\S]*>/i.test(code)) {
    return "xml";
  } else if (/function|const|let|=>/.test(code)) {
    return "javascript";
  } else if (/\.?([a-z0-9-_]+)\s*{[^}]*}/i.test(code)) {
    return "css";
  } else if (/class\s+\w+\s*{/.test(code)) {
    return "clike";
  } else if (/Atom\./.test(code)) {
    return "atom";
  } else if (/<rss|<channel|<item>/i.test(code)) {
    return "rss";
  } else if (/<svg|<circle|<rect|<path>/i.test(code)) {
    return "svg";
  } else if (/<!DOCTYPE html>/i.test(code) || /<html/i.test(code)) {
    return "html";
  }

  return "plaintext";
};

const ShowCode = ({ code }: { code: string }) => {
  const [detectedLanguage, setDetectedLanguage] = useState("plaintext");
  console.log("lang: ", detectedLanguage);

  useEffect(() => {
    const lang = detectLanguage(code || "");
    setDetectedLanguage(lang);
  }, [code]);

  return (
    <div>
      <div className="card-body" style={{ padding: 0, margin: 0 }}>
        <Editor
          value={code || ""}
          onValueChange={() => {}}
          highlight={(code: string) =>
            code && languages[detectedLanguage]
              ? highlight(code, languages[detectedLanguage], detectedLanguage)
              : code
          }
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 14,
            backgroundColor: "#1e1e1e",
            color: "#f8f8f2",
          }}
        />
      </div>
    </div>
  );
};

export default ShowCode;
