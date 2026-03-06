// ═══════════════════════════════════════════
//  Neural Network Scan Animation (Solid Edition)
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
                this.nodes.push({ x, y, layer: li, label, radius: 4, energy: 0, active: false });
            }
        });

        // Connect adjacent layers (moderately dense)
        for (let li = 0; li < layers.length - 1; li++) {
            const fromNodes = this.nodes.filter(n => n.layer === li);
            const toNodes = this.nodes.filter(n => n.layer === li + 1);
            fromNodes.forEach(from => {
                // Connect to 3-5 random nodes in next layer for "solid" look
                const connectCount = Math.min(toNodes.length, 3 + Math.floor(Math.random() * 3));
                const shuffled = [...toNodes].sort(() => Math.random() - 0.5);
                for (let i = 0; i < connectCount; i++) {
                    this.connections.push({ from, to: shuffled[i], weight: 0.5 + Math.random() * 0.5 });
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
        // In idle mode (homepage), simulate a scanning wave
        if (this.phase === 'scanning' && this.progress === 0 && !window._scanProgressCallback) {
            const wavePos = (Math.sin(this.t * 0.5) + 1) / 2; // 0-1 wave
            this.progress = wavePos;
        }

        const activeLayer = Math.floor(this.progress * (8 - 1));

        // Activate nodes based on progress
        this.nodes.forEach(n => {
            n.active = n.layer <= activeLayer;
            if (n.active) {
                n.energy = Math.min(1, n.energy + 0.08);
            } else {
                n.energy = Math.max(0.1, n.energy - 0.03); // Solid background energy
            }
        });

        // Spawn particles along active connections (More dense for "solid")
        if (Math.random() < 0.5) {
            const activeConns = this.connections.filter(c => c.from.active && c.to.layer <= activeLayer + 1);
            if (activeConns.length > 0) {
                const conn = activeConns[Math.floor(Math.random() * activeConns.length)];
                this.particles.push({
                    x: conn.from.x, y: conn.from.y,
                    tx: conn.to.x, ty: conn.to.y,
                    progress: 0, speed: 0.02 + Math.random() * 0.03,
                    size: 2 + Math.random() * 2,
                    alpha: 1.0
                });
            }
        }

        // Spawn sparks at active nodes
        if (Math.random() < 0.2) {
            const activeNodes = this.nodes.filter(n => n.active);
            if (activeNodes.length > 0) {
                const node = activeNodes[Math.floor(Math.random() * activeNodes.length)];
                this.sparks.push({
                    x: node.x, y: node.y,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    life: 1, decay: 0.02 + Math.random() * 0.02,
                    size: 1.5 + Math.random() * 2
                });
            }
        }

        // Update particles
        this.particles = this.particles.filter(p => {
            p.progress += p.speed;
            p.x = p.x + (p.tx - p.x) * p.speed * 4;
            p.y = p.y + (p.ty - p.y) * p.speed * 4;
            p.alpha = 1 - p.progress;
            return p.progress < 1;
        });

        // Update sparks
        this.sparks = this.sparks.filter(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.life -= s.decay;
            return s.life > 0;
        });

        // Completion pulse
        if (this.phase === 'complete') {
            this.nodes.forEach(n => {
                n.energy = 0.8 + Math.sin(this.t * 4 + n.layer) * 0.2;
            });
        }
    }

    _draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.W, this.H);

        // Background glow
        const grad = ctx.createRadialGradient(this.W / 2, this.H / 2, 0, this.W / 2, this.H / 2, this.W * 0.7);
        grad.addColorStop(0, 'rgba(26, 175, 99, 0.05)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.W, this.H);

        // Draw connections (Solid lines)
        this.connections.forEach(c => {
            const energy = Math.min(c.from.energy, c.to.energy || 0);
            const baseAlpha = 0.15;
            const activeAlpha = 0.6;

            ctx.strokeStyle = `rgba(26, 175, 99, ${baseAlpha + energy * (activeAlpha - baseAlpha)})`;
            ctx.lineWidth = 1 + energy * 2;

            ctx.beginPath();
            ctx.moveTo(c.from.x, c.from.y);
            ctx.lineTo(c.to.x, c.to.y);
            ctx.stroke();
        });

        // Draw particles
        this.particles.forEach(p => {
            ctx.fillStyle = `rgba(26, 255, 130, ${p.alpha})`;
            ctx.shadowColor = 'rgba(26, 255, 130, 0.9)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Draw sparks
        this.sparks.forEach(s => {
            ctx.fillStyle = `rgba(26, 255, 130, ${s.life * 0.8})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw nodes (More prominent)
        this.nodes.forEach(n => {
            const e = n.energy;

            // Glow
            ctx.shadowColor = `rgba(26, 175, 99, ${0.2 + e * 0.8})`;
            ctx.shadowBlur = 10 + e * 15;

            // Outer ring
            ctx.strokeStyle = `rgba(26, 255, 130, ${0.4 + e * 0.6})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius + 3 + e * 3, 0, Math.PI * 2);
            ctx.stroke();

            // Core (Solid)
            ctx.fillStyle = `rgba(26, 255, 130, ${0.6 + e * 0.4})`;
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius + e * 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
        });

        // Layer labels at bottom (Solid)
        if (this.W > 400) {
            const labels = ['Input', 'Conv1', 'Conv2', 'Pool', 'Conv3', 'FC1', 'FC2', 'Output'];
            const padX = 50;
            const gap = (this.W - padX * 2) / (labels.length - 1);
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.textAlign = 'center';
            labels.forEach((label, i) => {
                const x = padX + i * gap;
                const activeLayer = Math.floor(this.progress * 7);
                ctx.fillStyle = i <= activeLayer
                    ? '#00E5FF'
                    : 'rgba(255, 255, 255, 0.4)';
                ctx.fillText(label.toUpperCase(), x, this.H - 8);
            });
        }
    }

    destroy() {
        this.stop();
        window.removeEventListener('resize', () => this._resize());
    }
};
