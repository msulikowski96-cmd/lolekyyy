import React from 'react';
import { Card } from './Card';

interface AnalysisDisplayProps {
  analysis: string;
}

// A simple parser to render Markdown into styled components
const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const renderLine = (line: string, key: number | string) => {
        // Handle bold text with **text**
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const processedLine = parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
        return <span key={key}>{processedLine}</span>;
    };
    
    const elements = [];
    let listItems: React.ReactNode[] = [];
    let listType: 'ul' | 'ol' | null = null;
    
    const lines = text.split('\n');

    const flushList = () => {
        if (listItems.length > 0) {
            if (listType === 'ul') {
                elements.push(<ul key={`list-${elements.length}`} className="list-disc pl-5 space-y-2">{listItems}</ul>);
            } else if (listType === 'ol') {
                 elements.push(<ol key={`list-${elements.length}`} className="list-decimal pl-5 space-y-2">{listItems}</ol>);
            }
            listItems = [];
            listType = null;
        }
    };

    lines.forEach((line, index) => {
        if (line.startsWith('### ')) {
            flushList();
            elements.push(<h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-sky-300">{renderLine(line.substring(4), index)}</h3>);
            return;
        }

        if (line.startsWith('- ')) {
            if (listType !== 'ul') flushList();
            listType = 'ul';
            listItems.push(<li key={index}>{renderLine(line.substring(2), index)}</li>);
            return;
        }

        if (line.match(/^\d+\.\s/)) {
            if (listType !== 'ol') flushList();
            listType = 'ol';
            listItems.push(<li key={index}>{renderLine(line.substring(line.indexOf(' ')+1), index)}</li>);
            return;
        }
        
        flushList();
        if (line.trim() !== '') {
            elements.push(<p key={index} className="my-2">{renderLine(line, index)}</p>);
        }
    });

    flushList(); // Add any remaining list
  
    return (
      <div className="prose prose-invert prose-p:text-gray-300 prose-li:text-gray-300 prose-headings:text-teal-300">
        {elements}
      </div>
    );
  };


export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  return (
    <Card className="h-full">
        <div className="flex items-center gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10c.313 0 .622-.015.926-.044l-1.436-1.436c-1.332.235-2.735.08-3.928-.598-1.551-.88-2.617-2.541-2.949-4.334-.332-1.793.076-3.633 1.151-5.074s2.689-2.31 4.482-2.642c1.793-.332 3.633.076 5.074 1.151.35.26.674.551.97.87l1.436-1.436A9.946 9.946 0 0 0 12 2zm10 10c0-1.042-.168-2.044-.483-2.986l-1.437 1.437c.234 1.332.08 2.735-.598 3.928-.88 1.551-2.541 2.617-4.334 2.949-1.793.332-3.633-.076-5.074-1.151s-2.31-2.689-2.642-4.482c-.332-1.793.076-3.633 1.151-5.074.26-.35.551-.674.87-.97L8.986 4.483A9.947 9.947 0 0 0 2 12c0 5.514 4.486 10 10 10s10-4.486 10-10z"></path><path d="m14.435 18.991.971-1.942.486-.971-1.942-.971-.971-.486-.971.486-1.942.971.486.971.971 1.942.971.486zm-5.87-13.862.971-1.942.486-.971-1.942-.971-.971-.486-.971.486-1.942.971.486.971.971 1.942.971.486z"></path></svg>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300">
                AI Coach Analysis
            </h2>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-md min-h-[300px]">
            <SimpleMarkdownRenderer text={analysis} />
        </div>
    </Card>
  );
};