const DATA = {
	'1': ['windows', 'server'],
	'2': ['crystalzoom'],
	'3': ['python', 'crystalzoom', 'linux'],
	'4': ['crystalzoom'],
	'7': ['java', 'crystalzoom', 'cpp', 'js'],
	'9': ['crystalzoom'],
	'10': ['ruby', 'rails']
};

class OccurrencesCounter {
	#parsedData;
	#state;

	constructor(data) {
		this.data = data;
		this.newObj = {};
		this.#parsedData;
		this.#state = {
			occurrences: 0,
			valueWithCount: '',
			valueIndex: null,
			isSequencial: false,
			lastFoundKey: null,
			consecutivesData: {
				initialIndex: null,
				lastIndex: null
			}
		};
	}

	#parseData() {
		const clonedObj = JSON.parse(JSON.stringify(this.data));
		this.#parsedData = Object.entries(clonedObj);
	}

	get parsedData() {
		return this.#parsedData;
	}

	set setData(d) {
		this.data = d;
	}

	#setState(newState) {
		this.#state = {
			...this.#state,
			...newState
		};
	}

	#updateObj(updateData) {
		this.newObj = {
			...this.newObj,
			...updateData
		};
	}

	#deleteKeyFromObj(key) {
		delete this.newObj[key];
	}

	#processElement(key, arrValue, value) {
		const { occurrences, isSequencial } = this.#state;

		const currentKey = Number(key);
		const valueOccurrences = isSequencial ? occurrences + 1 : 1;

		return this.#setState({
			valueWithCount: `${value}${valueOccurrences}`,
			valueIndex: arrValue.indexOf(value),
			lastFoundKey: currentKey,
			occurrences: isSequencial ? occurrences + 1 : 1
		});
	}

	#processSequencial(currentKey, currentValue) {
		const { consecutivesData, valueWithCount, valueIndex } = this.#state;

		currentValue.splice(valueIndex, 1);

		const { initialIndex, lastIndex } = consecutivesData;

		const startSequenceIndex = lastIndex ? initialIndex : Object.keys(this.newObj).length;

		this.#setState({
			consecutivesData: {
				initialIndex: startSequenceIndex,
				lastIndex: currentKey
			}
		});

		this.#updateObj({
			[startSequenceIndex]: [valueWithCount],
			[currentKey]: currentValue
		});

		return !currentValue.length && this.#deleteKeyFromObj(currentKey);
	}

	#setIsSecuencial(key) {
		const { lastFoundKey } = this.#state;
		const currentKey = Number(key);

		this.#setState({
			isSequencial: currentKey === lastFoundKey + 1
		});
	}

	#processArrayWithQueryValue(key, arrValue, value) {
		this.#setIsSecuencial(key);
		this.#processElement(key, arrValue, value);

		const { isSequencial } = this.#state;

		if (isSequencial) return this.#processSequencial(key, arrValue);

		const { valueIndex, valueWithCount } = this.#state;
		arrValue[valueIndex] = valueWithCount;

		return this.#updateObj({
			[key]: arrValue
		});
	}

	evaluate(value) {
		this.#parseData();
		this.#parsedData.forEach(([key, arrValue]) => {
			if (!arrValue.includes(value)) return (this.newObj = { ...this.newObj, [key]: arrValue });
			this.#processArrayWithQueryValue(key, arrValue, value);
		});

		return JSON.stringify(this.newObj);
	}
}

const counter = new OccurrencesCounter();
counter.setData = DATA;
console.log('evaluate', counter.evaluate('crystalzoom'));
