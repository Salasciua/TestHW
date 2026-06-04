import { useState } from "react";

const ASPECTS = [
  { emoji: "👤", question: "Quanto conta che sia più giovane di tuo marito?" },
  { emoji: "😍", question: "Quanto conta che sia esteticamente bello?" },
  { emoji: "🔮", question: "Quanto ti piacerebbe che fosse qualcuno che già conosci, per cui provi un'attrazione mai messa in pratica?" },
  { emoji: "👑", question: "Quanto vuoi che sia dominante e fisico durante il rapporto, anche a costo di lasciarti segni?" },
  { emoji: "📏", question: "Quanto conta la lunghezza della sua dotazione?" },
  { emoji: "⭕", question: "Quanto conta lo spessore della sua dotazione?" },
  { emoji: "💦", question: "Quanto è importante che possa lasciare un segno molto evidente da mostrare a tuo marito?" },
  { emoji: "👄", question: "Quanto è importante che ti faccia sentire persa tra le sue labbra?" },
  { emoji: "👅", question: "Quanto conta l'abilità con la lingua?" },
  { emoji: "🔥", question: "Quanto è importante che sappia muoversi con sensualità e vigore in tutte le posizioni, durando per tutto il tempo necessario?" },
];

const MAX_TOTAL = 50;
const MAX_PER = 10;

export default function App() {
  const [screen, setScreen] = useState("intro");
  const [values, setValues] = useState(Array(10).fill(0));
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const total = values.reduce((a, b) => a + b, 0);
  const remaining = MAX_TOTAL - total;

  function handleSlider(idx, raw) {
    const newVal = Math.min(parseInt(raw), MAX_PER);
    const otherSum = values.reduce((a, b, i) => i !== idx ? a + b : a, 0);
    const clamped = Math.min(newVal, MAX_TOTAL - otherSum);
    setValues(v => v.map((val, i) => i === idx ? clamped : val));
  }

  async function handleSubmit() {
    setError("");
    setScreen("loading");
    try {
      const res = await fetch("/.netlify/functions/generate-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aspects: ASPECTS, values }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
      setScreen("result");
    } catch (e) {
      setError("Errore nella generazione del profilo. Riprova.");
      setScreen("quiz");
    }
  }

  function reset() {
    setValues(Array(10).fill(0));
    setResult("");
    setError("");
    setScreen("intro");
  }

  return (
    <>
      <div className="bg-texture" />
      <div className="container">

        {screen === "intro" && (
          <div className="screen active">
            <div className="intro-eyebrow">Quiz psicologico</div>
            <h1 className="intro-title">
              Cosa cerchi <em>veramente</em> nel terzo di coppia?
            </h1>
            <div className="divider" />
            <p className="intro-text">
              Lo sapevi che le caratteristiche che sogni nel terzo per i tuoi giochi possono rivelarti tanti aspetti che magari non avevi mai considerato su cosa inconsciamente ti eccita nel tuo ruolo di HotWife?
              <br /><br />
              Distribuisci 50 punti totali tra le 10 caratteristiche che vedi di seguito e la nostra AI addestrata con oltre 1.000 libri e 2.000 siti sulle relazioni non monogame ti farà veramente capire chi sei.
            </p>
            <button className="btn" onClick={() => setScreen("quiz")}>
              Inizia il quiz →
            </button>
          </div>
        )}

        {screen === "quiz" && (
          <div className="screen active">
            <div className="quiz-header">
              <div className="quiz-eyebrow">Distribuisci i tuoi punti</div>
              <div className="quiz-title">Massimo 10 punti per caratteristica, 50 in totale</div>
            </div>

            <div className="budget-wrap">
              <div className="budget-left">
                <div className={`budget-num ${remaining === 0 ? "done" : ""}`}>{remaining}</div>
                <div className="budget-sublabel">punti rimasti</div>
              </div>
              <div className="budget-bar-wrap">
                <div className="budget-bar-track">
                  <div className="budget-bar-fill" style={{ width: `${(total / MAX_TOTAL) * 100}%` }} />
                </div>
                <div className="budget-bar-label">{total} / {MAX_TOTAL}</div>
              </div>
            </div>

            {ASPECTS.map((a, i) => (
              <div key={i} className="aspect-card">
                <div className="aspect-header">
                  <div className="aspect-left">
                    <span className="aspect-emoji">{a.emoji}</span>
                    <div className="aspect-question">{a.question}</div>
                  </div>
                  <div className={`aspect-value ${values[i] === MAX_PER ? "maxed" : ""}`}>{values[i]}</div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={values[i]}
                  onChange={(e) => handleSlider(i, e.target.value)}
                />
              </div>
            ))}

            {error && <p className="hint" style={{ color: "#c0392b" }}>{error}</p>}
            {remaining > 0 && <p className="hint">Hai ancora {remaining} punti da assegnare</p>}

            <button className="btn" onClick={handleSubmit} disabled={remaining !== 0} style={{ marginTop: "1.5rem" }}>
              Scopri il tuo profilo →
            </button>
            <button className="btn btn-ghost" onClick={reset}>← Ricomincia</button>
          </div>
        )}

        {screen === "loading" && (
          <div className="screen active">
            <div className="loading-wrap">
              <div className="loading-title">Stiamo analizzando i tuoi desideri...</div>
              <div className="loading-sub">elaborazione in corso</div>
              <div className="pulse-dots"><span /><span /><span /></div>
            </div>
          </div>
        )}

        {screen === "result" && (
          <div className="screen active">
            <div className="result-eyebrow">La tua analisi</div>
            <div className="result-title">Ecco cosa rivela di te</div>

            <div className="score-grid">
              {ASPECTS.map((a, i) => (
                <div key={i} className="score-item">
                  <span className="score-item-emoji">{a.emoji}</span>
                  <span className={`score-item-val ${values[i] >= 8 ? "high" : ""}`}>{values[i]}</span>
                </div>
              ))}
            </div>

            <div className="result-card">
              <div className="result-label">La tua psicologia</div>
              <div className="result-text">
                {result.split("\n").filter(l => l.trim()).map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>

            <div className="result-footer">
              <div className="result-footer-line" />
              <div className="result-footer-text">Analisi generata da AI</div>
              <div className="result-footer-line" />
            </div>

            <button className="btn btn-ghost" onClick={reset} style={{ marginTop: "0" }}>← Rifai il quiz</button>
          </div>
        )}

      </div>
    </>
  );
}
