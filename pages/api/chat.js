export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { message, history, context } = req.body;
      
      // In a real app, this would call an AI service
      // For now, we'll just echo back the message
      const response = {
        message: `I received your message: "${message}". This is a placeholder response since we're not connecting to a real AI service in this demo.`,
        entities: [],
        topic: 'general'
      };
      
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error processing chat:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error processing chat',
        error: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }
} 