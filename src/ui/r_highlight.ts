import { escapeHtml } from './components';

/**
 * Lightweight syntax highlighter for base-R scripts.
 * Tokens:
 * - Comments: muted italic (#9C8F7E)
 * - Keywords: teal (#5EEAD4)
 * - Numbers: amber (#FBBF24)
 * - Strings: green (#A3E635)
 * - Function names: sky blue (#93C5FD)
 */
export function highlightRCode(rawCode: string): string {
  if (!rawCode) return '';

  const lines = rawCode.split('\n');
  const highlightedLines = lines.map((line) => {
    // Check if entire line is comment
    const commentIdx = findCommentIndex(line);
    let codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
    const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : '';

    // Tokenize codePart into strings, numbers, keywords, functions, identifiers
    let parsedCode = '';
    let pos = 0;

    while (pos < codePart.length) {
      const char = codePart[pos];

      // String literal
      if (char === '"' || char === "'") {
        const quote = char;
        let strEnd = pos + 1;
        while (strEnd < codePart.length) {
          if (codePart[strEnd] === '\\') {
            strEnd += 2;
          } else if (codePart[strEnd] === quote) {
            strEnd++;
            break;
          } else {
            strEnd++;
          }
        }
        const strVal = codePart.slice(pos, strEnd);
        parsedCode += `<span class="r-string">${escapeHtml(strVal)}</span>`;
        pos = strEnd;
        continue;
      }

      // Keyword / Function / Number / Other
      const remaining = codePart.slice(pos);

      // Check number
      const numMatch = remaining.match(/^(\b\d+(\.\d+)?([eE][+-]?\d+)?\b)/);
      if (numMatch) {
        parsedCode += `<span class="r-number">${escapeHtml(numMatch[1])}</span>`;
        pos += numMatch[1].length;
        continue;
      }

      // Check word token (keywords or function or variable)
      const wordMatch = remaining.match(/^([a-zA-Z._][a-zA-Z0-9._]*)/);
      if (wordMatch) {
        const word = wordMatch[1];
        const afterWord = remaining.slice(word.length);

        if (
          /^(TRUE|FALSE|NULL|NA|NaN|Inf|function|if|else|for|while|repeat|break|next|return|in)$/.test(
            word
          )
        ) {
          parsedCode += `<span class="r-keyword">${escapeHtml(word)}</span>`;
        } else if (/^\s*\(/.test(afterWord)) {
          // Followed by open paren -> function call
          parsedCode += `<span class="r-function">${escapeHtml(word)}</span>`;
        } else {
          parsedCode += escapeHtml(word);
        }

        pos += word.length;
        continue;
      }

      // Default character
      parsedCode += escapeHtml(char);
      pos++;
    }

    if (commentPart) {
      parsedCode += `<span class="r-comment">${escapeHtml(commentPart)}</span>`;
    }

    return parsedCode;
  });

  return highlightedLines.join('\n');
}

/**
 * Finds the index of a '#' character that is not inside quotes.
 */
function findCommentIndex(line: string): number {
  let inDouble = false;
  let inSingle = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '\\' && (inDouble || inSingle)) {
      i++;
      continue;
    }
    if (c === '"' && !inSingle) {
      inDouble = !inDouble;
    } else if (c === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (c === '#' && !inDouble && !inSingle) {
      return i;
    }
  }

  return -1;
}
