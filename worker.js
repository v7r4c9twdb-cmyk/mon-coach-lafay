
export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "https://v7r4c9twdb-cmyk.github.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (request.method !== "POST") {
      return new Response("Méthode non autorisée", {
        status: 405,
        headers: cors
      });
    }

    try {
      const { image, menuText, profile } = await request.json();

      const prompt = `
Tu es un coach sportif et nutritionnel spécialisé dans la méthode Lafay.
Analyse le menu de cantine fourni et propose :
- Les meilleurs choix à la cantine.
- Les repas à préparer à la maison pour compléter la journée.
- Un programme alimentaire sur 7 jours.
- Une liste de courses économique.

Profil :
${JSON.stringify(profile || {})}

Menu de cantine :
${menuText || "Analyse la photo du menu."}

Privilégie la prise de muscle sans prise excessive de graisse abdominale.
Donne des quantités précises et des conseils simples.
`;

      const content = [
        { type: "input_text", text: prompt }
      ];

      if (image) {
        content.push({
          type: "input_image",
          image_url: image
        });
      }

      const response = await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-4.1-mini",
            input: [{
              role: "user",
              content
            }]
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Erreur OpenAI");
      }

      return new Response(
        JSON.stringify({ result: result.output_text }),
        {
          headers: {
            ...cors,
            "Content-Type": "application/json"
          }
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: {
            ...cors,
            "Content-Type": "application/json"
          }
        }
      );
    }
  }
};
