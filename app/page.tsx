'use client'
import React, { useState, useEffect } from 'react';
import { Heart, Camera, Music, Sparkles } from 'lucide-react';

const ValentineGift = () => {
  const [isOpened, setIsOpened] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  // Suas fotos da pasta public
  const photos = [
    {
      url: "/foto1.jpg", // Coloque sua primeira foto como foto1.jpg na pasta public
      caption: "Nosso primeiro encontro ❤️"
    },
    {
      url: "/foto2.jpg", // Coloque sua segunda foto como foto2.jpg na pasta public
      caption: "Momentos especiais juntos 💕"
    },
    {
      url: "/foto3.jpg", // Coloque sua terceira foto como foto3.jpg na pasta public
      caption: "Para sempre você e eu 🥰"
    }
  ];

  // Música de fundo - coloque seu arquivo como musica.mp3 na pasta public
  const musicUrl = "/musica.mp3";

  const loveMessages = [
    "Você é o meu maior presente! ❤️",
    "Cada momento com você é mágico ✨",
    "Te amo mais a cada dia que passa 💕",
    "Você faz meu coração sorrir 😊",
    "Minha vida é mais colorida com você 🌈"
  ];

  useEffect(() => {
    // Inicializar áudio
    const audioElement = new Audio(musicUrl);
    audioElement.loop = true;
    audioElement.volume = 0.5;
    setAudio(audioElement);

    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = "";
      }
    };
  }, []);

  useEffect(() => {
    if (isOpened) {
      const photoInterval = setInterval(() => {
        setCurrentPhoto((prev) => (prev + 1) % photos.length);
      }, 3000);

      return () => clearInterval(photoInterval);
    }
  }, [isOpened, photos.length]);

  useEffect(() => {
    if (isOpened) {
      const heartInterval = setInterval(() => {
        createFloatingHeart();
      }, 1000);

      const sparkleInterval = setInterval(() => {
        createSparkle();
      }, 500);

      return () => {
        clearInterval(heartInterval);
        clearInterval(sparkleInterval);
      };
    }
  }, [isOpened]);

  const createFloatingHeart = () => {
    const newHeart = {
      id: Date.now() + Math.random(),
      left: Math.random() * 100,
      animationDelay: Math.random() * 2,
      size: Math.random() * 10 + 20,
      emoji: Math.random() > 0.5 ? '❤️' : '💕'
    };

    setHearts(prev => [...prev, newHeart]);

    setTimeout(() => {
      setHearts(prev => prev.filter(heart => heart.id !== newHeart.id));
    }, 4000);
  };

  const createSparkle = () => {
    const newSparkle = {
      id: Date.now() + Math.random(),
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 1,
    };

    setSparkles(prev => [...prev, newSparkle]);

    setTimeout(() => {
      setSparkles(prev => prev.filter(sparkle => sparkle.id !== newSparkle.id));
    }, 2000);
  };

  const toggleMusic = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  const openGift = () => {
    if (isOpened) return;
    
    setIsOpened(true);
    
    // Iniciar música automaticamente
    if (audio && !isPlaying) {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
    
    // Criar explosão inicial de corações e brilhos
    for (let i = 0; i < 15; i++) {
      setTimeout(() => createFloatingHeart(), i * 100);
      setTimeout(() => createSparkle(), i * 50);
    }

    setTimeout(() => {
      setShowMessage(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fundo animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-red-500 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-ping"></div>
      </div>

      {/* Corações flutuantes */}
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="absolute pointer-events-none animate-bounce"
          style={{
            left: `${heart.left}%`,
            bottom: '-50px',
            fontSize: `${heart.size}px`,
            animationDelay: `${heart.animationDelay}s`,
            animation: `floatUp 4s ease-out forwards ${heart.animationDelay}s`
          }}
        >
          {heart.emoji}
        </div>
      ))}

      {/* Brilhos */}
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="absolute pointer-events-none w-2 h-2 bg-white rounded-full animate-ping"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            animationDelay: `${sparkle.animationDelay}s`
          }}
        />
      ))}

      {/* Controle de música */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleMusic}
          className="bg-white/20 backdrop-blur-md rounded-full p-3 text-white hover:bg-white/30 transition-all duration-300 shadow-lg"
        >
          {isPlaying ? (
            <div className="flex items-center space-x-2">
              <Music className="w-6 h-6" />
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            </div>
          ) : (
            <Music className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {!isOpened ? (
          // Presente fechado
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-pulse drop-shadow-lg">
                Para Minha Namorada
              </h1>
              <p className="text-xl md:text-2xl text-white/90 animate-bounce drop-shadow-md">
                Clique no presente para abrir! 🎁
              </p>
            </div>

            <div 
              onClick={openGift}
              className="relative cursor-pointer transform transition-all duration-300 hover:scale-110 hover:rotate-3 animate-pulse"
            >
              {/* Caixa do presente */}
              <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl shadow-2xl relative overflow-hidden">
                {/* Fita vertical */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-full bg-yellow-400 shadow-lg"></div>
                {/* Fita horizontal */}
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-8 bg-yellow-400 shadow-lg"></div>
                
                {/* Laço */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-16 h-12 bg-yellow-400 rounded-full relative">
                    <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-12 bg-yellow-400 rounded-full rotate-12"></div>
                    <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-12 bg-yellow-400 rounded-full -rotate-12"></div>
                  </div>
                </div>

                {/* Brilho na caixa */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : (
          // Presente aberto
          <div className="text-center space-y-8 animate-fadeIn">
            {/* Carrossel de fotos */}
            <div className="relative">
              <div className="w-80 h-80 md:w-96 md:h-96 mx-auto rounded-full overflow-hidden shadow-2xl border-8 border-white/30 backdrop-blur-sm">
                <img 
                  src={photos[currentPhoto].url}
                  alt="Nossa foto"
                  className="w-full h-full object-cover transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              
              {/* Legenda da foto */}
              <div className="mt-4 bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 mx-auto max-w-md">
                <p className="text-white font-semibold text-lg drop-shadow-md">
                  {photos[currentPhoto].caption}
                </p>
              </div>

              {/* Indicadores do carrossel */}
              <div className="flex justify-center space-x-3 mt-4">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentPhoto 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Mensagem de amor */}
            {showMessage && (
              <div className="bg-white/20 backdrop-blur-lg rounded-3xl p-8 mx-auto max-w-2xl animate-slideUp">
                <div className="flex items-center justify-center mb-4">
                  <Heart className="text-red-400 mr-2" size={32} />
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Te Amo!
                  </h2>
                  <Heart className="text-red-400 ml-2" size={32} />
                </div>
                
                <div className="space-y-3">
                  {loveMessages.map((message, index) => (
                    <p 
                      key={index}
                      className="text-white text-lg md:text-xl font-medium drop-shadow-lg animate-fadeIn"
                      style={{ animationDelay: `${index * 0.5}s` }}
                    >
                      {message}
                    </p>
                  ))}
                </div>

                <div className="flex justify-center items-center mt-6 space-x-4">
                  <Camera className="text-white/80" size={24} />
                  <span className="text-white/90 text-lg">
                    Nossas memórias mais preciosas
                  </span>
                  <Sparkles className="text-white/80" size={24} />
                </div>

                <div className="mt-6 text-center">
                  <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                    Feliz Dia dos Namorados! 💕
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ValentineGift;