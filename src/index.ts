import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Define bindings
type Bindings = {
  AI: any
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS is important since frontend and backend could be served from different URLs in dev/prod
app.use('/api/*', cors())

// Helper function to decode base64 to Uint8Array
function base64ToUint8Array(base64: string) {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return [...bytes]; // Workers AI expects number array if arrayBuffer isn't accepted
}

app.post('/api/generate', async (c) => {
  try {
    const { inputType, content, tone } = await c.req.json()
    let textToAnalyze = content

    if (inputType === 'image') {
      // Perform OCR using the vision model
      const imageBytes = base64ToUint8Array(content);
      const response = await c.env.AI.run('@cf/google/gemma-4-26b-a4b-it', {
        prompt: "Please extract the chat text from this image exactly as it is.",
        image: imageBytes
      });
      textToAnalyze = response.response || (response.choices && response.choices[0]?.message?.content);
    }

    // Generate response using text model
    const systemPrompt = `你是一个精通人际交往和沟通技巧的公关专家。用户会提供一段别人发给他的消息，以及他期望回复的语气为【${tone}】。
请你根据该语气，直接生成一段可以复制发送的回复文本。要求：口语化、符合真实聊天场景、不要有任何多余的解释和前置语。`;

    const aiResponse = await c.env.AI.run('@cf/google/gemma-4-26b-a4b-it', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: textToAnalyze }
      ]
    });

    const replyText = aiResponse.response || (aiResponse.choices && aiResponse.choices[0]?.message?.content);
    return c.json({ success: true, reply: replyText, aiRaw: aiResponse })
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

export default app
