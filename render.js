(() => {
	'use strict';

	const animParams = {};

	function* animations(href, width, height) {
		const NS = 'http://www.w3.org/2000/svg';

		const { frames, rows, columns, fps } = animParams;

		const w0 = width / (columns * frames); // 1 フレームの横幅（px）
		const w1 = width / columns; // 1 アニメーションの横幅（px）
		const h0 = height / rows; // 1 フレームの縦幅（px）
		const d = frames / fps; // 周期（s）

		for (let x = 0; x < columns; x++) {
			const xs = [...Array(frames).keys()].map(i => -x * w1 - i * w0).join(';');
			for (let y = 0; y < rows; y++) {
				const svg = document.createElementNS(NS, 'svg');
				svg.setAttribute('xmlns', NS);

				svg.setAttribute('viewBox', `0 0 ${w0} ${h0}`);
				svg.setAttribute('width', `${w0}px`);
				svg.setAttribute('height', `${h0}px`);

				const image = document.createElementNS(NS, 'image');
				image.setAttribute('href', href);
				image.setAttribute('x', -x * w1);
				image.setAttribute('y', -y * h0);
				image.style.imageRendering = 'crisp-edges';
				svg.appendChild(image);

				const animate = document.createElementNS(NS, 'animate');
				animate.setAttribute('attributeName', 'x');
				if (Number.isFinite(d)) {
					animate.setAttribute('dur', `${d}s`);
				}
				animate.setAttribute('repeatCount', 'indefinite');
				animate.setAttribute('calcMode', 'discrete');
				animate.setAttribute('values', xs);
				image.appendChild(animate);

				yield svg;
			}
		}
	}

	let href;
	const imageView = document.getElementById("image");
	const animationView = document.getElementById("animations");

	function render() {
		function renderSVGs() {
			animationView.innerText = '';
			const w = imageView.naturalWidth;
			const h = imageView.naturalHeight;
			for (const svg of animations(href, w, h)) {
				animationView.appendChild(svg);
			}
		}
		if (!href) {
			return;
		}
		animationView.innerText = '';
		if (imageView.src === href) {
			renderSVGs();
		} else {
			imageView.addEventListener('load', renderSVGs, { once: true });
			imageView.src = href;
		}
	}

	window.addEventListener('popstate', e => {
		imageView.removeAttribute('src');
		if (href) {
			URL.revokeObjectURL(href);
		}
		const url = new URLSearchParams(location.search).get('url');
		if (url) {
			href = url;
			render();
		} else if (e.state) {
			href = URL.createObjectURL(e.state);
			render();
		} else {
			animationView.innerText = '';
		}
	});

	const form = document.getElementById('sprite-form');

	form.addEventListener('submit', e => {
		e.preventDefault();
		if (e.target.url.value !== new URLSearchParams(location.search).get('url')) {
			if (href) {
				URL.revokeObjectURL(href);
			}
			href = e.target.url.value;
			history.pushState(null, '', `?url=${href}`);
			render();
		}
	});

	form.image.addEventListener('change', e => {
		const blob = e.target.files[0];
		history.pushState(blob, '', location.pathname);
		if (href) {
			URL.revokeObjectURL(href);
		}
		href = URL.createObjectURL(blob);
		render();
	});

	function updateAnimParams() {
		const frames = Number(form.frames.value);
		const rows = Number(form.rows.value);
		const columns = Number(form.columns.value);
		const fps = Number(form.fps.value);
		if (![frames, rows, columns, fps].some(x => Number.isNaN(x))) {
			animParams.frames = frames;
			animParams.rows = rows;
			animParams.columns = columns;
			animParams.fps = fps;
		}
		render();
	}

	for (const k of ['frames', 'rows', 'columns', 'fps']) {
		form[k].addEventListener('change', updateAnimParams);
	}

	const params = new URLSearchParams(location.search);
	for (const e of form.elements) {
		if (e.name) {
			const value = params.get(e.name);
			if (value) {
				try {
					e.value = value;
				} catch (DOMException) {
					// noop
				}
			}
		}
	}
	updateAnimParams();

	const url = params.get('url');
	if (url) {
		href = form.url.value = url;
		render();
	} else if (history.state) {
		href = URL.createObjectURL(history.state);
		render();
	}
})();
