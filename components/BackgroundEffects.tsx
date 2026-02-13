import React, { useEffect, useRef } from 'react';

const BackgroundEffects: React.FC = () => {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const fgCanvas = fgCanvasRef.current;
    if (!bgCanvas || !fgCanvas) return;

    const bgCtx = bgCanvas.getContext('2d');
    const fgCtx = fgCanvas.getContext('2d');
    if (!bgCtx || !fgCtx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      bgCanvas.width = width;
      bgCanvas.height = height;
      fgCanvas.width = width;
      fgCanvas.height = height;
    };
    setCanvasSize();

    let mouse = { x: width / 2, y: height / 2, active: false };
    let targetParallax = { x: 0, y: 0 };
    let currentParallax = { x: 0, y: 0 };
    
    // --- Space Miniature Class (Astronauts, Satellites) ---
    const spaceAssets = [
        { emoji: '👨‍🚀', speed: 0.1, rotation: 0.005 }, 
        { emoji: '🛰️', speed: 0.08, rotation: 0.002 }, 
        { emoji: '🚀', speed: 0.2, rotation: 0 },     
        { emoji: '🛸', speed: 0.15, rotation: 0.01 },  
        { emoji: '🪐', speed: 0.04, rotation: 0.001 },
        { emoji: '👩‍🚀', speed: 0.1, rotation: -0.004 }
    ];

    class SpaceMiniature {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        emoji: string;
        opacity: number;
        rotation: number;
        rotationSpeed: number;
        floatOffset: number;
        floatSpeed: number;
        depth: number;

        constructor() {
            const asset = spaceAssets[Math.floor(Math.random() * spaceAssets.length)];
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * asset.speed;
            this.vy = Math.sin(angle) * asset.speed;
            this.size = 18 + Math.random() * 12;
            this.emoji = asset.emoji;
            this.opacity = 0.1 + Math.random() * 0.15;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = asset.rotation + (Math.random() - 0.5) * 0.003;
            this.floatOffset = Math.random() * Math.PI * 2;
            this.floatSpeed = 0.002 + Math.random() * 0.005;
            this.depth = 0.5 + Math.random() * 1.5;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            this.floatOffset += this.floatSpeed;

            // Organic drifting oscillation
            this.x += Math.sin(this.floatOffset * 0.7) * 0.15;
            this.y += Math.cos(this.floatOffset * 1.1) * 0.15;

            if (this.x < -100) this.x = width + 100;
            if (this.x > width + 100) this.x = -100;
            if (this.y < -100) this.y = height + 100;
            if (this.y > height + 100) this.y = -100;
        }

        draw() {
            if (!bgCtx) return;
            const px = this.x + currentParallax.x * this.depth;
            const py = this.y + currentParallax.y * this.depth;
            
            bgCtx.save();
            bgCtx.globalAlpha = this.opacity;
            bgCtx.font = `${this.size}px Arial`;
            bgCtx.translate(px, py);
            bgCtx.rotate(this.rotation);
            bgCtx.fillText(this.emoji, -this.size/2, this.size/2);
            bgCtx.restore();
        }
    }

    class ShootingStar {
        x: number;
        y: number;
        vx: number;
        vy: number;
        length: number;
        opacity: number;
        active: boolean;

        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * (height / 2);
            this.vx = 12 + Math.random() * 15;
            this.vy = 3 + Math.random() * 6;
            this.length = 80 + Math.random() * 150;
            this.opacity = 0;
            this.active = false;
        }

        launch() {
            this.reset();
            this.active = true;
        }

        update() {
            if (!this.active) return;
            this.x += this.vx;
            this.y += this.vy;
            if (this.opacity < 0.7) this.opacity += 0.04;

            if (this.x > width + this.length || this.y > height + this.length) {
                this.active = false;
            }
        }

        draw() {
            if (!this.active || !bgCtx) return;
            bgCtx.save();
            const grad = bgCtx.createLinearGradient(this.x, this.y, this.x - this.length, this.y - (this.length * (this.vy / this.vx)));
            grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
            grad.addColorStop(1, 'transparent');
            bgCtx.strokeStyle = grad;
            bgCtx.lineWidth = 2;
            bgCtx.lineCap = 'round';
            bgCtx.beginPath();
            bgCtx.moveTo(this.x, this.y);
            bgCtx.lineTo(this.x - this.length, this.y - (this.length * (this.vy / this.vx)));
            bgCtx.stroke();
            bgCtx.restore();
        }
    }

    class Star {
      x: number;
      y: number;
      size: number;
      opacity: number;
      twinkleSpeed: number;
      twinkleFactor: number;
      depth: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.8;
        this.opacity = 0.2 + Math.random() * 0.6;
        this.twinkleSpeed = 0.005 + Math.random() * 0.015;
        this.twinkleFactor = Math.random() * Math.PI;
        this.depth = 0.05 + Math.random() * 0.2;
        
        const tints = ['#ffffff', '#e2e8f0', '#bfdbfe', '#fef3c7', '#f472b6'];
        this.color = tints[Math.floor(Math.random() * tints.length)];
      }

      update() {
        this.twinkleFactor += this.twinkleSpeed;
      }

      draw() {
        if (!bgCtx) return;
        const px = this.x + currentParallax.x * this.depth;
        const py = this.y + currentParallax.y * this.depth;
        
        const twinkleOpacity = this.opacity * (0.3 + 0.7 * Math.abs(Math.sin(this.twinkleFactor)));
        bgCtx.fillStyle = this.color;
        bgCtx.globalAlpha = twinkleOpacity;
        bgCtx.beginPath();
        bgCtx.arc(px, py, this.size, 0, Math.PI * 2);
        bgCtx.fill();
        bgCtx.globalAlpha = 1.0;
      }
    }

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.size = Math.random() * 1.8 + 0.4;
        const colors = ['rgba(129, 140, 248, 0.6)', 'rgba(168, 85, 247, 0.6)', 'rgba(244, 114, 182, 0.6)'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        if (mouse.active) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 200;
            
            if (distance < maxDistance) {
                const force = (maxDistance - distance) / maxDistance;
                this.vx -= (dx / distance) * force * 0.04;
                this.vy -= (dy / distance) * force * 0.04;
                // Add some friction when near mouse
                this.vx *= 0.99;
                this.vy *= 0.99;
            }
        }
      }

      draw() {
        if (!bgCtx) return;
        bgCtx.fillStyle = this.color;
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fill();
      }
    }

    class Planetoid {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        depth: number;
        color: string;
        glowColor: string;
        rotation: number;
        rotationSpeed: number;

        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.2;
            this.vy = (Math.random() - 0.5) * 0.2;
            this.size = Math.random() * 5 + 3;
            this.depth = 0.3 + Math.random() * 0.7;
            const colors = [
                { base: '#4f46e5', glow: 'rgba(79, 70, 229, 0.3)' },
                { base: '#9333ea', glow: 'rgba(147, 51, 234, 0.3)' },
                { base: '#db2777', glow: 'rgba(219, 39, 119, 0.3)' },
                { base: '#0891b2', glow: 'rgba(8, 145, 178, 0.3)' }
            ];
            const chosen = colors[Math.floor(Math.random() * colors.length)];
            this.color = chosen.base;
            this.glowColor = chosen.glow;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.008;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;

            if (this.x < -100) this.x = width + 100;
            if (this.x > width + 100) this.x = -100;
            if (this.y < -100) this.y = height + 100;
            if (this.y > height + 100) this.y = -100;
        }

        draw() {
            if (!bgCtx) return;
            const px = this.x + currentParallax.x * this.depth;
            const py = this.y + currentParallax.y * this.depth;
            
            bgCtx.save();
            bgCtx.translate(px, py);
            bgCtx.rotate(this.rotation);

            bgCtx.shadowBlur = 20;
            bgCtx.shadowColor = this.glowColor;
            
            bgCtx.fillStyle = this.color;
            bgCtx.beginPath();
            bgCtx.arc(0, 0, this.size, 0, Math.PI * 2);
            bgCtx.fill();

            // Reflection highlight
            bgCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            bgCtx.beginPath();
            bgCtx.arc(-this.size/3, -this.size/3, this.size/3, 0, Math.PI * 2);
            bgCtx.fill();

            bgCtx.restore();
        }
    }

    class NebulaCloud {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        opacity: number;
        depth: number;
        color: string;

        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.08;
            this.vy = (Math.random() - 0.5) * 0.08;
            this.size = Math.random() * 200 + 100;
            this.opacity = 0.02 + Math.random() * 0.06;
            this.depth = 0.1 + Math.random() * 0.3;
            const colors = ['#6366f1', '#a855f7', '#ec4899', '#06b6d4'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < -this.size * 2) this.x = width + this.size * 2;
            if (this.x > width + this.size * 2) this.x = -this.size * 2;
            if (this.y < -this.size * 2) this.y = height + this.size * 2;
            if (this.y > height + this.size * 2) this.y = -this.size * 2;
        }

        draw() {
            if (!bgCtx) return;
            const px = this.x + currentParallax.x * this.depth;
            const py = this.y + currentParallax.y * this.depth;
            
            const gradient = bgCtx.createRadialGradient(px, py, 0, px, py, this.size);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(0.5, this.color + '33');
            gradient.addColorStop(1, 'transparent');
            
            bgCtx.save();
            bgCtx.globalAlpha = this.opacity;
            bgCtx.fillStyle = gradient;
            bgCtx.beginPath();
            bgCtx.arc(px, py, this.size, 0, Math.PI * 2);
            bgCtx.fill();
            bgCtx.restore();
        }
    }

    class CursorTrailParticle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        life: number;
        color: string;

        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 1.5;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = Math.random() * 4 + 1;
            this.life = 1.0;
            const colors = ['129, 140, 248', '168, 85, 247', '244, 114, 182'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= 0.02;
            this.size *= 0.97;
        }

        draw() {
            if (!fgCtx) return;
            fgCtx.fillStyle = `rgba(${this.color}, ${this.life * 0.7})`;
            fgCtx.beginPath();
            fgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            fgCtx.fill();
        }
    }

    const stars: Star[] = Array.from({ length: 400 }, () => new Star());
    const particles: Particle[] = Array.from({ length: 150 }, () => new Particle()); 
    const planetoids: Planetoid[] = Array.from({ length: 18 }, () => new Planetoid());
    const nebulaClouds: NebulaCloud[] = Array.from({ length: 12 }, () => new NebulaCloud());
    const spaceMiniatures: SpaceMiniature[] = Array.from({ length: 10 }, () => new SpaceMiniature());
    const trailParticles: CursorTrailParticle[] = [];
    const shootingStar = new ShootingStar();

    const animate = () => {
      if (!bgCtx || !fgCtx) return;
      
      bgCtx.clearRect(0, 0, width, height);
      fgCtx.clearRect(0, 0, width, height);
      
      // Update Parallax with smoothing
      currentParallax.x += (targetParallax.x - currentParallax.x) * 0.05;
      currentParallax.y += (targetParallax.y - currentParallax.y) * 0.05;

      // Draw Layers in Order
      stars.forEach(star => { star.update(); star.draw(); });
      nebulaClouds.forEach(cloud => { cloud.update(); cloud.draw(); });
      planetoids.forEach(p => { p.update(); p.draw(); });
      spaceMiniatures.forEach(mini => { mini.update(); mini.draw(); });

      if (!shootingStar.active && Math.random() < 0.003) {
          shootingStar.launch();
      }
      shootingStar.update();
      shootingStar.draw();

      // Spider Web / Constellation
      bgCtx.globalCompositeOperation = 'screen';
      particles.forEach((p1, i) => {
        p1.update();
        p1.draw();

        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                const opacity = 0.2 * (1 - dist / 150);
                bgCtx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
                bgCtx.lineWidth = 0.7;
                bgCtx.beginPath();
                bgCtx.moveTo(p1.x, p1.y);
                bgCtx.lineTo(p2.x, p2.y);
                bgCtx.stroke();
            }
        }

        if (mouse.active) {
            const dx = mouse.x - p1.x;
            const dy = mouse.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                const opacity = 0.4 * (1 - dist / 200);
                bgCtx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                bgCtx.lineWidth = 1;
                bgCtx.beginPath();
                bgCtx.moveTo(p1.x, p1.y);
                bgCtx.lineTo(mouse.x, mouse.y);
                bgCtx.stroke();
            }
        }
      });
      bgCtx.globalCompositeOperation = 'source-over';

      // Cursor Trail
      if (mouse.active) {
          trailParticles.push(new CursorTrailParticle(mouse.x, mouse.y));
      }
      for (let i = trailParticles.length - 1; i >= 0; i--) {
          const p = trailParticles[i];
          p.update();
          p.draw();
          if (p.life <= 0) trailParticles.splice(i, 1);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => setCanvasSize();
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      
      // Calculate parallax based on distance from center
      targetParallax.x = (width / 2 - e.clientX) * 0.05;
      targetParallax.y = (height / 2 - e.clientY) * 0.05;
    };
    const handleMouseLeave = () => { 
        mouse.active = false; 
        targetParallax.x = 0;
        targetParallax.y = 0;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0 bg-[#010206] overflow-hidden pointer-events-none">
          <div className="absolute top-[5%] -left-[10%] w-[80rem] h-[80rem] bg-indigo-950/20 rounded-full mix-blend-screen filter blur-[160px] animate-blob"></div>
          <div className="absolute -bottom-[15%] -right-[15%] w-[70rem] h-[70rem] bg-purple-950/20 rounded-full mix-blend-screen filter blur-[150px] animate-blob animation-delay-2000"></div>
          <div className="absolute top-[35%] left-[25%] w-[50rem] h-[50rem] bg-blue-950/15 rounded-full mix-blend-screen filter blur-[130px] animate-blob animation-delay-4000"></div>
          
          <canvas ref={bgCanvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 galaxy-overlay"></div>
      </div>
      <canvas ref={fgCanvasRef} className="fixed inset-0 w-full h-full z-[100] pointer-events-none" />
    </>
  );
};

export default BackgroundEffects;