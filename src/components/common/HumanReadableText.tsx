import React from 'react';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface HumanReadableTextProps {
  content: string;
  className?: string;
  variant?: 'copilot' | 'clinical' | 'compact';
}

/**
 * Parses markdown-like or semi-structured text into ultra-clean,
 * human-friendly, readable visual elements with beautiful typography,
 * styled badges, bullet points, and highlight pills.
 * Completely eliminates raw markdown clutter (e.g. '###', '**', raw asterisks).
 */
export const HumanReadableText: React.FC<HumanReadableTextProps> = ({
  content,
  className = '',
  variant = 'copilot'
}) => {
  if (!content) return null;

  // Clean initial text if it has awkward formatting
  const sanitized = content.replace(/\r\n/g, '\n').trim();

  // Split into lines/blocks
  const rawLines = sanitized.split('\n');

  // Group into structural blocks: paragraphs, lists, headers, callouts
  interface Block {
    type: 'header' | 'bullet' | 'number' | 'callout' | 'paragraph';
    title?: string;
    text: string;
    number?: string;
    level?: number;
  }

  const blocks: Block[] = [];
  let currentParagraph = '';

  const flushParagraph = () => {
    if (currentParagraph.trim()) {
      blocks.push({
        type: 'paragraph',
        text: currentParagraph.trim()
      });
      currentParagraph = '';
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    // Markdown Headers: #, ##, ###, ####
    const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      flushParagraph();
      blocks.push({
        type: 'header',
        level: headerMatch[1].length,
        text: headerMatch[2].replace(/\*\*/g, '').trim()
      });
      continue;
    }

    // Header styled like "Section Name:" with bold or uppercase
    const titleColonMatch = line.match(/^(\*{0,2})([A-Z][A-Za-z0-9\s—–-]{2,40}):\1\s*(.*)$/);
    if (titleColonMatch && !line.startsWith('-') && !line.startsWith('*')) {
      const title = titleColonMatch[2].trim();
      const remainder = titleColonMatch[3].trim();
      flushParagraph();

      if (remainder) {
        blocks.push({
          type: 'callout',
          title,
          text: remainder
        });
      } else {
        blocks.push({
          type: 'header',
          level: 3,
          text: title
        });
      }
      continue;
    }

    // Blockquote or Callout: >
    if (line.startsWith('>')) {
      flushParagraph();
      blocks.push({
        type: 'callout',
        text: line.replace(/^>\s*/, '').trim()
      });
      continue;
    }

    // Numbered list item: 1. or 1)
    const numberMatch = line.match(/^(\d+)[\.\)]\s+(.+)$/);
    if (numberMatch) {
      flushParagraph();
      blocks.push({
        type: 'number',
        number: numberMatch[1],
        text: numberMatch[2].trim()
      });
      continue;
    }

    // Bullet list item: - or * or •
    const bulletMatch = line.match(/^[-*•]\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      blocks.push({
        type: 'bullet',
        text: bulletMatch[1].trim()
      });
      continue;
    }

    // Regular text line
    if (currentParagraph) {
      currentParagraph += ' ' + line;
    } else {
      currentParagraph = line;
    }
  }

  flushParagraph();

  // Helper to format inline text (bold, metric highlights, units) cleanly
  const renderInline = (str: string) => {
    // Split by markdown bold **text** or __text__
    const parts = str.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);

    return parts.map((part, idx) => {
      if ((part.startsWith('**') && part.endsWith('**')) ||
          (part.startsWith('__') && part.endsWith('__'))) {
        const inner = part.slice(2, -2);
        return (
          <span
            key={idx}
            className={`font-semibold text-white px-1 py-0.5 rounded bg-white/5 border border-white/10 ${
              variant === 'clinical' ? 'text-rose-200' : 'text-emerald-200'
            }`}
          >
            {inner}
          </span>
        );
      }

      // Check for standalone metric highlights (e.g. 142 µg/m³, +310%, 2.4x, etc.)
      const words = part.split(/(\b\d+(?:\.\d+)?(?:\s*(?:µg\/m³|ppm|ppb|°C|%|years|yrs|hours|hrs|x))\b)/gi);
      if (words.length > 1) {
        return (
          <React.Fragment key={idx}>
            {words.map((sub, sIdx) => {
              if (/^\d+(?:\.\d+)?(?:\s*(?:µg\/m³|ppm|ppb|°C|%|years|yrs|hours|hrs|x))$/i.test(sub.trim())) {
                return (
                  <span
                    key={sIdx}
                    className="font-mono font-bold text-amber-300 px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px]"
                  >
                    {sub}
                  </span>
                );
              }
              return sub;
            })}
          </React.Fragment>
        );
      }

      return part;
    });
  };

  return (
    <div className={`space-y-2.5 text-xs text-slate-200 leading-relaxed font-sans ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'header') {
          return (
            <div
              key={idx}
              className={`pt-2 pb-1 border-b border-white/10 flex items-center gap-2 ${
                block.level === 1 ? 'text-base font-extrabold text-white font-tech tracking-wide' :
                block.level === 2 ? 'text-sm font-bold text-emerald-300 font-tech tracking-wide' :
                'text-xs font-bold text-slate-100 font-tech uppercase tracking-wider'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{block.text}</span>
            </div>
          );
        }

        if (block.type === 'callout') {
          return (
            <div
              key={idx}
              className="p-3 my-1.5 rounded-xl bg-[#0e1626]/80 border border-emerald-500/30 shadow-sm"
            >
              {block.title && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-1 font-tech uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{block.title}</span>
                </div>
              )}
              <div className="text-slate-300 text-xs leading-relaxed">
                {renderInline(block.text)}
              </div>
            </div>
          );
        }

        if (block.type === 'bullet') {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0 shadow-sm shadow-emerald-400/50" />
              <div className="text-slate-200 text-xs leading-relaxed flex-1">
                {renderInline(block.text)}
              </div>
            </div>
          );
        }

        if (block.type === 'number') {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1 py-1">
              <span className="w-4 h-4 rounded-md bg-indigo-500/25 border border-indigo-400/40 text-indigo-300 text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {block.number}
              </span>
              <div className="text-slate-200 text-xs leading-relaxed flex-1">
                {renderInline(block.text)}
              </div>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-slate-200 text-xs leading-relaxed">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
};
