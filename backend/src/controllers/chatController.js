import { ChatConversation, ChatMessage, Profile, DietPlan, WorkoutPlan, AIUsageLog } from '../models/index.js';
import { callAI } from '../services/aiService.js';

// Helper to build AI Coach System Context
const buildCoachContext = (profile, dietPlan, workoutPlan) => {
  let context = `You are AstraFit AI Coach, a supportive, certified fitness instructor and sports nutritionist.
Provide practical, encouraging, and clear fitness & diet advice. Keep responses concise (2-4 paragraphs).

USER CONTEXT:`;

  if (profile) {
    context += `
- Name: User
- Age: ${profile.age}, Gender: ${profile.gender}
- Goal: ${profile.goal}
- Experience: ${profile.fitnessExperience}
- Dietary Preference: ${profile.dietaryPreference}
- Allergies: ${profile.allergies?.join(', ') || 'None'}
- Environment: ${profile.workoutEnvironment}`;
  }

  if (dietPlan) {
    context += `
- Active Diet Plan: ${dietPlan.dailyCalories} kcal/day (Protein: ${dietPlan.macros?.protein}g, Carbs: ${dietPlan.macros?.carbs}g, Fat: ${dietPlan.macros?.fat}g)`;
  }

  if (workoutPlan) {
    context += `
- Active Workout Split: ${workoutPlan.title} (${workoutPlan.splitType})`;
  }

  context += `\n\nSafety Rule: Always include a brief disclaimer if user asks about medical symptoms or extreme starvation diets.`;
  return context;
};

// GET /api/chat/messages — Get message history for active conversation
export const getMessages = async (req, res) => {
  try {
    let conversation = await ChatConversation.findOne({ userId: req.user._id });
    if (!conversation) {
      conversation = await ChatConversation.create({
        userId: req.user._id,
        title: 'AI Coaching Chat',
      });
    }

    const messages = await ChatMessage.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    return res.status(200).json({
      success: true,
      data: { conversationId: conversation._id, messages },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch chat history.' });
  }
};

// POST /api/chat/send — Send user query and generate AI response
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    // 1. Get or create user conversation
    let conversation = await ChatConversation.findOne({ userId: req.user._id });
    if (!conversation) {
      conversation = await ChatConversation.create({
        userId: req.user._id,
        title: 'AI Coaching Chat',
      });
    }

    // 2. Save user message to DB
    const userMsg = await ChatMessage.create({
      conversationId: conversation._id,
      sender: 'user',
      message: message.trim(),
    });

    // 3. Fetch user context (RAG context)
    const [profile, dietPlan, workoutPlan, pastMessages] = await Promise.all([
      Profile.findOne({ userId: req.user._id }),
      DietPlan.findOne({ userId: req.user._id, isActive: true }),
      WorkoutPlan.findOne({ userId: req.user._id, isActive: true }),
      ChatMessage.find({ conversationId: conversation._id }).sort({ createdAt: -1 }).limit(6),
    ]);

    // Format conversation history for prompt
    const historyText = pastMessages
      .reverse()
      .map(m => `${m.sender === 'user' ? 'User' : 'Coach'}: ${m.message}`)
      .join('\n');

    const systemContext = buildCoachContext(profile, dietPlan, workoutPlan);
    const fullPrompt = `${systemContext}\n\nRECENT CHAT HISTORY:\n${historyText}\n\nRespond helpful and concisely to the latest user message.`;

    // 4. Call AI service
    const { text, usage, provider, latency } = await callAI(fullPrompt);

    // 5. Save AI response to DB
    const aiMsg = await ChatMessage.create({
      conversationId: conversation._id,
      sender: 'ai',
      message: text,
    });

    // 6. Log AI usage
    await AIUsageLog.create({
      userId: req.user._id,
      feature: 'chat',
      requestType: 'chat',
      provider,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      latencyMs: latency,
    });

    return res.status(200).json({
      success: true,
      data: { userMessage: userMsg, aiMessage: aiMsg },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message.',
    });
  }
};
