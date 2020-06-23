import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { quotesArray, random, allowedKeys } from './Helper';
import ItemList from './components/ItemList';
import '../css/app.css';

let interval = null;

// TODO à faire Find a way to deal with touch/mobile keyboard

const App = () => {
	const inputRef = useRef(null);
	const outputRef = useRef(null);
	const [ duration, setDuration ] = useState(60);
	const [ started, setStarted ] = useState(false);
	const [ ended, setEnded ] = useState(false);
	const [ index, setIndex ] = useState(0);
	const [ correctIndex, setCorrectIndex ] = useState(0);
	const [ errorIndex, setErrorIndex ] = useState(0);
	const [ quote, setQuote ] = useState({});
	const [ input, setInput ] = useState('');
	const [ cpm, setCpm ] = useState(0);
	const [ wpm, setWpm ] = useState(0);
	const [ accuracy, setAccuracy ] = useState(0);
	const [ isError, setIsError ] = useState(false);
	const [ lastScore, setLastScore ] = useState('0');

	useEffect(() => {
		const newQuote = random(quotesArray)
		setQuote(newQuote);
		setInput(newQuote.quote);
	}, []);

	const handleEnd = () => {
		setEnded(true);
		setStarted(false);
		clearInterval(interval);
	}

	const setTimer = () => {
		const now = Date.now();
		const seconds = now + duration * 1000;
		interval = setInterval(() => {
			const secondLeft = Math.round((seconds - Date.now()) / 1000);
			setDuration(secondLeft);
			if (secondLeft === 0) {
				handleEnd();
			}
		}, 1000);
	}

	const handleStart = () => {
		setStarted(true);
		setEnded(false);
		setInput(quote.quote);
		inputRef.current.focus();
		setTimer();
	}

	const handleKeyDown = e => {
		e.preventDefault();
		const { key } = e;
		const quoteText = quote.quote;

		if (key === quoteText.charAt(index)) {
			setIndex(index + 1);
			const currentChar = quoteText.substring(index + 1, index + quoteText.length);
			setInput(currentChar);
			setCorrectIndex(correctIndex + 1);
			setIsError(false);
			outputRef.current.innerHTML += key;
		} else {
			if (allowedKeys.includes(key)) {
				setErrorIndex(errorIndex + 1);
				setIsError(true);
				outputRef.current.innerHTML += `<span class="text-danger">${key}</span>`;
			}
		}

		const timeRemains = ((60 - duration) / 60).toFixed(2);
		const _accuracy = Math.floor((index - errorIndex) / index * 100);
		const _wpm = Math.round(correctIndex / 5 / timeRemains);

		if (index > 5) {
			setAccuracy(_accuracy);
			setCpm(correctIndex);
			setWpm(_wpm);
		}

		if (index + 1 === quoteText.length || errorIndex > 50) {
			handleEnd();
		}
	}

	useEffect(
		() => {
			if (ended) localStorage.setItem('wpm', wpm);
		},
		[ ended, wpm ]
	)
	useEffect(() => {
		const storedScore = localStorage.getItem('wpm')
		if (storedScore) setLastScore(storedScore);
	}, [])

	return (
		<div>
			<div className="container">
				<div className="mesures-container">
					<div className="legend-container">
						<h1>Compteur de mots WPM</h1>
						<h3>Moyenne en WPM: mots par minutes</h3>
						<div className="legend">
							<span className="legend-items" style={{ background: '#F6BDC0' }}>0</span>
							<span className="legend-items" style={{ background: '#F6BDC0' }}>
								Tortue
							</span>
							<span className="legend-items" style={{ background: '#F6BDC0' }}>20</span>
							<span className="legend-items" style={{ background: '#F1959B' }}>20</span>
							<span className="legend-items" style={{ background: '#F1959B' }}>
								Moyen
							</span>
							<span className="legend-items" style={{ background: '#F1959B' }}>40</span>
							<span className="legend-items" style={{ background: '#F07470' }}>40</span>
							<span className="legend-items" style={{ background: '#F07470' }}>
								Rapide
							</span>
							<span className="legend-items" style={{ background: '#F07470' }}>80</span>
							<span className="legend-items" style={{ background: '#EA4C46' }}>80</span>
							<span className="legend-items" style={{ background: '#EA4C46' }}>
								Pro
							</span>
							<span className="legend-items" style={{ background: '#EA4C46' }}>100</span>
							<span className="legend-items" style={{ background: '#DC1C13' }}>100</span>
							<span className="legend-items" style={{ background: '#DC1C13' }}>
								Legendary
							</span>
							<span className="legend-items" style={{ background: '#DC1C13' }}>100+</span>
						</div>
					</div>
					<ul className="list">
						<ItemList name="Timer" data={duration} />
						<ItemList
							name="WPM"
							data={wpm}
							style={
								wpm > 0 && wpm < 20 ? (
									{ color: '#F6BDC0' }
								) : wpm >= 20 && wpm < 40 ? (
									{ color: '#F1959B' }
								) : wpm >= 40 && wpm < 60 ? (
									{ color: '#F07470' }
								) : wpm >= 60 && wpm < 80 ? (
									{ color: '#EA4C46' }
								) : wpm >= 80 ? (
									{ color: '#DC1C13' }
								) : (
									{}
								)
							}
						/>
						<ItemList name="CPM" data={cpm} />
						<ItemList name="Errors" data={errorIndex} />
						<ItemList name="Accuracy" data={accuracy} symbole="%" />
						<ItemList name="LastScore" data={lastScore} />
					</ul>
				</div>
				<div>
					<div>
						<div>
							<div className="infos" role="alert">
								Commencez à taper après avoir cliqué sur GO sans utiliser la touche <b>Retour en arriére</b> pour corriger.
								Les fautes seront noter et le cadre deviendra <u>ROUGE</u> pour vous prévenir. Bonne chance !
							</div>
							<div>
								{ended ? (
									<button
										onClick={() => window.location.reload()}
									>
										Réessayer
									</button>
								) : started ? (
									<button disabled>
										La Pression
									</button>
								) : (
									<button onClick={handleStart}>
										GO!
									</button>
								)}
							</div>
						</div>
						{ended ? (
							<div className="quotes-container">
								<span>"{quote.quote}"</span>
								<span>- {quote.author}</span>
							</div>
						) : started ? (
							<div
								className={`quotes${started ? ' active' : ''}${isError
									? ' is-error'
									: ''}`}
								tabIndex="0"
								onKeyDown={handleKeyDown}
								ref={inputRef}
							>
								{input}
							</div>
						) : (
							<div className="quotes" tabIndex="-1" ref={inputRef}>
								{input}
							</div>
						)}
						<div className="output" ref={outputRef} />
						<h3>Facts</h3>
						<ul className="facts">
							<li>
								Word Per Minute (WPM) ou Mots Par Minute est une mesure de calcul de combien de mots on peut taper en 1 minute.
							</li>
							<li>Character Per Minute (CPM) ou Caractères Par Minute calcul combien de caractères sont saisis par minute.</li>
							<li>
								Quelques records :{' '}
								<a
									href="https://fr.wikipedia.org/wiki/Dactylographie#Concours"
									rel="noopener noreferrer"
									target="_blank"
								>
									Helena Matoušková
								</a>{' '}
								955,10 caractères à la minute et un pourcentage d'erreur de 0,03. Ou encore{' '}
								<a
									href="https://www.ratatype.fr/learn/average-typing-speed/"
									rel="noopener noreferrer"
									target="_blank"
								>
									Stella Pajunas
								</a>{' '}
								avec 216 WPM ... no comment
							</li>
						</ul>
					</div>
				</div>
				<footer className="footer">
					<div className="footer-info">
					</div>
				</footer>
			</div>
			<p className="messageResp">Responsiveness not ready yet layout working fine but fixing mobile keyboard issues on touch devices</p>
		</div>
	)
}

ReactDOM.render(<App />, document.getElementById('root'));
