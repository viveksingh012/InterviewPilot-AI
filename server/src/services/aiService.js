/**
 * aiService.js
 *
 * Isolates all LLM-provider interaction so the rest of the app never talks
 * to OpenAI/Anthropic directly (see PRD §28, §33-Scalability).
 *
 * Supported providers (env AI_PROVIDER): "openai" | "anthropic" | "mock"
 * "mock" requires no API key and produces deterministic, reasonable output —
 * useful for local development and demos.
 */

// const PROVIDER = (process.env.AI_PROVIDER || 'mock').toLowerCase();

// // ---------- Low-level provider callers ----------

// const controller = new AbortController();
// const timeout = setTimeout(() => controller.abort(), 25000);

// console.log('[AI] Provider:', PROVIDER);
// console.log('[AI] Model:', process.env.OPENAI_MODEL);

// async function callOpenAI(systemPrompt, userPrompt) {
//   const res = await fetch('https://api.openai.com/v1/chat/completions', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
//       messages: [
//         { role: 'system', content: systemPrompt },
//         { role: 'user', content: userPrompt },
//       ],
//       temperature: 0.6,
//       response_format: { type: 'json_object' },
//     }),
//     signal: controller.signal,
//   });
//   if (!res.ok) {
//     const body = await res.text();
//     throw new Error(`OpenAI request failed (${res.status}): ${body}`);
//   }
//   const data = await res.json();
//   return data.choices?.[0]?.message?.content || '{}';
// }


// async function callAnthropic(systemPrompt, userPrompt) {
//   const res = await fetch('https://api.anthropic.com/v1/messages', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-api-key': process.env.ANTHROPIC_API_KEY,
//       'anthropic-version': '2023-06-01',
//     },
//     body: JSON.stringify({
//       model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
//       max_tokens: 1200,
//       system: systemPrompt + '\nRespond with ONLY valid JSON, no markdown fences, no preamble.',
//       messages: [{ role: 'user', content: userPrompt }],
//     }),
//   });
//   if (!res.ok) {
//     const body = await res.text();
//     throw new Error(`Anthropic request failed (${res.status}): ${body}`);
//   }
//   const data = await res.json();
//   const text = (data.content || []).map((b) => b.text || '').join('\n');
//   return text;
// }

// function safeParseJSON(raw) {
//   const cleaned = raw.replace(/```json|```/g, '').trim();
//   try {
//     return JSON.parse(cleaned);
//   } catch (err) {
//     throw new Error('AI returned malformed JSON');
//   }
// }

// /**
//  * Calls the configured provider and returns parsed JSON.
//  * Wraps errors so callers can distinguish AI failures (see PRD §32).
//  */
// async function completeJSON(systemPrompt, userPrompt) {
//   if (PROVIDER === 'mock') {
//     return mockComplete(systemPrompt, userPrompt);
//   }

//   const controller = new AbortController();
//   const timeout = setTimeout(() => controller.abort(), 25000);

//   try {
//     let raw;
//     if (PROVIDER === 'openai') {
//       raw = await callOpenAI(systemPrompt, userPrompt);
//     } else if (PROVIDER === 'anthropic') {
//       raw = await callAnthropic(systemPrompt, userPrompt);
//     } else {
//       throw new Error(`Unknown AI_PROVIDER: ${PROVIDER}`);
//     }
//     return safeParseJSON(raw);
//   } catch (err) {
//     const wrapped = new Error(`AI_SERVICE_FAILURE: ${err.message}`);
//     wrapped.isAiFailure = true;
//     throw wrapped;
//   } finally {
//     clearTimeout(timeout);
//   }
// }

// // ---------- Mock provider (no API key needed) ----------
// // Produces plausible, deterministic-ish output so the full product loop
// // works out of the box. Swap AI_PROVIDER to "openai"/"anthropic" for real use.

