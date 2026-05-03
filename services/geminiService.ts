import { Scene, RewriteAction, CharacterProfile, FormInputs } from '../types';

const LOCAL_STORAGE_KEY_API = 'VEO_API_KEY';
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

const getApiKey = (): string => {
  const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY_API);
  if (storedKey && storedKey.trim().length > 0) return storedKey;
  const envKey = (import.meta as any)?.env?.VITE_OPENAI_API_KEY || (import.meta as any)?.env?.API_KEY;
  if (envKey) return envKey;
  throw new Error('API Key is missing. Please click the Settings (Gear) icon in the top right to enter your OpenAI API Key.');
};

const sceneSchema = {
  type: 'object',
  properties: {
    sceneNumber: { type: 'integer' },
    shortDescription: { type: 'string' },
    videoStyle: { type: 'string' },
    countryContext: { type: 'string' },
    characterDescription: { type: 'string' },
    visuals: { type: 'string' },
    camera: { type: 'string' },
    audio: { type: 'string' },
    sfx: { type: 'string' },
    dialogue: { type: 'string' },
    music: { type: 'string' },
  },
  required: ['sceneNumber','shortDescription','videoStyle','countryContext','characterDescription','visuals','camera','audio','sfx','dialogue','music'],
  additionalProperties: false,
} as const;

const fullSchema = {
  type: 'object',
  properties: { scenes: { type: 'array', items: sceneSchema } },
  required: ['scenes'],
  additionalProperties: false,
} as const;

const systemInstruction = `You are 'VEO 3 Prompt Director'. Return valid JSON only. Descriptive fields in English, dialogue in requested language, shortDescription in Vietnamese.`;

const buildParts = (text: string, profiles: CharacterProfile[]) => {
  const content: any[] = [{ type: 'input_text', text }];
  profiles.filter(p => p.image && p.mimeType).forEach(p => {
    content.push({ type: 'input_image', image_url: `data:${p.mimeType};base64,${p.image}` });
  });
  return content;
};

const callOpenAIJson = async (prompt: string, schemaName: string, schema: object, temperature = 0.8, profiles: CharacterProfile[] = []): Promise<any> => {
  const res = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getApiKey()}` },
    body: JSON.stringify({
      model: 'gpt-4.1',
      temperature,
      input: [{ role: 'system', content: systemInstruction }, { role: 'user', content: buildParts(prompt, profiles) }],
      text: { format: { type: 'json_schema', name: schemaName, schema, strict: true } },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  const outputText = data.output_text || data.output?.flatMap((o: any) => o.content || []).find((c: any) => c.type === 'output_text')?.text;
  if (!outputText) throw new Error('No JSON text returned by OpenAI.');
  return JSON.parse(outputText);
};

const callOpenAIText = async (prompt: string, temperature = 0.8): Promise<string> => {
  const res = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getApiKey()}` },
    body: JSON.stringify({ model: 'gpt-4.1-mini', temperature, input: prompt }),
  });
  if (!res.ok) throw new Error(`OpenAI API error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return (data.output_text || '').trim();
};

export const suggestStoryDetails = async (briefDescription: string, language: string, duration: string, includeDialogue: boolean): Promise<string> => {
  return callOpenAIText(`Expand this short-film idea in ${language}. Idea: "${briefDescription}". Duration: ${duration || 'not specified'}. ${includeDialogue ? 'Include sample dialogue.' : 'No dialogue.'}` , 0.85);
};

export const generateCinematicPrompts = async ({ description, duration, country, languages, videoStyle, characterProfiles, sceneCount }: any): Promise<Scene[]> => {
  const prompt = `Generate scene prompts from this overview: ${description}. Style: ${videoStyle}. Country context: ${country}. Dialogue language: ${languages}. Duration: ${duration || 'not specified'}. Scene count: ${sceneCount || 'auto'}. Each scene is 8 seconds.`;
  const parsed = await callOpenAIJson(prompt, 'scene_list', fullSchema, 0.8, characterProfiles);
  return parsed.scenes || [];
};

export const rewriteScene = async (sceneToRewrite: Scene, action: RewriteAction, formInputs: FormInputs, allScenes: Scene[]): Promise<Scene> => {
  const prompt = `Rewrite scene #${sceneToRewrite.sceneNumber}. Action: ${action}. Settings: ${JSON.stringify(formInputs)}. Previous scenes: ${JSON.stringify(allScenes)}. Scene: ${JSON.stringify(sceneToRewrite)}.`;
  return callOpenAIJson(prompt, 'single_scene', sceneSchema, 0.9, formInputs.characterProfiles);
};

