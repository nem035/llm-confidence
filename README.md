# llm-confidence

`llm-confidence` is a tiny utility designed to calculate the confidence levels
of a given string in an LLMs output.

Let's say you ask an LLM "What is the capital of the United States?" and it
responds with "Washington, D.C.".

This utility will tell you how confident the LLM is that "Washington, D.C." is
the correct answer.

```javascript
const confidence = getLLMOutputConfidence({
  model, // e.g. "gpt-3.5-turbo"
  value, // e.g. "Washington, D.C."
  logprobs: // logprobs array from the OpenAI completion
});
```

## Installation

```bash
npm install llm-confidence
```

## Usage

Note: at the moment, this package is only compatible with OpenAI.

```javascript
import getLLMOutputConfidence from "llm-confidence";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ORG = process.env.OPENAI_ORG;

const openaiAPI = new OpenAI({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORG,
});

const question = "What is the capital of the United States?";

const model = "gpt-3.5-turbo";

const completion = await openaiAPI.chat.completions.create({
  model,
  logprobs: true,
  messages: [
    {
      role: "system",
      content: "You are a helpful assistant and a geography genius.",
    },
    {
      role: "user",
      content: question,
    },
  ],
});

const [choice] = completion.choices;
const value = choice.message.content; // "Washington, D.C."

const confidence = getLLMOutputConfidence({
  model,
  value, // <-- The value you want to calculate the confidence of
  logprobs: choice.logprobs?.content ?? [],
});

console.log(`
I'm ${
  confidence * 100
}% confident that "${value}" is the correct answer to the question "${question}".
`); // "I'm 98% confident that "Washington, D.C." is the correct answer to the question "What is the capital of the United States?".
```

## Caveat

Using logprobs for confidence calculations is not perfect. It's just one way to
get a rough idea of how probable a set of tokens is.