// function mockComplete(systemPrompt, userPrompt) {
//   if (systemPrompt.includes('QUESTION_GENERATION')) {
//     return mockGenerateQuestions(userPrompt);
//   }
//   if (systemPrompt.includes('FOLLOW_UP_DECISION')) {
//     return mockFollowUp(userPrompt);
//   }
//   if (systemPrompt.includes('ANSWER_EVALUATION')) {
//     return mockEvaluateAnswer(userPrompt);
//   }
//   if (systemPrompt.includes('FINAL_REPORT')) {
//     return mockFinalReport(userPrompt);
//   }
//   return {};
// }

// function mockGenerateQuestions(userPrompt) {
//   const ctx = JSON.parse(userPrompt);
//   const topics = ctx.topics && ctx.topics.length ? ctx.topics : [ctx.role];
//   const bank = {
//     templates: [
//       'Walk me through how you would design {topic} for a system handling significant scale.',
//       'What are the key trade-offs you consider when working with {topic}?',
//       'Describe a real situation where you used {topic} to solve a problem.',
//       'How would you debug a production issue related to {topic}?',
//       'What are common mistakes engineers make with {topic}, and how do you avoid them?',
//       'Explain {topic} to someone with a {level} understanding, then go deeper.',
//       'How does {topic} fit into the broader architecture of a {role} system?',
//       'What would you do differently if you had to redesign {topic} from scratch?',
//     ],
//   };
//   const questions = [];
//   for (let i = 0; i < ctx.count; i++) {
//     const topic = topics[i % topics.length];
//     const template = bank.templates[i % bank.templates.length];
//     questions.push({
//       question: template.replace('{topic}', topic).replace('{level}', ctx.experienceLevel).replace('{role}', ctx.role),
//       topic,
//       difficulty: ctx.difficulty,
//     });
//   }
//   return { questions };
// }

// function mockFollowUp(userPrompt) {
//   const ctx = JSON.parse(userPrompt);
//   const answerLength = (ctx.answer || '').trim().split(/\s+/).length;
//   const shouldFollowUp = answerLength > 0 && answerLength < 40;
//   return {
//     shouldFollowUp,
//     followUpQuestion: shouldFollowUp
//       ? `Can you go deeper on that? Specifically, what trade-offs or edge cases did you consider for "${(ctx.question || '').slice(0, 60)}"?`
//       : null,
//     reason: shouldFollowUp ? 'Answer was brief; probing for depth.' : 'Answer was sufficiently detailed.',
//   };
// }

// function mockEvaluateAnswer(userPrompt) {
//   const ctx = JSON.parse(userPrompt);
//   const words = (ctx.answer || '').trim().split(/\s+/).filter(Boolean).length;
//   const base = Math.min(95, 40 + words * 1.5);
//   const jitter = (seed) => Math.max(0, Math.min(100, Math.round(base + (((seed * 7) % 11) - 5))));
//   return {
//     technicalAccuracy: jitter(1),
//     relevance: jitter(2),
//     completeness: jitter(3),
//     communication: jitter(4),
//     depth: jitter(5),
//     score: Math.round(base),
//     whatWentWell: words > 15
//       ? 'You addressed the core of the question with reasonable structure.'
//       : 'You attempted the question directly.',
//     whatWasMissing: words < 60
//       ? 'The answer could use more specific examples, edge cases, or trade-off discussion.'
//       : 'Consider tightening the answer around the most impactful points.',
//   };
// }

// function mockFinalReport(userPrompt) {
//   const ctx = JSON.parse(userPrompt);
//   const scores = ctx.answers.map((a) => a.score || 0);
//   const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
//   const topicScores = {};
//   ctx.answers.forEach((a) => {
//     if (!a.topic) return;
//     topicScores[a.topic] = topicScores[a.topic] || [];
//     topicScores[a.topic].push(a.score || 0);
//   });
//   const topicAverages = Object.entries(topicScores).map(([topic, arr]) => ({
//     topic,
//     avg: arr.reduce((a, b) => a + b, 0) / arr.length,
//   }));
//   topicAverages.sort((a, b) => b.avg - a.avg);
//   const strongTopics = topicAverages.slice(0, Math.ceil(topicAverages.length / 2)).map((t) => t.topic);
//   const weakTopics = topicAverages.slice(Math.ceil(topicAverages.length / 2)).map((t) => t.topic);

