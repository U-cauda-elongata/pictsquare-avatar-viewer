(() => {
	'use strict';

	function* animations(href) {
		const W = 32; // 1 フレームの横幅（px）
		const H = 32; // 縦幅
		const FPS = 9; // フレームレート
		const F = 3; // フレーム数
		const N = 4; // アニメーション数

		const D = F / FPS; // 周期（s）

		const NS = 'http://www.w3.org/2000/svg';

		for (let i = 0; i < N; i++) {
			const svg = document.createElementNS(NS, 'svg');
			svg.setAttribute('xmlns', NS);

			svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
			svg.setAttribute('width', `${W}px`);
			svg.setAttribute('height', `${H}px`);

			const image = document.createElementNS(NS, 'image');
			image.setAttribute('href', href);
			image.setAttribute('y', -i * H);
			image.style.imageRendering = 'crisp-edges';
			svg.appendChild(image);

			const animate = document.createElementNS(NS, 'animate');
			animate.setAttribute('attributeName', 'x');
			animate.setAttribute('dur', `${D}s`);
			animate.setAttribute('repeatCount', 'indefinite');
			animate.setAttribute('calcMode', 'discrete');
			animate.setAttribute('values', [...Array(F).keys()].map(j => -j * W).join(';'));
			image.appendChild(animate);

			yield svg;
		}
	}

	const container = document.getElementById("view");

	function render(href) {
		container.innerText = '';
		for (const svg of animations(href)) {
			container.appendChild(svg);
		}
	}

	const form = document.getElementById('avatarForm');
	let href;
	form.avatar.addEventListener('change', e => {
		if (href) {
			URL.revokeObjectURL(href);
		}
		href = URL.createObjectURL(e.target.files[0]);
		render(href);
	});
})();
