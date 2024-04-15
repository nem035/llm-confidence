import {
  encoding_for_model as getEncodingForModel,
} from "tiktoken";

const textDecoder = new TextDecoder();

// This function takes in a string value, and a logprobs array from a completion
// and returns the confidence assigned to the whole value by the model.
// This is done by finding the logprobs for each token in the value, and
// adding up the logprobs for each token to get the confidence.
// Note: this will find the first string of tokens that match the value
// and ignore any following matches.
export default function getLLMOutputConfidence({
  model,
  value,
  logprobs,
}) {
  if (!Array.isArray(logprobs) || logprobs.length === 0) {
    return 0;
  }

  if (typeof value !== "string" || value.length === 0) {
    return 0;
  }

  if (typeof model !== "string" || !model.startsWith('gpt')) {
    return 0;
  }

  const enc = getEncodingForModel(model);
  const expectedTokens = Array.from(enc.encode(value)).map((t) =>
    textDecoder.decode(enc.decode(new Uint32Array([t]))),
  );

  const valueLogprobs = [];

  for (let i = 0; i < logprobs.length; i += 1) {
    const logprob = logprobs[i];

    if (logprob.token === expectedTokens[0]) {

      for (let j = 0; j < expectedTokens.length; j++) {
        const lp = logprobs[i + j];
        if (lp?.token !== expectedTokens[j]) {
          valueLogprobs.length = 0;
          break;
        }

        valueLogprobs.push(lp);
      }
      break;
    }
  }

  const confidence = Math.exp(
    valueLogprobs.reduce((acc, curr) => acc + curr.logprob, 0),
  );

  return confidence;
}