//   return {
//     overallScore: avg,
//     technicalScore: avg,
//     communicationScore: Math.max(0, avg - 3),
//     problemSolvingScore: Math.max(0, avg - 2),
//     relevanceScore: Math.min(100, avg + 2),
//     depthScore: Math.max(0, avg - 5),
//     summary: `Candidate scored an average of ${avg}/100 across ${ctx.answers.length} questions for the ${ctx.role} (${ctx.experienceLevel}) interview.`,
//     strengths: strongTopics.length ? strongTopics.map((t) => `Solid grasp of ${t}`) : ['Engaged consistently across questions'],
//     weaknesses: weakTopics.length ? weakTopics.map((t) => `Needs more depth in ${t}`) : ['No major weak areas detected'],
//     recommendations: [
//       'Practice explaining trade-offs out loud for each answer.',
//       ...weakTopics.map((t) => `Review core concepts and do focused practice on ${t}.`),
//       'Do another mock interview to track improvement.',
//     ],
//     strongTopics,
//     weakTopics,
//   };
// }

// module.exports = {
//   completeJSON,
//   PROVIDER,
// };

/**
 * aiService.js
 *
 * Handles all OpenAI API interaction.
 *
 * Supported provider:
 * - OpenAI only
 *
 * Requires:
 * - OPENAI_API_KEY
 * - OPENAI_MODEL (optional, defaults to gpt-4o-mini)
 */


// const PROVIDER = process.env.AI_PROVIDER

// // ---------- Configuration ----------

// const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// // console.log('[AI] Provider:', PROVIDER);
// // console.log('[AI] Model:', OPENAI_MODEL);
// // console.log('[AI] API key exists:', Boolean(process.env.OPENAI_API_KEY));

// if (!process.env.OPENAI_API_KEY) {
//   console.warn('[AI] WARNING: OPENAI_API_KEY is not configured');
// }

// // ---------- OpenAI caller ----------

// async function callOpenAI(systemPrompt, userPrompt, signal) {
//     console.log('[AI] Calling OpenAI...');
//   console.log('[AI] Model:', OPENAI_MODEL);
//   console.log('[AI] API key exists:', Boolean(process.env.OPENAI_API_KEY));

//   const res = await fetch(
//     'https://api.openai.com/v1/chat/completions',
//     {
//       method: 'POST',

//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },

//       body: JSON.stringify({
//         model: OPENAI_MODEL,

//         messages: [
//           {
//             role: 'system',
//             content: systemPrompt,
//           },
//           {
//             role: 'user',
//             content: userPrompt,
//           },
//         ],

//         temperature: 0.6,

//         response_format: {
//           type: 'json_object',
//         },
//       }),

//       signal,
//     }
//   );

//   if (!res.ok) {
//     const body = await res.text();

//     throw new Error(
//       `OpenAI request failed (${res.status}): ${body}`
//     );
//   }

//   const data = await res.json();

//   const content = data.choices?.[0]?.message?.content;

//   if (!content) {
//     throw new Error('OpenAI returned an empty response');
//   }

//   return content;
// }

// // ---------- JSON parser ----------

// function safeParseJSON(raw) {
//   if (typeof raw !== 'string') {
//     throw new Error('OpenAI response was not a string');
//   }

//   const cleaned = raw
//     .replace(/```json/g, '')
//     .replace(/```/g, '')
//     .trim();

//   try {
//     return JSON.parse(cleaned);
//   } catch (err) {
//     console.error('[AI] Invalid JSON returned by OpenAI:');
//     console.error(cleaned);

//     throw new Error('AI returned malformed JSON');
//   }
// }

// // ---------- Main AI function ----------

// /**
//  * Sends a prompt to OpenAI and returns parsed JSON.
//  */
// async function completeJSON(systemPrompt, userPrompt) {
//   if (!process.env.OPENAI_API_KEY) {
//     const error = new Error('OPENAI_API_KEY is not configured');
//     error.isAiFailure = true;
//     throw error;
//   }

//   const controller = new AbortController();

