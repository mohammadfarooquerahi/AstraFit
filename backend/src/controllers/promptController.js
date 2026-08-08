import { PromptTemplate, AdminActionLog } from '../models/index.js';

// GET /api/admin/prompts
export const getAllPrompts = async (req, res) => {
  try {
    const prompts = await PromptTemplate.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: { prompts } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch prompts.' });
  }
};

// POST /api/admin/prompts
export const createPrompt = async (req, res) => {
  try {
    const { name, content, feature, version, isActive } = req.body;
    if (!name || !content || !feature) {
      return res.status(400).json({ success: false, message: 'Name, content, and feature are required.' });
    }
    const prompt = await PromptTemplate.create({ name, content, feature, version: version || '1.0', isActive: isActive ?? true, createdBy: req.user._id });
    await AdminActionLog.create({ adminId: req.user._id, action: 'CREATE_PROMPT', details: `Created prompt: ${name} v${version || '1.0'}` });
    return res.status(201).json({ success: true, data: { prompt } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create prompt.' });
  }
};

// PUT /api/admin/prompts/:id
export const updatePrompt = async (req, res) => {
  try {
    const { content, isActive, version } = req.body;
    const prompt = await PromptTemplate.findByIdAndUpdate(
      req.params.id,
      { content, isActive, version, updatedAt: new Date() },
      { new: true }
    );
    if (!prompt) return res.status(404).json({ success: false, message: 'Prompt not found.' });
    await AdminActionLog.create({ adminId: req.user._id, action: 'UPDATE_PROMPT', details: `Updated prompt: ${prompt.name}` });
    return res.status(200).json({ success: true, data: { prompt } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update prompt.' });
  }
};

// DELETE /api/admin/prompts/:id
export const deletePrompt = async (req, res) => {
  try {
    const prompt = await PromptTemplate.findByIdAndDelete(req.params.id);
    await AdminActionLog.create({ adminId: req.user._id, action: 'DELETE_PROMPT', details: `Deleted prompt: ${prompt?.name}` });
    return res.status(200).json({ success: true, message: 'Prompt deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete prompt.' });
  }
};
