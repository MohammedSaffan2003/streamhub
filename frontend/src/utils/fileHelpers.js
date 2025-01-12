// File type icons (you can replace these with actual icons from a library like FontAwesome)
const FILE_ICONS = {
  "application/pdf": "📄",
  "application/msword": "📝",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "📝",
  "image/jpeg": "🖼️",
  "image/png": "🖼️",
  "image/gif": "🖼️",
  "video/mp4": "🎥",
  "audio/mpeg": "🎵",
  default: "📁",
};

const FILE_TYPE_LABELS = {
  "application/pdf": "PDF",
  "application/msword": "Word Document",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word Document",
  "image/jpeg": "JPEG Image",
  "image/png": "PNG Image",
  "image/gif": "GIF Image",
  "video/mp4": "MP4 Video",
  "audio/mpeg": "MP3 Audio",
  default: "File",
};

export const getFileIcon = (fileType) => {
  return FILE_ICONS[fileType] || FILE_ICONS.default;
};

export const getFileTypeLabel = (fileType) => {
  return FILE_TYPE_LABELS[fileType] || FILE_TYPE_LABELS.default;
};
