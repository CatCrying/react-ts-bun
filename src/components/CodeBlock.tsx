import { useEffect, useRef } from "react";
import hljs from "../lib/hljs-setup";

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.removeAttribute("data-highlighted");
    hljs.highlightElement(ref.current);
  }, [code, language]);

  return (
    <pre className="hljs-block overflow-x-auto rounded-md border border-white/10 bg-[#0d1117] p-4 text-[13px] leading-relaxed">
      <code ref={ref} className={`language-${language} font-mono`}>
        {code}
      </code>
    </pre>
  );
}