//   const timeout = setTimeout(() => {
//     controller.abort();
//   }, 25000);

//   try {
//     console.log('[AI] Starting OpenAI request...');

//     const raw = await callOpenAI(
//       systemPrompt,
//       userPrompt,
//       controller.signal
//     );

//     console.log('[AI] OpenAI request completed');

//     return safeParseJSON(raw);

//   } catch (err) {
//     console.error('================ OPENAI ERROR ================');
//     console.error('Name:', err.name);
//     console.error('Message:', err.message);
//     console.error('Stack:', err.stack);
//     console.error('================================================');

//     const wrapped = new Error(
//       `AI_SERVICE_FAILURE: ${err.message}`
//     );

//     wrapped.isAiFailure = true;
//     wrapped.retryable = true;

//     throw wrapped;

//   } finally {
//     clearTimeout(timeout);
//   }
// }

// module.exports = {
//   completeJSON,
//   PROVIDER,
// };

//.................................................................................................

/**
 * aiService.js
 *
 * Gemini-only AI service.
 *
 * Requires:
 *   GEMINI_API_KEY
 *   GEMINI_MODEL (optional)
 *
 * Default model:
 *   gemini-2.5-flash-lite
 */

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log('[AI] Provider: Gemini');
console.log('[AI] Model:', GEMINI_MODEL);
console.log('[AI] API key exists:', Boolean(GEMINI_API_KEY));


// --------------------------------------------------
// Gemini API caller
// --------------------------------------------------

async function callGemini(systemPrompt, userPrompt, signal) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  console.log('[AI] Calling Gemini...');
  console.log('[AI] Model:', GEMINI_MODEL);

  const res = await fetch(url, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: systemPrompt,
          },
        ],
      },

      contents: [
        {
          role: 'user',
          parts: [
            {
              text: userPrompt,
            },
          ],
        },
      ],

      generationConfig: {
        temperature: 0.6,
        responseMimeType: 'application/json',
      },
    }),

    signal,
  });

  console.log('[AI] Gemini HTTP status:', res.status);

  const body = await res.text();

  console.log('[AI] Gemini response:', body);

  if (!res.ok) {
    throw new Error(
      `Gemini request failed (${res.status}): ${body}`
    );
  }

  let data;

  try {
    data = JSON.parse(body);
  } catch {
    throw new Error('Gemini returned invalid HTTP JSON');
  }

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('') || '';

  if (!text) {
    throw new Error('Gemini returned an empty response');
  }

  return text;
}


// --------------------------------------------------
// JSON parser
// --------------------------------------------------

function safeParseJSON(raw) {
  if (typeof raw !== 'string') {
    throw new Error('Gemini response was not a string');
  }

  const cleaned = raw
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[AI] Gemini returned malformed JSON:');
    console.error(cleaned);

    throw new Error('AI returned malformed JSON');
  }
}


// --------------------------------------------------
// Main AI function
// --------------------------------------------------

async function completeJSON(systemPrompt, userPrompt) {
  if (!GEMINI_API_KEY) {
    const error = new Error(
      'GEMINI_API_KEY is not configured'
    );

    error.isAiFailure = true;
    error.retryable = false;

    throw error;
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 25000);

  try {
    console.log('[AI] Starting Gemini request...');

    const raw = await callGemini(
      systemPrompt,
      userPrompt,
      controller.signal
    );

    console.log('[AI] Gemini request completed');

    const parsed = safeParseJSON(raw);

    return parsed;

  } catch (err) {
    console.error('================ GEMINI ERROR ================');
    console.error('Name:', err.name);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('================================================');

    if (err.name === 'AbortError') {
      const timeoutError = new Error(
        'Gemini request timed out after 25 seconds'
      );

      timeoutError.isAiFailure = true;
      timeoutError.retryable = true;

      throw timeoutError;
    }

    const wrapped = new Error(
      `AI_SERVICE_FAILURE: ${err.message}`
    );

    wrapped.isAiFailure = true;
    wrapped.retryable = true;

    throw wrapped;

  } finally {
    clearTimeout(timeout);
  }
}


module.exports = {
  completeJSON,
};
