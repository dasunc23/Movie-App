import React, { useState } from 'react';
import { Button, Card, Input, Modal, Loader, MovieCard } from './components/common';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const demoMovie = {
    title: "Inception",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology...",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    vote_average: 8.4,
    release_date: "2010-07-16"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-5xl font-bold text-center mb-12">
          🎬 Moovie Components
        </h1>

        {/* Buttons */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </Card>

        {/* Inputs */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Inputs</h2>
          <div className="space-y-4">
            <Input 
              label="Email" 
              type="email" 
              placeholder="Enter your email"
              required
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="Enter password"
              error="Password is required"
            />
          </div>
        </Card>

        {/* Modal */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Modal</h2>
          <Button onClick={() => setIsModalOpen(true)}>
            Open Modal
          </Button>
        </Card>

        {/* Loader */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Loader</h2>
          <div className="flex gap-8">
            <Loader size="sm" />
            <Loader size="md" />
            <Loader size="lg" />
          </div>
        </Card>

        {/* Movie Card */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Movie Card</h2>
          <div className="max-w-xs">
            <MovieCard 
              movie={demoMovie}
              onClick={() => alert('Movie clicked!')}
            />
          </div>
        </Card>
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
      >
        <p className="text-gray-300 mb-4">
          This is a modal component. Press ESC or click outside to close.
        </p>
        <Button onClick={() => setIsModalOpen(false)}>
          Close
        </Button>
      </Modal>
    </div>
  );
}

export default App;