import React from 'react';
import { useSelector } from 'react-redux';
import { FiPlay, FiFilm, FiCamera } from 'react-icons/fi';

const CSS3DElements = () => {
  const { mode } = useSelector((state) => state.theme);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {/* Floating 3D Cinema Elements */}
      
      {/* Large Movie Reel - Top Left */}
      <div className={`absolute top-20 left-10 w-32 h-32 rounded-full transform-gpu ${
        mode === 'dark' 
          ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
          : 'bg-gradient-to-br from-blue-500 to-purple-500'
      } opacity-20 animate-spin-slow`}
        style={{
          animation: 'float 6s ease-in-out infinite, rotate 20s linear infinite',
          transform: 'perspective(1000px) rotateX(45deg) rotateY(15deg)'
        }}>
        <div className="absolute inset-4 rounded-full border-4 border-white/30"></div>
        <div className="absolute inset-8 rounded-full border-2 border-white/20"></div>
      </div>

      {/* Film Strip - Top Right */}
      <div className={`absolute top-32 right-16 w-8 h-48 ${
        mode === 'dark'
          ? 'bg-gradient-to-b from-yellow-400 to-orange-500'
          : 'bg-gradient-to-b from-yellow-500 to-red-500'
      } opacity-25 transform-gpu`}
        style={{
          animation: 'float 8s ease-in-out infinite reverse, sway 4s ease-in-out infinite',
          transform: 'perspective(800px) rotateY(30deg) rotateZ(10deg)'
        }}>
        {/* Film perforations */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute left-1 w-2 h-4 bg-black/50 rounded-sm" 
               style={{ top: `${i * 24 + 8}px` }}></div>
        ))}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute right-1 w-2 h-4 bg-black/50 rounded-sm" 
               style={{ top: `${i * 24 + 8}px` }}></div>
        ))}
      </div>

      {/* 3D Cube with Icons - Center */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 w-20 h-20 transform-gpu"
        style={{
          animation: 'float 7s ease-in-out infinite, rotate3d 15s linear infinite',
          transform: 'perspective(1000px) rotateX(25deg) rotateY(25deg)'
        }}>
        <div className={`w-full h-full relative ${
          mode === 'dark'
            ? 'bg-gradient-to-br from-pink-500 to-purple-600'
            : 'bg-gradient-to-br from-pink-400 to-purple-500'
        } rounded-lg opacity-30 shadow-2xl`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <FiPlay className="text-white text-2xl" />
          </div>
        </div>
      </div>

      {/* Camera Icon - Bottom Left */}
      <div className={`absolute bottom-32 left-20 w-16 h-16 rounded-xl ${
        mode === 'dark'
          ? 'bg-gradient-to-tr from-cyan-500 to-blue-600'
          : 'bg-gradient-to-tr from-cyan-400 to-blue-500'
      } opacity-25 flex items-center justify-center transform-gpu`}
        style={{
          animation: 'float 5s ease-in-out infinite, tilt 10s ease-in-out infinite',
          transform: 'perspective(600px) rotateY(-20deg) rotateX(10deg)'
        }}>
        <FiCamera className="text-white text-xl" />
      </div>

      {/* Small Movie Reel - Bottom Right */}
      <div className={`absolute bottom-40 right-32 w-20 h-20 rounded-full ${
        mode === 'dark'
          ? 'bg-gradient-to-br from-green-500 to-teal-600'
          : 'bg-gradient-to-br from-green-400 to-teal-500'
      } opacity-20 transform-gpu`}
        style={{
          animation: 'float 9s ease-in-out infinite reverse, rotate 25s linear infinite reverse',
          transform: 'perspective(800px) rotateX(60deg) rotateY(-30deg)'
        }}>
        <div className="absolute inset-2 rounded-full border-2 border-white/40"></div>
        <div className="absolute inset-4 rounded-full border border-white/30"></div>
      </div>

      {/* Film Icon - Mid Right */}
      <div className={`absolute top-1/2 right-10 w-12 h-12 rounded-lg ${
        mode === 'dark'
          ? 'bg-gradient-to-bl from-indigo-500 to-purple-600'
          : 'bg-gradient-to-bl from-indigo-400 to-purple-500'
      } opacity-30 flex items-center justify-center transform-gpu`}
        style={{
          animation: 'float 6s ease-in-out infinite, swing 8s ease-in-out infinite',
          transform: 'perspective(700px) rotateY(45deg) rotateZ(-15deg)'
        }}>
        <FiFilm className="text-white text-lg" />
      </div>

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} 
          className={`absolute w-3 h-3 rounded-full ${
            mode === 'dark'
              ? 'bg-gradient-to-r from-purple-400 to-pink-400'
              : 'bg-gradient-to-r from-blue-400 to-purple-400'
          } opacity-40`}
          style={{
            left: `${20 + (i * 120) % 80}%`,
            top: `${30 + (i * 80) % 60}%`,
            animation: `float ${4 + i}s ease-in-out infinite, drift ${8 + i * 2}s linear infinite`,
            animationDelay: `${i * 0.5}s`
          }}>
        </div>
      ))}
    </div>
  );
};

export default CSS3DElements;