export const translateScene = async (sceneToTranslate: Scene, targetLanguage: string): Promise<Scene> => {
  const prompt = `Translate all string values in this JSON scene to ${targetLanguage}, keep keys and sceneNumber unchanged: ${JSON.stringify(sceneToTranslate)}`;
  return callOpenAIJson(prompt, 'translated_scene', sceneSchema, 0.2);
};

export const generateNextScene = async (prompt: string, allScenes: Scene[], formInputs: FormInputs): Promise<Scene> => {
  const nextSceneNumber = allScenes.length + 1;
  const req = `Generate next scene #${nextSceneNumber}. Request: ${prompt}. Settings: ${JSON.stringify(formInputs)}. Previous scenes: ${JSON.stringify(allScenes)}.`;
  const newScene = await callOpenAIJson(req, 'next_scene', sceneSchema, 0.85, formInputs.characterProfiles);
  newScene.sceneNumber = nextSceneNumber;
  return newScene as Scene;
};

export const formatSceneForVeoPrompt = (scene: Scene): string => {
  const allParts = [scene.videoStyle && `A cinematic video in the style of ${scene.videoStyle}`, scene.countryContext && `set within a ${scene.countryContext} cultural context`, scene.visuals && `depicting: ${scene.visuals.replace(/\n/g, ' ')}`, scene.characterDescription && `The characters are described as: ${scene.characterDescription.replace(/\n/g, ' ')}`, scene.camera && `The camera work includes: ${scene.camera.replace(/\n/g, ' ')}`, (scene.audio || scene.sfx || scene.music) && `The sound design includes ${[scene.audio && `ambient audio of ${scene.audio.replace(/\n/g, ' ')}`, scene.sfx && `sound effects like ${scene.sfx.replace(/\n/g, ' ')}`, scene.music && `a background score that is ${scene.music.replace(/\n/g, ' ')}`].filter(Boolean).join(', ')}`, (scene.dialogue && scene.dialogue.toLowerCase().trim() !== 'n/a' && scene.dialogue.trim() !== '') && `The dialogue is: "${scene.dialogue.replace(/\n/g, ' ')}"`];
  return allParts.filter(Boolean).join('. ').replace(/\.\s*\./g, '.').replace(/\s+/g, ' ').trim() + '.';
};

export const formatSceneForImagePrompt = (scene: Scene): string => {
  const mood = scene.camera.toLowerCase().includes('dark') ? 'dark, moody lighting' : scene.camera.toLowerCase().includes('bright') ? 'bright, natural lighting' : 'cinematic lighting';
  return `A high-quality, ${scene.videoStyle} cinematic film still ${scene.countryContext ? `in a ${scene.countryContext} setting` : ''}. The scene depicts: ${scene.visuals.replace(/\n/g, ' ')}. Character Appearance (Must be consistent): ${scene.characterDescription.replace(/\n/g, ' ')}. Atmosphere: ${mood}, 8k resolution, highly detailed, storytelling composition, photorealistic.`;
};

export const generateVideoFromScene = async (_scene: Scene): Promise<string> => {
  throw new Error('Video generation is not supported via OpenAI in this app yet. Please keep using prompt export for external video tools.');
};

export const generateImageFromScene = async (scene: Scene): Promise<string> => {
  const prompt = formatSceneForImagePrompt(scene);
  const res = await fetch(`${OPENAI_BASE_URL}/images/generations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getApiKey()}` },
    body: JSON.stringify({ model: 'gpt-image-1', prompt, size: '1536x1024' }),
  });
  if (!res.ok) throw new Error(`Failed to generate image: ${await res.text()}`);
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error('No image data returned.');
  return `data:image/png;base64,${b64}`;
};
