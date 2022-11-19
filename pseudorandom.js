function getColorFromSeed(hue, sat, val) {
	class PRNG {
		seed = 0;

		result(seed) {
			this.seed = seed;
			let a = this.seed * 15485863;
			return ((a * a * a) % 2038074743) / 2038074743; //Will return in range 0 to 1 if seed >= 0 and -1 to 0 if seed < 0.
		}

		next() {
			this.seed++;
			let a = this.seed * 15485863;
			return ((a * a * a) % 2038074743) / 2038074743;
		}
	}

	function floatToHEX(h, s, v) {
		const res = hslToRgb(h, s, v);
		console.log(res);
		let hexstr = "#";
		for (const r of res) {
			hexstr += Math.round(r).toString(16).padStart(2, "0");
		}
		console.log(hexstr);
		return hexstr;
	}

	/**
	 * Converts an HSL color value to RGB. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes h, s, and l are contained in the set [0, 1] and
	 * returns r, g, and b in the set [0, 255].
	 *
	 * @param   Number  h       The hue
	 * @param   Number  s       The saturation
	 * @param   Number  l       The lightness
	 * @return  Array           The RGB representation
	 */
	function hslToRgb(h, s, l) {
		if (s === undefined) {
			s = 1;
		}
		if (l === undefined) {
			l = 0.5;
		}
		console.log("HSL: ", h, s, l);
		var r, g, b;

		if (s == 0) {
			r = g = b = l; // achromatic
		} else {
			function hue2rgb(p, q, t) {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			}

			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			console.log("pq: ", p, q);
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
			console.log("RGB", r, g, b);
		}

		return [r * 255, g * 255, b * 255];
	}
	const rng = new PRNG();
	
	hue = rng.result(hue);
	sat = sat || rng.next() / 4.0 + .75;
	val = val || rng.next() / 4.0 + .33;

	return floatToHEX(hue, sat, val);
}
