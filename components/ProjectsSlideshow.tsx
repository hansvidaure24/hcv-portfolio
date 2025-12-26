"use client";
import NextImage from "next/image";
import { useState, useRef, useEffect } from "react";

type Project = {
  title: string;
  image: string;
  description: string;
};

export default function ProjectsSlideshow({ projects }: { projects: Project[] }) {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const prevSlide = () => setCurrent((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  const nextSlide = () => setCurrent((prev) => (prev === projects.length - 1 ? 0 : prev + 1));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMouse({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [projects.length]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center w-[80vw] relative rounded-2xl bg-[#0B1C2D] shadow-lg z-10 border-2 border-black overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: hovered ? 'auto' : 'auto', aspectRatio: '16/9', maxHeight: '70vh' }}
    >
      <div className="w-full flex items-center justify-center relative overflow-hidden h-full">
        {projects.map((project, idx) => (
          <NextImage
            key={project.image}
            src={project.image}
            alt={project.title}
            fill
            className={`object-cover w-full h-full absolute top-0 left-0 transition-opacity duration-700 ${idx === current ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
            sizes="(max-width: 1200px) 80vw, 960px"
            priority={idx === current}
          />
        ))}
        {/* Overlay for title, description, and buttons */}
        <div className="absolute inset-0 flex flex-col justify-end z-20 pointer-events-none">
          <div className="w-full bg-black/60 px-3 py-2 sm:px-6 sm:py-4 text-white">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">{projects[current]?.title}</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-2 sm:mb-4">{projects[current]?.description}</p>
          </div>
        </div>
        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 sm:p-3 transition z-30 pointer-events-auto text-lg sm:text-2xl"
          aria-label="Previous Project"
        >
          &#8592;
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 sm:p-3 transition z-30 pointer-events-auto text-lg sm:text-2xl"
          aria-label="Next Project"
        >
          &#8594;
        </button>
      </div>
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {projects.map((_, idx) => (
          <span
            key={idx}
            className={`w-3 h-3 rounded-full ${idx === current ? "" : "bg-white/40"}`}
            style={idx === current ? { background: "#C9A24D" } : {}}
          />
        ))}
      </div>
    </div>
  );
}