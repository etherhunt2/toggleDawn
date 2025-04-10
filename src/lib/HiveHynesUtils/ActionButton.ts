import React, { useState } from 'react';

const style = `
  .button-group-wrapper {
    max-width: 40vw;
    margin: 0 auto;
    position: relative;
    display: flex;
    justify-content: center;
    gap: 20px;
    padding-bottom: 20px;
    padding-top: 40px;
    overflow: hidden;
    border-radius: 10px;
    background-color: rgba(173, 216, 230, 0.8);
    clip-path: polygon(10% 5%, 90% 5%, 95% 95%, 5% 95%);
    animation: wave-clip 3s ease-in-out infinite alternate;
  }

  @media (max-width: 568px) {
    .button-group-wrapper {
      overflow-x: scroll;
      min-width: 100vw;
      padding-left: 100px;
      padding-right: 100px;
    }
  }

  @media (max-width: 1080px) {
    .button-group-wrapper {
      max-width: 80vw;
    }
  }

  /* Wave animation for top and bottom sides */
  /*@keyframes wave-clip {
    0% {
      clip-path: polygon(12% 5%, 88% 5%, 95% 95%, 5% 95%);
    }
    50% {
      clip-path: polygon(10% 8%, 90% 8%, 93% 92%, 7% 92%);
    }
    100% {
      clip-path: polygon(8% 5%, 92% 5%, 91% 95%, 9% 95%);
    }
  }*/

  .floating-button {
    background-color: #007bff;
    border: none;
    border-radius: 50px;
    padding: 15px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    color: #fff;
    box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    position: relative;
  }

  .floating-button:hover {
    background-color: #0056b3;
    box-shadow: 0px 15px 20px rgba(0, 0, 0, 0.4);
    transform: translateY(-5px);
  }

  .floating-button svg {
    width: 20px;
    height: 20px;
    fill: white;
  }

  .button-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .button-label {
    position: absolute;
    top: -30px;
    opacity: 0;
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
    transform: translateY(0px);
  }

  .button-wrapper:hover .button-label {
    opacity: 1;
    transform: translateY(-40);
  }
`;

