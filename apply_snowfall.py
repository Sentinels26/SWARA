import os
import re

snowfall_code = """import React, { useEffect, useRef, useState } from "react";

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  wind: number;
  amplitude: number;
  frequency: number;
  angle: number;
}

export default function Snowfall({
  children,
  count = 100,
  minRadius = 1,
  maxRadius = 4,
  minSpeed = 0.5,
  maxSpeed = 2,
  wind = 0.5,
  className = ""
}: {
  children: React.ReactNode;
  count?: number;
  minRadius?: number;
  maxRadius?: number;
  minSpeed?: number;
  maxSpeed?: number;
  wind?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const snowflakesRef = useRef<Snowflake[]>([]);
  const animationFrameRef = useRef<number>(0);

  const naturalDistribution = () => {
    const r = Math.random();
    if (r < 0.3) {
      return 0.1 + Math.random() * 0.3;
    } else if (r < 0.9) {
      return 0.5 + Math.random() * 1.0;
    } else {
      return 1.6 + Math.random() * 1.4;
    }
  };

  const initSnowflakes = (width: number, height: number) => {
    const snowflakes: Snowflake[] = [];
    const adjustedCount = Math.min(count, Math.floor((width * height) / 10000));

    for (let i = 0; i < adjustedCount; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: minRadius + Math.random() * (maxRadius - minRadius),
        speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
        opacity: 0.3 + Math.random() * 0.7,
        wind: (Math.random() - 0.5) * wind * 0.5,
        amplitude: naturalDistribution(),
        frequency: 0.001 + Math.random() * 0.008,
        angle: Math.random() * Math.PI * 2
      });
    }

    snowflakesRef.current = snowflakes;
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const { width, height } = canvasRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        initSnowflakes(width, height);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      const snowColor = "rgba(255, 255, 255,";

      snowflakesRef.current.forEach((flake) => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${snowColor} ${flake.opacity})`;
        ctx.fill();

        flake.y += flake.speed;
        flake.angle += flake.frequency;

        flake.x += flake.wind + Math.sin(flake.angle) * flake.amplitude;

        if (flake.y > dimensions.height) {
          flake.y = -flake.radius;
          flake.x = Math.random() * dimensions.width;
          flake.amplitude = naturalDistribution();
          flake.frequency = 0.001 + Math.random() * 0.008;
        }

        if (flake.x > dimensions.width) {
          flake.x = 0;
        } else if (flake.x < 0) {
          flake.x = dimensions.width;
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        style={{ zIndex: 0 }}
      />
      <div className="z-10 relative h-full flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
"""

components_dir = "/Users/macbookair/Documents/swara1/frontend/src/components"
snowfall_file = os.path.join(components_dir, "Snowfall.tsx")
with open(snowfall_file, "w") as f:
    f.write(snowfall_code)

welcome_path = "/Users/macbookair/Documents/swara1/frontend/src/pages/welcome/Welcome.tsx"
with open(welcome_path, "r") as f:
    welcome_content = f.read()

# Add import
if "import Snowfall" not in welcome_content:
    welcome_content = re.sub(r"(import { User, Stethoscope, ArrowRight } from 'lucide-react';)", r"\1\nimport Snowfall from '../../components/Snowfall';", welcome_content)

# Wrap the inner div with Snowfall
# The outer div is: <div className="h-screen w-screen bg-slate-50 ... animate-page-load">
# The inner div is: <div className={`relative z-10 transition-all duration-1000 ...`}>
# We will replace <div className={`relative z-10 transition-all duration-1000... with <Snowfall className="h-full w-full"><div className={`relative... and close it at the end.

# Let's replace the outer div's content
welcome_content = welcome_content.replace(
    '<div className={`relative z-10 transition-all duration-1000 ease-in-out flex flex-col items-center w-full max-w-4xl h-full justify-center max-h-screen py-4`}>',
    '<Snowfall count={80} minSpeed={0.3} maxSpeed={1.5}>\n      <div className={`relative z-10 transition-all duration-1000 ease-in-out flex flex-col items-center w-full max-w-4xl h-full justify-center max-h-screen py-4`}>'
)

# And add the closing tag just before the closing </div> of the main wrapper
welcome_content = welcome_content.replace(
    '      </div>\n    </div>\n  );\n}',
    '      </div>\n      </Snowfall>\n    </div>\n  );\n}'
)

with open(welcome_path, "w") as f:
    f.write(welcome_content)

print("Snowfall added to Welcome.tsx")
