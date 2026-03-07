// ═══════════════════════════════════════════
//  Neural Network Scan Animation (Premium Edition)
// ═══════════════════════════════════════════
//  Canvas-based animated visualization of neural
//  network inference — nodes, connections, particles
//  flowing through layers during crop analysis.
// ═══════════════════════════════════════════

window.NeuralNetAnim = class NeuralNetAnim {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.running = false;
        this.progress = 0;           // 0–1
        this.phase = 'idle';         // idle | scanning | complete
        this.nodes = [];
        this.connections = [];
        this.particles = [];
        this.sparks = [];
        this.frameId = null;
        this.t = 0;

        // Brand Palette (Standardized)
        this.colors = {
            cyan: '#00E5FF',
            blue: '#007BFF',
            cyanGlow: 'rgba(0, 229, 255, 0.4)',
            blueGlow: 'rgba(0, 123, 255, 0.4)',
            nodeBase: 'rgba(0, 229, 255, 0.2)',
            nodeActive: 'rgba(0, 229, 255, 1.0)',
            lineBase: 'rgba(255, 255, 255, 0.05)',
            lineActive: 'rgba(0, 229, 255, 0.4)'
        };

        this._setupLayers();
        this._resize();
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        const r = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.W = rect.width;
        this.H = rect.height;
        this.canvas.width = this.W * r;
        this.canvas.height = this.H * r;
        this.ctx.scale(r, r);
        this._setupLayers();
    }

    _setupLayers() {
        this.nodes = [];
        this.connections = [];

        // Define network layers: [nodeCount, label]
        const layers = [
            [6, 'Input'],
            [10, 'Conv'],
            [12, 'Conv'],
            [8, 'Pool'],
            [10, 'Conv'],
            [6, 'Dense'],
            [4, 'Dense'],
            [3, 'Out'],
        ];

        const padX = 50;
        const padY = 30;
        const layerGap = (this.W - padX * 2) / (layers.length - 1);

        layers.forEach(([count, label], li) => {
            const x = padX + li * layerGap;
            const nodeGap = (this.H - padY * 2) / (count + 1);
            for (let ni = 0; ni < count; ni++) {
                const y = padY + (ni + 1) * nodeGap;
                this.nodes.push({ x, y, layer: li, label, radius: 3, energy: 0, active: false });
            }
        });

        // Connect adjacent layers (Optimized density for premium feel)
        for (let li = 0; li < layers.length - 1; li++) {
            const fromNodes = this.nodes.filter(n => n.layer === li);
            const toNodes = this.nodes.filter(n => n.layer === li + 1);
            fromNodes.forEach(from => {
                // Connect to a few random nodes in next layer
                const connectCount = Math.min(toNodes.length, 2 + Math.floor(Math.random() * 2));
                const shuffled = [...toNodes].sort(() => Math.random() - 0.5);
                for (let i = 0; i < connectCount; i++) {
                    this.connections.push({ from, to: shuffled[i], weight: 0.3 + Math.random() * 0.7 });
                }
            });
        }
    }

    start() {
        this.running = true;
        this.phase = 'scanning';
        this.progress = 0;
        this.particles = [];
        this.sparks = [];
        this.t = 0;
        this._loop();
    }

    stop() {
        this.running = false;
        this.phase = 'idle';
        if (this.frameId) cancelAnimationFrame(this.frameId);
    }

    setProgress(pct) {
        this.progress = Math.min(1, Math.max(0, pct / 100));
        if (pct >= 100) this.phase = 'complete';
    }

    _loop() {
        if (!this.running) return;
        this.t += 0.016;
        this._update();
        this._draw();
        this.frameId = requestAnimationFrame(() => this._loop());
    }

    _update() {
        // In idle mode (homepage), simulate a smooth scanning wave
        if (this.phase === 'scanning' && this.progress === 0 && !window._scanProgressCallback) {
            const wavePos = (Math.sin(this.t * 0.4) + 1) / 2; // Slower, smoother wave
            this.progress = wavePos;
        }

        const activeLayer = Math.floor(this.progress * (8 - 1));

        // Activate nodes based on progress with smooth energy transitions
        this.nodes.forEach(n => {
            n.active = n.layer <= activeLayer;
            if (n.active) {
                n.energy = Math.min(1, n.energy + 0.06);
            } else {
                n.energy = Math.max(0.05, n.energy - 0.02);
            }
        });

        // Spawn high-speed particles along active connections
        if (Math.random() < 0.4) {
            const activeConns = this.connections.filter(c => c.from.active && c.to.layer <= activeLayer + 1);
            if (activeConns.length > 0) {
                const conn = activeConns[Math.floor(Math.random() * activeConns.length)];
                this.particles.push({
                    x: conn.from.x, y: conn.from.y,
                    tx: conn.to.x, ty: conn.to.y,
                    progress: 0,
                    speed: 0.03 + Math.random() * 0.04,
                    size: 1.5 + Math.random() * 1.5,
                    alpha: 1.0,
                    color: Math.random() > 0.5 ? this.colors.cyan : this.colors.blue
                });
            }
        }

        // Spawn micro-sparks at active nodes
        if (Math.random() < 0.15) {
            const activeNodes = this.nodes.filter(n => n.active);
            if (activeNodes.length > 0) {
                const node = activeNodes[Math.floor(Math.random() * activeNodes.length)];
                this.sparks.push({
                    x: node.x, y: node.y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    life: 1, decay: 0.03 + Math.random() * 0.03,
                    size: 1 + Math.random() * 1.5
                });
            }
        }

        // Update particles
        this.particles = this.particles.filter(p => {
            p.progress += p.speed;
            const ease = 1 - Math.pow(1 - p.progress, 3); // Cubic ease out
            p.x = p.x + (p.tx - p.x) * ease * 0.2;
            p.y = p.y + (p.ty - p.y) * ease * 0.2;
            p.alpha = 1 - p.progress;
            return p.progress < 0.95;
        });

        // Update sparks
        this.sparks = this.sparks.filter(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.life -= s.decay;
            return s.life > 0;
        });

        // Completion gentle pulse
        if (this.phase === 'complete') {
            this.nodes.forEach(n => {
                n.energy = 0.7 + Math.sin(this.t * 3 + n.layer) * 0.3;
            });
        }
    }

    _draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.W, this.H);

        // Subdued background radial glow (Cyan)
        const grad = ctx.createRadialGradient(this.W / 2, this.H / 2, 0, this.W / 2, this.H / 2, this.W * 0.8);
        grad.addColorStop(0, 'rgba(0, 229, 255, 0.03)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.W, this.H);

        // Draw connections (Thin, sophisticated lines)
        this.connections.forEach(c => {
            const energy = Math.min(c.from.energy, c.to.energy || 0);
            const baseAlpha = 0.05;
            const activeAlpha = 0.3;

            ctx.strokeStyle = energy > 0.1
                ? `rgba(0, 229, 255, ${baseAlpha + energy * (activeAlpha - baseAlpha)})`
                : this.colors.lineBase;

            ctx.lineWidth = 0.5 + energy * 1.5;

            ctx.beginPath();
            ctx.moveTo(c.from.x, c.from.y);
            ctx.lineTo(c.to.x, c.to.y);
            ctx.stroke();
        });

        // Draw particles with glow
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Draw sparks
        this.sparks.forEach(s => {
            ctx.fillStyle = `rgba(0, 229, 255, ${s.life * 0.6})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw nodes (Refined dots with outer rings)
        this.nodes.forEach(n => {
            const e = n.energy;

            // Glow for active nodes
            if (e > 0.2) {
                ctx.shadowColor = `rgba(0, 229, 255, ${0.1 + e * 0.4})`;
                ctx.shadowBlur = 8 + e * 10;
            }

            // Outer ring (Transparent to Active Cyan)
            ctx.strokeStyle = `rgba(0, 229, 255, ${0.1 + e * 0.5})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius + 2 + e * 4, 0, Math.PI * 2);
            ctx.stroke();

            // Core
            ctx.fillStyle = e > 0.5 ? this.colors.cyan : `rgba(255, 255, 255, ${0.1 + e * 0.4})`;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius + e, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
        });

        // Layer labels at bottom (Premium Monospace)
        if (this.W > 450) {
            const labels = ['INPUT', 'CONV_1', 'CONV_2', 'POOL', 'CONV_3', 'FC_1', 'FC_2', 'OUTPUT'];
            const padX = 50;
            const gap = (this.W - padX * 2) / (labels.length - 1);
            ctx.font = '900 8px "Inter", monospace';
            ctx.textAlign = 'center';
            ctx.letterSpacing = '1px';

            labels.forEach((label, i) => {
                const x = padX + i * gap;
                const activeLayer = Math.floor(this.progress * 7);
                ctx.fillStyle = i <= activeLayer
                    ? this.colors.cyan
                    : 'rgba(255, 255, 255, 0.2)';
                ctx.fillText(label, x, this.H - 6);
            });
        }
    }

    destroy() {
        this.stop();
        window.removeEventListener('resize', () => this._resize());
    }
};
