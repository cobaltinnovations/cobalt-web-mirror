import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { createUseThemedStyles, useCobaltTheme } from '@/jss/theme';

const FPS = 60;
const INTERVAL = 1000 / FPS;

const useStyles = createUseThemedStyles(() => ({
	canvas: {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 9999,
		width: '100%',
		height: '100%',
		position: 'absolute',
		pointerEvents: 'none',
	},
}));

interface Props {
	x?: number;
	y?: number;
	particleCount?: number;
	deg?: number;
	shapeSize?: number;
	spreadDeg?: number;
	launchSpeed?: number;
	opacityDeltaMultiplier?: number;
	className?: string;
}

export const Confetti = ({
	particleCount = 30,
	shapeSize = 16,
	className,
	x = 0.5,
	y = 0.5,
	deg = 270,
	spreadDeg = 30,
	launchSpeed = 1,
	opacityDeltaMultiplier = 1,
}: Props) => {
	const theme = useCobaltTheme();
	const classes = useStyles();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const ctxRef = useRef<CanvasRenderingContext2D>();
	const particlesRef = useRef<Particle[]>([]);
	const animationFrameRef = useRef(0);

	const prepareCanvas = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const ctx = canvas.getContext('2d');
		if (!ctx) {
			return;
		}

		ctxRef.current = ctx;
		const canvasWidth = window.innerWidth;
		const canvasHeight = window.innerHeight;
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
	}, []);

	const createParticles = useCallback(() => {
		const effectiveOpacityDelta = 0.004 * Math.max(0.1, opacityDeltaMultiplier);

		for (let i = 0; i < particleCount; i += 1) {
			particlesRef.current.push(
				new Particle(
					x,
					y,
					deg,
					[theme.colors.s300, theme.colors.w300, theme.colors.d300, theme.colors.p300],
					['circle', 'square'],
					shapeSize,
					spreadDeg,
					launchSpeed,
					effectiveOpacityDelta
				)
			);
		}
	}, [
		deg,
		launchSpeed,
		opacityDeltaMultiplier,
		particleCount,
		shapeSize,
		spreadDeg,
		theme.colors.d300,
		theme.colors.p300,
		theme.colors.s300,
		theme.colors.w300,
		x,
		y,
	]);

	const render = useCallback(() => {
		if (!ctxRef.current) {
			return;
		}

		let now;
		let delta;
		let then = Date.now();

		const frame = () => {
			const canvas = canvasRef.current;

			if (!ctxRef.current) {
				return;
			}

			if (!canvas) {
				return;
			}

			animationFrameRef.current = requestAnimationFrame(frame);
			now = Date.now();
			delta = now - then;

			if (delta < INTERVAL) {
				return;
			}

			ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);

			const particles = particlesRef.current;
			for (let i = particles.length - 1; i >= 0; i -= 1) {
				const p = particles[i];

				p.update();
				p.draw(ctxRef.current);

				const canvasHeight = canvas?.height ?? 0;
				const particalIsInvisible = p.opacity <= 0;
				const particleIsOffCanvas = p.y > canvasHeight;

				if (particalIsInvisible || particleIsOffCanvas) {
					particles.splice(particles.indexOf(p), 1);
				}
			}

			then = now - (delta % INTERVAL);

			if (particles.length <= 0) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};

		animationFrameRef.current = requestAnimationFrame(frame);
	}, []);

	useEffect(() => {
		prepareCanvas();
		createParticles();
		render();

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [createParticles, prepareCanvas, render]);

	return <canvas ref={canvasRef} className={classNames(classes.canvas, className)} />;
};

class Particle {
	x: number;
	y: number;
	width: number;
	height: number;
	theta: number;
	radius: number;
	vx: number;
	vy: number;
	xFriction: number;
	yFriction: number;
	gravity: number;
	opacity: number;
	opacityDelta: number;
	rotate: number;
	widthDelta: number;
	heightDelta: number;
	rotateDelta: number;
	colors: string[];
	color: { r: number; g: number; b: number };
	shapes: readonly ['circle', 'square'];
	shape: string;
	swingOffset: number;
	swingSpeed: number;
	swingAmplitude: number;

	constructor(
		x: number,
		y: number,
		deg = 0,
		colors: string[],
		shapes = ['circle', 'square'] as const,
		shapeSize = 12,
		spread = 30,
		launchSpeed = 1,
		opacityDelta = 0.004
	) {
		this.x = x * window.innerWidth;
		this.y = y * window.innerHeight;
		this.width = shapeSize;
		this.height = shapeSize;
		this.theta = (Math.PI / 180) * randomNumBetween(deg - spread, deg + spread);
		this.radius = randomNumBetween(20 * launchSpeed, 70 * launchSpeed);
		this.vx = this.radius * Math.cos(this.theta);
		this.vy = this.radius * Math.sin(this.theta);
		this.xFriction = 0.9;
		this.yFriction = 0.87;
		this.gravity = randomNumBetween(0.5, 0.6);
		this.opacity = 1;
		this.opacityDelta = opacityDelta;
		this.rotate = randomNumBetween(0, 360);
		this.widthDelta = randomNumBetween(0, 360);
		this.heightDelta = randomNumBetween(0, 360);
		this.rotateDelta = randomNumBetween(-1, 1);
		this.colors = colors;
		this.color = hexToRgb(this.colors[Math.floor(randomNumBetween(0, this.colors.length))]);
		this.shapes = shapes;
		this.shape = this.shapes[Math.floor(randomNumBetween(0, this.shapes.length))];
		this.swingOffset = randomNumBetween(0, Math.PI * 2);
		this.swingSpeed = Math.random() * 0.05 + 0.01;
		this.swingAmplitude = randomNumBetween(0.1, 0.2);
	}

	update() {
		this.vx *= this.xFriction;
		this.vy *= this.yFriction;
		this.vy += this.gravity;
		this.vx += Math.sin(this.swingOffset) * this.swingAmplitude;
		this.x += this.vx;
		this.y += this.vy;
		this.opacity -= this.opacityDelta;
		this.widthDelta += 2;
		this.heightDelta += 2;
		this.rotate += this.rotateDelta;
		this.swingOffset += this.swingSpeed;
	}

	drawSquare(ctx: CanvasRenderingContext2D) {
		ctx.fillRect(
			this.x,
			this.y,
			this.width * Math.cos((Math.PI / 180) * this.widthDelta),
			this.height * Math.sin((Math.PI / 180) * this.heightDelta)
		);
	}

	drawCircle(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.ellipse(
			this.x,
			this.y,
			Math.abs(this.width * Math.cos((Math.PI / 180) * this.widthDelta)) / 2,
			Math.abs(this.height * Math.sin((Math.PI / 180) * this.heightDelta)) / 2,
			0,
			0,
			2 * Math.PI
		);
		ctx.fill();
		ctx.closePath();
	}

	draw(ctx: CanvasRenderingContext2D) {
		const translateXAlpha = this.width * 1.3;
		const translateYAlpha = this.height * 1.3;
		ctx.translate(this.x + translateXAlpha, this.y + translateYAlpha);
		ctx.rotate((Math.PI / 100) * this.rotate);
		ctx.translate(-(this.x + translateXAlpha), -(this.y + translateYAlpha));
		ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;

		if (this.shape === 'square') {
			this.drawSquare(ctx);
		}
		if (this.shape === 'circle') {
			this.drawCircle(ctx);
		}

		ctx.resetTransform();
	}
}

export const randomNumBetween = (min: number, max: number) => Math.random() * (max - min) + min;

export const hexToRgb = (hex: string) => {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);

	return { r, g, b };
};