const ActionButton = ({ addTable, addEditor, addImage, addFile, addCode, addHtml }) => {
  const [hoveredButton, setHoveredButton] = useState(null);

  const buttons = [
    {
      name: 'HTML',
      action: addHtml,
      icon: `
        <svg width="800px" height="800px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0.5 0.5V0C0.360174 0 0.226736 0.0585498 0.132059 0.161445C0.0373814 0.264341 -0.00988477 0.40218 0.00172713 0.541523L0.5 0.5ZM14.5 0.5L14.9983 0.541523C15.0099 0.40218 14.9626 0.264341 14.8679 0.161445C14.7733 0.0585498 14.6398 0 14.5 0V0.5ZM13.5 12.5L13.6581 12.9743C13.8479 12.9111 13.9817 12.7408 13.9983 12.5415L13.5 12.5ZM7.5 14.5L7.34189 14.9743C7.44452 15.0086 7.55548 15.0086 7.65811 14.9743L7.5 14.5ZM1.5 12.5L1.00173 12.5415C1.01834 12.7408 1.15214 12.9111 1.34189 12.9743L1.5 12.5ZM4.5 3.5V3H4V3.5H4.5ZM4.5 6.5H4V7H4.5V6.5ZM10.5 6.5H11V6H10.5V6.5ZM10.5 9.5L10.6581 9.97434L11 9.86038V9.5H10.5ZM7.5 10.5L7.34189 10.9743L7.5 11.027L7.65811 10.9743L7.5 10.5ZM4.5 9.5H4V9.86038L4.34189 9.97434L4.5 9.5ZM0.5 1H14.5V0H0.5V1ZM14.0017 0.458477L13.0017 12.4585L13.9983 12.5415L14.9983 0.541523L14.0017 0.458477ZM13.3419 12.0257L7.34189 14.0257L7.65811 14.9743L13.6581 12.9743L13.3419 12.0257ZM7.65811 14.0257L1.65811 12.0257L1.34189 12.9743L7.34189 14.9743L7.65811 14.0257ZM1.99827 12.4585L0.998273 0.458477L0.00172713 0.541523L1.00173 12.5415L1.99827 12.4585ZM11 3H4.5V4H11V3ZM4 3.5V6.5H5V3.5H4ZM4.5 7H10.5V6H4.5V7ZM10 6.5V9.5H11V6.5H10ZM10.3419 9.02566L7.34189 10.0257L7.65811 10.9743L10.6581 9.97434L10.3419 9.02566ZM7.65811 10.0257L4.65811 9.02566L4.34189 9.97434L7.34189 10.9743L7.65811 10.0257ZM5 9.5V8H4V9.5H5Z" />
        </svg>`
    },
    {
      name: 'FILE',
      action: addFile,
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-pdf" viewBox="0 0 16 16">
          <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
          <path d="M4.603 14.087a.8.8 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.7 7.7 0 0 1 1.482-.645 20 20 0 0 0 1.062-2.227 7.3 7.3 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a11 11 0 0 0 .98 1.686 5.8 5.8 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.86.86 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.7 5.7 0 0 1-.911-.95 11.7 11.7 0 0 0-1.997.406 11.3 11.3 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.8.8 0 0 1-.58.029m1.379-1.901q-.25.115-.459.238c-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361q.016.032.026.044l.035-.012c.137-.056.355-.235.635-.572a8 8 0 0 0 .45-.606m1.64-1.33a13 13 0 0 1 1.01-.193 12 12 0 0 1-.51-.858 21 21 0 0 1-.5 1.05zm2.446.45q.226.245.435.41c.24.19.407.253.498.256a.1.1 0 0 0 .07-.015.3.3 0 0 0 .094-.125.44.44 0 0 0 .059-.2.1.1 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a4 4 0 0 0-.612-.053zM8.078 7.8a7 7 0 0 0 .2-.828q.046-.282.038-.465a.6.6 0 0 0-.032-.198.5.5 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822q.036.167.09.346z" />
        </svg>`
    },
    {
      name: 'IMAGE',
      action: addImage,
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-image" viewBox="0 0 16 16">
          <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
          <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z" />
        </svg>`
    },
    {
      name: 'EDITOR',
      action: addEditor,
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
          <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
          <path fillRule="evenodd" d="M1 13.5V16h2.5l9.724-9.724-2.5-2.5L1 13.5z" />
        </svg>`
    },
    {
      name: 'TABLE',
      action: addTable,
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-table" viewBox="0 0 16 16">
          <path d="M2 2h12v12H2V2zm1 1v10h10V3H3zm1 1h2v2H4V4zm3 0h2v2H7V4zm3 0h2v2h-2V4zM4 7h2v2H4V7zm3 0h2v2H7V7zm3 0h2v2h-2V7zm-3 3h2v2H7v-2zm3 0h2v2h-2v-2z" />
        </svg>`
    },
    {
      name: 'CODE',
      action: addCode,
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-code-slash" viewBox="0 0 16 16">
          <path d="M10.478 1.647a.5.5 0 1 0-.956-.294l-4 13a.5.5 0 0 0 .956.294zM4.854 4.146a.5.5 0 0 1 0 .708L1.707 8l3.147 3.146a.5.5 0 0 1-.708.708l-3.5-3.5a.5.5 0 0 1 0-.708l3.5-3.5a.5.5 0 0 1 .708 0m6.292 0a.5.5 0 0 0 0 .708L14.293 8l-3.147 3.146a.5.5 0 0 0 .708.708l3.5-3.5a.5.5 0 0 0 0-.708l-3.5-3.5a.5.5 0 0 0-.708 0" />
        </svg>`
    },
  ];

  return (
    <div>
      <style>{style}</style>
      <div className="button-group-wrapper">
        {buttons.map(({ name, action, icon }) => (
          <div
            className="button-wrapper"
            key={name}
            onMouseEnter={() => setHoveredButton(name)}
            onMouseLeave={() => setHoveredButton(null)}
          >
            {hoveredButton === name && (
              <Badge variant="primary badge-sm light" className="button-label">
                {name}
              </Badge>
            )}
            <button className="floating-button" type="button" onClick={action}>
              {/* SVG Icon Placeholder */}
              {icon ? (
                <div dangerouslySetInnerHTML={{ __html: icon }} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 16 16" fill="white">
                  <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" fill="none" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>
    </div >
  );
};

export default ActionButton;
