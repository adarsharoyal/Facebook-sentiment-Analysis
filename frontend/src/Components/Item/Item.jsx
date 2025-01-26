import React from 'react';
import './Item.css';

function Item({ id, image }) {  
  const handleDownload = async () => {
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Create a temporary <a> element to trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `post_${id}.jpg`; // Filename for download
      document.body.appendChild(link);
      link.click();

      // Clean up the URL and remove the link
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download image", error);
    }
  };

  return (
    <div className='item' onClick={handleDownload}>
      <img src={image} alt={id} />
      <div className="overlay">Download Image</div>
    </div>
  );
}

export default Item;
