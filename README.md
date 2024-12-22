# StreamHub - Live Streaming and Video Platform

StreamHub is a full-stack web application that enables users to live stream, upload videos, chat, and interact with other users in real-time. Built with the MERN stack (MongoDB, Express.js, React., Node.js) and integrated with ZegoCloud for live streaming capabilities.

## Features

### Live Streaming

- Real-time live streaming capabilities
- Role-based streaming (Host/Audience)
- Stream chat functionality
- Stream quality controls
- Screen sharing options

### Video Content

- Video upload and management
- Video playback
- Video categorization
- User-specific video galleries

### User Management

- User authentication and authorization
- Profile management
- Profile customization
- Secure JWT-based sessions

### Chat System

- Real-time chat functionality
- Private messaging
- Online status indicators
- Message history

## Tech Stack

### Frontend

- React.js
- React Router for navigation
- ZegoCloud UI Kit for streaming
- Socket.io-client for real-time features
- JWT for authentication
- CSS for styling

### Backend

Node.js
Express.js

- MongoDB with Mongoose
- Socket.io for real-time communication
- JWT for authentication
- Cloudinary for media storage
- Bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
  MongoDB
- ZegoCloud account
- Cloudinary account

## Environment Variables

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:5000
```

### Backend (.env)

```bash
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PORT=5000
ZEGOCLOUD_APP_ID=your_zego_app_id
ZEGOCLOUD_SERVER_SECRET=your_zego_server_secret
NODE_ENV=development
```

## Installation

1. Clone the repository

```bash
git clone https://github.com/mohammedsaffan2003/streamhub.git
cd streamhub
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Install frontend dependencies

```bash
cd frontend
npm install
```

4. Start the backend server

```bash
cd backend
npm start
```

5. Start the frontend development server

```bash
cd frontend
npm run dev
```

## API Endpoints

### Authentication

- POST `/api/register` - Register new user
- POST `/api/login` - User login
- POST `/api/logout` - User logout

### User Management

- GET `/api/user` - Get user profile
- PUT `/api/user` - Update user profile
- PUT `/api/user/avatar` - Update user avatar

### Video Management

- POST `/api/videos` - Upload video
- GET `/api/videos` - Get all videos
- GET `/api/videos/:id` - Get specific video
- DELETE `/api/videos/:id` - Delete video

### Live Streaming

- POST `/api/zego/token` - Get streaming token
- GET `/api/streams/active` - Get active streams

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- ZegoCloud for streaming capabilities
- Cloudinary for media storage
- Socket.io for real-time features
- MongoDB Atlas for database hosting

## Contact

Mohammed Saffan

LinkedIn: https://www.linkedin.com/in/mohammedsaffan2003/

Project Link: https://github.com/mohammedsaffan2003/streamhub
