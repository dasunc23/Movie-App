import React from 'react';
import { Card } from './Card';

export const MovieCard = ({ 
  movie, 
  onClick,
  showRating = true 
}) => {
  const posterUrl = movie.poster_path || movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path || movie.posterPath}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <Card hover onClick={onClick} className="overflow-hidden group">
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-sm text-gray-300 line-clamp-3">
            {movie.overview}
          </p>
        </div>

        {/* Rating badge */}
        {showRating && (movie.vote_average || movie.voteAverage) && (
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-white">
              {(movie.vote_average || movie.voteAverage)?.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Movie info */}
      <div className="p-4">
        <h3 className="font-bold text-white text-lg line-clamp-1 mb-1">
          {movie.title}
        </h3>
        <p className="text-sm text-gray-400">
          {movie.release_date || movie.releaseDate 
            ? new Date(movie.release_date || movie.releaseDate).getFullYear() 
            : 'N/A'}
        </p>
      </div>
    </Card>
  );
};