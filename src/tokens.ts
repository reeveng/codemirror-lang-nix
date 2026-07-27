import { ExternalTokenizer, ContextTracker } from "@lezer/lr";
import {
  strContent,
  indStrContent,
  strDollarBrace,
  indStrDollarBrace,
  strEnd,
  indStrEnd,
  escapeSequence,
  indEscapeSequence,
} from "./syntax.grammar.terms";

const quote = 34,
  backslack = 92,
  braceL = 123,
  dollar = 36,
  apostrophe = 39;

const indStrEndLength = 2,
  indEscapeLength = 3,
  indBackslashEscapeLength = 4;

export const scanString = new ExternalTokenizer((input) => {
  for (let afterDollar = false, i = 0; ; i++) {
    let { next } = input;
    if (next < 0) {
      if (i > 0) input.acceptToken(strContent);
      break;
    } else if (next === quote) {
      if (i > 0) input.acceptToken(strContent);
      else input.acceptToken(strEnd, 1);
      break;
    } else if (next === braceL && afterDollar) {
      if (i == 1) input.acceptToken(strDollarBrace, 1);
      else input.acceptToken(strContent, -1);
      break;
    } else if (next === backslack) {
      input.advance();
      input.acceptToken(escapeSequence, 1);
    }
    afterDollar = next === dollar;
    input.advance();
  }
});

export const scanIndString = new ExternalTokenizer((input) => {
  for (let i = 0; ; i++) {
    let { next } = input;
    if (next < 0) {
      if (i > 0) input.acceptToken(indStrContent);
      break;
    } else if (next === apostrophe && input.peek(1) === apostrophe) {
      if (i > 0) {
        input.acceptToken(indStrContent);
      } else {
        let after = input.peek(2);
        if (after === dollar || after === apostrophe) {
          input.acceptToken(indEscapeSequence, indEscapeLength);
        } else if (after === backslack && input.peek(3) >= 0) {
          input.acceptToken(indEscapeSequence, indBackslashEscapeLength);
        } else {
          input.acceptToken(indStrEnd, indStrEndLength);
        }
      }
      break;
    } else if (next === dollar && input.peek(1) === braceL) {
      if (i > 0) input.acceptToken(indStrContent);
      else input.acceptToken(indStrDollarBrace, 2);
      break;
    }
    input.advance();
  }
});
