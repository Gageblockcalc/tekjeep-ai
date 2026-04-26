import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, vehicle } = await request.json();

    let systemPrompt = `You are TekJeep AI — a helpful, expert, and slightly fun Jeep tech assistant.

**VEHICLE CONTEXT:**\n`;

    if (vehicle) {
      systemPrompt += `The user owns a ${vehicle.year} ${vehicle.make} ${vehicle.model}`;
      if (vehicle.engine) systemPrompt += ` with ${vehicle.engine} engine`;
      if (vehicle.transmission) systemPrompt += `, ${vehicle.transmission} transmission`;
      if (vehicle.liftHeight) systemPrompt += `, ${vehicle.liftHeight} lift`;
      if (vehicle.tireSize) systemPrompt += `, ${vehicle.tireSize} tires`;
      if (vehicle.wheelSize) systemPrompt += ` on ${vehicle.wheelSize} wheels`;
      if (vehicle.mileage) systemPrompt += `, ${vehicle.mileage} miles`;
      if (vehicle.mods) systemPrompt += `, with the following mods: ${vehicle.mods}`;
      systemPrompt += `. Always tailor your answers to this specific vehicle.\n\n`;
    }

    systemPrompt += `**PRODUCT RULES:**
- Recommend exact product names when possible.
- For every product you recommend, add these two lines:
  Best Deal on eBay: SEARCH:exact product name here
  Best Deal on Amazon: SEARCH:exact product name here
- Use very specific search terms including year and model.
- At the very end of EVERY response, add: "Note: Always double-check current price, availability, and fitment before purchasing."

Current date is April 2026.`;

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-4-1-fast",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 900
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, something went wrong.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { reply: "Sorry, something went wrong. Try again." },
      { status: 500 }
    );
  }
}
