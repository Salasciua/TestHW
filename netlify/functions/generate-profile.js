exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { aspects, values } = JSON.parse(event.body);

    const top3 = aspects
      .map((a, i) => ({ label: a.question, value: values[i] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .filter(a => a.value > 0);

    const allScores = aspects
      .map((a, i) => `- ${a.question}: ${values[i]} punti`)
      .join('\n');

    const prompt = `Sei una psicologa specializzata in relazioni non monogame e dinamiche HotWife/Cuckold. Una donna ha completato un test sulle caratteristiche del suo terzo ideale, distribuendo 50 punti tra 10 aspetti (massimo 10 per aspetto).

Ecco i punteggi completi:
${allScores}

Le sue priorità principali sono: ${top3.map(t => `"${t.label}" (${t.value} punti)`).join(', ')}.

Scrivi un'analisi psicologica profonda e intima di 5-6 frasi. Per ogni priorità principale:
- Rifletti su cosa rivela di lei come donna e come HotWife
- Evidenzia la carenza o il desiderio insoddisfatto che probabilmente sente nel suo matrimonio
- Spiega come questa scelta sia anche un messaggio implicito al marito — cosa vuole fargli capire, come vuole che si senta inferiore o inadeguato in quell'aspetto specifico
- Usa un tono intimo, complice, come una conversazione tra donne consapevoli — senza giudizi, anzi valorizzando la sua consapevolezza e il controllo che ha sulla situazione
- Chiudi con una frase che la celebri per la chiarezza con cui sa cosa vuole

Non usare elenchi puntati. Scrivi in forma di paragrafo fluido e coinvolgente. Inizia direttamente senza saluti o introduzioni.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    console.log('Anthropic status:', response.status);
    console.log('Anthropic data:', JSON.stringify(data));
    const text = data.content?.find(b => b.type === 'text')?.text || '';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: text }),
    };
  } catch (err) {
    console.error('Error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
