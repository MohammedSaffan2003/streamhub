import React, { useState } from "react";
import axios from "axios";

const VideoUploadPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("video", file);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/upload-video/", formData, {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Video uploaded successfully!");
    } catch (error) {
      console.error("Error uploading video:", error);
    }
  };

  return (
    <form onSubmit={handleUpload} className="upload-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Video Title"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Video Description"
        required
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        accept="video/*"
        required
      />
      <button type="submit">Upload Video</button>
    </form>
  );
};

export default VideoUploadPage;
