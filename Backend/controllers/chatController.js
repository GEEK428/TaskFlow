const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chat = require('../models/Chat');


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @desc    Get user chat history
 * @route   GET /api/chat
 * @access  Private
 */
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    let chat = await Chat.findOne({ user: userId });
    if (!chat) {
      chat = await Chat.create({ user: userId, messages: [] });
    }
    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Send message to Flow AI (Streaming SSE)
 * @route   POST /api/chat
 * @access  Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, history } = req.body;
    const userId = req.user._id;

    if (!message) return res.status(400).json({ error: 'Message is required' });

    
    const systemPrompt = `You are Flow AI, a sharp productivity coach and senior colleague.
Your role is to help users with work, development, and efficiency.
Rules:
- Be brief (1-3 sentences).
- Give smart, senior colleague-level advice.
- If asked something unrelated to work/productivity, gently bring it back to focus.`;

   
    const chatHistory = (history || []).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); 

    
    const models = ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"];
    let streamResult = null;

    for (const modelName of models) {
      let success = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          res.write(`data: ${JSON.stringify({ text: '', status: 'connecting', model: modelName })}\n\n`);
          
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] }
          });

          const chatSession = model.startChat({
            history: chatHistory,
            generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
          });

          streamResult = await Promise.race([
            chatSession.sendMessageStream(message),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
          ]);
          
          success = true;
          break; 
        } catch (error) {
          if (attempt === 2) break;
          await new Promise(r => setTimeout(r, 500));
        }
      }
      if (success) break; 
    }

    if (!streamResult) throw new Error("AI over capacity");

    let fullAiResponse = '';

   
    try {
      for await (const chunk of streamResult.stream) {
        try {
          const chunkText = chunk.text();
          if (chunkText) {
            fullAiResponse += chunkText;
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
          }
        } catch (e) {}
      }
    } catch (e) {}

    
    try {
      let chatDoc = await Chat.findOne({ user: userId });
      if (!chatDoc) chatDoc = new Chat({ user: userId, messages: [] });
      
      chatDoc.messages.push({ role: 'user', content: message });
      chatDoc.messages.push({ role: 'assistant', content: fullAiResponse });
      await chatDoc.save();
    } catch (e) { console.error('DB Error:', e); }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('FlowAI Error:', error);
    res.write(`data: ${JSON.stringify({ error: true, message: error.message })}\n\n`);
    res.end();
  }
};
